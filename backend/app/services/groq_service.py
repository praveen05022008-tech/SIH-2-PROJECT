import os
import json
import logging
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

MODELS_PRIORITY = [
    settings.GROQ_MODEL,
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
]

def get_groq_client():
    api_key = settings.GROQ_API_KEY
    if not api_key:
        return None
    try:
        from groq import Groq
        return Groq(api_key=api_key)
    except Exception as e:
        logger.warning(f"Unable to initialize Groq client: {e}")
        return None

def _call_groq(messages: List[Dict[str, str]], json_mode: bool = False, temperature: float = 0.2) -> Optional[str]:
    client = get_groq_client()
    if not client:
        return None
    
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
            logger.warning(f"Groq inference failed on model '{model}': {str(e)}. Trying next fallback...")
            continue
            
    logger.warning(f"All Groq inference attempts failed: {last_error}")
    return None


def _fallback_skill_gap_roadmap(
    student_name: str,
    target_role: str,
    current_skills: List[Dict[str, Any]],
    interests: Optional[str] = None
) -> Dict[str, Any]:
    known_skills = [s.get("name", str(s)) for s in current_skills if isinstance(s, dict)]
    role_lower = target_role.lower()
    
    recommended_skills = ["System Architecture", "Git & CI/CD", "Production Observability"]
    if "data" in role_lower or "ai" in role_lower or "machine" in role_lower:
        recommended_skills = ["PyTorch", "Model Evaluation & Tuning", "MLOps Pipelines", "Data Validation"]
    elif "frontend" in role_lower or "web" in role_lower:
        recommended_skills = ["State Management (Zustand/Redux)", "Performance Optimization", "Accessibility (a11y)", "Testing (Vitest/Playwright)"]
    elif "cloud" in role_lower or "devops" in role_lower:
        recommended_skills = ["Docker & Kubernetes", "Terraform / IaC", "AWS / Cloud Infrastructure", "Monitoring (Prometheus/Grafana)"]
    else:
        recommended_skills = ["FastAPI / Distributed Microservices", "Relational & NoSQL Databases", "Redis Caching", "Security & JWT"]

    score = min(85, max(45, len(known_skills) * 15 + 35))
    
    return {
        "summary": f"Skill alignment analysis for {student_name or 'Candidate'} targeting the '{target_role}' role indicates strong fundamental readiness ({score}%). Focus on production tooling and architectural depth will close the remaining gaps.",
        "overall_readiness_score": score,
        "strengths": known_skills if known_skills else ["Core Computer Science Fundamentals", "Problem Solving", "Adaptability"],
        "critical_gaps": [
            {
                "skill": sk,
                "current_level": "Beginner",
                "target_level": "Intermediate / Advanced",
                "importance": "High"
            }
            for sk in recommended_skills[:3]
        ],
        "four_week_roadmap": [
            {
                "week": 1,
                "focus_theme": "Core Competency Reinforcement",
                "action_items": [f"Deep dive into {recommended_skills[0]} design patterns", "Read official documentation and architectural best practices"],
                "recommended_projects": ["Build a small proof-of-concept module"],
                "estimated_hours": 12
            },
            {
                "week": 2,
                "focus_theme": "Advanced Implementation & Testing",
                "action_items": [f"Implement practical applications of {recommended_skills[1]}", "Write automated unit and integration tests"],
                "recommended_projects": ["Integrate modular testing suite"],
                "estimated_hours": 14
            },
            {
                "week": 3,
                "focus_theme": "System Architecture & Integration",
                "action_items": [f"Explore {recommended_skills[2]} integration", "Optimize throughput and query performance"],
                "recommended_projects": ["Deploy containerized service on local or cloud host"],
                "estimated_hours": 15
            },
            {
                "week": 4,
                "focus_theme": "Production Readiness & Portfolio Showcase",
                "action_items": ["Document architecture in README with system diagram", "Conduct mock technical interview sessions"],
                "recommended_projects": [f"Publish end-to-end {target_role} capstone repository"],
                "estimated_hours": 10
            }
        ],
        "industry_advice": f"Industries hiring for {target_role} value hands-on system building and problem solving. Demonstrating real projects with measurable outcomes is the most impactful differentiator."
    }


def analyze_skill_gap_and_generate_roadmap(
    student_name: str,
    target_role: str,
    current_skills: List[Dict[str, Any]],
    interests: Optional[str] = None
) -> Dict[str, Any]:
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
    
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            pass
            
    return _fallback_skill_gap_roadmap(student_name, target_role, current_skills, interests)


def _fallback_assessment_quiz(skill_name: str, difficulty: str = "intermediate", num_questions: int = 5) -> Dict[str, Any]:
    default_qs = [
        {
            "question_text": f"Which of the following is a recognized best practice when working with {skill_name} in production?",
            "question_type": "mcq",
            "options": [
                "Strict type validation and defensive error handling",
                "Hardcoding configuration credentials directly in code",
                "Disabling logging and monitoring to maximize speed",
                "Skipping automated testing during releases"
            ],
            "correct_answer": "Strict type validation and defensive error handling",
            "marks": 1,
            "difficulty": difficulty,
            "explanation": "Validating inputs and handling errors defensively prevents unhandled runtime exceptions and security issues."
        },
        {
            "question_text": f"What is the primary operational advantage of modular architecture in {skill_name} applications?",
            "question_type": "mcq",
            "options": [
                "Separation of concerns and independent maintainability",
                "Eliminating the need for a database",
                "Automatic unlimited cloud scaling without configuration",
                "Allowing all variables to be globally accessible"
            ],
            "correct_answer": "Separation of concerns and independent maintainability",
            "marks": 1,
            "difficulty": difficulty,
            "explanation": "Modularization decouples components, making code easier to test, update, and maintain."
        },
        {
            "question_text": f"When optimizing performance in {skill_name}, which strategy is most effective?",
            "question_type": "mcq",
            "options": [
                "Profiling bottlenecks, caching repetitive operations, and asynchronous I/O",
                "Running redundant compute cycles continuously",
                "Increasing database connection pools beyond server capacity",
                "Replacing all data structures with plain text files"
            ],
            "correct_answer": "Profiling bottlenecks, caching repetitive operations, and asynchronous I/O",
            "marks": 1,
            "difficulty": difficulty,
            "explanation": "Identifying actual bottlenecks and using caching with non-blocking I/O delivers tangible efficiency gains."
        },
        {
            "question_text": f"In {skill_name}, how should sensitive environment variables and API tokens be managed?",
            "question_type": "mcq",
            "options": [
                "Using encrypted secret managers and environment variables (.env)",
                "Checking them into public git version control",
                "Embedding them directly in client-side script tags",
                "Storing them unencrypted on shared network drives"
            ],
            "correct_answer": "Using encrypted secret managers and environment variables (.env)",
            "marks": 1,
            "difficulty": difficulty,
            "explanation": "Secrets should always be isolated in environment configurations or managed vault stores, never committed to version control."
        },
        {
            "question_text": f"What metric best reflects reliability when deploying {skill_name} services?",
            "question_type": "mcq",
            "options": [
                "Service uptime, low error rate (5xx), and p95 latency targets",
                "The total number of lines of source code",
                "How fast code is typed by the engineering team",
                "The number of comments in the codebase"
            ],
            "correct_answer": "Service uptime, low error rate (5xx), and p95 latency targets",
            "marks": 1,
            "difficulty": difficulty,
            "explanation": "Production reliability is measured by availability SLOs, error budgets, and latency percentiles."
        }
    ]
    
    selected_qs = default_qs[:min(num_questions, len(default_qs))]
    
    return {
        "title": f"{skill_name} Industry Competency Assessment",
        "skill": skill_name,
        "difficulty": difficulty,
        "passing_percentage": 70,
        "questions": selected_qs
    }


def generate_assessment_quiz(
    skill_name: str,
    difficulty: str = "intermediate",
    num_questions: int = 5,
    subtopics: Optional[str] = None
) -> Dict[str, Any]:
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
    
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            pass
            
    return _fallback_assessment_quiz(skill_name, difficulty, num_questions)


def career_counselor_chat(
    user_message: str,
    student_profile: Dict[str, Any],
    chat_history: Optional[List[Dict[str, str]]] = None
) -> str:
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
    
    raw = _call_groq(messages, json_mode=False, temperature=0.4)
    if raw and len(raw.strip()) > 10:
        return raw
        
    # Intelligent fallback counselor response
    name = student_profile.get("full_name", "Student")
    dept = student_profile.get("department", "Engineering")
    skills = student_profile.get("skills", [])
    skills_text = ", ".join(skills) if skills else "your coursework fundamentals"
    
    return (
        f"Hello {name}! Regarding your inquiry:\n\n"
        f"**Career Guidance for {dept}**\n\n"
        f"1. **Core Competencies**: Building on {skills_text}, focus on building full-lifecycle projects that solve real-world problems. "
        f"Hiring teams look for evidence of problem solving, code quality, and testing.\n"
        f"2. **Industry Alignment**: Contemporary tech stacks prioritize cloud-native architectures, API integration, and database optimization. "
        f"Completing verified skill assessments on this portal will boost your visibility to prospective employers.\n"
        f"3. **Next Steps**: Review our curated Learning Programs, take an assessment to verify your skills, and check the Opportunities tab for internships matching your current profile.\n\n"
        f"Feel free to ask about specific interview preparation topics, resume optimization, or role roadmaps!"
    )


def extract_skills_from_resume_text(resume_text: str) -> Dict[str, Any]:
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
    
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            pass
            
    # Intelligent keyword extraction fallback
    common_tech = ["Python", "Java", "C++", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "FastAPI", "Docker", "AWS", "Git", "Machine Learning", "HTML", "CSS"]
    extracted_tech = [t for t in common_tech if t.lower() in resume_text.lower()]
    if not extracted_tech:
        extracted_tech = ["Python", "SQL", "Git", "REST APIs"]
        
    return {
        "technical_skills": extracted_tech,
        "soft_skills": ["Problem Solving", "Teamwork", "Agile Communication"],
        "suggested_roles": ["Software Engineer", "Full Stack Developer", "Data Analyst"],
        "experience_summary": f"Candidate profile with practical technical background across {len(extracted_tech)} identified competency domains.",
        "portfolio_projects": ["Web Application Development", "Database Schema Design & API Implementation"]
    }


def explain_candidate_match(
    candidate_profile: Dict[str, Any],
    opportunity_data: Dict[str, Any]
) -> Dict[str, Any]:
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
    
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            pass
            
    c_name = candidate_profile.get("full_name", "Candidate")
    opp_title = opportunity_data.get("title", "the role")
    c_skills = [s.get("name", str(s)) for s in candidate_profile.get("skills", []) if isinstance(s, dict)]
    
    return {
        "match_verdict": f"{c_name} demonstrates strong alignment with {opp_title} with proven foundational skills and relevant academic background.",
        "key_strengths": c_skills[:3] if c_skills else ["Academic Excellence", "Core Programming", "Demonstrated Learning Agility"],
        "potential_gaps": ["Production cloud operations experience", "Large-scale distributed systems tuning"],
        "suggested_interview_questions": [
            f"How have you applied your key skills in academic or live projects?",
            f"Describe how you troubleshoot unexpected runtime errors in a web service.",
            f"What approach do you take to learn a new framework or technology under tight timelines?"
        ]
    }

