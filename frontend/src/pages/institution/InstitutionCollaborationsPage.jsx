import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Building2, CheckCircle2, XCircle } from 'lucide-react';

export function InstitutionCollaborationsPage() {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = () => {
    setLoading(true);
    api.get('/collaborations')
      .then((data) => setCollaborations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/collaborations/${id}/status`, { status });
      fetchCollaborations();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  return (
    <PortalLayout title="Industry Collaboration Proposals" allowedRoles={['institution']}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Corporate Partnership Proposals</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>Review joint innovation initiatives, student training, and campus visits</p>
          </div>
          <span className="badge badge-info">{collaborations.length} Proposals</span>
        </div>

        {loading ? (
          <p className="text-muted">Loading collaboration records...</p>
        ) : collaborations.length === 0 ? (
          <p className="text-muted" style={{ padding: '30px 0' }}>No partnership proposals currently awaiting review.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Initiative Title</th>
                  <th>Nature</th>
                  <th>Initiator</th>
                  <th>Status</th>
                  <th>Proposed Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {collaborations.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: '12px', color: '#4B5563', maxWidth: '300px' }}>{c.description}</div>
                    </td>
                    <td><span className="badge badge-neutral">{c.collaboration_type.replace('_', ' ')}</span></td>
                    <td>{c.partner_company_name || c.initiator_name || 'Industry Partner'}</td>
                    <td>
                      <span className={`badge ${c.status === 'accepted' ? 'badge-success' : c.status === 'declined' ? 'badge-danger' : 'badge-warning'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      {c.status === 'proposed' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleUpdateStatus(c.id, 'accepted')} className="btn btn-success btn-sm" style={{ padding: '4px 8px' }}>
                            Accept
                          </button>
                          <button onClick={() => handleUpdateStatus(c.id, 'declined')} className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }}>
                            Decline
                          </button>
                        </div>
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
