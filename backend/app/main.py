import os

from app.config import settings
from app.initial_setup import init_db

# Routers
from app.routers import (
    admin,
    ai,
    analytics,
    applications,
    assessments,
    auth,
    collaborations,
    documents,
    internships,
    issues,
    learning,
    opportunities,
    portfolios,
    profiles,
    skills,
    users,
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Centralized Platform for Academia–Industry Collaboration for Skill Mapping, Internships and Placement",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded documents fallback
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount API v1 Routers
v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=v1)
app.include_router(users.router, prefix=v1)
app.include_router(profiles.router, prefix=v1)
app.include_router(skills.router, prefix=v1)
app.include_router(assessments.router, prefix=v1)
app.include_router(opportunities.router, prefix=v1)
app.include_router(applications.router, prefix=v1)
app.include_router(internships.router, prefix=v1)
app.include_router(portfolios.router, prefix=v1)
app.include_router(collaborations.router, prefix=v1)
app.include_router(learning.router, prefix=v1)
app.include_router(documents.router, prefix=v1)
app.include_router(analytics.router, prefix=v1)
app.include_router(admin.router, prefix=v1)
app.include_router(ai.router, prefix=v1)
app.include_router(issues.router, prefix=v1)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/healthz", tags=["System Health"])
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "database": "TiDB Distributed SQL",
        "storage": "Cloudinary CDN",
        "ai_engine": "Groq Cloud API",
        "version": "1.0.0",
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Academia–Industry Collaboration Portal API is running.",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
    }
