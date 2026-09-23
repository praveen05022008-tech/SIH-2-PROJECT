import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  User,
  Tag,
  ShieldAlert,
  Send,
  Loader2,
  RefreshCw
} from 'lucide-react';

export function AdminIssuesPage() {
  const toast = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Edit / Triage Modal
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newStatus, setNewStatus] = useState('triage');
  const [newSeverity, setNewSeverity] = useState('medium');
  const [adminNotes, setAdminNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, [statusFilter, categoryFilter]);

  const fetchIssues = async () => {
    setLoading(true);
    let url = '/issues';
    const params = [];
    if (statusFilter) params.push(`status=${statusFilter}`);
    if (categoryFilter) params.push(`category=${categoryFilter}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    try {
      const data = await api.get(url);
      setIssues(data);
    } catch (err) {
      toast.error('Failed to load issues: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTriage = (iss) => {
    setSelectedIssue(iss);
    setNewStatus(iss.status);
    setNewSeverity(iss.severity);
    setAdminNotes(iss.admin_notes || '');
    setAssignedTo(iss.assigned_to || '');
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;
    setUpdating(true);
    try {
      await api.patch(`/issues/${selectedIssue.id}`, {
        status: newStatus,
        severity: newSeverity,
        admin_notes: adminNotes,
        assigned_to: assignedTo
      });
      toast.success(`Issue #${selectedIssue.id} updated to ${newStatus.toUpperCase()}`);
      setSelectedIssue(null);
      fetchIssues();
    } catch (err) {
      toast.error('Error updating issue: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'open':
        return <span className="badge badge-danger">Open</span>;
      case 'triage':
        return <span className="badge badge-warning">Triage</span>;
      case 'assigned':
      case 'in_progress':
        return <span className="badge badge-info">In Progress</span>;
      case 'resolved':
      case 'closed':
        return <span className="badge badge-success">Resolved</span>;
      default:
        return <span className="badge badge-neutral">{st}</span>;
    }
  };

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'critical':
        return '#DC2626';
      case 'high':
        return '#EA580C';
      case 'medium':
        return '#CA8A04';
      default:
        return '#64748B';
    }
  };

  return (
    <PortalLayout title="Issue Reporting & Bug Triage Governance" allowedRoles={['admin']}>
      {/* Header Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>System Issue & Bug Triage Board</h3>
            <p className="text-muted" style={{ fontSize: '12px', margin: '4px 0 0' }}>
              Track user defect tickets, RBAC access inquiries, and platform anomalies (Section 33)
            </p>
          </div>
          <button onClick={fetchIssues} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={13} /> Refresh Tickets
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="triage">Triage</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">All Categories</option>
            <option value="bug">Bug / Defect</option>
            <option value="access_issue">Access Issue</option>
            <option value="data_correction">Data Correction</option>
            <option value="feature_request">Feature Request</option>
            <option value="other">Other</option>
          </select>

          <span style={{ fontSize: '12.5px', color: '#64748B', marginLeft: 'auto' }}>
            Total Tickets: <strong>{issues.length}</strong>
          </span>
        </div>
      </div>

      {/* Issue Tickets List / Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '36px', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner message="Loading reported issue tickets..." />
          </div>
        ) : issues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CheckCircle2 size={36} color="#16A34A" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '15px', color: '#1E293B', marginBottom: '4px' }}>No Issue Tickets Found</h4>
            <p className="text-muted" style={{ fontSize: '13px' }}>All systems and user workflows are operating nominally.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title & Summary</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Reporter</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((iss) => (
                  <tr key={iss.id}>
                    <td style={{ fontWeight: 700, color: '#3B5BDB' }}>#{iss.id}</td>
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ fontWeight: 600, color: '#1E2A44', marginBottom: '2px' }}>{iss.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {iss.description}
                      </div>
                      {iss.admin_notes && (
                        <div style={{ fontSize: '11px', color: '#0369A1', marginTop: '4px', backgroundColor: '#F0F9FF', padding: '2px 6px', borderRadius: '4px' }}>
                          Note: {iss.admin_notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                        {iss.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: getSeverityColor(iss.severity), textTransform: 'capitalize' }}>
                        ● {iss.severity}
                      </span>
                    </td>
                    <td>{getStatusBadge(iss.status)}</td>
                    <td>
                      <div style={{ fontSize: '12.5px', color: '#1E2A44' }}>{iss.reporter_username || `User #${iss.user_id}`}</div>
                      <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'capitalize' }}>{iss.reporter_role}</span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {new Date(iss.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenTriage(iss)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                      >
                        Triage & Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Triage Modal */}
      {selectedIssue && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="card-header">
              <h3 className="card-title">Triage Ticket #{selectedIssue.id}</h3>
              <button onClick={() => setSelectedIssue(null)} className="btn btn-outline btn-sm">Close</button>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: '4px' }}>{selectedIssue.title}</div>
              <p style={{ color: '#475569', margin: 0, lineHeight: '1.5' }}>{selectedIssue.description}</p>
            </div>

            <form onSubmit={handleUpdateIssue}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Workflow Status *</label>
                  <select className="form-control" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="open">Open</option>
                    <option value="triage">Triage</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Severity Level *</label>
                  <select className="form-control" value={newSeverity} onChange={(e) => setNewSeverity(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assignee / Lead</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Infrastructure Team, DevOps, Security Team"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resolution / Triage Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Add resolution explanation or action items for this ticket..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setSelectedIssue(null)} className="btn btn-outline btn-sm" disabled={updating}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Triage Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
