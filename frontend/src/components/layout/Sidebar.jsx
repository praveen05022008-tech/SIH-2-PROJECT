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
  AlertCircle,
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';

function AicSidebarLogo({ collapsed = false }) {
  return (
    <div
      style={{
        width: collapsed ? 36 : 34,
        height: collapsed ? 36 : 34,
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
        color: '#FFFFFF',
        flexShrink: 0
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </div>
  );
}

export function Sidebar({ isOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('aic_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  if (!user) return null;

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aic_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

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
          { to: '/industry/opportunities', label: 'Manage Postings', icon: Briefcase },
          { to: '/industry/post-opportunity', label: 'Post Opportunity', icon: Plus },
          { to: '/industry/applications', label: 'Applicant Pipeline', icon: Users },
          { to: '/industry/analytics', label: 'Analytics & Reports', icon: BarChart3 },
          { to: '/industry/profile', label: 'Company Profile', icon: Building2 },
          { to: '/industry/mentorship', label: 'Internship Tracking', icon: GraduationCap },
          { to: '/industry/learning-programs', label: 'Academy & Training', icon: BookOpen },
          { to: '/industry/collaborations', label: 'Institutional Collab', icon: FolderGit2 },
        ];
      case 'institution':
        return [
          { to: '/institution/dashboard', label: 'Institution Dashboard', icon: LayoutDashboard },
          { to: '/institution/placements', label: 'Placements & Analytics', icon: BarChart3 },
          { to: '/institution/profile', label: 'Institution Profile', icon: Building2 },
          { to: '/institution/departments', label: 'Departments', icon: FolderGit2 },
          { to: '/institution/students', label: 'Student Directory', icon: GraduationCap },
          { to: '/institution/faculty', label: 'Faculty Directory', icon: Users },
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
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside
        className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${isOpen ? 'sidebar-mobile-open' : ''}`}
        style={{
          width: isCollapsed ? '72px' : '260px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 30,
          flexShrink: 0
        }}
      >
        {/* Top Header & Navigation Section */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Brand Header */}
          <div
            style={{
              padding: isCollapsed ? '16px 12px' : '18px 16px 18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AicSidebarLogo collapsed={isCollapsed} />
              {!isCollapsed && (
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.2px', lineHeight: 1.2 }}>
                    AIC PORTAL
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                    Collaboration Portal
                  </div>
                </div>
              )}
            </div>

            {/* Collapse Toggle Button (Desktop) */}
            <button
              type="button"
              onClick={toggleCollapsed}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#94A3B8',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s, color 0.15s',
                padding: 0
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#94A3B8';
              }}
            >
              {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          {/* Navigation Links List (Non-scrollable) */}
          <nav
            style={{
              padding: isCollapsed ? '6px 8px' : '6px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflow: 'hidden'
            }}
          >
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => onClose && onClose()}
                  style={({ isActive }) => ({
                    borderRadius: '10px',
                    padding: isCollapsed ? '11px 0' : '11px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: isCollapsed ? 0 : '12px',
                    fontSize: '13.5px',
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? '#2563EB' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    textDecoration: 'none',
                    transition: 'background-color 0.15s, color 0.15s',
                    width: '100%',
                    boxSizing: 'border-box'
                  })}
                >
                  <Icon size={isCollapsed ? 19 : 17} style={{ flexShrink: 0 }} />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions Section */}
        <div
          style={{
            padding: isCollapsed ? '14px 8px' : '16px 18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            flexShrink: 0
          }}
        >
          <button
            onClick={() => setShowIssueModal(true)}
            title={isCollapsed ? 'Report Issue / Bug' : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? 0 : '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#F87171',
              padding: isCollapsed ? '10px 0' : '10px 14px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'background-color 0.15s'
            }}
          >
            <AlertCircle size={isCollapsed ? 17 : 15} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span>Report Issue / Bug</span>}
          </button>

          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Sign Out' : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? 0 : '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#CBD5E1',
              padding: isCollapsed ? '10px 0' : '10px 14px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'background-color 0.15s'
            }}
          >
            <LogOut size={isCollapsed ? 17 : 15} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <ReportIssueModal isOpen={showIssueModal} onClose={() => setShowIssueModal(false)} />
    </>
  );
}
