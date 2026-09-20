import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Academia-Industry Collaboration Portal"
    API_V1_STR: str = "/api/v1"
    
    # TiDB / PostgreSQL / SQLite Connection String
    # Format for TiDB: mysql+pymysql://<user>:<password>@<host>:4000/<database>?ssl_verify_cert=true&ssl_verify_identity=true
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./aic_portal.db")
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "aic-portal-enterprise-secret-key-prod-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
