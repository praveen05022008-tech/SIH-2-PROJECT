import json
import logging
from typing import Any, Dict, List

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langchain_ollama import ChatOllama
from langgraph.graph import END, START, StateGraph
from sqlalchemy.orm import Session

from app.agents.state import CandidateMatchState
from app.config import settings
from app.models.opportunity import Opportunity, OpportunitySkill
from app.models.profile import StudentProfile
from app.models.skill import Skill, StudentSkill
from app.models.user import User

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
            logger.warning(f"Failed to initialize ChatOllama for matching graph: {e}. Falling back to Groq...")

    if settings.GROQ_API_KEY:
        return ChatGroq(temperature=0.2, groq_api_key=settings.GROQ_API_KEY, model_name=settings.GROQ_MODEL)

    return ChatOllama(model=settings.OLLAMA_MODEL, base_url=settings.OLLAMA_BASE_URL, temperature=0.2)


def create_candidate_matching_graph(db: Session):
    """
    Constructs a LangGraph StateGraph pipeline for Candidate-Opportunity Matching & Explainability:
    START -> load_opportunity_and_candidate -> evaluate_eligibility_and_skill_score -> generate_recruiter_explainability -> END
    """

    def load_opportunity_and_candidate(state: CandidateMatchState) -> Dict[str, Any]:
        opp_id = state.get("opportunity_id")
        candidate_id = state.get("candidate_id")

        opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
        opp_data = {
            "id": opp_id,
            "title": opp.title if opp else "Opportunity",
            "company_name": opp.company_name if opp else "Company",
            "type": opp.type if opp else "internship",
            "min_cgpa": opp.eligibility_cgpa if opp else 0.0,
            "required_skills": [],
        }
        if opp:
            for s in opp.skills:
                if s.skill:
                    opp_data["required_skills"].append(
                        {"name": s.skill.name, "level": s.minimum_level, "mandatory": s.is_mandatory}
                    )

        student = (
            db.query(StudentProfile)
            .filter((StudentProfile.id == candidate_id) | (StudentProfile.user_id == candidate_id))
            .first()
        )

        candidate_profile = {
            "name": student.full_name if student else "Candidate",
            "cgpa": student.cgpa if (student and student.cgpa) else 8.0,
            "year": student.year_of_study if (student and student.year_of_study) else 3,
            "skills": [],
        }

        if student:
            for ss in db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all():
                sk = db.query(Skill).filter(Skill.id == ss.skill_id).first()
                if sk:
                    candidate_profile["skills"].append(
                        {
                            "name": sk.name,
                            "level": ss.skill_level,
                            "verified": ss.verified_by_assessment,
                            "score": ss.score,
                        }
                    )

        return {"opportunity_data": opp_data, "candidate_profile": candidate_profile}

    def evaluate_eligibility_and_skill_score(state: CandidateMatchState) -> Dict[str, Any]:
        opp = state.get("opportunity_data", {})
        cand = state.get("candidate_profile", {})

        reasons = []
        missing = []
        is_eligible = True

        min_cgpa = opp.get("min_cgpa") or 0.0
        cand_cgpa = cand.get("cgpa") or 0.0
        if min_cgpa > 0:
            if cand_cgpa < min_cgpa:
                is_eligible = False
                reasons.append(f"Eligibility flag: CGPA {cand_cgpa} is below required {min_cgpa}")
            else:
                reasons.append(f"Meets CGPA requirement ({cand_cgpa} >= {min_cgpa})")

        cand_skill_map = {s["name"].lower(): s for s in cand.get("skills", [])}
        req_skills = opp.get("required_skills", [])

        if not req_skills:
            score = 80.0 if is_eligible else 45.0
            reasons.append("General opportunity: open to broad candidate skill profiles.")
            return {
                "deterministic_score": score,
                "eligibility_passed": is_eligible,
                "match_reasons": reasons,
                "missing_skills": [],
            }

        total_weight = 0.0
        earned_weight = 0.0

        for req in req_skills:
            weight = 2.0 if req.get("mandatory") else 1.0
            total_weight += weight
            sk_name = req["name"]

            matched = cand_skill_map.get(sk_name.lower())
            if matched:
                earned_weight += weight
                verified_str = " (Assessment Verified)" if matched.get("verified") else ""
                reasons.append(
                    f"Verified skill match: {sk_name} at {matched.get('level', 'intermediate').capitalize()}{verified_str}"
                )
            else:
                missing.append(sk_name)
                if req.get("mandatory"):
                    reasons.append(f"Missing required competency: {sk_name}")

        coverage = (earned_weight / total_weight) * 100.0 if total_weight > 0 else 60.0
        final_score = round(coverage if is_eligible else coverage * 0.5, 1)

        return {
            "deterministic_score": final_score,
            "eligibility_passed": is_eligible,
            "match_reasons": reasons,
            "missing_skills": missing,
        }

    def generate_recruiter_explainability(state: CandidateMatchState) -> Dict[str, Any]:
        llm = get_llm()

        sys_msg = SystemMessage(
            content=(
                "You are an AI Technical Hiring Evaluator for recruiters in a LangGraph matching pipeline. "
                "Analyze the candidate against opportunity requirements and provide explainable hiring telemetry. "
                "Output ONLY valid JSON with keys: "
                "'match_verdict' (string), 'key_strengths' (list of strings), "
                "'suggested_interview_questions' (list of 3 targeted technical questions)."
            )
        )

        usr_msg = HumanMessage(content=f"""
            Opportunity: {json.dumps(state.get('opportunity_data', {}))}
            Candidate Profile: {json.dumps(state.get('candidate_profile', {}))}
            Deterministic Score: {state.get('deterministic_score', 0)}%
            Eligibility: {state.get('eligibility_passed', True)}
            Reasons: {json.dumps(state.get('match_reasons', []))}
            Missing: {json.dumps(state.get('missing_skills', []))}
            """)

        try:
            response = llm.invoke([sys_msg, usr_msg])
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]

            parsed = json.loads(content.strip())
            return {
                "ai_verdict": parsed.get("match_verdict", "Candidate matches key criteria."),
                "key_strengths": parsed.get("key_strengths", state.get("match_reasons", [])),
                "suggested_interview_questions": parsed.get("suggested_interview_questions", []),
            }
        except Exception as e:
            logger.warning(f"Matching AI generation error: {e}")
            return {
                "ai_verdict": f"Score: {state.get('deterministic_score')}% with eligibility {'verified' if state.get('eligibility_passed') else 'flagged'}.",
                "key_strengths": state.get("match_reasons", []),
                "suggested_interview_questions": [
                    "Walk me through a project where you implemented core technical competencies.",
                    "How do you approach debugging complex systems under tight deadlines?",
                    "What strategies do you use to quickly acquire missing skills on the job?",
                ],
            }

    workflow = StateGraph(CandidateMatchState)
    workflow.add_node("load_opportunity_and_candidate", load_opportunity_and_candidate)
    workflow.add_node("evaluate_eligibility_and_skill_score", evaluate_eligibility_and_skill_score)
    workflow.add_node("generate_recruiter_explainability", generate_recruiter_explainability)

    workflow.add_edge(START, "load_opportunity_and_candidate")
    workflow.add_edge("load_opportunity_and_candidate", "evaluate_eligibility_and_skill_score")
    workflow.add_edge("evaluate_eligibility_and_skill_score", "generate_recruiter_explainability")
    workflow.add_edge("generate_recruiter_explainability", END)

    return workflow.compile()
