import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { GraduationCap, CheckCircle, Clock, Upload, Send } from 'lucide-react';

export function InternshipProgressPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Submit modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = () => {
    setLoading(true);
    api.get('/internships')
      .then((data) => setInternships(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      await api.put(`/internships/tasks/${selectedTask.id}/submit`, {
        submission_url: submissionUrl,
        submission_notes: submissionNotes,
      });
      alert('Task submission sent to mentor.');
      setSelectedTask(null);
      setSubmissionUrl('');
      setSubmissionNotes('');
      fetchInternships();
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout title="Internship Progress & Tasks" allowedRoles={['student']}>
      {loading ? (
        <p className="text-muted">Loading internship records...</p>
      ) : internships.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <GraduationCap size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', color: '#1E2A44', marginBottom: '6px' }}>No Active Internships</h3>
          <p className="text-muted" style={{ fontSize: '13px' }}>
            When an industry partner selects you for an internship opening, your milestones and task tracking desk will activate here.
          </p>
        </div>
      ) : (
        internships.map((intern) => (
          <div key={intern.id} style={{ marginBottom: '24px' }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{intern.opportunity_title}</h3>
                  <p className="text-muted" style={{ fontSize: '13px' }}>
                    Company: <strong>{intern.company_name}</strong> • Status: <span className="badge badge-success">{intern.status.toUpperCase()}</span>
                  </p>
                </div>
                {intern.final_grade && (
                  <div>
                    <span className="badge badge-info" style={{ fontSize: '13px', padding: '4px 10px' }}>
                      Final Grade: {intern.final_grade}
                    </span>
                  </div>
                )}
              </div>

              <h4 style={{ fontSize: '15px', color: '#1E2A44', margin: '14px 0 10px' }}>Assigned Milestones & Tasks</h4>

              {intern.tasks?.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '13px' }}>No tasks assigned by your mentor yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Task Title</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Grade</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {intern.tasks?.map((t) => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: 600 }}>{t.title}</td>
                          <td style={{ fontSize: '12.5px', color: '#4B5563', maxWidth: '280px' }}>{t.description || 'N/A'}</td>
                          <td>
                            <span className={`badge ${t.status === 'reviewed' ? 'badge-success' : t.status === 'submitted' ? 'badge-warning' : 'badge-neutral'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td>{t.due_date ? new Date(t.due_date).toLocaleDateString() : 'Flexible'}</td>
                          <td>{t.grade || '-'}</td>
                          <td>
                            {t.status === 'pending' ? (
                              <button onClick={() => setSelectedTask(t)} className="btn btn-secondary btn-sm">
                                <Upload size={12} /> Submit Work
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                                Work Submitted
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Submit Task Modal */}
      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Submit Deliverable: {selectedTask.title}</h3>
              <button onClick={() => setSelectedTask(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <form onSubmit={handleSubmitTask}>
              <div className="form-group">
                <label className="form-label">Deliverable URL / Repository Link / Document *</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://drive.google.com/... or https://github.com/..."
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Submission Remarks</label>
                <textarea
                  className="form-control"
                  placeholder="Describe your solution, methodology, and key deliverables..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setSelectedTask(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  <Send size={13} /> {submitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
