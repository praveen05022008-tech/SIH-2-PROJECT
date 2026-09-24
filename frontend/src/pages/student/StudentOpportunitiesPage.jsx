import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Briefcase,
  MapPin,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Check,
  ExternalLink,
  Sparkles,
  Target,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Filter,
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';

export function StudentOpportunitiesPage() {
  const toast = useToast();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [matchTab, setMatchTab] = useState('all'); // 'all', 'recommended', 'internships', 'jobs'

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
      .then((data) => setOpportunities(data || []))
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

  const filteredOpportunities = useMemo(() => {
    let list = [...opportunities];

    if (matchTab === 'recommended') {
      list = list.filter((o) => (o.match_score || 0) >= 70);
    } else if (matchTab === 'internships') {
      list = list.filter((o) => o.type === 'internship' || o.type === 'apprenticeship');
    } else if (matchTab === 'jobs') {
      list = list.filter((o) => o.type === 'job');
    }

    // Sort by match score descending
    return list.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  }, [opportunities, matchTab]);

  return (
    <PortalLayout title="Internships & Placement Opportunities" allowedRoles={['student']}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>

        {/* Top Header & AI Matching Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            borderRadius: '16px',
            padding: '24px 28px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(96, 165, 250, 0.4)',
                    color: '#93C5FD',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Sparkles size={12} /> Automated AI Match Engine
                </span>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#F8FAFC' }}>
                Verified Internships & Career Opportunities
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#CBD5E1' }}>
                Opportunities are continuously scored against your verified assessment results, academic CGPA, and portfolio skills.
              </p>
            </div>
          </div>

          {/* Tab Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
            {[
              { id: 'all', label: 'All Open Roles' },
              { id: 'recommended', label: 'AI Best Matches (70%+ Fit)' },
              { id: 'internships', label: 'Internships & Projects' },
              { id: 'jobs', label: 'Full-Time Positions' }
            ].map((tab) => {
              const active = matchTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMatchTab(tab.id)}
                  style={{
                    padding: '7px 15px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: active ? 700 : 500,
                    backgroundColor: active ? '#2563EB' : 'rgba(255, 255, 255, 0.06)',
                    color: active ? '#FFFFFF' : '#CBD5E1',
                    border: active ? '1px solid #60A5FA' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Attribute Filters */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search roles by title, skill keywords, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none'
              }}
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                width: '150px',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#FFFFFF'
              }}
            >
              <option value="">All Types</option>
              <option value="internship">Internship</option>
              <option value="job">Full-time Job</option>
              <option value="apprenticeship">Apprenticeship</option>
              <option value="live_project">Live Project</option>
            </select>

            <select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              style={{
                width: '140px',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#FFFFFF'
              }}
            >
              <option value="">All Modes</option>
              <option value="remote">Remote</option>
              <option value="on-site">On-Site</option>
              <option value="hybrid">Hybrid</option>
            </select>

            <button
              type="submit"
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Apply Filter
            </button>
          </form>
        </div>

        {/* Opportunities List */}
        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner message="Evaluating role matches against your profile credentials..." />
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              textAlign: 'center',
              padding: '48px 20px',
              border: '1px solid #E2E8F0'
            }}
          >
            <Briefcase size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', margin: '0 0 6px 0' }}>
              No matching opportunities found
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Try adjusting your filter parameters or search terms to explore more industry postings.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredOpportunities.map((opp) => {
              const isApplied = appliedIds.has(opp.id);
              const matchScore = opp.match_score !== undefined && opp.match_score !== null ? opp.match_score : 75.0;

              let fitLabel = 'Developing Fit';
              let fitBg = '#FEF2F2';
              let fitColor = '#DC2626';

              if (matchScore >= 75) {
                fitLabel = 'High Fit';
                fitBg = '#ECFDF5';
                fitColor = '#059669';
              } else if (matchScore >= 50) {
                fitLabel = 'Moderate Fit';
                fitBg = '#FFFBEB';
                fitColor = '#D97706';
              }

              return (
                <div
                  key={opp.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: '#F1F5F9',
                            color: '#475569',
                            padding: '3px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          {opp.type.replace('_', ' ')}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            padding: '3px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          {opp.work_mode}
                        </span>

                        {/* Fit Badge */}
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            backgroundColor: fitBg,
                            color: fitColor,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Target size={13} /> {matchScore}% Match • {fitLabel}
                        </span>
                      </div>

                      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                        {opp.title}
                      </h2>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748B', fontSize: '13px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#334155' }}>
                          <Building2 size={14} color="#2563EB" /> {opp.company_name}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin size={14} /> {opp.location}
                        </span>
                        {opp.stipend_salary && (
                          <span style={{ fontWeight: 700, color: '#059669' }}>
                            Stipend/Package: {opp.stipend_salary}
                          </span>
                        )}
                        {opp.duration && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={14} /> Duration: {opp.duration}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {isApplied ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              backgroundColor: '#ECFDF5',
                              color: '#059669',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Check size={15} /> Application Submitted
                          </span>
                          <Link
                            to="/student/applications"
                            style={{
                              fontSize: '12.5px',
                              fontWeight: 600,
                              color: '#2563EB',
                              textDecoration: 'none',
                              padding: '7px 12px',
                              border: '1px solid #BFDBFE',
                              borderRadius: '8px'
                            }}
                          >
                            Track Status
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenApplyModal(opp)}
                          style={{
                            backgroundColor: '#2563EB',
                            color: '#FFFFFF',
                            padding: '9px 20px',
                            borderRadius: '10px',
                            fontSize: '13.5px',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Send size={14} /> Apply Now
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ color: '#475569', fontSize: '13.5px', margin: 0, lineHeight: 1.6 }}>
                    {opp.description}
                  </p>

                  {/* Skills Required Tags */}
                  {opp.skills && opp.skills.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {opp.skills.map((sk) => (
                        <span
                          key={sk.id}
                          style={{
                            backgroundColor: '#F8FAFC',
                            color: '#334155',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0'
                          }}
                        >
                          {sk.skill_name} ({sk.minimum_level})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Explainable AI Match Assessment Breakdown */}
                  {opp.match_reasons && opp.match_reasons.length > 0 && (
                    <div
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12.5px'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Target size={14} color="#2563EB" /> Candidate Match Assessment:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {opp.match_reasons.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>

                      {opp.missing_skills && opp.missing_skills.length > 0 && (
                        <div style={{ marginTop: '8px', color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertCircle size={14} /> Missing Competencies: {opp.missing_skills.join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bridge Course Pathway Recommendation */}
                  {opp.recommended_programs && opp.recommended_programs.length > 0 && (
                    <div
                      style={{
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E40AF' }}>
                            Recommended Skill Bridge Pathway
                          </div>
                          <div style={{ fontSize: '12px', color: '#3B82F6' }}>
                            {opp.recommended_programs[0].title} ({opp.recommended_programs[0].provider})
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/student/learning-programs"
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          backgroundColor: '#2563EB',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>Start Bridge Course</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Apply Modal */}
        {selectedOpp && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '16px'
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '28px',
                maxWidth: '540px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                  Apply for {selectedOpp.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  {selectedOpp.company_name} • {selectedOpp.location}
                </p>
              </div>

              {applyMsg.text && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', backgroundColor: applyMsg.type === 'error' ? '#FEF2F2' : '#EFF6FF', color: applyMsg.type === 'error' ? '#DC2626' : '#2563EB' }}>
                  {applyMsg.text}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Cover Note / Statement of Interest (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Introduce yourself, highlight relevant projects and why you are a strong match for this role..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  disabled={applying}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleApplySubmit}
                  disabled={applying}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    border: 'none',
                    cursor: applying ? 'not-allowed' : 'pointer'
                  }}
                >
                  {applying ? 'Submitting Application...' : 'Confirm & Submit Application'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
