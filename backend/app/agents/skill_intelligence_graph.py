import json
import logging
from typing import Any, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langchain_ollama import ChatOllama
from langgraph.graph import END, START, StateGraph
from sqlalchemy.orm import Session

from app.agents.state import SkillGapState
from app.config import settings
from app.models.learning import LearningProgram
from app.models.profile import StudentProfile
from app.models.skill import CareerRole, CareerRoleSkill, Skill, StudentSkill
from app.services.matching import LEVEL_VALUES

logger = logging.getLogger(__name__)


def get_llm():
    if settings.AI_PROVIDER.lower() == "ollama" or bool(settings.OLLAMA_BASE_URL):
        try:
            return ChatOllama(
                model=settings.OLLAMA_MODEL,
                base_url=settings.OLLAMA_BASE_URL,
                temperature=0.2,
            )
        except Exception as e:
            logger.warning(f"Failed to initialize ChatOllama for graph: {e}. Falling back to Groq...")

    if settings.GROQ_API_KEY:
        return ChatGroq(temperature=0.2, groq_api_key=settings.GROQ_API_KEY, model_name=settings.GROQ_MODEL)

    return ChatOllama(model=settings.OLLAMA_MODEL, base_url=settings.OLLAMA_BASE_URL, temperature=0.2)


def create_skill_intelligence_graph(db: Session):
    """
    Constructs a LangGraph StateGraph pipeline for End-to-End Skill Intelligence:
    START -> load_student_and_ontology -> compute_skill_gap_matrix -> fetch_learning_recommendations -> generate_agentic_roadmap -> END
    """

    def load_student_and_ontology(state: SkillGapState) -> Dict[str, Any]:
        student_id = state.get("student_id")
        target_role_title = state.get("target_role", "Software Engineer")

        current_skills = []
        student_name = state.get("student_name", "Student")

        if student_id:
            student = (
                db.query(StudentProfile)
                .filter((StudentProfile.id == student_id) | (StudentProfile.user_id == student_id))
                .first()
            )
            if student:
                student_name = student.full_name
                skills_records = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
                for ss in skills_records:
                    sk = db.query(Skill).filter(Skill.id == ss.skill_id).first()
                    current_skills.append(
                        {
                            "skill_id": ss.skill_id,
                            "skill_name": sk.name if sk else f"Skill #{ss.skill_id}",
                            "level": ss.skill_level,
                            "verified": ss.verified_by_assessment,
                            "score": ss.score,
                        }
                    )
        elif state.get("current_skills"):
            current_skills = state["current_skills"]

        # Find matching career role in ontology
        career_role = db.query(CareerRole).filter(CareerRole.title.ilike(f"%{target_role_title}%")).first()
        ontology_requirements = []
        if career_role:
            reqs = db.query(CareerRoleSkill).filter(CareerRoleSkill.career_role_id == career_role.id).all()
            for r in reqs:
                sk = db.query(Skill).filter(Skill.id == r.skill_id).first()
                ontology_requirements.append(
                    {
                        "skill_id": r.skill_id,
                        "skill_name": sk.name if sk else f"Skill #{r.skill_id}",
                        "required_level": r.required_level,
                        "is_mandatory": r.is_mandatory,
                    }
                )

        return {
            "student_name": student_name,
            "current_skills": current_skills,
            "ontology_requirements": ontology_requirements,
        }

    def compute_skill_gap_matrix(state: SkillGapState) -> Dict[str, Any]:
        reqs = state.get("ontology_requirements", [])
        current_skills = state.get("current_skills", [])

        student_map = {s.get("skill_name", "").lower(): s for s in current_skills}
        if not student_map:
            # Also try matching by skill_id
            student_map = {str(s.get("skill_id")): s for s in current_skills if s.get("skill_id")}

        matching = []
        weak = []
        missing = []
        matched_count = 0.0

        for req in reqs:
            sk_name = req["skill_name"]
            req_lvl = req.get("required_level", "intermediate")
            req_val = LEVEL_VALUES.get(req_lvl.lower(), 2)

            matched_item = student_map.get(sk_name.lower()) or student_map.get(str(req.get("skill_id")))
            if matched_item:
                curr_lvl = matched_item.get("level", "beginner")
                curr_val = LEVEL_VALUES.get(curr_lvl.lower(), 1)
                if curr_val >= req_val:
                    matched_count += 1.0
                    matching.append(
                        {
                            "skill_name": sk_name,
                            "current_level": curr_lvl,
                            "required_level": req_lvl,
                            "verified": matched_item.get("verified", False),
                        }
                    )
                else:
                    matched_count += 0.5
                    weak.append(
                        {
                            "skill_name": sk_name,
                            "current_level": curr_lvl,
                            "required_level": req_lvl,
                            "gap": f"Upgrade from {curr_lvl} to {req_lvl}",
                        }
                    )
            else:
                missing.append(
                    {"skill_name": sk_name, "required_level": req_lvl, "is_mandatory": req.get("is_mandatory", True)}
                )

        total = len(reqs)
        readiness = round((matched_count / total) * 100.0, 1) if total > 0 else 50.0

        return {
            "matching_skills": matching,
            "weak_skills": weak,
            "missing_skills": missing,
            "readiness_percentage": readiness,
        }

    def fetch_learning_recommendations(state: SkillGapState) -> Dict[str, Any]:
        all_gaps = [s["skill_name"].lower() for s in state.get("missing_skills", [])] + [
            s["skill_name"].lower() for s in state.get("weak_skills", [])
        ]
        recommended = []

        if all_gaps:
            programs = db.query(LearningProgram).all()
            for p in programs:
                covered = (p.skills_covered or "").lower()
                if any(gap in covered for gap in all_gaps) or any(gap in p.title.lower() for gap in all_gaps):
                    recommended.append(
                        {
                            "id": p.id,
                            "title": p.title,
                            "provider": p.provider_name,
                            "type": p.program_type,
                            "duration": p.duration,
                            "skills_covered": p.skills_covered,
                            "external_link": p.external_link,
                        }
                    )

        return {"recommended_programs": recommended[:6]}

    def generate_agentic_roadmap(state: SkillGapState) -> Dict[str, Any]:
        llm = get_llm()

        sys_msg = SystemMessage(
            content=(
                "You are an expert AI Career Skills Strategist running inside a LangGraph intelligence pipeline. "
                "Synthesize a customized 4-week learning roadmap and actionable industry advice. "
                "Output ONLY valid JSON with keys: "
                "'summary', 'four_week_roadmap' (list of 4 objects with 'week', 'focus_theme', 'action_items', 'recommended_projects', 'estimated_hours'), "
                "'industry_advice'."
            )
        )

        usr_msg = HumanMessage(content=f"""
            Candidate Name: {state.get('student_name', 'Student')}
            Target Role: {state.get('target_role', 'Software Engineer')}
            Readiness Score: {state.get('readiness_percentage', 50)}%
            Matching Skills: {json.dumps(state.get('matching_skills', []))}
            Weak Skills: {json.dumps(state.get('weak_skills', []))}
            Missing Skills: {json.dumps(state.get('missing_skills', []))}
            Available Recommended Programs: {json.dumps(state.get('recommended_programs', []))}
            Career Context / Interests: {state.get('career_interests', 'Industry Career Track')}
            """)

        try:
            response = llm.invoke([sys_msg, usr_msg])
            content = response.content.strip()
            # Clean possible markdown blocks
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]

            parsed = json.loads(content.strip())
            return {
                "ai_summary": parsed.get("summary", "Personalized roadmap synthesized."),
                "four_week_roadmap": parsed.get("four_week_roadmap", []),
                "industry_advice": parsed.get("industry_advice", "Focus on verified project artifacts."),
            }
        except Exception as e:
            logger.warning(f"LangGraph Groq synthesis error: {e}")
            return {
                "ai_summary": f"Strategic roadmap for {state.get('target_role')}.",
                "four_week_roadmap": [
                    {
                        "week": "Week 1",
                        "focus_theme": "Core Competency Foundations",
                        "action_items": ["Review fundamentals"],
                        "estimated_hours": 10,
                    },
                    {
                        "week": "Week 2",
                        "focus_theme": "Practical Applied Frameworks",
                        "action_items": ["Build small prototype"],
                        "estimated_hours": 12,
                    },
                    {
                        "week": "Week 3",
                        "focus_theme": "Real-world Project Implementation",
                        "action_items": ["Deploy capstone"],
                        "estimated_hours": 15,
                    },
                    {
                        "week": "Week 4",
                        "focus_theme": "Assessment & Interview Readiness",
                        "action_items": ["Take proctored test"],
                        "estimated_hours": 8,
                    },
                ],
                "industry_advice": "Focus on building verified project repositories and completing skill assessments.",
            }

    # Assemble Graph
    workflow = StateGraph(SkillGapState)
    workflow.add_node("load_student_and_ontology", load_student_and_ontology)
    workflow.add_node("compute_skill_gap_matrix", compute_skill_gap_matrix)
    workflow.add_node("fetch_learning_recommendations", fetch_learning_recommendations)
    workflow.add_node("generate_agentic_roadmap", generate_agentic_roadmap)

    workflow.add_edge(START, "load_student_and_ontology")
    workflow.add_edge("load_student_and_ontology", "compute_skill_gap_matrix")
    workflow.add_edge("compute_skill_gap_matrix", "fetch_learning_recommendations")
    workflow.add_edge("fetch_learning_recommendations", "generate_agentic_roadmap")
    workflow.add_edge("generate_agentic_roadmap", END)

    return workflow.compile()
