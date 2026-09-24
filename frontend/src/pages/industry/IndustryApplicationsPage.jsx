import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';
import { getDocumentViewUrl } from '../../utils/fileUrl';
import { Users, FileText, CheckCircle, Sparkles, Loader2, FolderGit2, ExternalLink } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function IndustryApplicationsPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const oppIdParam = searchParams.get('opportunity_id');

  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState(oppIdParam || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Review modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('shortlisted');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // AI Candidate Insights
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const fetchApplications = useCallback(() => {
    setLoading(true);
    let url = '/applications';
    const params = [];
    if (selectedOppId) params.push(`opportunity_id=${selectedOppId}`);
    if (statusFilter) params.push(`status_filter=${statusFilter}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    api.get(url)
      .then((data) => setApplications(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedOppId, statusFilter]);

  useEffect(() => {
    api.get('/opportunities?my_only=true')
      .then((data) => setOpportunities(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleOpenReview = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status === 'applied' ? 'shortlisted' : app.status);
    setReviewerNotes(app.reviewer_notes || '');
    setAiInsights(null);
  };


  const fetchAICandidateInsights = async () => {
    if (!selectedApp) return;
    setLoadingAi(true);
    try {
      const res = await api.post('/ai/candidate-insights', {
        applicant_user_id: selectedApp.applicant_user_id || selectedApp.applicant?.user_id,
        student_id: selectedApp.applicant_user_id || selectedApp.applicant?.user_id,
        opportunity_id: selectedApp.opportunity_id
      });
      setAiInsights(res);
      toast.success('Generated AI Candidate Suitability Insights.');
    } catch (err) {
      toast.error('Could not generate AI insights: ' + err.message);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setUpdating(true);

    try {
      await api.put(`/applications/${selectedApp.id}/status`, {
        status: newStatus,
        reviewer_notes: reviewerNotes,
      });
      setSelectedApp(null);
      fetchApplications();
      toast.success(`Application updated to '${newStatus.replace('_', ' ')}'.`);
    } catch (err) {
      toast.error('Error updating status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <PortalLayout title="Candidate Pipeline & Groq AI Talent Evaluation" allowedRoles={['industry']}>
      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Filter by Opening</label>
            <select
              className="form-control"
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
            >
              <option value="">All My Postings</option>
              {opportunities.map((o) => (
                <option key={o.id} value={o.id}>{o.title}</option>
              ))}
            </select>
          </div>

          <div style={{ width: '180px' }}>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Filter by Status</label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate List Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Applicant Roster</h3>
          <span className="badge badge-info">{applications.length} Candidates</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading candidate pipeline from TiDB..." />
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <Users size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">No candidate applications matching criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate / Role</th>
                  <th>Position</th>
                  <th>Institution / Discipline</th>
                  <th>Academic Profile / CGPA</th>
                  <th>Match Score</th>
                  <th>NOC Status</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => {
                  const isFaculty = a.applicant_role === 'faculty';
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, color: '#1E2A44' }}>
                            {a.applicant?.full_name || 'Candidate'}
                          </span>
                          {isFaculty && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#E0E7FF',
                                color: '#3730A3',
                              }}
                            >
                              FACULTY
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                          {a.applicant?.email}
                        </div>
                      </td>
                      <td>{a.opportunity?.title || 'Opening'}</td>
                      <td>
                        <div>{a.applicant?.institution_name || 'Academic Institution'}</div>
                        <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                          {isFaculty ? (a.applicant?.department_name || a.applicant?.specialization || 'Department') : a.applicant?.course}
                        </div>
                      </td>
                      <td>
                        {isFaculty ? (
                          <div>
                            <span style={{ fontWeight: 600, color: '#1E293B', fontSize: '12.5px' }}>
                              {a.applicant?.qualification || 'Post-Graduate'}
                            </span>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              {a.applicant?.experience_years ? `${a.applicant.experience_years} yrs tenure` : (a.applicant?.designation || 'Faculty')}
                            </div>
                          </div>
                        ) : (
                          <span>{a.applicant?.cgpa ? `${a.applicant.cgpa} CGPA` : 'N/A'}</span>
                        )}
                      </td>
                      <td>
                        {a.match_score !== null && a.match_score !== undefined ? (
                          <span style={{
                            backgroundColor: a.match_score >= 70 ? '#DEF7EC' : a.match_score >= 40 ? '#FEF08A' : '#FEE2E2',
                            color: a.match_score >= 70 ? '#166534' : a.match_score >= 40 ? '#854D0E' : '#991B1B',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '12px'
                          }}>
                            {a.match_score}%
                          </span>
                        ) : '-'}
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
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#DCFCE7',
                              color: '#15803D',
                              fontSize: '11px',
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                            title="Click to view uploaded institutional NOC"
                          >
                            <CheckCircle size={12} /> NOC Verified
                          </a>
                        ) : null}
                      </td>
                      <td>
                        <span className={`badge ${
                          a.status === 'selected' ? 'badge-success' :
                          a.status === 'shortlisted' ? 'badge-info' :
                          a.status === 'under_review' ? 'badge-warning' :
                          a.status === 'rejected' ? 'badge-danger' : 'badge-neutral'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td>{new Date(a.applied_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleOpenReview(a)} className="btn btn-outline btn-sm">
                            Evaluate
                          </button>
                          <a
                            href={`/portfolio/${a.applicant?.username || a.applicant_user_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11.5px', color: '#2563EB', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="View Complete Student Digital Portfolio"
                          >
                            <FolderGit2 size={12} /> Portfolio
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Evaluate Candidate: {selectedApp.applicant?.full_name}</h3>
                <p className="text-muted" style={{ fontSize: '12px' }}>
                  Position: {selectedApp.opportunity?.title} • Match: {selectedApp.match_score || 'N/A'}%
                </p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="btn btn-outline btn-sm">Close</button>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', border: '1px solid #E2E8F0' }}>
              {selectedApp.applicant_role === 'faculty' && (
                <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '14px' }}>
                      {selectedApp.applicant?.full_name}
                    </span>
                    <span className="badge badge-info" style={{ fontSize: '11px' }}>Faculty Candidate</span>
                  </div>
                  <div style={{ color: '#475569', fontSize: '12.5px', marginBottom: '4px' }}>
                    <strong>Designation & Institution:</strong> {selectedApp.applicant?.designation || 'Faculty'} • {selectedApp.applicant?.institution_name || 'Academic Institution'} ({selectedApp.applicant?.department_name || 'Engineering'})
                  </div>
                  <div style={{ color: '#475569', fontSize: '12.5px', marginBottom: '4px' }}>
                    <strong>Qualification & Tenure:</strong> {selectedApp.applicant?.qualification || 'Post-Graduate'} • {selectedApp.applicant?.experience_years ? `${selectedApp.applicant.experience_years} years experience` : 'Academic tenure'}
                  </div>
                  {selectedApp.applicant?.research_areas && (
                    <div style={{ color: '#475569', fontSize: '12.5px' }}>
                      <strong>Research Interests:</strong> {selectedApp.applicant.research_areas}
                    </div>
                  )}
                </div>
              )}

              <div style={{ fontWeight: 600, color: '#1E2A44', marginBottom: '4px' }}>
                {selectedApp.applicant_role === 'faculty' ? 'Statement of Academic Objectives & Purpose:' : 'Candidate Statement / Cover Note:'}
              </div>
              <p style={{ color: '#475569', lineHeight: '1.5', fontStyle: 'italic', margin: 0 }}>
                "{selectedApp.cover_note || 'No statement submitted.'}"
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <a
                  href={`/portfolio/${selectedApp.applicant?.username || selectedApp.applicant_user_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#EFF6FF', border: '1px solid #2563EB', color: '#2563EB', fontWeight: 700 }}
                >
                  <FolderGit2 size={13} /> View Digital Portfolio
                </a>
                {selectedApp.resume_url && (
                  <a href={getDocumentViewUrl(selectedApp.resume_url)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                    <FileText size={13} /> {selectedApp.applicant_role === 'faculty' ? 'View Faculty CV' : 'View Candidate Resume'}
                  </a>
                )}
                {selectedApp.noc_document_url && (
                  <a
                    href={getDocumentViewUrl(selectedApp.noc_document_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#16A34A', color: '#166534', backgroundColor: '#F0FDF4' }}
                  >
                    <CheckCircle size={13} /> View Verified Institutional NOC
                  </a>
                )}
                <button
                  type="button"
                  onClick={fetchAICandidateInsights}
                  disabled={loadingAi}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#3B5BDB' }}
                >
                  {loadingAi ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  {loadingAi ? 'Analyzing Fit...' : (selectedApp.applicant_role === 'faculty' ? 'Groq AI Faculty Fit Analysis' : 'Groq AI Fit Analysis')}
                </button>
              </div>
            </div>

            {/* AI Insights Card */}
            {aiInsights && (
              <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1E40AF', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
                  <Sparkles size={16} /> AI Candidate Suitability Assessment
                </div>
                <p style={{ fontSize: '13px', color: '#1E3A8A', marginBottom: '8px' }}>
                  <strong>Verdict:</strong> {aiInsights.match_verdict}
                </p>
                {aiInsights.key_strengths?.length > 0 && (
                  <div style={{ fontSize: '12.5px', marginBottom: '6px' }}>
                    <strong style={{ color: '#166534' }}>Key Strengths:</strong> {aiInsights.key_strengths.join(', ')}
                  </div>
                )}
                {aiInsights.potential_gaps?.length > 0 && (
                  <div style={{ fontSize: '12.5px', marginBottom: '8px' }}>
                    <strong style={{ color: '#991B1B' }}>Potential Skill Gaps:</strong> {aiInsights.potential_gaps.join(', ')}
                  </div>
                )}
                {aiInsights.suggested_interview_questions?.length > 0 && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #DBEAFE' }}>
                    <div style={{ fontWeight: 600, fontSize: '12px', color: '#1E3A8A', marginBottom: '4px' }}>
                      Recommended Technical Interview Questions:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#1E293B' }}>
                      {aiInsights.suggested_interview_questions.map((q, qIdx) => (
                        <li key={qIdx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleUpdateStatus}>
              <div className="form-group">
                <label className="form-label">Update Recruitment Status *</label>
                <select
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlist for Interview</option>
                  <option value="selected">Select Candidate (Offer Placement/Internship)</option>
                  <option value="rejected">Reject Application</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reviewer Notes / Interview Instructions</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Notes sent to candidate (e.g. interview schedule or feedback)..."
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setSelectedApp(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={updating}>
                  {updating ? 'Updating...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
