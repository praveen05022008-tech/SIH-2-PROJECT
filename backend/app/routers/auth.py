from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.audit import log_audit
from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.profile import FacultyProfile, IndustryProfile, StudentProfile
from app.models.user import Department, Institution, User
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.schemas.user import UserResponse
from app.services.email_service import send_welcome_email
from app.services.notification import send_notification

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    # 1. Validate role (Students and Faculty are provisioned via verified institution CSV rosters)
    allowed_roles = ["industry", "institution"]
    if data.role in ["student", "faculty"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Students and Faculty cannot self-register directly. Institutional stakeholders provision student and faculty credentials via bulk roster upload.",
        )
    if data.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid registration role. Public registration is only open to: {allowed_roles}",
        )

    # 2. Check duplicate email or username
    existing_user = db.query(User).filter((User.email == data.email) | (User.username == data.username)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email or username already exists"
        )

    # 3. Create User record (Requires admin approval)
    hashed_pwd = hash_password(data.password)
    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hashed_pwd,
        role=data.role,
        is_approved=False,  # Registration approval workflow
        is_active=True,
        institution_id=data.institution_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 4. Create Role-specific Profile
    if data.role == "student":
        student_prof = StudentProfile(
            user_id=user.id,
            full_name=data.full_name,
            phone=data.phone,
            address=data.address,
            institution_id=data.institution_id,
            department_id=data.department_id,
            course=data.course,
            year_of_study=data.year_of_study,
        )
        db.add(student_prof)
    elif data.role == "faculty":
        faculty_prof = FacultyProfile(
            user_id=user.id,
            full_name=data.full_name,
            phone=data.phone,
            institution_id=data.institution_id,
            department_id=data.department_id,
            designation=data.designation,
        )
        db.add(faculty_prof)
    elif data.role == "industry":
        comp_name = data.company_name or data.full_name
        ind_prof = IndustryProfile(
            user_id=user.id,
            company_name=comp_name,
            sector=data.sector,
            contact_person=data.full_name,
            contact_email=data.email,
            contact_phone=data.phone,
        )
        db.add(ind_prof)
    elif data.role == "institution":
        # If institution doesn't exist yet, create it
        inst_name = data.institution_name or data.full_name
        existing_inst = db.query(Institution).filter(Institution.name == inst_name).first()
        if not existing_inst:
            code = "".join([w[0].upper() for w in inst_name.split() if w])[:8]
            existing_inst = Institution(
                name=inst_name,
                code=code,
                contact_email=data.email,
                contact_phone=data.phone,
                verification_status="pending",
            )
            db.add(existing_inst)
            db.commit()
            db.refresh(existing_inst)
        user.institution_id = existing_inst.id
        db.commit()

    db.commit()

    # Send Welcome / Registration confirmation email to the user
    send_welcome_email(
        to_email=user.email,
        full_name=data.full_name,
        role=data.role,
    )

    # Notify all admins of pending approval
    admins = db.query(User).filter(User.role == "admin").all()
    for adm in admins:
        send_notification(
            db=db,
            user_id=adm.id,
            title="New User Registration",
            message=f"New {data.role.capitalize()} registration: {data.full_name} ({data.email}) is pending approval.",
            notification_type="approval",
            link_url="/admin/approvals",
        )

    log_audit(
        db=db,
        action="REGISTER",
        user_id=user.id,
        resource_type="USER",
        resource_id=str(user.id),
        details={"email": user.email, "role": user.role},
        ip_address=request.client.host if request.client else None,
    )

    return {
        "message": "Registration submitted successfully. Your account is pending administrator approval.",
        "user_id": user.id,
        "is_approved": False,
    }


@router.post("/login", response_model=Token)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter((User.email == data.username_or_email) | (User.username == data.username_or_email))
        .first()
    )

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username/email or password")

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated by the system administrator.",
        )

    token_data = {"sub": str(user.id), "role": user.role, "username": user.username, "is_approved": user.is_approved}
    access_token = create_access_token(data=token_data)

    log_audit(
        db=db,
        action="LOGIN",
        user_id=user.id,
        resource_type="AUTH",
        resource_id=str(user.id),
        details={"role": user.role},
        ip_address=request.client.host if request.client else None,
    )

    return Token(
        access_token=access_token, role=user.role, user_id=user.id, username=user.username, is_approved=user.is_approved
    )


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile_data = None
    if current_user.role == "student" and current_user.student_profile:
        profile_data = {
            "id": current_user.student_profile.id,
            "full_name": current_user.student_profile.full_name,
            "phone": current_user.student_profile.phone,
            "course": current_user.student_profile.course,
            "year_of_study": current_user.student_profile.year_of_study,
            "cgpa": current_user.student_profile.cgpa,
            "resume_url": current_user.student_profile.resume_url,
            "profile_photo_url": current_user.student_profile.profile_photo_url,
            "institution_name": (
                current_user.student_profile.institution.name if current_user.student_profile.institution else None
            ),
        }
    elif current_user.role == "faculty" and current_user.faculty_profile:
        profile_data = {
            "id": current_user.faculty_profile.id,
            "full_name": current_user.faculty_profile.full_name,
            "designation": current_user.faculty_profile.designation,
            "qualification": current_user.faculty_profile.qualification,
            "institution_name": (
                current_user.faculty_profile.institution.name if current_user.faculty_profile.institution else None
            ),
        }
    elif current_user.role == "industry" and current_user.industry_profile:
        profile_data = {
            "id": current_user.industry_profile.id,
            "company_name": current_user.industry_profile.company_name,
            "sector": current_user.industry_profile.sector,
            "location": current_user.industry_profile.location,
            "verification_status": current_user.industry_profile.verification_status,
        }
    elif current_user.role == "institution" and current_user.institution:
        profile_data = {
            "id": current_user.institution.id,
            "name": current_user.institution.name,
            "code": current_user.institution.code,
            "verification_status": current_user.institution.verification_status,
        }

    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "role": current_user.role,
        "is_approved": current_user.is_approved,
        "is_active": current_user.is_active,
        "institution_id": current_user.institution_id,
        "profile": profile_data,
    }


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out"}
