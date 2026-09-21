import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Briefcase, MapPin, Building, Clock, CheckCircle2, AlertCircle, Send, Check, ExternalLink } from 'lucide-react';

export function StudentOpportunitiesPage() {
  const toast = useToast();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [search, setSearch] = useState('');

  // Apply modal
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState({ type: '', text: '' });
  const [appliedIds, setAppliedIds] = useState(new Set());

  useEffect(() => {
    fetchOpportunities();
    fetchMyApplications();
  }, [typeFilter, workModeFilter]);

  const fetchOpportunities = () => {
    setLoading(true);
    let url = '/opportunities?status_filter=open';
    if (typeFilter) url += `&type=${typeFilter}`;
    if (workModeFilter) url += `&work_mode=${workModeFilter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    api.get(url)
      .then((data) => setOpportunities(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchMyApplications = () => {
    api.get('/applications')
      .then((apps) => {
        const ids = new Set(apps.map((a) => a.opportunity_id));
        setAppliedIds(ids);
      })
      .catch(() => {});
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const handleOpenApplyModal = (opp) => {
    if (appliedIds.has(opp.id)) {
      toast.info(`You have already applied for ${opp.title}.`);
      return;
    }
    setSelectedOpp(opp);
    setCoverNote('');
    setApplyMsg({ type: '', text: '' });
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedOpp) return;
    setApplying(true);
    setApplyMsg({ type: '', text: '' });

    try {
      await api.post('/applications', {
        opportunity_id: selectedOpp.id,
        cover_note: coverNote,
      });
      setAppliedIds((prev) => new Set([...prev, selectedOpp.id]));
      toast.success('Application submitted successfully to employer.');
      setSelectedOpp(null);
    } catch (err) {
      const msg = err.message || 'Failed to submit application.';
      if (msg.toLowerCase().includes('already submitted') || msg.toLowerCase().includes('already applied')) {
        setAppliedIds((prev) => new Set([...prev, selectedOpp.id]));
        toast.warning('You have already applied for this opening.');
        setTimeout(() => setSelectedOpp(null), 1200);
      } else {
        toast.error(msg);
      }
      setApplyMsg({ type: 'error', text: msg });
    } finally {
      setApplying(false);
    }
  };

  return (
    <PortalLayout title="Internships & Placements" allowedRoles={['student']}>
      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, keywords, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '220px' }}
          />

          <select
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Types</option>
            <option value="internship">Internship</option>
            <option value="job">Full-time Job</option>
            <option value="apprenticeship">Apprenticeship</option>
            <option value="live_project">Live Project</option>
          </select>

          <select
            className="form-control"
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="">All Modes</option>
            <option value="remote">Remote</option>
            <option value="on-site">On-Site</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
            Filter Openings
          </button>
        </form>
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="card" style={{ padding: '30px', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner message="Fetching verified opportunities from database..." />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Briefcase size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <p className="text-muted">No open opportunities found matching your search criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {opportunities.map((opp) => {
            const isApplied = appliedIds.has(opp.id);
            return (
              <div key={opp.id} className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span className="badge badge-neutral" style={{ textTransform: 'uppercase' }}>
                        {opp.type.replace('_', ' ')}
                      </span>
                      <span className="badge badge-info">{opp.work_mode.toUpperCase()}</span>
                      {opp.match_score !== undefined && opp.match_score !== null && (
                        <span style={{
                          backgroundColor: opp.match_score >= 70 ? '#DEF7EC' : opp.match_score >= 40 ? '#FEF08A' : '#FEE2E2',
                          color: opp.match_score >= 70 ? '#166534' : opp.match_score >= 40 ? '#854D0E' : '#991B1B',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '11.5px'
                        }}>
                          {opp.match_score}% Match
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '17px', color: '#1E2A44', marginBottom: '4px' }}>{opp.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#6B7280', fontSize: '13px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={14} /> {opp.company_name}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} /> {opp.location}
                      </span>
                      {opp.stipend_salary && (
                        <span style={{ fontWeight: 600, color: '#1E2A44' }}>
                          Stipend/Salary: {opp.stipend_salary}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {isApplied ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> Applied
                        </span>
                        <Link to="/student/applications" className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '12px' }}>
                          Track Status
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenApplyModal(opp)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 16px' }}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ color: '#4B5563', fontSize: '13px', margin: '14px 0 10px', lineHeight: '1.6' }}>
                  {opp.description}
                </p>

                {/* Skills Tags */}
                {opp.skills && opp.skills.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {opp.skills.map((sk) => (
                      <span key={sk.id} style={{
                        backgroundColor: '#F1F5F9',
                        color: '#334155',
                        fontSize: '11.5px',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        border: '1px solid #E2E8F0'
                      }}>
                        {sk.skill_name} ({sk.minimum_level})
                      </span>
                    ))}
                  </div>
                )}

                {/* Explainable Match Transparency */}
                {opp.match_reasons && opp.match_reasons.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px dashed #CBD5E1', fontSize: '12px' }}>
                    <div style={{ fontWeight: 600, color: '#1E2A44', marginBottom: '4px' }}>Candidate Match Assessment:</div>
                    <ul style={{ paddingLeft: '18px', color: '#475569' }}>
                      {opp.match_reasons.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                    {opp.missing_skills && opp.missing_skills.length > 0 && (
                      <div style={{ marginTop: '4px', color: '#B91C1C' }}>
                        Missing Requirements: {opp.missing_skills.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {selectedOpp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header" style={{ marginBottom: '14px' }}>
              <div>
                <h3 className="card-title">Apply for {selectedOpp.title}</h3>
                <p className="text-muted" style={{ fontSize: '12.5px' }}>{selectedOpp.company_name} • {selectedOpp.location}</p>
              </div>
              <button onClick={() => setSelectedOpp(null)} className="btn btn-outline btn-sm">Close</button>
            </div>

            {applyMsg.text && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: applyMsg.type === 'success' ? '#DEF7EC' : '#FEE2E2',
                border: `1px solid ${applyMsg.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
                borderRadius: '4px',
                padding: '8px 12px',
                color: applyMsg.type === 'success' ? '#166534' : '#991B1B',
                fontSize: '12.5px',
                marginBottom: '14px'
              }}>
                {applyMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{applyMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit}>
              <div className="form-group">
                <label className="form-label">Cover Note / Expression of Interest</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Introduce yourself, explain your interest in this opening and summarize your relevant competencies..."
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  required
                />
              </div>

              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px', lineHeight: '1.5' }}>
                Your registered student profile, verified skill assessments, and uploaded resume will be attached to this application.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setSelectedOpp(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={applying}>
                  <Send size={13} /> {applying ? 'Submitting...' : 'Confirm Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
