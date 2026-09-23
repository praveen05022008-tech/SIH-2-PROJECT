import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ReportIssueModal } from '../common/ReportIssueModal';
import {
  LayoutDashboard,
  UserCheck,
  Award,
  Briefcase,
  FileCheck,
  GraduationCap,
  BookOpen,
  FolderGit2,
  Users,
  Building2,
  Settings,
  LogOut,
  FileText,
  Compass,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showIssueModal, setShowIssueModal] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleLinks = () => {
    switch (user.role) {
      case 'student':
        return [
          { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/student/profile', label: 'My Profile & Portfolio', icon: UserCheck },
          { to: '/student/assessments', label: 'Skill Assessments', icon: Award },
          { to: '/student/gap-analysis', label: 'Skill Gap Analysis', icon: Compass },
          { to: '/student/opportunities', label: 'Internships & Jobs', icon: Briefcase },
          { to: '/student/applications', label: 'My Applications', icon: FileCheck },
          { to: '/student/internship-progress', label: 'Internship Progress', icon: GraduationCap },
          { to: '/student/mentor-feedback', label: 'Mentor Feedback', icon: FileText },
          { to: '/student/learning-programs', label: 'Learning Programs', icon: BookOpen },
        ];
      case 'faculty':
        return [
          { to: '/faculty/dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
          { to: '/faculty/profile', label: 'Faculty Profile', icon: UserCheck },
          { to: '/faculty/opportunities', label: 'Faculty Opportunities', icon: Briefcase },
          { to: '/faculty/applications', label: 'My Applications', icon: FileCheck },
          { to: '/faculty/collaborations', label: 'Collaborations', icon: Building2 },
          { to: '/faculty/learning-programs', label: 'FDPs & Training', icon: BookOpen },
        ];
      case 'industry':
        return [
          { to: '/industry/dashboard', label: 'Industry Dashboard', icon: LayoutDashboard },
          { to: '/industry/profile', label: 'Company Profile', icon: Building2 },
          { to: '/industry/post-opportunity', label: 'Post Opportunity', icon: Briefcase },
          { to: '/industry/my-opportunities', label: 'My Opportunities', icon: FileText },
          { to: '/industry/applications', label: 'Applicant Pipeline', icon: Users },
          { to: '/industry/mentorship', label: 'Internship Tracking', icon: GraduationCap },
          { to: '/industry/collaborations', label: 'Institutional Collab', icon: FolderGit2 },
        ];
      case 'institution':
        return [
          { to: '/institution/dashboard', label: 'Institution Dashboard', icon: LayoutDashboard },
          { to: '/institution/profile', label: 'Institution Profile', icon: Building2 },
          { to: '/institution/departments', label: 'Departments', icon: FolderGit2 },
          { to: '/institution/students', label: 'Student Directory', icon: GraduationCap },
          { to: '/institution/faculty', label: 'Faculty Directory', icon: Users },
          { to: '/institution/placements', label: 'Placements & Internships', icon: Briefcase },
          { to: '/institution/document-verification', label: 'Document Verification', icon: ShieldCheck },
          { to: '/institution/collaborations', label: 'Industry Collaborations', icon: FileCheck },
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'System Dashboard', icon: LayoutDashboard },
          { to: '/admin/approvals', label: 'Registration Approvals', icon: UserCheck },
          { to: '/admin/issues', label: 'Bug Triage & Issues', icon: AlertCircle },
          { to: '/admin/skills', label: 'Skill Taxonomy', icon: Award },
          { to: '/admin/assessments', label: 'Assessments Authoring', icon: FileText },
          { to: '/admin/opportunities', label: 'Opportunity Governance', icon: Briefcase },
          { to: '/admin/audit-logs', label: 'System Audit Logs', icon: ShieldCheck },
          { to: '/admin/settings', label: 'System Settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navLinks = getRoleLinks();

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.svg" alt="AIC Logo" width="32" height="32" />
          <div>
            <div className="sidebar-brand-title">AIC PORTAL</div>
            <div className="sidebar-brand-subtitle">Collaboration Portal</div>
          </div>
        </div>

        <div style={{ padding: '12px 14px', borderBottom: '1px solid #2B3856', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            backgroundColor: '#3B5BDB',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '3px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {user.role}
          </span>
          <span style={{ fontSize: '12px', color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.username}
          </span>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => setShowIssueModal(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              border: '1px solid #475569',
              color: '#F87171',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12.5px'
            }}
          >
            <AlertCircle size={14} />
            <span>Report Issue / Bug</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              border: '1px solid #334155',
              color: '#CBD5E1',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <ReportIssueModal isOpen={showIssueModal} onClose={() => setShowIssueModal(false)} />
    </>
  );
}
