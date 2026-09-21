import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';
import { Building2, Plus, Send } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function FacultyCollaborationsPage() {
  const toast = useToast();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [collabType, setCollabType] = useState('research');
  const [desc, setDesc] = useState('');
  const [terms, setTerms] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handlePropose = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/collaborations', {
        title,
        collaboration_type: collabType,
        description: desc,
        terms,
      });
      setShowModal(false);
      setTitle('');
      setDesc('');
      setTerms('');
      toast.success('Collaboration proposal submitted successfully.');
      fetchCollaborations();
    } catch (err) {
      toast.error('Error submitting proposal: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout title="Research & Industry Collaborations" allowedRoles={['faculty']}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Joint Academia-Industry Initiatives</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>FDPs, Research Collaborations, and Technical Consultancy</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-secondary btn-sm">
            <Plus size={13} /> Propose Initiative
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading collaboration proposals..." />
        ) : collaborations.length === 0 ? (
          <p className="text-muted" style={{ padding: '24px 0' }}>No collaboration proposals recorded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Partner / Initiator</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {collaborations.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.title}</td>
                    <td>
                      <span className="badge badge-neutral">{c.collaboration_type.replace('_', ' ')}</span>
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'accepted' ? 'badge-success' : c.status === 'in_progress' ? 'badge-info' : 'badge-neutral'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{c.partner_company_name || c.partner_institution_name || c.initiator_name || 'Partner'}</td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Propose Industry-Academia Collaboration</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <form onSubmit={handlePropose}>
              <div className="form-group">
                <label className="form-label">Initiative Title *</label>
                <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Collaboration Type *</label>
                <select className="form-control" value={collabType} onChange={(e) => setCollabType(e.target.value)}>
                  <option value="research">Collaborative Research</option>
                  <option value="consultancy">Technical / Clinical Consultancy</option>
                  <option value="fdp">Faculty Development Program (FDP)</option>
                  <option value="live_project">Live Student & Faculty Project</option>
                  <option value="workshop">Technical Workshop</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description & Objectives *</label>
                <textarea className="form-control" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Terms / Deliverables / Requirements</label>
                <textarea className="form-control" rows={2} value={terms} onChange={(e) => setTerms(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  <Send size={13} /> {submitting ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
