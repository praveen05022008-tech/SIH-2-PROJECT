import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Briefcase, Plus, Users, MapPin } from 'lucide-react';

export function MyOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOpportunities();
  }, []);

  const fetchMyOpportunities = () => {
    setLoading(true);
    api.get('/opportunities?my_only=true')
      .then((data) => setOpportunities(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <PortalLayout title="My Posted Opportunities" allowedRoles={['industry']}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Corporate Listings</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>Manage your active recruitment drives</p>
          </div>
          <Link to="/industry/post-opportunity" className="btn btn-primary btn-sm">
            <Plus size={13} /> Post New Opening
          </Link>
        </div>

        {loading ? (
          <p className="text-muted">Loading your postings...</p>
        ) : opportunities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <Briefcase size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">No opportunities posted under your account yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Openings</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Posted Date</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600 }}>{o.title}</td>
                    <td><span className="badge badge-neutral">{o.type.replace('_', ' ')}</span></td>
                    <td>{o.location} ({o.work_mode})</td>
                    <td>{o.openings_count}</td>
                    <td>
                      <span className={`badge ${o.status === 'open' ? 'badge-success' : 'badge-neutral'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/industry/applications?opportunity_id=${o.id}`} style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={13} /> {o.applications_count} Candidates
                      </Link>
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
