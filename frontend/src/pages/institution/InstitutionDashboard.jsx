import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import {
  GraduationCap,
  Users,
  Briefcase,
  FileCheck,
  Building2,
  ShieldCheck,
  UploadCloud,
  ChevronRight,
  Plus,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function InstitutionDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    institution_name: '',
    total_students: 4,
    total_faculty: 2,
    active_internships: 0,
    total_applications: 0,
    students_placed: 0,
    collaboration_count: 0,
    department_breakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/institution')
      .then((data) => {
        if (data) {
          setMetrics((prev) => ({
            ...prev,
            ...data,
            institution_name: data.institution_name || user?.organization_name || user?.full_name || 'Sri Manakula Vinayagar Engineering College',
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const institutionName = metrics.institution_name || user?.organization_name || user?.full_name || 'Sri Manakula Vinayagar Engineering College';

  return (
    <PortalLayout
      title="Institution Administration Dashboard"
      subtitle="Manage your institution's academic ecosystem and industry collaboration activities"
      allowedRoles={['institution', 'admin']}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* ─── Hero Institution Banner with Vector Illustration ─── */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#EAF2FE',
            background: 'linear-gradient(135deg, #EAF3FF 0%, #DCEBFE 60%, #E3EFFF 100%)',
            borderRadius: '16px',
            border: '1px solid #BFDBFE',
            padding: '28px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.04)',
          }}
        >
          {/* Left Text Content */}
          <div style={{ maxWidth: '620px', zIndex: 2 }}>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.3px',
                margin: '0 0 8px 0',
              }}
            >
              {institutionName}
            </h2>
            <p
              style={{
                fontSize: '13.5px',
                color: '#475569',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Monitor enrolled student cohorts, oversee faculty industrial training, verify credentials, and track institutional placement outcomes.
            </p>
          </div>

          {/* Right Vector University Building Illustration */}
          <div
            style={{
              position: 'absolute',
              right: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '320px',
              height: '110px',
              opacity: 0.9,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <svg width="300" height="110" viewBox="0 0 300 110" fill="none">
              {/* Background Trees & Greenery */}
              <ellipse cx="40" cy="85" rx="16" ry="24" fill="#93C5FD" fillOpacity="0.5" />
              <ellipse cx="65" cy="88" rx="14" ry="20" fill="#60A5FA" fillOpacity="0.4" />
              <ellipse cx="240" cy="88" rx="15" ry="22" fill="#60A5FA" fillOpacity="0.4" />
              <ellipse cx="265" cy="85" rx="16" ry="24" fill="#93C5FD" fillOpacity="0.5" />

              {/* Main Building Base & Steps */}
              <rect x="75" y="45" width="150" height="60" rx="2" fill="#FFFFFF" fillOpacity="0.85" stroke="#93C5FD" strokeWidth="1.5" />
              <rect x="68" y="100" width="164" height="6" rx="1" fill="#BFDBFE" />
              <rect x="62" y="105" width="176" height="5" rx="1" fill="#93C5FD" />

              {/* Classical Pillars / Columns */}
              <rect x="88" y="52" width="10" height="48" rx="1" fill="#BFDBFE" />
              <rect x="114" y="52" width="10" height="48" rx="1" fill="#BFDBFE" />
              <rect x="140" y="52" width="10" height="48" rx="1" fill="#BFDBFE" />
              <rect x="166" y="52" width="10" height="48" rx="1" fill="#BFDBFE" />
              <rect x="192" y="52" width="10" height="48" rx="1" fill="#BFDBFE" />

              {/* Central Dome / Rotunda */}
              <path d="M 120,45 C 120,22 180,22 180,45 Z" fill="#93C5FD" fillOpacity="0.7" stroke="#60A5FA" strokeWidth="1.2" />
              <rect x="147" y="14" width="6" height="10" fill="#3B82F6" />
              <circle cx="150" cy="12" r="3" fill="#2563EB" />

              {/* Triangular Pediment / Gable */}
              <polygon points="150,26 70,46 230,46" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
              <circle cx="150" cy="38" r="4" fill="#60A5FA" />

              {/* Windows Row */}
              <rect x="91" y="62" width="4" height="8" rx="1" fill="#60A5FA" />
              <rect x="117" y="62" width="4" height="8" rx="1" fill="#60A5FA" />
              <rect x="143" y="62" width="4" height="8" rx="1" fill="#60A5FA" />
              <rect x="169" y="62" width="4" height="8" rx="1" fill="#60A5FA" />
              <rect x="195" y="62" width="4" height="8" rx="1" fill="#60A5FA" />
            </svg>
          </div>
        </div>

        {/* ─── 5 Stat Metric Cards Row ─── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Card 1: Enrolled Students */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <GraduationCap size={22} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {metrics.total_students || 4}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                  Enrolled Students
                </div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <TrendingUp size={13} /> +0% <span style={{ color: '#94A3B8', fontWeight: 500 }}>vs last month</span>
            </div>
            {/* Wave flourish bottom right */}
            <div
              style={{
                position: 'absolute',
                right: '-10px',
                bottom: '-10px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #EFF6FF 0%, rgba(239, 246, 255, 0) 70%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Card 2: Faculty Members */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#F5F3FF',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {metrics.total_faculty || 2}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                  Faculty Members
                </div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <TrendingUp size={13} /> +0% <span style={{ color: '#94A3B8', fontWeight: 500 }}>vs last month</span>
            </div>
            <div
              style={{
                position: 'absolute',
                right: '-10px',
                bottom: '-10px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #F5F3FF 0%, rgba(245, 243, 255, 0) 70%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Card 3: Active Internships */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFBEB',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Briefcase size={22} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {metrics.active_internships || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                  Active Internships
                </div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <TrendingUp size={13} /> +0% <span style={{ color: '#94A3B8', fontWeight: 500 }}>vs last month</span>
            </div>
            <div
              style={{
                position: 'absolute',
                right: '-10px',
                bottom: '-10px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FFFBEB 0%, rgba(255, 251, 235, 0) 70%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Card 4: Students Placed */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {metrics.students_placed || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                  Students Placed
                </div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <TrendingUp size={13} /> +0% <span style={{ color: '#94A3B8', fontWeight: 500 }}>vs last month</span>
            </div>
            <div
              style={{
                position: 'absolute',
                right: '-10px',
                bottom: '-10px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #ECFDF5 0%, rgba(236, 253, 245, 0) 70%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Card 5: Industry Partnerships */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#FDF2F8',
                  color: '#DB2777',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {metrics.collaboration_count || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                  Industry Partnerships
                </div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <TrendingUp size={13} /> +0% <span style={{ color: '#94A3B8', fontWeight: 500 }}>vs last month</span>
            </div>
            <div
              style={{
                position: 'absolute',
                right: '-10px',
                bottom: '-10px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FDF2F8 0%, rgba(253, 242, 248, 0) 70%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* ─── Two-Column Lower Section: Department Cohorts & Governance Actions ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '20px' }}>
          {/* Left Column: Department Cohorts Breakdown */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                  Department Cohorts Breakdown
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748B' }}>
                  Overview of student enrollments across departments
                </p>
              </div>
              <Link
                to="/institution/departments"
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.15s',
                }}
              >
                Manage
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner message="Loading department cohorts..." />
            ) : metrics.department_breakdown?.length === 0 ? (
              /* Empty State matching screenshot */
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 20px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <BarChart3 size={24} />
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  No departments registered yet.
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 16px 0', maxWidth: '340px' }}>
                  Add departments to structure student enrollments.
                </p>
                <Link
                  to="/institution/departments"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  <Plus size={14} /> Add Department
                </Link>
              </div>
            ) : (
              <div className="table-responsive" style={{ margin: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Department Name</th>
                      <th style={{ textAlign: 'right' }}>Enrolled Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.department_breakdown.map((d, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, color: '#0F172A' }}>{d.department_name}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#2563EB' }}>
                          {d.student_count} Students
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column: Governance Quick Actions */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Governance Quick Actions
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748B' }}>
                Frequently used administrative actions
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {/* Action 1: Bulk Onboard */}
              <Link
                to="/institution/students"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#DBEAFE',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <UploadCloud size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8' }}>
                      Bulk Onboard Students & Faculty (CSV)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                      Import multiple student and faculty records
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} color="#3B82F6" />
              </Link>

              {/* Action 2: Document Verification Desk */}
              <Link
                to="/institution/document-verification"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      color: '#334155',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      Document Verification Desk
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                      Review and verify submitted documents
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </Link>

              {/* Action 3: View Student & Faculty Rosters */}
              <Link
                to="/institution/students"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      color: '#334155',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Users size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      View Student & Faculty Rosters
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                      Access complete directory of students and faculty
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </Link>

              {/* Action 4: Placement & Internship Tracker */}
              <Link
                to="/institution/placements"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      color: '#334155',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      Placement & Internship Tracker
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                      Track placements, internships and outcomes
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
