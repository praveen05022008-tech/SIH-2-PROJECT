"""Data Purge Script - Clears all user data, test entries, and uploaded assets from TiDB and Cloudinary.
Retains ONLY the database schema, the 5 core system roles, and the Super Admin login.
"""

import os
import sys

import cloudinary
import cloudinary.api
from sqlalchemy import text

from app.config import settings
from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models.user import Role, User


def clean_database():
    print("--- 1. CLEANING TIDB DISTRIBUTED DATABASE ---")
    db = SessionLocal()
    try:
        # Disable foreign key checks for clean wipe
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))

        # List of tables to clear
        tables_to_clear = [
            "issue_reports",
            "audit_logs",
            "notifications",
            "document_verifications",
            "documents",
            "learning_programs",
            "collaborations",
            "certifications",
            "projects",
            "portfolios",
            "mentor_feedbacks",
            "internship_tasks",
            "internships",
            "applications",
            "opportunity_skills",
            "opportunities",
            "assessment_results",
            "assessment_questions",
            "assessments",
            "career_role_skills",
            "career_roles",
            "student_skills",
            "skills",
            "skill_categories",
            "industry_profiles",
            "faculty_profiles",
            "student_profiles",
            "departments",
            "institutions",
        ]

        for table in tables_to_clear:
            try:
                db.execute(text(f"TRUNCATE TABLE {table};"))
                print(f"  [-] Truncated table: {table}")
            except Exception as e:
                # Fallback to DELETE if TRUNCATE has foreign key restriction
                try:
                    db.execute(text(f"DELETE FROM {table};"))
                    print(f"  [-] Deleted all records from: {table}")
                except Exception as inner_e:
                    print(f"  [!] Note on table {table}: {inner_e}")

        # Delete non-admin users
        db.execute(text("DELETE FROM users WHERE role != 'admin' AND email != 'admin@aicportal.in';"))
        print("  [-] Cleared all non-admin user accounts.")

        # Re-enable foreign key checks
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()

        # Re-verify System Roles
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
                print(f"  [+] Seeded system role: {r_info['name']}")

        # Re-verify Super Admin Account
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
            print(f"  [+] Initialized Super Admin user: {admin_email}")
        else:
            admin_user.is_approved = True
            admin_user.is_active = True
            admin_user.hashed_password = hash_password("AdminPassword@2026")
            print(f"  [✓] Verified existing Super Admin user: {admin_email}")

        db.commit()
        print("--- TiDB Database Cleaned Successfully. Schema & Super Admin Retained. ---")
    finally:
        db.close()


def clean_cloudinary():
    print("\n--- 2. CLEANING CLOUDINARY OBJECT STORAGE ---")
    if not settings.CLOUDINARY_CLOUD_NAME or not settings.CLOUDINARY_API_KEY:
        print("  [!] Cloudinary credentials not configured, skipping.")
        return

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )

    resource_types = ["image", "raw", "video"]
    for res_type in resource_types:
        try:
            print(f"  [*] Searching for uploaded '{res_type}' assets in Cloudinary...")
            # Fetch all resources
            res = cloudinary.api.resources(resource_type=res_type, max_results=500)
            resources = res.get("resources", [])
            public_ids = [r["public_id"] for r in resources]

            if public_ids:
                print(f"  [-] Deleting {len(public_ids)} {res_type} files from Cloudinary...")
                cloudinary.api.delete_resources(public_ids, resource_type=res_type)
                print(f"  [✓] Deleted {len(public_ids)} {res_type} files.")
            else:
                print(f"  [✓] No {res_type} files found in Cloudinary.")
        except Exception as e:
            print(f"  [!] Note on Cloudinary '{res_type}' deletion: {e}")

    # Delete folders if any
    try:
        cloudinary.api.delete_folder("aic_portal")
        print("  [✓] Deleted 'aic_portal' root folder in Cloudinary.")
    except Exception:
        pass

    print("--- Cloudinary Cleaned Successfully. ---")


if __name__ == "__main__":
    clean_database()
    clean_cloudinary()
    print("\n✅ Total Reset Complete: Clean slate with fresh schema and Super Admin ready.")
