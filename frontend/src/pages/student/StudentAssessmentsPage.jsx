import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Award, Clock, CheckCircle2, AlertCircle, Play, ChevronRight, HelpCircle } from 'lucide-react';

export function StudentAssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = () => {
    setLoading(true);
    api.get('/assessments')
      .then((data) => setAssessments(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
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
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout title="Skill Assessments" allowedRoles={['student']}>
      {result && (
        <div className="card" style={{ borderLeft: `4px solid ${result.status === 'passed' ? '#16803C' : '#C53030'}` }}>
          <div className="card-header">
            <h3 className="card-title">Assessment Result: {result.assessment_title}</h3>
            <span className={`badge ${result.status === 'passed' ? 'badge-success' : 'badge-danger'}`}>
              {result.status.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '32px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>Score Earned</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1E2A44' }}>{result.score} pts</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>Percentage</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1E2A44' }}>{result.percentage}%</div>
            </div>
          </div>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
            {result.status === 'passed'
              ? 'Congratulations! Your skill profile has been automatically updated with verified proficiency.'
              : 'You did not achieve the required passing threshold. Review the domain material and retake the test when ready.'}
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/student/assessment-results')} className="btn btn-primary btn-sm">
              View All Results
            </button>
            <button onClick={() => setResult(null)} className="btn btn-outline btn-sm">
              Back to Assessments
            </button>
          </div>
        </div>
      )}

      {/* Active Assessment Modal / Test View */}
      {activeTest && (
        <div className="card" style={{ border: '2px solid #3B5BDB' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">{activeTest.title}</h3>
              <p className="text-muted" style={{ fontSize: '12.5px', marginTop: '2px' }}>
                Type: {activeTest.assessment_type.toUpperCase()} • Time Limit: {activeTest.time_limit_minutes} mins • Passing: {activeTest.passing_marks} pts
              </p>
            </div>
            <button onClick={() => setActiveTest(null)} className="btn btn-outline btn-sm">
              Cancel Test
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '10px 0' }}>
            {activeTest.questions.length === 0 ? (
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
                          border: answers[q.id] === opt ? '1px solid #3B5BDB' : '1px solid #E2E5EA',
                          borderRadius: '4px',
                          backgroundColor: answers[q.id] === opt ? '#EEF2FF' : '#FFFFFF',
                          cursor: 'pointer',
                          fontSize: '13px'
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

          {activeTest.questions.length > 0 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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

      {/* Available Assessments List */}
      {!activeTest && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Available Official Assessments</h3>
            <span className="badge badge-info">{assessments.length} Available</span>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading assessments from database..." />
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
                    <th>Title</th>
                    <th>Type</th>
                    <th>Questions</th>
                    <th>Time Limit</th>
                    <th>Passing Marks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.title}</td>
                      <td>
                        <span className="badge badge-neutral">{a.assessment_type}</span>
                      </td>
                      <td>{a.questions?.length || 0} Questions</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} color="#6B7280" /> {a.time_limit_minutes} mins
                        </span>
                      </td>
                      <td>{a.passing_marks} / {a.total_marks}</td>
                      <td>
                        <button
                          onClick={() => handleStartTest(a)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 12px' }}
                        >
                          <Play size={12} /> Take Assessment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
