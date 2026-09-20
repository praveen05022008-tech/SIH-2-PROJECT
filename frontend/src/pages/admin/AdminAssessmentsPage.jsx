import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Award, Plus, CheckCircle, Clock } from 'lucide-react';

export function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // New assessment modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [assType, setAssType] = useState('technical');
  const [timeLimit, setTimeLimit] = useState(30);
  const [passingMarks, setPassingMarks] = useState(50);
  const [totalMarks, setTotalMarks] = useState(100);
  const [linkedSkillId, setLinkedSkillId] = useState('');

  // Add question modal
  const [selectedAssForQ, setSelectedAssForQ] = useState(null);
  const [qText, setQText] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qOpt4, setQOpt4] = useState('');
  const [qCorrect, setQCorrect] = useState('');
  const [qMarks, setQMarks] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assList, skList] = await Promise.all([
        api.get('/assessments'),
        api.get('/skills'),
      ]);
      setAssessments(assList);
      setSkills(skList);
    } catch {}
    setLoading(false);
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assessments', {
        title,
        assessment_type: assType,
        time_limit_minutes: parseInt(timeLimit),
        passing_marks: parseFloat(passingMarks),
        total_marks: parseFloat(totalMarks),
        skill_id: linkedSkillId ? parseInt(linkedSkillId) : null,
        is_published: true,
      });
      setShowCreateModal(false);
      setTitle('');
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedAssForQ) return;
    try {
      await api.post(`/assessments/${selectedAssForQ.id}/questions`, {
        question_text: qText,
        options: [qOpt1, qOpt2, qOpt3, qOpt4],
        correct_answer: qCorrect,
        marks: parseFloat(qMarks),
      });
      setSelectedAssForQ(null);
      setQText('');
      setQOpt1('');
      setQOpt2('');
      setQOpt3('');
      setQOpt4('');
      setQCorrect('');
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <PortalLayout title="Assessment Authoring & Test Banking" allowedRoles={['admin']}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Standardized Skill Assessments</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>Configure tests and question banks for student competency verification</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-secondary btn-sm">
            <Plus size={13} /> Author Assessment
          </button>
        </div>

        {loading ? (
          <p className="text-muted">Loading assessments catalog...</p>
        ) : assessments.length === 0 ? (
          <p className="text-muted" style={{ padding: '24px 0' }}>No assessments authored yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Questions Count</th>
                  <th>Time Limit</th>
                  <th>Passing Marks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.title}</td>
                    <td><span className="badge badge-neutral">{a.assessment_type}</span></td>
                    <td>{a.questions?.length || 0} Questions</td>
                    <td>{a.time_limit_minutes} mins</td>
                    <td>{a.passing_marks} / {a.total_marks}</td>
                    <td>
                      <button onClick={() => setSelectedAssForQ(a)} className="btn btn-outline btn-sm">
                        <Plus size={12} /> Add Question
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Author New Assessment</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <form onSubmit={handleCreateAssessment}>
              <div className="form-group">
                <label className="form-label">Assessment Title *</label>
                <input type="text" className="form-control" placeholder="e.g. Fundamental Clinical Data Structures" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Assessment Type</label>
                  <select className="form-control" value={assType} onChange={(e) => setAssType(e.target.value)}>
                    <option value="technical">Technical Assessment</option>
                    <option value="programming">Programming Assessment</option>
                    <option value="aptitude">Aptitude Test</option>
                    <option value="soft_skill">Soft-Skill Questionnaire</option>
                    <option value="communication">Communication Assessment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Link to Catalog Skill (Optional)</label>
                  <select className="form-control" value={linkedSkillId} onChange={(e) => setLinkedSkillId(e.target.value)}>
                    <option value="">-- None / General --</option>
                    {skills.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Time Limit (mins)</label>
                  <input type="number" min="5" className="form-control" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Passing Marks</label>
                  <input type="number" min="1" className="form-control" value={passingMarks} onChange={(e) => setPassingMarks(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Marks</label>
                  <input type="number" min="10" className="form-control" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save & Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {selectedAssForQ && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Add Question to: {selectedAssForQ.title}</h3>
              <button onClick={() => setSelectedAssForQ(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <form onSubmit={handleAddQuestion}>
              <div className="form-group">
                <label className="form-label">Question Text *</label>
                <textarea className="form-control" rows={3} value={qText} onChange={(e) => setQText(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Option A *</label>
                <input type="text" className="form-control" value={qOpt1} onChange={(e) => setQOpt1(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Option B *</label>
                <input type="text" className="form-control" value={qOpt2} onChange={(e) => setQOpt2(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Option C *</label>
                <input type="text" className="form-control" value={qOpt3} onChange={(e) => setQOpt3(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Option D *</label>
                <input type="text" className="form-control" value={qOpt4} onChange={(e) => setQOpt4(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Correct Answer (Exact String) *</label>
                  <input type="text" className="form-control" placeholder="Match Option text" value={qCorrect} onChange={(e) => setQCorrect(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Question Marks</label>
                  <input type="number" min="1" className="form-control" value={qMarks} onChange={(e) => setQMarks(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setSelectedAssForQ(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
