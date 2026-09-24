"""Initial Setup Script - Seeds system roles, initial Super Admin, standard skill taxonomy,
and verified demo accounts for all 5 stakeholder roles for seamless portal testing.
"""

import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import app.models  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.database import Base, SessionLocal, engine  # noqa: E402
from app.models.profile import FacultyProfile, IndustryProfile, StudentProfile  # noqa: E402
from app.models.skill import CareerRole, CareerRoleSkill, Skill, SkillCategory, StudentSkill  # noqa: E402
from app.models.user import Department, Institution, Role, User  # noqa: E402


def init_db():
    print("Creating all database tables (28 relational tables)...")
    Base.metadata.create_all(bind=engine)

    from sqlalchemy import inspect, text

    try:
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        migrations = [
            ("learning_programs", "target_audience", "VARCHAR(50) DEFAULT 'all'"),
            ("learning_programs", "faculty_credits", "FLOAT DEFAULT 2.0"),
            ("learning_programs", "delivery_format", "VARCHAR(50) DEFAULT 'online'"),
            ("certificates", "recipient_role", "VARCHAR(50) DEFAULT 'student'"),
            ("certificates", "credits", "FLOAT NULL"),
            ("certificates", "designation", "VARCHAR(100) NULL"),
            ("certificates", "institution_name", "VARCHAR(255) NULL"),
            ("opportunities", "target_departments", "VARCHAR(255) NULL"),
            ("opportunities", "min_experience_years", "INTEGER NULL"),
            ("opportunities", "academic_qualification", "VARCHAR(100) NULL"),
            ("applications", "noc_document_url", "VARCHAR(500) NULL"),
        ]
        with engine.connect() as conn:
            for tbl, col, col_type in migrations:
                if tbl in table_names:
                    existing_cols = [c["name"] for c in inspector.get_columns(tbl)]
                    if col not in existing_cols:
                        try:
                            conn.execute(text(f"ALTER TABLE {tbl} ADD COLUMN {col} {col_type}"))
                            conn.commit()
                            print(f" [+] Auto-migrated: added column '{col}' to '{tbl}'")
                        except Exception as ex:
                            print(f" [!] Note for {tbl}.{col}: {ex}")
    except Exception as e:
        print(f" [!] Auto-migration check note: {e}")

    db = SessionLocal()
    try:
        # 1. Populate the 5 system roles
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

        # 2. Seed default Institution & Departments if none exist
        default_inst = db.query(Institution).first()
        if not default_inst:
            default_inst = Institution(
                name="Apex Institute of Science and Technology",
                code="AIST-001",
                address="Tech Innovation Park, Sector 4",
                contact_email="registrar@aist.edu.in",
                contact_phone="+91 98765 43210",
                website="https://aist.edu.in",
                verification_status="verified",
            )
            db.add(default_inst)
            db.flush()
            print(f" [+] Created default institution: {default_inst.name}")

            dept_names = [
                ("Computer Science & Engineering", "CSE"),
                ("Information Technology", "IT"),
                ("Data Science & Artificial Intelligence", "DSAI"),
                ("Electronics & Communication", "ECE"),
            ]
            for d_name, d_code in dept_names:
                dept = Department(institution_id=default_inst.id, name=d_name, code=d_code)
                db.add(dept)
            db.flush()
            print(f" [+] Initialized {len(dept_names)} academic departments")

        default_dept = db.query(Department).first()

        # 3. Seed foundational Skill Taxonomy if empty
        if db.query(SkillCategory).count() == 0:
            categories_data = [
                (
                    "Web & Full Stack",
                    "Web applications, frontend, backend architectures and APIs",
                    [
                        ("Python", "technical", "advanced"),
                        ("JavaScript", "technical", "advanced"),
                        ("TypeScript", "technical", "intermediate"),
                        ("React", "technical", "advanced"),
                        ("FastAPI", "technical", "intermediate"),
                        ("Node.js", "technical", "intermediate"),
                        ("SQL", "technical", "advanced"),
                        ("REST APIs", "technical", "advanced"),
                    ],
                ),
                (
                    "Cloud & DevOps",
                    "Cloud infrastructure, containerization and continuous integration",
                    [
                        ("Docker", "technical", "intermediate"),
                        ("Kubernetes", "technical", "beginner"),
                        ("AWS Cloud", "technical", "intermediate"),
                        ("Git & GitHub", "technical", "advanced"),
                        ("CI/CD Automation", "technical", "intermediate"),
                    ],
                ),
                (
                    "AI & Data Science",
                    "Machine learning, analytics, and intelligent systems",
                    [
                        ("Machine Learning", "technical", "intermediate"),
                        ("Deep Learning", "technical", "intermediate"),
                        ("Data Analytics", "technical", "intermediate"),
                        ("NLP", "technical", "beginner"),
                    ],
                ),
                (
                    "Core Professional Competencies",
                    "Essential cross-functional and teamwork competencies",
                    [
                        ("Problem Solving", "soft", "advanced"),
                        ("System Design", "technical", "intermediate"),
                        ("Agile Collaboration", "soft", "advanced"),
                    ],
                ),
            ]

            for cat_name, cat_desc, skills_list in categories_data:
                cat = SkillCategory(name=cat_name, description=cat_desc)
                db.add(cat)
                db.flush()
                for item in skills_list:
                    s_name = item[0]
                    s_relevance = item[2] if len(item) > 2 else "high"
                    existing_s = db.query(Skill).filter(Skill.name == s_name).first()
                    if not existing_s:
                        s_obj = Skill(
                            name=s_name,
                            category_id=cat.id,
                            description=f"{s_name} competency",
                            industry_relevance=s_relevance,
                        )
                        db.add(s_obj)
            db.flush()
            print(" [+] Populated standard skill categories and industry skills ontology")

        # 4. Seed standard Career Roles if empty
        if db.query(CareerRole).count() == 0:
            career_roles = [
                ("Full Stack Engineer", "Technology", "End-to-end web system architect and application builder"),
                (
                    "AI / ML Engineer",
                    "Artificial Intelligence",
                    "Intelligent models, inference pipelines, and machine learning specialist",
                ),
                (
                    "Cloud DevOps Engineer",
                    "Cloud & Infrastructure",
                    "Scalable cloud deployments, containers, and automated workflows",
                ),
                ("Data Analyst", "Analytics", "Enterprise data telemetry, analytics, and reporting specialist"),
            ]
            for r_title, r_sector, r_desc in career_roles:
                cr = CareerRole(title=r_title, sector=r_sector, description=r_desc)
                db.add(cr)
            db.flush()
            print(f" [+] Initialized {len(career_roles)} standard career tracks")

        # 5. Bootstrap Initial Super Admin account if not present
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

        # 6. Bootstrap Demo Accounts for All 4 Other Roles
        demo_accounts = [
            {
                "email": "student@aicportal.in",
                "username": "student_demo",
                "password": "DemoPassword@2026",
                "role": "student",
                "full_name": "Aarav Sharma",
                "profile_type": "student",
            },
            {
                "email": "faculty@aicportal.in",
                "username": "faculty_demo",
                "password": "DemoPassword@2026",
                "role": "faculty",
                "full_name": "Dr. Priya Iyer",
                "profile_type": "faculty",
            },
            {
                "email": "industry@aicportal.in",
                "username": "industry_demo",
                "password": "DemoPassword@2026",
                "role": "industry",
                "company_name": "Nexus Dynamics Corp",
                "sector": "Information Technology",
                "profile_type": "industry",
            },
            {
                "email": "institution@aicportal.in",
                "username": "institution_demo",
                "password": "DemoPassword@2026",
                "role": "institution",
                "profile_type": "institution",
            },
        ]

        for acc in demo_accounts:
            existing = db.query(User).filter(User.email == acc["email"]).first()
            if not existing:
                u = User(
                    email=acc["email"],
                    username=acc["username"],
                    hashed_password=hash_password(acc["password"]),
                    role=acc["role"],
                    is_approved=True,
                    is_active=True,
                    institution_id=default_inst.id if default_inst else None,
                )
                db.add(u)
                db.flush()

                if acc["profile_type"] == "student":
                    sp = StudentProfile(
                        user_id=u.id,
                        full_name=acc["full_name"],
                        institution_id=default_inst.id if default_inst else None,
                        department_id=default_dept.id if default_dept else None,
                        course="B.Tech Computer Science & Engineering",
                        year_of_study=3,
                        cgpa=8.8,
                        career_interests="Full Stack Web Development, Cloud Architecture, AI Services",
                    )
                    db.add(sp)
                    db.flush()
                    # Add a couple of initial skills for the demo student
                    py_skill = db.query(Skill).filter(Skill.name == "Python").first()
                    react_skill = db.query(Skill).filter(Skill.name == "React").first()
                    if py_skill:
                        db.add(
                            StudentSkill(
                                student_id=sp.id,
                                skill_id=py_skill.id,
                                skill_level="intermediate",
                                verified_by_assessment=True,
                                score=85,
                            )
                        )
                    if react_skill:
                        db.add(
                            StudentSkill(
                                student_id=sp.id,
                                skill_id=react_skill.id,
                                skill_level="intermediate",
                                verified_by_assessment=True,
                                score=80,
                            )
                        )

                elif acc["profile_type"] == "faculty":
                    fp = FacultyProfile(
                        user_id=u.id,
                        full_name=acc["full_name"],
                        institution_id=default_inst.id if default_inst else None,
                        department_id=default_dept.id if default_dept else None,
                        designation="Associate Professor",
                        specialization="Distributed Computing & Machine Learning",
                        experience_years=9,
                        research_areas="Distributed Systems, Cloud Microservices, AI/ML Pipelines",
                    )
                    db.add(fp)

                elif acc["profile_type"] == "industry":
                    ip = IndustryProfile(
                        user_id=u.id,
                        company_name=acc["company_name"],
                        sector=acc["sector"],
                        description="Global enterprise engineering scalable cloud and web solutions.",
                        location="Bengaluru, India",
                        website="https://nexusdynamics.io",
                        verification_status="verified",
                    )
                    db.add(ip)

                print(f" [+] Initialized demo {acc['role']} account ({acc['email']})")

        db.commit()
        print("Database initialization and taxonomy seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f" [!] Initialization error: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
