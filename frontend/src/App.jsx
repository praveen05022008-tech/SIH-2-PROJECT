import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';


// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AboutPage } from './pages/public/AboutPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { PublicPortfolioPage } from './pages/public/PublicPortfolioPage';

// Student Pages

import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentAssessmentsPage } from './pages/student/StudentAssessmentsPage';
import { AssessmentResultsPage } from './pages/student/AssessmentResultsPage';
import { StudentSkillsPage } from './pages/student/StudentSkillsPage';
import { SkillGapAnalysisPage } from './pages/student/SkillGapAnalysisPage';
import { StudentOpportunitiesPage } from './pages/student/StudentOpportunitiesPage';
import { StudentApplicationsPage } from './pages/student/StudentApplicationsPage';
import { StudentPortfolioPage } from './pages/student/StudentPortfolioPage';
import { InternshipProgressPage } from './pages/student/InternshipProgressPage';
import { MentorFeedbackPage } from './pages/student/MentorFeedbackPage';
import { StudentLearningPage } from './pages/student/StudentLearningPage';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyProfilePage } from './pages/faculty/FacultyProfilePage';
import { FacultyOpportunitiesPage } from './pages/faculty/FacultyOpportunitiesPage';
import { FacultyApplicationsPage } from './pages/faculty/FacultyApplicationsPage';
import { FacultyCollaborationsPage } from './pages/faculty/FacultyCollaborationsPage';
import { StudentLearningPage as FacultyLearningPage } from './pages/student/StudentLearningPage';

// Industry Pages
import { IndustryDashboard } from './pages/industry/IndustryDashboard';
import { IndustryProfilePage } from './pages/industry/IndustryProfilePage';
import { PostOpportunityPage } from './pages/industry/PostOpportunityPage';
import { MyOpportunitiesPage } from './pages/industry/MyOpportunitiesPage';
import { IndustryApplicationsPage } from './pages/industry/IndustryApplicationsPage';
import { IndustryMentorshipPage } from './pages/industry/IndustryMentorshipPage';
import { IndustryCollaborationsPage } from './pages/industry/IndustryCollaborationsPage';

// Institution Pages
import { InstitutionDashboard } from './pages/institution/InstitutionDashboard';
import { DepartmentsPage } from './pages/institution/DepartmentsPage';
import { InstitutionStudentsPage } from './pages/institution/InstitutionStudentsPage';
import { InstitutionPlacementsPage } from './pages/institution/InstitutionPlacementsPage';
import { DocumentVerificationPage } from './pages/institution/DocumentVerificationPage';
import { InstitutionCollaborationsPage } from './pages/institution/InstitutionCollaborationsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminApprovalsPage } from './pages/admin/AdminApprovalsPage';
import { AdminIssuesPage } from './pages/admin/AdminIssuesPage';
import { AdminSkillsPage } from './pages/admin/AdminSkillsPage';
import { AdminAssessmentsPage } from './pages/admin/AdminAssessmentsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/portfolio/:username" element={<PublicPortfolioPage />} />

          {/* Role 1: Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/assessments" element={<StudentAssessmentsPage />} />
          <Route path="/student/assessment-results" element={<Navigate to="/student/assessments" replace />} />
          <Route path="/student/skills" element={<Navigate to="/student/profile" replace />} />
          <Route path="/student/gap-analysis" element={<SkillGapAnalysisPage />} />
          <Route path="/student/opportunities" element={<StudentOpportunitiesPage />} />
          <Route path="/student/applications" element={<StudentApplicationsPage />} />
          <Route path="/student/portfolio" element={<Navigate to="/student/profile?tab=portfolio" replace />} />
          <Route path="/student/internship-progress" element={<InternshipProgressPage />} />
          <Route path="/student/mentor-feedback" element={<MentorFeedbackPage />} />
          <Route path="/student/learning-programs" element={<StudentLearningPage />} />

          {/* Role 2: Academician / Faculty Routes */}
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/profile" element={<FacultyProfilePage />} />
          <Route path="/faculty/opportunities" element={<FacultyOpportunitiesPage />} />
          <Route path="/faculty/applications" element={<FacultyApplicationsPage />} />
          <Route path="/faculty/collaborations" element={<FacultyCollaborationsPage />} />
          <Route path="/faculty/learning-programs" element={<FacultyLearningPage />} />

          {/* Role 3: Industry Routes */}
          <Route path="/industry/dashboard" element={<IndustryDashboard />} />
          <Route path="/industry/profile" element={<IndustryProfilePage />} />
          <Route path="/industry/post-opportunity" element={<PostOpportunityPage />} />
          <Route path="/industry/my-opportunities" element={<MyOpportunitiesPage />} />
          <Route path="/industry/applications" element={<IndustryApplicationsPage />} />
          <Route path="/industry/mentorship" element={<IndustryMentorshipPage />} />
          <Route path="/industry/collaborations" element={<IndustryCollaborationsPage />} />

          {/* Role 4: Institution Routes (Separated from Admin!) */}
          <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
          <Route path="/institution/profile" element={<InstitutionDashboard />} />
          <Route path="/institution/departments" element={<DepartmentsPage />} />
          <Route path="/institution/students" element={<InstitutionStudentsPage />} />
          <Route path="/institution/faculty" element={<InstitutionStudentsPage />} />
          <Route path="/institution/placements" element={<InstitutionPlacementsPage />} />
          <Route path="/institution/document-verification" element={<DocumentVerificationPage />} />
          <Route path="/institution/collaborations" element={<InstitutionCollaborationsPage />} />

          {/* Role 5: Super Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/approvals" element={<AdminApprovalsPage />} />
          <Route path="/admin/issues" element={<AdminIssuesPage />} />
          <Route path="/admin/skills" element={<AdminSkillsPage />} />
          <Route path="/admin/assessments" element={<AdminAssessmentsPage />} />
          <Route path="/admin/opportunities" element={<MyOpportunitiesPage />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ToastProvider>
  );
}
