import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Briefcase, Users, UserCheck, GraduationCap, Plus, ArrowRight } from 'lucide-react';

export function IndustryDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    company_name: '',
    active_opportunities: 0,
    applications_received: 0,
    shortlisted_candidates: 0,
    selected_candidates: 0,
    active_interns: 0,
    opportunities_breakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/industry')
      .then((data) => setMetrics(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout title="Industry Recruitment Dashboard" allowedRoles={['industry']}>
      <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderLeft: '4px solid #3B5BDB' }}>
        <h2 style={{ fontSize: '18px', color: '#1E2A44', marginBottom: '6px' }}>
          {metrics.company_name || user?.username} - Recruitment Portal
        </h2>
        <p className="text-muted" style={{ fontSize: '13.5px' }}>
          Connect with vetted talent from partner institutions, evaluate candidate match metrics, and manage internship deliverables.
        </p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper"><Briefcase size={22} /></div>
          <div>
            <div className="stat-value">{metrics.active_opportunities}</div>
            <div className="stat-label">Active Postings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper"><Users size={22} /></div>
          <div>
            <div className="stat-value">{metrics.applications_received}</div>
            <div className="stat-label">Applications Received</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper"><UserCheck size={22} /></div>
          <div>
            <div className="stat-value">{metrics.shortlisted_candidates}</div>
            <div className="stat-label">Shortlisted Candidates</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper"><GraduationCap size={22} /></div>
          <div>
            <div className="stat-value">{metrics.selected_candidates}</div>
            <div className="stat-label">Selected Offers</div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Postings */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Live Postings Summary</h3>
            <Link to="/industry/my-opportunities" className="btn btn-outline btn-sm">View All</Link>
          </div>

          {loading ? (
            <p className="text-muted">Loading postings...</p>
          ) : metrics.opportunities_breakdown?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <p className="text-muted">No opportunities posted yet.</p>
              <Link to="/industry/post-opportunity" className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }}>
                <Plus size={13} /> Post First Opening
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Openings</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.opportunities_breakdown.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>{o.title}</td>
                      <td><span className="badge badge-neutral">{o.type}</span></td>
                      <td><span className="badge badge-success">{o.status}</span></td>
                      <td>{o.openings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recruitment Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/industry/post-opportunity" className="btn btn-primary btn-sm" style={{ justifyContent: 'flex-start' }}>
              <Plus size={14} /> Post Internship / Job
            </Link>
            <Link to="/industry/applications" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
              <Users size={14} /> Review Candidate Pipeline
            </Link>
            <Link to="/industry/mentorship" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
              <GraduationCap size={14} /> Manage Intern Milestones
            </Link>
            <Link to="/industry/collaborations" className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>
              <ArrowRight size={14} /> Institutional Partnerships
            </Link>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
