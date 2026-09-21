import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';

import { Building2, Plus, Send } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function IndustryCollaborationsPage() {
  const [collaborations, setCollaborations] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Proposal modal
  const [showModal, setShowModal] = useState(false);
  const [targetInstId, setTargetInstId] = useState('');
  const [title, setTitle] = useState('');
  const [collabType, setCollabType] = useState('live_project');
  const [desc, setDesc] = useState('');
  const [terms, setTerms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCollaborations();
    api.get('/users/institutions').then((data) => setInstitutions(data)).catch(() => {});
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
        partner_institution_id: targetInstId ? parseInt(targetInstId) : null,
        collaboration_type: collabType,
        title,
        description: desc,
        terms,
      });
      setShowModal(false);
      setTitle('');
      setDesc('');
      setTerms('');
      setTargetInstId('');
      fetchCollaborations();
      toast.success('Collaboration proposal submitted to institution.');
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout title="Institutional Collaborations" allowedRoles={['industry']}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Academia-Industry Partnerships</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>Propose live projects, curriculum guidance, and campus recruitment drives</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-secondary btn-sm">
            <Plus size={13} /> Propose Collaboration
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading collaboration proposals..." />
        ) : collaborations.length === 0 ? (
          <p className="text-muted" style={{ padding: '24px 0' }}>No active partnerships recorded.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Target Institution</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {collaborations.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.title}</td>
                    <td><span className="badge badge-neutral">{c.collaboration_type.replace('_', ' ')}</span></td>
                    <td>{c.partner_institution_name || 'All Institutions'}</td>
                    <td>
                      <span className={`badge ${c.status === 'accepted' ? 'badge-success' : c.status === 'in_progress' ? 'badge-info' : 'badge-neutral'}`}>
                        {c.status}
                      </span>
                    </td>
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
              <h3 className="card-title">Propose Institutional Collaboration</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <form onSubmit={handlePropose}>
              <div className="form-group">
                <label className="form-label">Initiative Title *</label>
                <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Partner Institution (Optional)</label>
                <select className="form-control" value={targetInstId} onChange={(e) => setTargetInstId(e.target.value)}>
                  <option value="">-- Open to All Partner Institutions --</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.name} ({inst.code})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Collaboration Nature *</label>
                <select className="form-control" value={collabType} onChange={(e) => setCollabType(e.target.value)}>
                  <option value="live_project">Live Industry Project</option>
                  <option value="fdp">Faculty Development Program (FDP)</option>
                  <option value="research">Joint Research / Clinical Trial</option>
                  <option value="guest_lecture">Expert Guest Lecture</option>
                  <option value="challenge">Innovation Challenge / Hackathon</option>
                  <option value="industrial_visit">Industrial Field Visit</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description & Scope *</label>
                <textarea className="form-control" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Terms & Resource Commitments</label>
                <textarea className="form-control" rows={2} value={terms} onChange={(e) => setTerms(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  <Send size={13} /> {submitting ? 'Submitting...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
