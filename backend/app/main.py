import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Centralized Platform for Academia–Industry Collaboration for Skill Mapping, Internships and Placement",
)

# CORS setup - supports local development and any deployed Vercel domain
cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if settings.FRONTEND_URL:
    cors_origins.append(settings.FRONTEND_URL.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)


# Explicit OPTIONS preflight handler for cross-origin compliance
@app.options("/{rest_of_path:path}")
async def preflight_options_handler(rest_of_path: str):
    return {}


# Serve uploaded documents fallback safely
try:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
except Exception as e:
    print(f"Static uploads mount notice: {e}")

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
    try:
        init_db()
    except Exception as e:
        print(f"Warning during on_startup init_db: {e}")


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
