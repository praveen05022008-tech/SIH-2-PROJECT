import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Briefcase, Building, MapPin, Send, Check } from 'lucide-react';

export function FacultyOpportunitiesPage() {
  const toast = useToast();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOpportunities();
    fetchMyApplications();
  }, []);

  const fetchOpportunities = () => {
    setLoading(true);
    api.get('/opportunities?status_filter=open')
      .then((data) => {
        // Filter opportunities appropriate for faculty
        const facultyOpps = data.filter((o) =>
          ['faculty_internship', 'industrial_training', 'live_project'].includes(o.type)
        );
        setOpportunities(facultyOpps.length > 0 ? facultyOpps : data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchMyApplications = () => {
    api.get('/applications')
      .then((apps) => {
        setAppliedIds(new Set(apps.map((a) => a.opportunity_id)));
      })
      .catch(() => {});
  };

  const handleOpenModal = (opp) => {
    if (appliedIds.has(opp.id)) {
      toast.info(`You have already applied for ${opp.title}.`);
      return;
    }
    setSelectedOpp(opp);
    setCoverNote('');
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedOpp) return;
    setSubmitting(true);
    try {
      await api.post('/applications', {
        opportunity_id: selectedOpp.id,
        cover_note: coverNote,
      });
      setAppliedIds((prev) => new Set([...prev, selectedOpp.id]));
      setSelectedOpp(null);
      setCoverNote('');
      toast.success('Application submitted successfully.');
    } catch (err) {
      const msg = err.message || 'Failed to submit application.';
      if (msg.toLowerCase().includes('already submitted') || msg.toLowerCase().includes('already applied')) {
        setAppliedIds((prev) => new Set([...prev, selectedOpp.id]));
        toast.warning('You have already applied for this opening.');
        setSelectedOpp(null);
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout title="Faculty Opportunities" allowedRoles={['faculty']}>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Industrial Sabbaticals, FDPs & Corporate Training</h3>
          <span className="badge badge-info">{opportunities.length} Openings</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading faculty opportunities..." />
        ) : opportunities.length === 0 ? (
          <p className="text-muted" style={{ padding: '20px 0' }}>No industry opportunities currently posted for faculty.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {opportunities.map((opp) => {
              const isApplied = appliedIds.has(opp.id);
              return (
                <div key={opp.id} style={{ border: '1px solid #E2E5EA', borderRadius: '4px', padding: '16px', backgroundColor: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-neutral" style={{ textTransform: 'uppercase', marginBottom: '6px' }}>
                        {opp.type.replace('_', ' ')}
                      </span>
                      <h4 style={{ fontSize: '16px', color: '#1E2A44', marginBottom: '4px' }}>{opp.title}</h4>
                      <div style={{ display: 'flex', gap: '16px', color: '#6B7280', fontSize: '12.5px' }}>
                        <span><Building size={13} style={{ verticalAlign: 'middle' }} /> {opp.company_name}</span>
                        <span><MapPin size={13} style={{ verticalAlign: 'middle' }} /> {opp.location} ({opp.work_mode})</span>
                      </div>
                    </div>

                    <div>
                      {isApplied ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} /> Applied
                          </span>
                          <Link to="/faculty/applications" className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '12px' }}>
                            View Status
                          </Link>
                        </div>
                      ) : (
                        <button onClick={() => handleOpenModal(opp)} className="btn btn-secondary btn-sm">
                          Apply / Express Interest
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#4B5563', margin: '12px 0 0', lineHeight: '1.6' }}>
                    {opp.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedOpp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Apply for {selectedOpp.title}</h3>
              <button onClick={() => setSelectedOpp(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">Statement of Purpose / Academic Objectives</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Outline your research goals and how this industry training benefits your curriculum..."
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setSelectedOpp(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  <Send size={13} /> {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
