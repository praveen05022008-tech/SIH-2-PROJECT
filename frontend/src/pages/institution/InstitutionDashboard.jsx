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
  ArrowRight,
  UploadCloud,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function InstitutionDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    institution_name: '',
    total_students: 0,
    total_faculty: 0,
    active_internships: 0,
    total_applications: 0,
    students_placed: 0,
    collaboration_count: 0,
    department_breakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/institution')
      .then((data) => setMetrics(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout title="Institution Administration Dashboard" allowedRoles={['institution']}>
      <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderLeft: '4px solid #3B5BDB' }}>
        <h2 style={{ fontSize: '18px', color: '#1E2A44', marginBottom: '6px' }}>
          {metrics.institution_name || user?.username}
        </h2>
        <p className="text-muted" style={{ fontSize: '13.5px' }}>
          Monitor enrolled student cohorts, oversee faculty industrial training, verify credentials, and track institutional placement outcomes.
        </p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper"><GraduationCap size={22} /></div>
          <div>
            <div className="stat-value">{metrics.total_students}</div>
            <div className="stat-label">Enrolled Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper"><Users size={22} /></div>
          <div>
            <div className="stat-value">{metrics.total_faculty}</div>
            <div className="stat-label">Faculty Members</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper"><Briefcase size={22} /></div>
          <div>
            <div className="stat-value">{metrics.active_internships}</div>
            <div className="stat-label">Active Internships</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper"><FileCheck size={22} /></div>
          <div>
            <div className="stat-value">{metrics.students_placed}</div>
            <div className="stat-label">Students Placed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper"><Building2 size={22} /></div>
          <div>
            <div className="stat-value">{metrics.collaboration_count}</div>
            <div className="stat-label">Industry Partnerships</div>
          </div>
        </div>
      </div>

      {/* Department Breakdown & Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Department Cohorts Breakdown</h3>
            <Link to="/institution/departments" className="btn btn-outline btn-sm">Manage</Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading department analytics..." />
          ) : metrics.department_breakdown?.length === 0 ? (
            <p className="text-muted" style={{ padding: '24px 0' }}>No departments registered yet. Add departments to structure student enrollments.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Enrolled Students</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.department_breakdown.map((d, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{d.department_name}</td>
                      <td>{d.student_count} Students</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Governance Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/institution/students" className="btn btn-primary btn-sm" style={{ justifyContent: 'flex-start', backgroundColor: '#3B5BDB' }}>
              <UploadCloud size={14} /> Bulk Onboard Students & Faculty (CSV)
            </Link>
            <Link to="/institution/document-verification" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
              <ShieldCheck size={14} /> Document Verification Desk
            </Link>
            <Link to="/institution/students" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
              <GraduationCap size={14} /> View Student & Faculty Rosters
            </Link>
            <Link to="/institution/placements" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
              <Briefcase size={14} /> Placement & Internship Tracker
            </Link>
            <Link to="/institution/collaborations" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
              <Building2 size={14} /> Industry Partnership Proposals
            </Link>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
