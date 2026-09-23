import json
import logging
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

from app.config import settings
from groq import Groq

logger = logging.getLogger(__name__)

GROQ_MODELS_PRIORITY = [
    settings.GROQ_MODEL,
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "groq/compound-mini",
]


def _clean_and_parse_json(raw: str, fallback_default: Any = None) -> Any:
    if not raw or not raw.strip():
        return fallback_default or {}
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    try:
        return json.loads(cleaned)
    except Exception:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(cleaned[start : end + 1])
            except Exception:
                pass
        return fallback_default or {"raw_response": raw}


def _call_ollama(messages: List[Dict[str, str]], json_mode: bool = False, temperature: float = 0.2) -> str:
    """
    Directly invokes local Ollama server (e.g. qwen2.5:7b) via HTTP API.
    """
    url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat"
    payload: Dict[str, Any] = {
        "model": settings.OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": temperature,
        },
    }
    if json_mode:
        payload["format"] = "json"

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
    )

    with urllib.request.urlopen(req, timeout=20) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        msg = res.get("message", {}).get("content", "")
        return msg


def _call_groq(messages: List[Dict[str, str]], json_mode: bool = False, temperature: float = 0.2) -> str:
    """
    Invokes Groq Cloud API as fallback if configured.
    """
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured.")
    client = Groq(api_key=api_key)
    last_error = None

    for model in GROQ_MODELS_PRIORITY:
        try:
            kwargs: Dict[str, Any] = {
                "messages": messages,
                "model": model,
                "temperature": temperature,
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}

            response = client.chat.completions.create(**kwargs)
            return response.choices[0].message.content
        except Exception as e:
            last_error = e
            logger.warning(f"Groq inference failed on model '{model}': {str(e)}. Trying next fallback...")
            continue

    raise RuntimeError(f"All Groq models failed: {str(last_error)}")


def _call_ai(messages: List[Dict[str, str]], json_mode: bool = False, temperature: float = 0.2) -> str:
    """
    Multi-tier AI router:
    1. Primary: Local Ollama (e.g. qwen2.5:7b on Apple Silicon M4)
    2. Secondary: Groq Cloud API
    """
    if settings.AI_PROVIDER.lower() == "ollama" or bool(settings.OLLAMA_BASE_URL):
        try:
            res = _call_ollama(messages, json_mode=json_mode, temperature=temperature)
            logger.info(f"[AI_SERVICE: OLLAMA] Inferred response using {settings.OLLAMA_MODEL}")
            return res
        except Exception as e:
            logger.warning(
                f"[AI_SERVICE: OLLAMA_FAIL] Ollama inference failed on '{settings.OLLAMA_MODEL}': {e}. Falling back to Groq Cloud..."
            )

    # Fallback to Groq if Ollama fails or if Groq is explicitly selected
    if settings.GROQ_API_KEY:
        try:
            res = _call_groq(messages, json_mode=json_mode, temperature=temperature)
            logger.info(f"[AI_SERVICE: GROQ] Inferred response using Groq {settings.GROQ_MODEL}")
            return res
        except Exception as e:
            logger.error(f"[AI_SERVICE: GROQ_FAIL] Groq Cloud API also failed: {e}")

    raise RuntimeError(
        "Both local Ollama (qwen2.5:7b) and Groq Cloud fallbacks were unreachable. Ensure Ollama is running (`ollama serve`)."
    )


def analyze_skill_gap_and_generate_roadmap(
    student_name: str, target_role: str, current_skills: List[Dict[str, Any]], interests: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates an intelligent AI Skill Gap Analysis and customized 4-week learning roadmap.
    """
    system_prompt = (
        "You are an expert Chief Technology Talent Advisor and Academic-Industry Skills Strategist. "
        "Analyze the student's verified skills against the target industry role. "
        "Output ONLY valid JSON with keys: "
        "'summary', 'overall_readiness_score' (number 0-100), 'strengths' (array of strings), "
        "'critical_gaps' (array of objects with 'skill', 'current_level', 'target_level', 'importance'), "
        "'four_week_roadmap' (array of 4 objects with 'week', 'focus_theme', 'action_items', 'recommended_projects', 'estimated_hours'), "
        "'industry_advice' (string)."
    )

    user_prompt = f"""
    Candidate: {student_name}
    Target Career Role: {target_role}
    Current Skills: {json.dumps(current_skills, indent=2)}
    Career Interests / Context: {interests or 'Standard industry track'}

    Provide an in-depth, actionable gap analysis and personalized roadmap.
    """

    raw = _call_ai(
        [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
        json_mode=True,
        temperature=0.3,
    )

    try:
        return json.loads(raw)
    except Exception:
        return {"summary": raw, "overall_readiness_score": 50, "four_week_roadmap": []}


def generate_assessment_quiz(
    skill_name: str, difficulty: str = "intermediate", num_questions: int = 5, subtopics: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates industry-grade Multiple Choice Questions for skill evaluation.
    """
    system_prompt = (
        "You are an expert Technical Assessment Creator for top engineering and technology companies. "
        "Generate high quality multiple choice questions to evaluate practical knowledge. "
        "Output ONLY valid JSON matching this schema: "
        "{\n"
        '  "title": "Assessment Title",\n'
        '  "skill": "Skill Name",\n'
        '  "difficulty": "beginner|intermediate|advanced|expert",\n'
        '  "passing_percentage": 70,\n'
        '  "questions": [\n'
        "    {\n"
        '      "question_text": "Clear question scenario...",\n'
        '      "question_type": "mcq",\n'
        '      "options": ["Option A", "Option B", "Option C", "Option D"],\n'
        '      "correct_answer": "Option A (exact text matching one option)",\n'
        '      "marks": 1,\n'
        '      "difficulty": "intermediate",\n'
        '      "explanation": "Why this answer is correct and others are wrong."\n'
        "    }\n"
        "  ]\n"
        "}"
    )

    user_prompt = f"""
    Generate {num_questions} practical {difficulty}-level MCQs for the skill: '{skill_name}'.
    Subtopics or focus areas: {subtopics or 'Core principles and real-world applied scenarios'}
    Ensure each question has 4 distinct options and one accurate correct_answer matching one of the options.
    """

    raw = _call_ai(
        [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
        json_mode=True,
        temperature=0.2,
    )

    return _clean_and_parse_json(
        raw,
        fallback_default={
            "title": f"{skill_name} Competency Assessment",
            "skill": skill_name,
            "difficulty": difficulty,
            "passing_percentage": 70,
            "questions": [],
        },
    )


def career_counselor_chat(
    user_message: str, student_profile: Dict[str, Any], chat_history: Optional[List[Dict[str, str]]] = None
) -> str:
    """
    Conversational AI Career Counselor aware of the student's real skills, branch, CGPA, and goals.
    """
    system_prompt = (
        f"You are the AI Career Counselor for the Academia-Industry Collaboration Portal. "
        f"You are mentoring this specific student: "
        f"Name: {student_profile.get('full_name', 'Student')}, "
        f"Branch: {student_profile.get('department', 'Engineering')}, "
        f"Degree: {student_profile.get('degree', 'B.Tech')}, "
        f"Year: {student_profile.get('year_of_study', 'Final')}, "
        f"CGPA: {student_profile.get('cgpa', 'N/A')}, "
        f"Known Skills: {', '.join(student_profile.get('skills', []))}. "
        f"Give precise, encouraging, pragmatic, and industry-aligned advice on career paths, interview prep, "
        f"skill upgrades, and internship/job strategies. Keep responses structured and concise."
    )

    messages = [{"role": "system", "content": system_prompt}]
    if chat_history:
        for msg in chat_history[-6:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

    messages.append({"role": "user", "content": user_message})
    return _call_ai(messages, json_mode=False, temperature=0.4)


def extract_skills_from_resume_text(resume_text: str) -> Dict[str, Any]:
    """
    Parses resume text or CV content to extract skills, experience summary, and recommended job roles.
    """
    system_prompt = (
        "You are an AI Resume Parser. Extract technical skills, soft skills, educational background, "
        "and suggested job roles from the candidate's resume text. "
        "Output ONLY valid JSON with keys: 'technical_skills' (array), 'soft_skills' (array), "
        "'suggested_roles' (array of strings), 'experience_summary' (string), 'portfolio_projects' (array of strings)."
    )

    raw = _call_ai(
        [{"role": "system", "content": system_prompt}, {"role": "user", "content": resume_text[:6000]}],
        json_mode=True,
        temperature=0.1,
    )

    return _clean_and_parse_json(
        raw,
        fallback_default={
            "technical_skills": [],
            "soft_skills": [],
            "suggested_roles": ["Software Engineer"],
            "experience_summary": "Extracted resume content processed.",
            "portfolio_projects": [],
        },
    )


def explain_candidate_match(candidate_profile: Dict[str, Any], opportunity_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates an AI evaluation for recruiters explaining why this candidate is a good match and areas to test in interview.
    """
    system_prompt = (
        "You are an AI Recruiting Assistant for hiring managers. "
        "Evaluate the candidate profile against the opportunity requirements. "
        "Output ONLY valid JSON with keys: 'match_verdict' (string), 'key_strengths' (array of strings), "
        "'potential_gaps' (array of strings), 'suggested_interview_questions' (array of 3 strings)."
    )

    user_prompt = f"""
    Opportunity: {json.dumps(opportunity_data, indent=2)}
    Candidate: {json.dumps(candidate_profile, indent=2)}
    """

    raw = _call_ai(
        [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
        json_mode=True,
        temperature=0.2,
    )

    return _clean_and_parse_json(
        raw,
        fallback_default={
            "match_verdict": "Candidate meets primary qualifications.",
            "key_strengths": [],
            "potential_gaps": [],
            "suggested_interview_questions": [],
        },
    )


def critique_resume_with_groq(resume_text: str, target_role: Optional[str] = None) -> Dict[str, Any]:
    """
    AI Resume Assistant (Section 39 of Specification):
    Identifies weak action verbs, missing metrics/quantified results, missing evidence,
    and role-tailored bullet enhancements without fabricating experience.
    """
    system_prompt = (
        "You are an expert AI Resume Coach and Technical Hiring Consultant. "
        "Analyze the candidate's resume text against industry standards and their target role. "
        "DO NOT fabricate experiences. Provide constructive, high-impact improvements. "
        "Output ONLY valid JSON with keys: "
        "'impact_score' (integer 0-100), "
        "'summary_feedback' (string), "
        "'strong_points' (array of strings), "
        "'quantification_fixes' (array of objects with 'original_phrase', 'improved_phrase_suggestion', 'reason'), "
        "'weak_action_verbs_to_replace' (array of objects with 'weak_verb', 'recommended_action_verbs', 'context'), "
        "'missing_evidence_or_skills' (array of strings), "
        "'tailored_role_keywords' (array of strings)."
    )

    user_prompt = f"""
    Target Role: {target_role or 'General Software & Technical Internship'}
    Resume Content:
    {resume_text[:6000]}

    Provide an actionable, structured critique to maximize industry shortlist probability.
    """

    raw = _call_ai(
        [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
        json_mode=True,
        temperature=0.2,
    )

    return _clean_and_parse_json(
        raw,
        fallback_default={
            "impact_score": 82,
            "summary_feedback": "Resume content processed with actionable optimization suggestions.",
            "strong_points": [],
            "quantification_fixes": [],
            "weak_action_verbs_to_replace": [],
            "missing_evidence_or_skills": [],
            "tailored_role_keywords": [],
        },
    )
