import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import {
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  FileText,
  CheckCircle,
  XCircle,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Percent
} from 'lucide-react';

export function StudentAssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);

  const navigate = useNavigate();
  const toast = useToast();

  const fetchAssessmentsAndResults = useCallback(async () => {
    setLoading(true);
    try {
      const [assessmentsData, resultsData] = await Promise.all([
        api.get('/assessments').catch(() => []),
        api.get('/assessments/results/my-results').catch(() => [])
      ]);
      setAssessments(assessmentsData || []);
      setResults(resultsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessmentsAndResults();
  }, [fetchAssessmentsAndResults]);

  // Helper to get latest result for an assessment
  const getLatestResultForAssessment = (assessmentId) => {
    const matching = results.filter((r) => r.assessment_id === assessmentId);
    if (matching.length === 0) return null;
    // Returns the most recent result
    return matching[0];
  };

  const handleStartTest = (test) => {
    setActiveTest(test);
    setAnswers({});
    setResult(null);
    setError('');
  };

  const handleSelectOption = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post(`/assessments/${activeTest.id}/submit`, {
        answers,
      });
      setResult(res);
      setActiveTest(null);
      toast.success(`Assessment submitted! Score: ${res.score} pts (${res.percentage}%)`);
      // Refresh results to show new score immediately in the table
      await fetchAssessmentsAndResults();
    } catch (err) {
      setError(err.message || 'Submission failed.');
      toast.error('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation
  const totalAssessments = assessments.length;
  const uniqueAttemptedAssessments = new Set(results.map((r) => r.assessment_id)).size;
  const passedAssessments = results.filter((r) => r.status === 'passed').length;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / results.length)
    : 0;

  return (
    <PortalLayout title="Skill Assessments & Scores" allowedRoles={['student']}>
      {/* Top Metric Cards */}
      {!activeTest && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div className="card" style={{ padding: '16px', borderLeft: '4px solid #3B5BDB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="text-muted" style={{ fontSize: '12.5px', fontWeight: 500 }}>Available Tests</span>
              <Award size={18} color="#3B5BDB" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1E2A44', marginTop: '6px' }}>
              {totalAssessments}
            </div>
          </div>

          <div className="card" style={{ padding: '16px', borderLeft: '4px solid #F59E0B' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="text-muted" style={{ fontSize: '12.5px', fontWeight: 500 }}>Attended Tests</span>
              <TrendingUp size={18} color="#F59E0B" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1E2A44', marginTop: '6px' }}>
              {uniqueAttemptedAssessments} <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 400 }}>of {totalAssessments}</span>
            </div>
          </div>

          <div className="card" style={{ padding: '16px', borderLeft: '4px solid #16803C' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="text-muted" style={{ fontSize: '12.5px', fontWeight: 500 }}>Passed & Verified</span>
              <ShieldCheck size={18} color="#16803C" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#16803C', marginTop: '6px' }}>
              {passedAssessments}
            </div>
          </div>

          <div className="card" style={{ padding: '16px', borderLeft: '4px solid #6366F1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="text-muted" style={{ fontSize: '12.5px', fontWeight: 500 }}>Average Score</span>
              <Percent size={18} color="#6366F1" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1E2A44', marginTop: '6px' }}>
              {results.length > 0 ? `${avgScore}%` : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Immediate Post-Submission Banner */}
      {result && (
        <div className="card" style={{ borderLeft: `5px solid ${result.status === 'passed' ? '#16803C' : '#C53030'}`, marginBottom: '24px' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Latest Submission: {result.assessment_title}</h3>
              <p className="text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
                Completed on {new Date(result.completed_at || Date.now()).toLocaleString()}
              </p>
            </div>
            <span className={`badge ${result.status === 'passed' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '13px', padding: '6px 12px' }}>
              {result.status.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '32px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score Earned</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#1E2A44' }}>{result.score} pts</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Percentage</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: result.status === 'passed' ? '#16803C' : '#DC2626' }}>
                {result.percentage}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: result.status === 'passed' ? '#16803C' : '#DC2626', marginTop: '4px' }}>
                {result.status === 'passed' ? 'Passed (Skill Verified)' : 'Needs Improvement'}
              </div>
            </div>
          </div>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
            {result.status === 'passed'
              ? 'Congratulations! Your profile has been automatically updated with verified proficiency for this skill.'
              : 'You did not achieve the required passing threshold. You can retake the assessment at any time to improve your score.'}
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setSelectedBreakdown(result)} className="btn btn-primary btn-sm">
              <FileText size={13} /> View Detailed Breakdown
            </button>
            <button onClick={() => setResult(null)} className="btn btn-outline btn-sm">
              Dismiss Banner
            </button>
          </div>
        </div>
      )}

      {/* Active Assessment Modal / Test View */}
      {activeTest && (
        <div className="card" style={{ border: '2px solid #3B5BDB', marginBottom: '24px' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">{activeTest.title}</h3>
              <p className="text-muted" style={{ fontSize: '12.5px', marginTop: '2px' }}>
                Type: {activeTest.assessment_type.toUpperCase()} • Time Limit: {activeTest.time_limit_minutes} mins • Passing: {activeTest.passing_marks} / {activeTest.total_marks || 100} pts
              </p>
            </div>
            <button onClick={() => setActiveTest(null)} className="btn btn-outline btn-sm">
              Cancel Test
            </button>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '4px', color: '#DC2626', fontSize: '13px', margin: '12px 0' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '10px 0' }}>
            {(!activeTest.questions || activeTest.questions.length === 0) ? (
              <p className="text-muted">No questions configured for this assessment yet.</p>
            ) : (
              activeTest.questions.map((q, idx) => (
                <div key={q.id} style={{ borderBottom: '1px solid #E2E5EA', paddingBottom: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '10px', color: '#1E2A44' }}>
                    {idx + 1}. {q.question_text} <span style={{ fontSize: '11px', color: '#6B7280' }}>({q.marks} marks)</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt) => (
                      <label
                        key={opt}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          border: answers[q.id] === opt ? '1.5px solid #3B5BDB' : '1px solid #E2E5EA',
                          borderRadius: '4px',
                          backgroundColor: answers[q.id] === opt ? '#EEF2FF' : '#FFFFFF',
                          cursor: 'pointer',
                          fontSize: '13px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => handleSelectOption(q.id, opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {activeTest.questions?.length > 0 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setActiveTest(null)}
                className="btn btn-outline btn-sm"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitTest}
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? 'Submitting & Evaluating...' : 'Submit Assessment'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Available Assessments List with Scores & Marks */}
      {!activeTest && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">All Skill Assessments & Attended Scores</h3>
              <p className="text-muted" style={{ fontSize: '12px' }}>
                Take or retake assessments at any time to verify skills and showcase your scores to employers
              </p>
            </div>
            <span className="badge badge-info">{assessments.length} Available</span>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading assessments and test scores from database..." />
          ) : assessments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Award size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
              <p className="text-muted">No published assessments found in the system catalog.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Assessment Title</th>
                    <th>Type</th>
                    <th>Questions & Time</th>
                    <th>Passing Threshold</th>
                    <th>My Score / Attended Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => {
                    const latestResult = getLatestResultForAssessment(a.id);
                    const isAttended = Boolean(latestResult);

                    return (
                      <tr key={a.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#1E2A44' }}>{a.title}</div>
                          {isAttended && latestResult.completed_at && (
                            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                              Last Attempt: {new Date(latestResult.completed_at).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                            {a.assessment_type}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '12.5px' }}>{a.questions?.length || 0} Questions</div>
                          <div style={{ fontSize: '11.5px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                            <Clock size={11} /> {a.time_limit_minutes} mins
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500, fontSize: '13px' }}>
                            {a.passing_marks} / {a.total_marks || 100} pts
                          </span>
                        </td>
                        <td>
                          {isAttended ? (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <span style={{
                                  fontWeight: 700,
                                  fontSize: '14px',
                                  color: latestResult.status === 'passed' ? '#16803C' : '#DC2626'
                                }}>
                                  {latestResult.score} / {a.total_marks || 100} pts
                                </span>
                                <span style={{
                                  fontWeight: 600,
                                  fontSize: '12.5px',
                                  color: latestResult.status === 'passed' ? '#16803C' : '#DC2626'
                                }}>
                                  ({latestResult.percentage}%)
                                </span>
                              </div>
                              <span className={`badge ${latestResult.status === 'passed' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11px' }}>
                                {latestResult.status === 'passed' ? 'PASSED (VERIFIED)' : 'FAILED'}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="badge badge-neutral" style={{ fontSize: '11.5px', color: '#6B7280' }}>
                                Not Attempted
                              </span>
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {isAttended ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStartTest(a)}
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                  title="Retake this assessment to improve your score"
                                >
                                  <RotateCcw size={12} /> Retake Test
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedBreakdown(latestResult)}
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  title="View detailed answer breakdown"
                                >
                                  <FileText size={12} /> Breakdown
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartTest(a)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              >
                                <Play size={12} /> Take Assessment
                              </button>
                            )}
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
      )}

      {/* Breakdown Details Modal */}
      {selectedBreakdown && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Score Breakdown: {selectedBreakdown.assessment_title || `Assessment #${selectedBreakdown.assessment_id}`}</h3>
                <p className="text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
                  Attempted: {selectedBreakdown.completed_at ? new Date(selectedBreakdown.completed_at).toLocaleString() : 'Recent'}
                </p>
              </div>
              <button onClick={() => setSelectedBreakdown(null)} className="btn btn-outline btn-sm">
                Close
              </button>
            </div>

            <div style={{ display: 'flex', gap: '24px', margin: '16px 0', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div>
                <span className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Score Earned</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E2A44' }}>{selectedBreakdown.score} pts</div>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Percentage</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: selectedBreakdown.status === 'passed' ? '#16803C' : '#DC2626' }}>
                  {selectedBreakdown.percentage}%
                </div>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Verification Status</span>
                <div>
                  <span className={`badge ${selectedBreakdown.status === 'passed' ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: '4px' }}>
                    {selectedBreakdown.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {selectedBreakdown.detailed_answers && (
              <div>
                <h4 style={{ fontSize: '13.5px', marginBottom: '10px', color: '#1E2A44' }}>Question Breakdown:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {Object.entries(selectedBreakdown.detailed_answers).map(([qid, info]) => (
                    <div
                      key={qid}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: info.is_correct ? '#F0FDF4' : '#FEF2F2',
                        border: `1px solid ${info.is_correct ? '#BBF7D0' : '#FECACA'}`,
                        borderRadius: '4px',
                        fontSize: '12.5px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {info.is_correct ? <CheckCircle size={15} color="#16A34A" /> : <XCircle size={15} color="#DC2626" />}
                        <span>Question #{qid}: Submitted answer: <strong>{info.submitted_answer || 'None'}</strong></span>
                      </div>
                      <span style={{ fontWeight: 600, color: info.is_correct ? '#16A34A' : '#DC2626' }}>
                        +{info.marks_earned} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedBreakdown(null)} className="btn btn-primary btn-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
