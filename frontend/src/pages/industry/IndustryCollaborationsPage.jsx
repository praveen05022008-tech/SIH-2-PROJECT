import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';

import { Building2, Plus, Send, X } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function IndustryCollaborationsPage() {
  const toast = useToast();
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '650px',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(226, 232, 240, 0.9)'
            }}
          >
            {/* Modal Header with Graphic Banner */}
            <div
              style={{
                position: 'relative',
                background: 'linear-gradient(90deg, #EBF3FE 0%, #E2EEFC 50%, #D7E7FA 100%)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                overflow: 'hidden'
              }}
            >
              {/* Artwork banner background image */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '320px',
                  backgroundImage: 'url(/ind-collab.png)',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right center',
                  backgroundSize: 'contain',
                  opacity: 0.95,
                  pointerEvents: 'none'
                }}
              />

              {/* Header Title and Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 1 }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#DCEBFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                    boxShadow: '0 2px 5px rgba(37, 99, 235, 0.08)'
                  }}
                >
                  <Building2 size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.01em' }}>
                    Propose Institutional Collaboration
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    Suggest a collaboration initiative with academic institutions
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  zIndex: 2,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.color = '#0F172A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#64748B';
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handlePropose}>
              <div style={{ padding: '22px 26px 12px 26px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Initiative Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    Initiative Title <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                    placeholder="e.g. AI Research Collaboration, Industry Sponsored Lab, Curriculum Development"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3B82F6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Partner Institution (Optional) */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    Partner Institution (Optional)
                  </label>
                  <select
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                    value={targetInstId}
                    onChange={(e) => setTargetInstId(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3B82F6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">-- Open to All Partner Institutions --</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>{inst.name} ({inst.code})</option>
                    ))}
                  </select>
                </div>

                {/* Collaboration Nature */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    Collaboration Nature <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                    value={collabType}
                    onChange={(e) => setCollabType(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3B82F6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="live_project">Live Industry Project</option>
                    <option value="fdp">Faculty Development Program (FDP)</option>
                    <option value="research">Joint Research / Clinical Trial</option>
                    <option value="guest_lecture">Expert Guest Lecture</option>
                    <option value="challenge">Innovation Challenge / Hackathon</option>
                    <option value="industrial_visit">Industrial Field Visit</option>
                  </select>
                </div>

                {/* Description & Scope */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    Description & Scope <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      lineHeight: '1.5',
                      minHeight: '80px',
                      transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                    placeholder="Detail the objectives, scope, expected outcomes, and areas of collaboration..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3B82F6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', fontSize: '12px', color: '#94A3B8' }}>
                    {desc.length}/1000
                  </div>
                </div>

                {/* Terms & Resource Commitments */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                    Terms & Resource Commitments
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      lineHeight: '1.5',
                      minHeight: '75px',
                      transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                    placeholder="Specify resource requirements, timeline, roles & responsibilities, and any terms..."
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3B82F6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', fontSize: '12px', color: '#94A3B8' }}>
                    {terms.length}/1000
                  </div>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div
                style={{
                  padding: '12px 26px 22px 26px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    fontWeight: '500',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: submitting ? '#93C5FD' : '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: '500',
                    fontSize: '13.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(37, 99, 235, 0.25)',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) e.currentTarget.style.backgroundColor = '#1D4ED8';
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) e.currentTarget.style.backgroundColor = '#2563EB';
                  }}
                >
                  <Send size={14} style={{ transform: 'translateY(-0.5px)' }} />
                  {submitting ? 'Submitting...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
