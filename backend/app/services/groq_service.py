import os
import json
import logging
from typing import Dict, Any, List, Optional
from groq import Groq
from app.config import settings

logger = logging.getLogger(__name__)

MODELS_PRIORITY = [
    settings.GROQ_MODEL,
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "groq/compound-mini"
]

def get_groq_client() -> Groq:
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured in settings or environment.")
    return Groq(api_key=api_key)

def _call_groq(messages: List[Dict[str, str]], json_mode: bool = False, temperature: float = 0.2) -> str:
    client = get_groq_client()
    last_error = None
    
    for model in MODELS_PRIORITY:
        try:
            kwargs = {
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
            logger.warning(f"Groq inference failed on model '{model}': {str(e)}. Trying fallback if available...")
            continue
            
    logger.error(f"All Groq models failed. Last error: {str(last_error)}")
    raise RuntimeError(f"Groq API Error: {str(last_error)}")


def analyze_skill_gap_and_generate_roadmap(
    student_name: str,
    target_role: str,
    current_skills: List[Dict[str, Any]],
    interests: Optional[str] = None
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
    
    raw = _call_groq([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ], json_mode=True, temperature=0.3)
    
    try:
        return json.loads(raw)
    except Exception:
        return {"summary": raw, "overall_readiness_score": 50, "four_week_roadmap": []}


def generate_assessment_quiz(
    skill_name: str,
    difficulty: str = "intermediate",
    num_questions: int = 5,
    subtopics: Optional[str] = None
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
        '    {\n'
        '      "question_text": "Clear question scenario...",\n'
        '      "question_type": "mcq",\n'
        '      "options": ["Option A", "Option B", "Option C", "Option D"],\n'
        '      "correct_answer": "Option A (exact text matching one option)",\n'
        '      "marks": 1,\n'
        '      "difficulty": "intermediate",\n'
        '      "explanation": "Why this answer is correct and others are wrong."\n'
        '    }\n'
        '  ]\n'
        "}"
    )
    
    user_prompt = f"""
    Generate {num_questions} practical {difficulty}-level MCQs for the skill: '{skill_name}'.
    Subtopics or focus areas: {subtopics or 'Core principles and real-world applied scenarios'}
    Ensure each question has 4 distinct options and one accurate correct_answer matching one of the options.
    """
    
    raw = _call_groq([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ], json_mode=True, temperature=0.2)
    
    return json.loads(raw)


def career_counselor_chat(
    user_message: str,
    student_profile: Dict[str, Any],
    chat_history: Optional[List[Dict[str, str]]] = None
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
    return _call_groq(messages, json_mode=False, temperature=0.4)


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
    
    raw = _call_groq([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": resume_text[:6000]}
    ], json_mode=True, temperature=0.1)
    
    return json.loads(raw)


def explain_candidate_match(
    candidate_profile: Dict[str, Any],
    opportunity_data: Dict[str, Any]
) -> Dict[str, Any]:
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
    
    raw = _call_groq([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ], json_mode=True, temperature=0.2)
    
    return json.loads(raw)
