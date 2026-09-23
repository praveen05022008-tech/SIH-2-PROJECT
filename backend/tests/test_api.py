import time

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/healthz")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "TiDB" in data["database"]
    assert "Cloudinary" in data["storage"]
    assert "Groq" in data["ai_engine"]


def test_admin_login():
    res = client.post(
        "/api/v1/auth/login", json={"username_or_email": "admin@aicportal.in", "password": "AdminPassword@2026"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "admin"
    assert "access_token" in data


def test_student_registration_and_flow():
    ts = int(time.time())
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": f"candidate_{ts}@domain.com",
            "username": f"cand_{ts}",
            "password": "Password123!",
            "role": "student",
            "full_name": "Test Candidate",
            "course": "B.Tech Computer Science",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["is_approved"] is False
    assert data["user_id"] > 0


def test_ai_skill_gap_roadmap():
    admin_token = create_access_token({"sub": "1", "role": "admin"})
    res = client.post(
        "/api/v1/ai/skill-gap-roadmap",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"target_role": "Backend Engineer", "interests": "FastAPI, TiDB, Cloud Storage"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert "overall_readiness_score" in data
    assert len(data.get("four_week_roadmap", [])) > 0


def test_ai_career_counselor():
    admin_token = create_access_token({"sub": "1", "role": "admin"})
    res = client.post(
        "/api/v1/ai/career-counselor",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"message": "What skills are most demanded by top tech industries this year?", "chat_history": []},
    )
    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert len(data["response"]) > 10
