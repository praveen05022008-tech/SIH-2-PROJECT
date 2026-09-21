import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';

import { Award, Plus, CheckCircle, Clock, Sparkles, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // New manual assessment modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [assType, setAssType] = useState('technical');
  const [timeLimit, setTimeLimit] = useState(30);
  const [passingMarks, setPassingMarks] = useState(50);
  const [totalMarks, setTotalMarks] = useState(100);
  const [linkedSkillId, setLinkedSkillId] = useState('');

  // AI Quiz Generator modal
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSkillName, setAiSkillName] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('intermediate');
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiSubtopics, setAiSubtopics] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

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

  const toast = useToast();

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
      toast.success('Assessment created and published.');
    } catch (err) {
      toast.error('Error creating assessment: ' + err.message);
    }
  };

  const handleGenerateAIQuiz = async (e) => {
    e.preventDefault();
    if (!aiSkillName.trim()) {
      toast.warning('Please specify a skill name.');
      return;
    }
    setAiGenerating(true);
    try {
      const res = await api.post('/ai/generate-quiz', {
        skill_name: aiSkillName,
        difficulty: aiDifficulty,
        num_questions: parseInt(aiNumQuestions),
        subtopics: aiSubtopics,
        save_as_assessment: true,
        assessment_title: `${aiSkillName} (${aiDifficulty.toUpperCase()}) Assessment`
      });
      setShowAIModal(false);
      setAiSkillName('');
      setAiSubtopics('');
      fetchData();
      toast.success(`Generated '${res.title}' with ${res.questions?.length || aiNumQuestions} questions via Groq AI!`);
    } catch (err) {
      toast.error('AI Generation Error: ' + err.message);
    } finally {
      setAiGenerating(false);
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
      toast.success('Question added to test bank.');
    } catch (err) {
      toast.error('Error adding question: ' + err.message);
    }
  };

  return (
    <PortalLayout title="Assessment Authoring & Groq AI Test Banking" allowedRoles={['admin', 'industry']}>
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="card-title">Skill Assessment Catalog</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>Author custom tests or generate comprehensive technical quizzes instantly using Groq AI</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowAIModal(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#3B5BDB' }}
            >
              <Sparkles size={14} /> Generate with Groq AI
            </button>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-secondary btn-sm">
              <Plus size={13} /> Manual Authoring
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading assessments from TiDB..." />
        ) : assessments.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <Award size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">No assessments authored yet. Click "Generate with Groq AI" to build your first assessment bank in seconds!</p>
          </div>
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

      {/* Groq AI Quiz Generator Modal */}
      {showAIModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#3B5BDB" />
                <h3 className="card-title">Generate Assessment with Groq AI</h3>
              </div>
              <button onClick={() => setShowAIModal(false)} className="btn btn-outline btn-sm" disabled={aiGenerating}>Close</button>
            </div>
            <form onSubmit={handleGenerateAIQuiz}>
              <div className="form-group">
                <label className="form-label">Skill or Domain Topic *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. FastAPI & Async Python, React 18 Hooks, Cloud DevOps, Clinical Trial Protocols"
                  value={aiSkillName}
                  onChange={(e) => setAiSkillName(e.target.value)}
                  required
                  disabled={aiGenerating}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Difficulty Level</label>
                  <select className="form-control" value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)} disabled={aiGenerating}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Questions</label>
                  <input
                    type="number"
                    min="2"
                    max="15"
                    className="form-control"
                    value={aiNumQuestions}
                    onChange={(e) => setAiNumQuestions(e.target.value)}
                    required
                    disabled={aiGenerating}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Specific Focus Subtopics (Optional)</label>
                <textarea
                  className="form-control"
                  placeholder="e.g. State management, lifecycle methods, async error handling, security best practices"
                  rows={2}
                  value={aiSubtopics}
                  onChange={(e) => setAiSubtopics(e.target.value)}
                  disabled={aiGenerating}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowAIModal(false)} className="btn btn-outline btn-sm" disabled={aiGenerating}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={aiGenerating || !aiSkillName.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#3B5BDB' }}
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Generating Assessment...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Generate & Save Assessment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Create Assessment Modal */}
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
