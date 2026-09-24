import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getDocumentViewUrl } from '../../utils/fileUrl';
import {
  FileCheck,
  Building,
  Clock,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle,
  ExternalLink,
  Award,
} from 'lucide-react';

export function FacultyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    setLoading(true);
    api.get('/applications')
      .then((data) => setApplications(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

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
    <PortalLayout title="My Faculty Applications" allowedRoles={['faculty']}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Applied Sabbaticals &amp; Training Programs</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>
              Track your corporate training, FDPs, and industrial immersion submissions
            </p>
          </div>
          <span className="badge badge-info">{applications.length} Applications</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your application records..." />
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <FileCheck size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '15px', color: '#1E2A44', marginBottom: '6px' }}>No Active Applications</h4>
            <p className="text-muted" style={{ fontSize: '13px' }}>You have not submitted applications for any faculty opportunities yet.</p>
            <Link to="/faculty/opportunities" className="btn btn-primary btn-sm" style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={14} /> Explore Faculty Openings <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Opportunity Title</th>
                  <th>Host Enterprise</th>
                  <th>Category</th>
                  <th>Match Fit</th>
                  <th>NOC Status</th>
                  <th>Application Status</th>
                  <th>Date Applied</th>
                  <th>Statement / Notes</th>
                  <th>Host Feedback</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1E2A44' }}>
                        {a.opportunity?.title || `Opportunity #${a.opportunity_id}`}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        {a.opportunity?.location ? `${a.opportunity.location} (${a.opportunity.work_mode || 'Onsite'})` : ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}>
                        <Building size={13} color="#4B5563" />
                        {a.opportunity?.company_name || 'Industry Partner'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                        {(a.opportunity?.type || 'Training').replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {a.match_score !== null && a.match_score !== undefined ? (
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: a.match_score >= 70 ? '#047857' : '#2563EB' }}>
                          {Math.round(a.match_score)}%
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td>
                      {a.noc_document_url ? (
                        <a
                          href={getDocumentViewUrl(a.noc_document_url)}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#047857',
                            backgroundColor: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          <CheckCircle size={12} /> NOC Verified
                        </a>
                      ) : null}
                    </td>
                    <td>{getStatusBadge(a.status)}</td>
                    <td>{new Date(a.applied_at).toLocaleDateString()}</td>
                    <td style={{ fontSize: '12px', color: '#4B5563', maxWidth: '240px' }}>
                      {a.cover_note || '—'}
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#1E2A44' }}>
                      {a.reviewer_notes ? (
                        <span style={{ fontWeight: 500 }}>{a.reviewer_notes}</span>
                      ) : (
                        <span className="text-muted" style={{ fontStyle: 'italic', fontSize: '12px' }}>Awaiting review</span>
                      )}
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
