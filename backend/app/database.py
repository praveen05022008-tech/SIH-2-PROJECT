import os

from app.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

db_url = settings.DATABASE_URL

# Normalize URL to standard SQLAlchemy pymysql driver
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)
elif db_url.startswith("mysql+mysqldb://"):
    db_url = db_url.replace("mysql+mysqldb://", "mysql+pymysql://", 1)
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Ensure ssl_verify_cert is provided for TiDB Cloud
if "gateway01" in db_url and "ssl_verify_cert" not in db_url:
    separator = "&" if "?" in db_url else "?"
    db_url = f"{db_url}{separator}ssl_verify_cert=true&ssl_verify_identity=true"

engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "pool_size": 10,
    "max_overflow": 20,
}

if db_url.startswith("sqlite"):
    engine_kwargs = {"pool_pre_ping": True, "connect_args": {"check_same_thread": False}}

engine = create_engine(db_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
