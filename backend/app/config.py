import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Academia-Industry Collaboration Portal"
    API_V1_STR: str = "/api/v1"
    
    # TiDB Connection String
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://zp21Ecbg9ccu3LS.root:8ELDXXLEwm3iOS3r@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/aic_portal?ssl_verify_cert=true&ssl_verify_identity=true"
    )
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "aic-portal-enterprise-secret-key-prod-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Cloudinary Cloud Storage
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")
    
    # Groq AI Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    
    # Uploads fallback local directory
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Ensure uploads directory exists for fallback/temp files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
