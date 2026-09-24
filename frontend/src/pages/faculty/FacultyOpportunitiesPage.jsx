import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getDocumentViewUrl } from '../../utils/fileUrl';
import {
  Briefcase,
  Building,
  MapPin,
  Send,
  Check,
  UploadCloud,
  FileText,
  CheckCircle,
  Award,
  GraduationCap,
  Clock,
  DollarSign,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export function FacultyOpportunitiesPage() {
  const toast = useToast();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [nocDocumentUrl, setNocDocumentUrl] = useState('');
  const [uploadingNoc, setUploadingNoc] = useState(false);
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
    setNocDocumentUrl('');
  };

  const handleNocFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingNoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', `NOC_${selectedOpp?.title || 'Faculty'}`);
      formData.append('document_type', 'noc');
      const res = await api.post('/documents/upload', formData);
      setNocDocumentUrl(res.file_url);
      toast.success('Institutional NOC uploaded successfully.');
    } catch (err) {
      toast.error('Failed to upload NOC: ' + (err.message || 'Server error'));
    } finally {
      setUploadingNoc(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedOpp) return;
    setSubmitting(true);
    try {
      await api.post('/applications', {
        opportunity_id: selectedOpp.id,
        cover_note: coverNote,
        noc_document_url: nocDocumentUrl || null,
      });
      setAppliedIds((prev) => new Set([...prev, selectedOpp.id]));
      setSelectedOpp(null);
      setCoverNote('');
      setNocDocumentUrl('');
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
    <PortalLayout title="Faculty Opportunities & Sabbaticals" allowedRoles={['faculty']}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Industrial Sabbaticals, Residencies &amp; Corporate Training</h3>
            <p className="text-muted" style={{ fontSize: '12.5px', margin: '2px 0 0' }}>
              Explore industry-sponsored research residencies, pedagogical sabbaticals, and hands-on corporate immersions
            </p>
          </div>
          <span className="badge badge-info">{opportunities.length} Openings</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading faculty opportunities..." />
        ) : opportunities.length === 0 ? (
          <p className="text-muted" style={{ padding: '24px 0', textAlign: 'center' }}>
            No industry opportunities currently posted for faculty.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {opportunities.map((opp) => {
              const isApplied = appliedIds.has(opp.id);
              const isFacultyType = ['faculty_internship', 'industrial_training'].includes(opp.type);

              return (
                <div key={opp.id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '18px 20px', backgroundColor: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: '11px' }}>
                          {opp.type.replace('_', ' ')}
                        </span>
                        {isFacultyType && (
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F3E8FF', color: '#7E22CE', fontWeight: 700 }}>
                            ACADEMIC SABBATICAL
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>{opp.title}</h4>
                      <div style={{ display: 'flex', gap: '16px', color: '#64748B', fontSize: '12.5px', flexWrap: 'wrap' }}>
                        <span><Building size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {opp.company_name}</span>
                        <span><MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {opp.location} ({opp.work_mode})</span>
                        {opp.duration_weeks && (
                          <span><Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {opp.duration_weeks} Weeks</span>
                        )}
                        {opp.stipend_amount > 0 ? (
                          <span style={{ color: '#047857', fontWeight: 600 }}>
                            ₹{opp.stipend_amount.toLocaleString()}/mo Honorarium
                          </span>
                        ) : (
                          <span style={{ color: '#64748B' }}>Corporate Sponsored Sabbatical</span>
                        )}
                      </div>
                    </div>

                    <div>
                      {isApplied ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} /> Applied
                          </span>
                          <Link to="/faculty/applications" className="btn btn-outline btn-sm" style={{ padding: '5px 12px', fontSize: '12px' }}>
                            View Status
                          </Link>
                        </div>
                      ) : (
                        <button onClick={() => handleOpenModal(opp)} className="btn btn-primary btn-sm" style={{ backgroundColor: '#312E81', borderColor: '#312E81' }}>
                          Apply / Express Interest
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#334155', margin: '14px 0 12px', lineHeight: '1.6' }}>
                    {opp.description}
                  </p>

                  {/* Sabbatical / Faculty Eligibility Highlights */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', marginTop: '12px' }}>
                    {opp.academic_qualification && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#EEF2FF', color: '#4338CA', fontWeight: 600 }}>
                        <GraduationCap size={13} /> {opp.academic_qualification}
                      </span>
                    )}
                    {opp.min_experience_years !== null && opp.min_experience_years !== undefined && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                        <Award size={13} /> Min {opp.min_experience_years} Years Experience
                      </span>
                    )}
                    {opp.target_departments && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                        <Layers size={13} /> Depts: {opp.target_departments}
                      </span>
                    )}
                    {opp.required_skills && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#F8FAFC', color: '#64748B' }}>
                        Focus Areas: {opp.required_skills}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Application Modal ─── */}
      {selectedOpp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Apply for {selectedOpp.title}</h3>
                <p className="text-muted" style={{ fontSize: '12px', margin: '2px 0 0' }}>
                  {selectedOpp.company_name} &bull; {selectedOpp.type.replace('_', ' ')}
                </p>
              </div>
              <button onClick={() => setSelectedOpp(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <form onSubmit={handleApply}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                  Statement of Purpose / Academic Objectives <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Outline your research goals, industry relevance, and how this sabbatical/training benefits your curriculum and academic department..."
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {/* Optional Institutional NOC Upload */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} color="#4F46E5" />
                    Institutional No-Objection Certificate (NOC)
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic' }}>Optional</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px' }}>
                  If your college or university has issued an NOC for this sabbatical/training, you may upload or link it. If not yet issued, leave it blank.
                </p>

                {nocDocumentUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#047857', fontWeight: 600 }}>
                      <CheckCircle size={15} /> NOC Document Attached
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={getDocumentViewUrl(nocDocumentUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        <ExternalLink size={11} /> View
                      </a>
                      <button
                        type="button"
                        onClick={() => setNocDocumentUrl('')}
                        style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11.5px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#334155',
                        cursor: uploadingNoc ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <UploadCloud size={14} />
                      {uploadingNoc ? 'Uploading NOC...' : 'Upload NOC Document (PDF/Doc)'}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={handleNocFileUpload}
                        disabled={uploadingNoc}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>or leave blank</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setSelectedOpp(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || uploadingNoc} style={{ backgroundColor: '#312E81', borderColor: '#312E81' }}>
                  <Send size={13} /> {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
