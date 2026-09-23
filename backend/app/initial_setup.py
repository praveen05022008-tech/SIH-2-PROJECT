"""Initial Setup Script - Seeds ONLY system roles and initial Super Admin.
Strictly adheres to Zero Fake Data policy: No dummy candidates, no fake postings, no simulated metrics.
"""

from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models.user import Role, User


def init_db():
    print("Creating all database tables (28 relational tables)...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Populate ONLY the 5 system roles
        system_roles = [
            {"name": "student", "description": "Student stakeholder - assess, learn, apply, portfolio"},
            {"name": "faculty", "description": "Academician / Faculty stakeholder - FDPs, research, consultancy"},
            {"name": "industry", "description": "Industry stakeholder - post opportunities, evaluate, recruit"},
            {"name": "institution", "description": "Institution stakeholder - monitor, verify, govern"},
            {"name": "admin", "description": "Super Administrator - platform governance and approvals"},
        ]

        for r_info in system_roles:
            role = db.query(Role).filter(Role.name == r_info["name"]).first()
            if not role:
                role = Role(name=r_info["name"], description=r_info["description"])
                db.add(role)
                print(f" [+] Created system role: {r_info['name']}")

        # 2. Bootstrap initial Super Admin account if not present
        admin_email = "admin@aicportal.in"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                email=admin_email,
                username="superadmin",
                hashed_password=hash_password("AdminPassword@2026"),
                role="admin",
                is_approved=True,
                is_active=True,
            )
            db.add(admin_user)
            print(f" [+] Initialized Super Admin account ({admin_email})")

        db.commit()
        print("Database initialization completed successfully with zero fake data.")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
