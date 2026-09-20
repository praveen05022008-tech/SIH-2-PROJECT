import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import {
  Users,
  GraduationCap,
  Building2,
  Briefcase,
  UserCheck,
  Award,
  ShieldCheck,
  ArrowRight,
  Clock
} from 'lucide-react';

export function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    total_students: 0,
    total_faculty: 0,
    total_industries: 0,
    total_institutions: 0,
    pending_registrations: 0,
    total_internships: 0,
    total_jobs: 0,
    total_applications: 0,
    selected_candidates: 0,
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/admin')
      .then((data) => setMetrics(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout title="Super Admin System Governance" allowedRoles={['admin']}>
      <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderLeft: '4px solid #1E2A44' }}>
        <h2 style={{ fontSize: '18px', color: '#1E2A44', marginBottom: '6px' }}>
          Portal Governance & Administrative Control
        </h2>
        <p className="text-muted" style={{ fontSize: '13.5px' }}>
          Centralized Governance Console. Overseeing all 5 stakeholder portals with zero simulated statistics.
        </p>
      </div>

      {/* Real-time System Metrics */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper"><GraduationCap size={22} /></div>
          <div>
            <div className="stat-value">{metrics.total_students}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper"><Users size={22} /></div>
          <div>
            <div className="stat-value">{metrics.total_faculty}</div>
            <div className="stat-label">Total Academicians</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper"><Building2 size={22} /></div>
          <div>
            <div className="stat-value">{metrics.total_industries}</div>
            <div className="stat-label">Total Industries</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper"><Building2 size={22} /></div>
          <div>
            <div className="stat-value">{metrics.total_institutions}</div>
            <div className="stat-label">Total Institutions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF08A', color: '#854D0E' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#854D0E' }}>{metrics.pending_registrations}</div>
            <div className="stat-label">Pending Approvals</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper"><Briefcase size={22} /></div>
          <div>
            <div className="stat-value">{metrics.total_internships}</div>
            <div className="stat-label">Active Internships</div>
          </div>
        </div>
      </div>

      {/* Approvals Banner & Recent Audits */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending Stakeholder Approvals</h3>
            <Link to="/admin/approvals" className="btn btn-secondary btn-sm">
              Review Queue <ArrowRight size={13} />
            </Link>
          </div>
          <p className="text-muted" style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
            Newly registered students, faculty members, industry representatives, and colleges require explicit administrative validation before account activation.
          </p>
          <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid #E2E5EA' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E2A44' }}>
              Pending Accounts in Queue: {metrics.pending_registrations}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              Click "Review Queue" to approve or decline access requests.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">System Audit Log Feed</h3>
            <Link to="/admin/audit-logs" className="btn btn-outline btn-sm">View Full Logs</Link>
          </div>
          {metrics.recent_activity?.length === 0 ? (
            <p className="text-muted" style={{ padding: '16px 0' }}>No recent audit events recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {metrics.recent_activity.slice(0, 5).map((log) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', padding: '6px 8px', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontWeight: 600, color: '#1E2A44' }}>{log.action}</span>
                  <span className="text-muted">{log.resource}</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
