# Academia–Industry Collaboration Portal
**A Unified Centralized Platform for Skill Mapping, Internships, Placements, and Industry–Academia Engagement**

---

## 1. Problem Statement & Mission
A significant gap exists between academic education and industry competencies. Students struggle to identify industry expectations, while companies face talent shortages. Simultaneously, faculty have limited access to industrial training, Faculty Development Programs (FDPs), and joint research opportunities.

This platform bridges these gaps by providing an intelligent, secure, and unified ecosystem for **Students**, **Academicians/Faculty**, **Industries**, **Educational Institutions**, and **Administrators**.

---

## 2. Core Architectural Principles
- **Zero Mock Data Policy**: All entities, opportunities, portfolios, assessments, metrics, and analytics are 100% dynamically driven by database records and live API interactions.
- **TiDB Distributed Database**: High-performance, distributed, MySQL-compatible SQL database with automated schema provisioning and strict ACID transactions.
- **Cloudinary Storage**: Secure, resilient cloud asset management for resumes (PDF/DOCX), verified certificates, portfolio deliverables, avatars, and company branding.
- **Groq AI Engine**: High-speed AI inference powering:
  1. *AI Skill Gap Analysis & Learning Roadmaps*
  2. *AI Career Counselor Assistant*
  3. *AI Assessment Quiz & Question Generator*
  4. *AI Resume & Skill Extraction*
  5. *AI Candidate-Opportunity Compatibility Insights*

---

## 3. End-to-End Stakeholder Lifecycle & Workflows

```
                                  ┌───────────────────────────┐
                                  │   Public Landing & Auth   │
                                  └─────────────┬─────────────┘
                                                │
         ┌───────────────────────────┬──────────┴────────────────┬───────────────────────────┐
         ▼                           ▼                           ▼                           ▼
 ┌───────────────┐           ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
 │    Student    │           │    Faculty    │           │   Industry    │           │  Institution  │
 ├───────────────┤           ├───────────────┤           ├───────────────┤           ├───────────────┤
 │• Cloudinary   │           │• Profile &    │           │• Company Page │           │• Real-time    │
 │  Resume / Bio │           │  Research Area│           │• Post Jobs &  │           │  Placement    │
 │• Skill Test & │           │• FDPs & Ind.  │           │  Internships  │           │  Analytics    │
 │  AI Quiz      │           │  Training     │           │• Groq AI Quiz │           │• Verify Docs  │
 │• Groq Roadmap │           │• Joint R&D    │           │  Generator    │           │  & Diplomas   │
 │• Apply & Track│           │  Proposals    │           │• Shortlist &  │           │• Manage MOUs  │
 │• Task Work &  │           │• Consultancy  │           │  Grade Tasks  │           │  with Industry│
 │  Portfolios   │           │  Engagements  │           │• Mentor Logs  │           │               │
 └───────────────┘           └───────────────┘           └───────────────┘           └───────────────┘
```

### 3.1 Student Flow
1. **Profile & Resume Upload**: Direct upload to Cloudinary. Groq AI parses resume text and auto-extracts technical & soft skills.
2. **Skill Assessment & Profiling**: Complete interactive questionnaires and AI-generated topic quizzes. Passing assessments verifies student skills in their profile.
3. **AI Skill Gap Analysis**: Compare student profile against desired roles (e.g. AI Engineer, Full Stack Developer) to receive an AI-generated learning roadmap and course suggestions.
4. **Opportunity Discovery & Smart Matching**: Browse internships and job openings with computed eligibility and AI match scores.
5. **Application & Lifecycle Tracking**: Track status in real time. Once hired, complete assigned tasks, submit project deliverables, receive mentor feedback, and earn verified digital portfolio badges.

### 3.2 Faculty / Academician Flow
1. **Academician Profile**: Showcase research interests, publications, patents, and domain specializations.
2. **Industrial Exposure**: Explore and apply for Faculty Internships, Industrial Training, and Faculty Development Programs (FDPs).
3. **Research & Consultancy Collaboration**: Submit collaborative research proposals and consultancy offerings directly to industry partners.

### 3.3 Industry Flow
1. **Corporate Branding**: Manage company profile, logo (Cloudinary), and department contacts.
2. **Opportunity Management**: Post internships, full-time jobs, apprenticeships, live projects, and FDPs.
3. **AI Assessment Generator**: Generate customized technical quizzes instantly using Groq AI.
4. **Candidate Evaluation & Shortlisting**: View applicant profiles with match percentages, AI candidate fit analysis, and verified skills.
5. **Internship Mentorship**: Assign milestone tasks, review submissions, grade student work, and submit mentor feedback.

### 3.4 Institution Flow
1. **Placement & Readiness Telemetry**: View real-time placement statistics, department-wise skill averages, and student participation rates.
2. **Document Verification**: Review and verify uploaded student certificates, degrees, and internship completion letters with Cloudinary previews.
3. **Collaboration Governance**: Partner with industries for guest lectures, hackathons, curriculum reviews, and formal MOUs.

### 3.5 Super Admin Flow
- Approve industry and institution account registrations.
- Maintain global skills ontology, categories, and standardized curriculum mappings.
- Inspect complete system audit trails for compliance and security.

---

## 4. Environment Configuration & Prerequisites

### Backend Configuration (`backend/.env`)
```ini
# TiDB / MySQL Distributed Database
DATABASE_URL=mysql+pymysql://<username>:<password>@<host>:4000/<dbname>?ssl_verify_cert=true&ssl_verify_identity=true

# Security
SECRET_KEY=aic-portal-super-secret-key-prod-ready
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Groq API Configuration
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama3-70b-8192
```

---

## 5. Technology Stack
- **Frontend**: React 18, Vite, React Router v6, Vanilla CSS / Modern Glassmorphic Design System, Lucide Icons.
- **Backend**: FastAPI, SQLAlchemy 2.0, Pydantic v2, PyJWT, PyMySQL, Cryptography.
- **Database**: TiDB (Distributed SQL).
- **Media**: Cloudinary CDN.
- **AI Engine**: Groq Cloud SDK (`llama3-70b-8192` / `mixtral-8x7b-32768`).
