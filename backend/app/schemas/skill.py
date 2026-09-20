from typing import Optional, List
from pydantic import BaseModel

class SkillCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class SkillCategoryCreate(SkillCategoryBase):
    pass

class SkillCategoryResponse(SkillCategoryBase):
    id: int
    class Config:
        from_attributes = True

class SkillBase(BaseModel):
    name: str
    description: Optional[str] = None
    industry_relevance: Optional[str] = "high"
    category_id: Optional[int] = None

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    category: Optional[SkillCategoryResponse] = None
    class Config:
        from_attributes = True

class StudentSkillBase(BaseModel):
    skill_id: int
    skill_level: str = "beginner"  # beginner, intermediate, advanced, expert

class StudentSkillCreate(StudentSkillBase):
    pass

class StudentSkillResponse(StudentSkillBase):
    id: int
    student_id: int
    verified_by_assessment: bool
    score: Optional[float] = None
    skill: Optional[SkillResponse] = None
    class Config:
        from_attributes = True

class CareerRoleSkillResponse(BaseModel):
    id: int
    skill_id: int
    required_level: str
    is_mandatory: bool
    skill: Optional[SkillResponse] = None
    class Config:
        from_attributes = True

class CareerRoleResponse(BaseModel):
    id: int
    title: str
    sector: Optional[str] = None
    description: Optional[str] = None
    required_skills: List[CareerRoleSkillResponse] = []
    class Config:
        from_attributes = True
