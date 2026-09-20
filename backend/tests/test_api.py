import time
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/healthz")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"
    assert "Academia" in res.json()["project"]

def test_admin_login():
    res = client.post("/api/v1/auth/login", json={
        "username_or_email": "admin@aicportal.in",
        "password": "AdminPassword@2026"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "admin"
    assert "access_token" in data

def test_unapproved_student_registration():
    ts = int(time.time())
    res = client.post("/api/v1/auth/register", json={
        "email": f"candidate_{ts}@domain.com",
        "username": f"cand_{ts}",
        "password": "Password123!",
        "role": "student",
        "full_name": "Test Candidate",
        "course": "B.Tech Computer Science"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["is_approved"] is False
