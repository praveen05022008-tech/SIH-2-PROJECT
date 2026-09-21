import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';

import { GraduationCap, Plus, Star, CheckCircle, ExternalLink } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function IndustryMentorshipPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task creation modal
  const [selectedInternForTask, setSelectedInternForTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Review modal
  const [selectedTaskForReview, setSelectedTaskForReview] = useState(null);
  const [grade, setGrade] = useState('A');
  const [feedback, setFeedback] = useState('');

  // Mentor evaluation modal
  const [selectedInternForFeedback, setSelectedInternForFeedback] = useState(null);
  const [fbText, setFbText] = useState('');
  const [rTech, setRTech] = useState(4.0);
  const [rSoft, setRSoft] = useState(4.0);
  const [rPunct, setRPunct] = useState(4.0);

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

  const toast = useToast();

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedInternForTask) return;
    try {
      await api.post(`/internships/${selectedInternForTask.id}/tasks`, {
        title: taskTitle,
        description: taskDesc,
        due_date: taskDueDate || null,
      });
      setSelectedInternForTask(null);
      setTaskTitle('');
      setTaskDesc('');
      fetchInternships();
      toast.success('Task assigned to intern.');
    } catch (err) {
      toast.error('Error creating task: ' + err.message);
    }
  };

  const handleReviewTask = async (e) => {
    e.preventDefault();
    if (!selectedTaskForReview) return;
    try {
      await api.put(`/internships/tasks/${selectedTaskForReview.id}/review`, {
        grade,
        feedback,
        status: 'reviewed',
      });
      setSelectedTaskForReview(null);
      setGrade('A');
      setFeedback('');
      fetchInternships();
      toast.success('Task reviewed and graded.');
    } catch (err) {
      toast.error('Error reviewing task: ' + err.message);
    }
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!selectedInternForFeedback) return;
    try {
      await api.post(`/internships/${selectedInternForFeedback.id}/feedback`, {
        feedback_text: fbText,
        rating_technical: parseFloat(rTech),
        rating_soft_skills: parseFloat(rSoft),
        rating_punctuality: parseFloat(rPunct),
      });
      setSelectedInternForFeedback(null);
      setFbText('');
      fetchInternships();
      toast.success('Mentor evaluation report recorded.');
    } catch (err) {
      toast.error('Error submitting feedback: ' + err.message);
    }
  };

  return (
    <PortalLayout title="Internship Milestones & Mentorship" allowedRoles={['industry']}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Supervised Interns & Apprentices</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>Assign tasks, grade submissions, and record performance ratings</p>
          </div>
          <span className="badge badge-info">{internships.length} Active Interns</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading interns and mentorship tasks..." />
        ) : internships.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <GraduationCap size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">No active interns assigned under your corporate profile.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {internships.map((intern) => (
              <div key={intern.id} style={{ border: '1px solid #E2E5EA', borderRadius: '4px', padding: '18px', backgroundColor: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', color: '#1E2A44', marginBottom: '2px' }}>
                      {intern.student_name || 'Intern Candidate'}
                    </h4>
                    <span className="text-muted" style={{ fontSize: '12.5px' }}>
                      Position: <strong>{intern.opportunity_title}</strong> • Status: <span className="badge badge-success">{intern.status}</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setSelectedInternForTask(intern)} className="btn btn-secondary btn-sm">
                      <Plus size={13} /> Assign Task
                    </button>
                    <button onClick={() => setSelectedInternForFeedback(intern)} className="btn btn-outline btn-sm">
                      <Star size={13} /> Post Evaluation
                    </button>
                  </div>
                </div>

                {/* Tasks List */}
                <h5 style={{ fontSize: '13.5px', color: '#1E2A44', marginBottom: '8px' }}>Assigned Milestones</h5>
                {intern.tasks?.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: '12.5px' }}>No milestones created for this candidate yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table" style={{ backgroundColor: '#FFFFFF' }}>
                      <thead>
                        <tr>
                          <th>Task Title</th>
                          <th>Status</th>
                          <th>Deliverable</th>
                          <th>Grade</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {intern.tasks?.map((t) => (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 600 }}>{t.title}</td>
                            <td>
                              <span className={`badge ${t.status === 'reviewed' ? 'badge-success' : t.status === 'submitted' ? 'badge-warning' : 'badge-neutral'}`}>
                                {t.status}
                              </span>
                            </td>
                            <td>
                              {t.submission_url ? (
                                <a href={t.submission_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                  <ExternalLink size={12} /> View Submission
                                </a>
                              ) : '-'}
                            </td>
                            <td>{t.grade || '-'}</td>
                            <td>
                              {t.status === 'submitted' ? (
                                <button onClick={() => setSelectedTaskForReview(t)} className="btn btn-primary btn-sm">
                                  Grade Work
                                </button>
                              ) : t.status === 'reviewed' ? (
                                <span style={{ fontSize: '12px', color: '#166534' }}>Graded</span>
                              ) : (
                                <span style={{ fontSize: '12px', color: '#6B7280' }}>Pending</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Task Modal */}
      {selectedInternForTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Assign Task to {selectedInternForTask.student_name}</h3>
              <button onClick={() => setSelectedInternForTask(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task / Milestone Title *</label>
                <input type="text" className="form-control" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Deliverable Requirements</label>
                <textarea className="form-control" rows={3} value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-control" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setSelectedInternForTask(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Task Modal */}
      {selectedTaskForReview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Grade Milestone: {selectedTaskForReview.title}</h3>
              <button onClick={() => setSelectedTaskForReview(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }}>
              <div>Deliverable: <a href={selectedTaskForReview.submission_url} target="_blank" rel="noreferrer">{selectedTaskForReview.submission_url}</a></div>
              {selectedTaskForReview.submission_notes && (
                <div style={{ marginTop: '6px', color: '#4B5563' }}>Notes: "{selectedTaskForReview.submission_notes}"</div>
              )}
            </div>
            <form onSubmit={handleReviewTask}>
              <div className="form-group">
                <label className="form-label">Grade Assigned *</label>
                <select className="form-control" value={grade} onChange={(e) => setGrade(e.target.value)}>
                  <option value="A+">A+ (Exceptional)</option>
                  <option value="A">A (Excellent)</option>
                  <option value="B+">B+ (Very Good)</option>
                  <option value="B">B (Satisfactory)</option>
                  <option value="Needs Revision">Needs Revision</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Supervisor Remarks</label>
                <textarea className="form-control" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setSelectedTaskForReview(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Submit Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mentor Evaluation Modal */}
      {selectedInternForFeedback && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Post Mentor Evaluation for {selectedInternForFeedback.student_name}</h3>
              <button onClick={() => setSelectedInternForFeedback(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <form onSubmit={handleAddFeedback}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Technical Skills (1-5)</label>
                  <input type="number" min="1" max="5" step="0.5" className="form-control" value={rTech} onChange={(e) => setRTech(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Soft Skills (1-5)</label>
                  <input type="number" min="1" max="5" step="0.5" className="form-control" value={rSoft} onChange={(e) => setRSoft(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Punctuality (1-5)</label>
                  <input type="number" min="1" max="5" step="0.5" className="form-control" value={rPunct} onChange={(e) => setRPunct(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Detailed Performance Evaluation *</label>
                <textarea className="form-control" rows={4} placeholder="Summarize intern strengths, technical contributions, and areas for improvement..." value={fbText} onChange={(e) => setFbText(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setSelectedInternForFeedback(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Evaluation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
