import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FileCheck, Building, Clock, ArrowRight } from 'lucide-react';

export function StudentApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications')
      .then((data) => setApplications(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'selected':
        return <span className="badge badge-success">Selected</span>;
      case 'shortlisted':
        return <span className="badge badge-info">Shortlisted</span>;
      case 'under_review':
        return <span className="badge badge-warning">Under Review</span>;
      case 'rejected':
        return <span className="badge badge-danger">Rejected</span>;
      case 'in_progress':
      case 'completed':
        return <span className="badge badge-success">{status.replace('_', ' ')}</span>;
      default:
        return <span className="badge badge-neutral">Applied</span>;
    }
  };

  return (
    <PortalLayout title="My Applications" allowedRoles={['student']}>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Submitted Application History</h3>
          <span className="badge badge-neutral">{applications.length} Records</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your application records..." />
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <FileCheck size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">You have not applied to any opportunities yet.</p>
            <Link to="/student/opportunities" className="btn btn-secondary btn-sm" style={{ marginTop: '14px' }}>
              Explore Openings <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Opportunity Title</th>
                  <th>Company / Provider</th>
                  <th>Type</th>
                  <th>Match Score</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Reviewer Feedback</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.opportunity?.title || `Opening #${a.opportunity_id}`}</td>
                    <td>{a.opportunity?.company_name || 'Industry Partner'}</td>
                    <td>
                      <span className="badge badge-neutral">{a.opportunity?.type || 'Opening'}</span>
                    </td>
                    <td>{a.match_score ? `${a.match_score}%` : 'N/A'}</td>
                    <td>{getStatusBadge(a.status)}</td>
                    <td>{new Date(a.applied_at).toLocaleDateString()}</td>
                    <td style={{ fontSize: '12px', color: '#4B5563' }}>
                      {a.reviewer_notes || 'Pending evaluation'}
                    </td>
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
