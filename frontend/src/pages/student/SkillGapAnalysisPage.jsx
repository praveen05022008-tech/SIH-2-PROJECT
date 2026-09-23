import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

import {
  Compass,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  Loader2,
  Calendar,
  Target,
  ShieldCheck
} from 'lucide-react';
import { AICareerCounselor } from '../../components/AICareerCounselor';

export function SkillGapAnalysisPage() {
  const [careerRoles, setCareerRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // AI Roadmap State
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [careerInterests, setCareerInterests] = useState('');
  const [aiRoadmap, setAiRoadmap] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    api.get('/skills/career-roles')
      .then((roles) => {
        setCareerRoles(roles);
        if (roles.length > 0) {
          setSelectedRoleId(roles[0].id);
          setCustomRoleInput(roles[0].title);
          runAnalysis(roles[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setInitialLoading(false));
  }, []);

  const runAnalysis = async (roleId) => {
    if (!roleId) return;
    setLoading(true);
    try {
      const data = await api.get(`/skills/gap-analysis/${roleId}`);
      setAnalysis(data);
    } catch {}
    setLoading(false);
  };

  const handleRoleChange = (e) => {
    const rId = e.target.value;
    setSelectedRoleId(rId);
    const selected = careerRoles.find(r => String(r.id) === String(rId));
    if (selected) setCustomRoleInput(selected.title);
    runAnalysis(rId);
  };

  const toast = useToast();

  const generateAIRoadmap = async () => {
    const target = customRoleInput.trim() || (analysis ? analysis.career_role : 'Software Engineer');
    setAiLoading(true);
    try {
      const res = await api.post('/ai/skill-gap-roadmap', {
        target_role: target,
        interests: careerInterests
      });
      setAiRoadmap(res);
      toast.success(`Generated 4-Week AI Career Roadmap for '${target}'.`);
    } catch (err) {
      toast.error('Failed to generate AI roadmap: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <PortalLayout title="Skill Gap & AI Career Roadmap" allowedRoles={['student']}>
      {/* Top Selector Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 className="card-title">Target Industry Career Pathway</h3>
            <p className="text-muted" style={{ fontSize: '13px' }}>
              Compare your validated skills against industry-defined standards or generate a tailored Groq AI roadmap.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              value={selectedRoleId}
              onChange={handleRoleChange}
              disabled={initialLoading}
              style={{ minWidth: '240px' }}
            >
              {careerRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.sector || 'Industry'})
                </option>
              ))}
            </select>

            <button
              onClick={generateAIRoadmap}
              disabled={aiLoading}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3B5BDB' }}
            >
              <Sparkles size={16} />
              {aiLoading ? 'Generating AI Roadmap...' : 'Generate Groq AI Roadmap'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Roadmap Display if Generated */}
      {aiRoadmap && (
        <div className="card" style={{ marginBottom: '24px', border: '2px solid #3B5BDB', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ backgroundColor: '#3B5BDB', padding: '8px', borderRadius: '8px' }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', color: '#1E2A44', margin: 0 }}>
                  Groq AI 4-Week Career Roadmap: {customRoleInput}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Personalized strategic roadmap based on your profile telemetry</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-primary" style={{ fontSize: '13px', padding: '6px 12px' }}>
                AI Readiness: {aiRoadmap.overall_readiness_score}%
              </span>
            </div>
          </div>

          <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5', marginBottom: '18px', padding: '12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <strong>Strategic Summary:</strong> {aiRoadmap.summary}
          </p>

          {/* 4-Week Cards */}
          {aiRoadmap.four_week_roadmap && aiRoadmap.four_week_roadmap.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              {aiRoadmap.four_week_roadmap.map((week, idx) => (
                <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#3B5BDB', fontSize: '13px' }}>{week.week || `Week ${idx + 1}`}</span>
                    {week.estimated_hours && (
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {week.estimated_hours} hrs
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '14px', color: '#1E293B', marginBottom: '8px' }}>{week.focus_theme}</h4>

                  {week.action_items && (
                    <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: '#475569', marginBottom: '8px' }}>
                      {Array.isArray(week.action_items) ? week.action_items.map((act, aIdx) => (
                        <li key={aIdx}>{act}</li>
                      )) : <li>{week.action_items}</li>}
                    </ul>
                  )}

                  {week.recommended_projects && (
                    <div style={{ fontSize: '12px', backgroundColor: '#F1F5F9', padding: '8px', borderRadius: '4px', color: '#0F172A' }}>
                      <strong>Project:</strong> {Array.isArray(week.recommended_projects) ? week.recommended_projects.join(', ') : week.recommended_projects}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {aiRoadmap.industry_advice && (
            <div style={{ backgroundColor: '#EFF6FF', borderLeft: '4px solid #3B5BDB', padding: '12px', borderRadius: '4px', fontSize: '13px', color: '#1E3A8A' }}>
              <strong>Industry Mentor Advice:</strong> {aiRoadmap.industry_advice}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '36px', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner message="Analyzing skill competencies from TiDB records..." />
        </div>
      ) : analysis ? (
        <div>
          {/* Readiness Score Card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', marginBottom: '20px' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>
                Standard Pathway Readiness
              </span>
              <h2 style={{ fontSize: '22px', color: '#1E2A44', marginTop: '4px' }}>
                {analysis.career_role}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 700,
                color: analysis.readiness_percentage >= 70 ? '#16803C' : analysis.readiness_percentage >= 40 ? '#B7791F' : '#C53030'
              }}>
                {analysis.readiness_percentage}%
              </div>
              <span className="text-muted" style={{ fontSize: '12px' }}>Role Competency Match</span>
            </div>
          </div>

          {/* 3 Columns: Matched, Weak, Missing */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Matching */}
            <div className="card" style={{ borderTop: '3px solid #16803C' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <CheckCircle2 size={18} color="#16803C" />
                <h4 style={{ fontSize: '15px', color: '#1E2A44' }}>Matching Competencies ({analysis.matching_skills.length})</h4>
              </div>
              {analysis.matching_skills.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '13px' }}>No satisfied skills recorded for this role yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analysis.matching_skills.map((s) => (
                    <div key={s.skill_name} style={{ padding: '8px 10px', backgroundColor: '#F0FDF4', borderRadius: '4px', fontSize: '12.5px' }}>
                      <strong>{s.skill_name}</strong> - Current: <span style={{ textTransform: 'capitalize' }}>{s.current_level}</span>
                      {s.verified && <span className="badge badge-success" style={{ marginLeft: '6px', fontSize: '10px' }}>Verified</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weak / Developing */}
            <div className="card" style={{ borderTop: '3px solid #B7791F' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <AlertTriangle size={18} color="#B7791F" />
                <h4 style={{ fontSize: '15px', color: '#1E2A44' }}>Developing Skills ({analysis.weak_skills.length})</h4>
              </div>
              {analysis.weak_skills.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '13px' }}>No proficiency gaps detected on possessed skills.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analysis.weak_skills.map((s) => (
                    <div key={s.skill_name} style={{ padding: '8px 10px', backgroundColor: '#FEFCE8', borderRadius: '4px', fontSize: '12.5px' }}>
                      <strong>{s.skill_name}</strong>
                      <div style={{ color: '#854D0E', fontSize: '11.5px', marginTop: '2px' }}>{s.gap}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missing */}
            <div className="card" style={{ borderTop: '3px solid #C53030' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <XCircle size={18} color="#C53030" />
                <h4 style={{ fontSize: '15px', color: '#1E2A44' }}>Missing Skills ({analysis.missing_skills.length})</h4>
              </div>
              {analysis.missing_skills.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '13px' }}>No required competencies missing.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analysis.missing_skills.map((s) => (
                    <div key={s.skill_name} style={{ padding: '8px 10px', backgroundColor: '#FEF2F2', borderRadius: '4px', fontSize: '12.5px' }}>
                      <strong>{s.skill_name}</strong> (Target: <span style={{ textTransform: 'capitalize' }}>{s.required_level}</span>)
                      {s.is_mandatory && <span className="badge badge-danger" style={{ marginLeft: '6px', fontSize: '10px' }}>Mandatory</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Skill Graph / Competency Map (Section 35 & 36 of Specification) */}
          <div className="card" style={{ marginBottom: '24px', backgroundColor: '#FFFFFF' }}>

            <div className="card-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={18} color="#3B5BDB" /> Interactive Competency Graph: {analysis.career_role}
                </h3>
                <p className="text-muted" style={{ fontSize: '12px', margin: '4px 0 0' }}>
                  Visualized hierarchical skill ontology mapping required competencies against your verified telemetry
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '11.5px' }}>
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={11} /> Mastered ({analysis.matching_skills.length})
                </span>
                <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={11} /> Developing ({analysis.weak_skills.length})
                </span>
                <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <XCircle size={11} /> Gap ({analysis.missing_skills.length})
                </span>
              </div>
            </div>

            {/* Visual Node Tree */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '20px', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
              {/* Root Node */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{
                  padding: '12px 24px',
                  backgroundColor: '#1E2A44',
                  color: '#FFFFFF',
                  borderRadius: '24px',
                  fontWeight: 700,
                  fontSize: '14px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Compass size={16} color="#60A5FA" /> {analysis.career_role} Benchmark
                </div>
              </div>

              {/* Connecting Branch Line */}
              <div style={{ width: '2px', height: '16px', backgroundColor: '#CBD5E1', margin: '0 auto 16px' }} />

              {/* Competency Clusters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Domain 1: Mastered Skills */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #BBF7D0', padding: '14px' }}>
                  <div style={{ fontWeight: 600, color: '#166534', fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} color="#166534" /> Verified Competencies
                  </div>
                  {analysis.matching_skills.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>None verified yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {analysis.matching_skills.map((s, idx) => (
                        <div key={idx} style={{
                          padding: '6px 10px',
                          backgroundColor: '#DCFCE7',
                          color: '#14532D',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: '1px solid #86EFAC'
                        }}>
                          {s.skill_name} • <span style={{ textTransform: 'capitalize', fontSize: '11px' }}>{s.current_level}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Domain 2: Developing Skills */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #FEF08A', padding: '14px' }}>
                  <div style={{ fontWeight: 600, color: '#854D0E', fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={15} color="#854D0E" /> Developing / Proficiency Gaps
                  </div>
                  {analysis.weak_skills.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>No partial gaps detected</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {analysis.weak_skills.map((s, idx) => (
                        <div key={idx} style={{
                          padding: '6px 10px',
                          backgroundColor: '#FEF9C3',
                          color: '#713F12',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: '1px solid #FDE047'
                        }}>
                          {s.skill_name} • <span style={{ fontSize: '11px' }}>{s.gap}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Domain 3: Missing Required Skills */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #FECACA', padding: '14px' }}>
                  <div style={{ fontWeight: 600, color: '#991B1B', fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={15} color="#991B1B" /> Critical Missing Gaps
                  </div>
                  {analysis.missing_skills.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>No missing skills!</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {analysis.missing_skills.map((s, idx) => (
                        <div key={idx} style={{
                          padding: '6px 10px',
                          backgroundColor: '#FEE2E2',
                          color: '#7F1D1D',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: '1px solid #FCA5A5'
                        }}>
                          {s.skill_name} (Target: {s.required_level})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* Recommended Learning Programs */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recommended Learning Programs to Bridge Gaps</h3>
              <span className="badge badge-info">{analysis.recommended_programs.length} Recommendations</span>
            </div>

            {analysis.recommended_programs.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '13px' }}>No specific programs linked to these skill gaps yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {analysis.recommended_programs.map((p) => (
                  <div key={p.id} style={{ border: '1px solid #E2E5EA', borderRadius: '4px', padding: '14px', backgroundColor: '#F8FAFC' }}>
                    <span className="badge badge-neutral" style={{ marginBottom: '6px' }}>{p.type.toUpperCase()}</span>
                    <h4 style={{ fontSize: '14.5px', marginBottom: '4px', color: '#1E2A44' }}>{p.title}</h4>
                    <p className="text-muted" style={{ fontSize: '12px', marginBottom: '8px' }}>Provider: {p.provider} • Duration: {p.duration || 'Flexible'}</p>
                    <div style={{ fontSize: '12px', color: '#3B5BDB', marginBottom: '10px' }}>Skills: {p.skills_covered}</div>
                    <a href={p.external_link || '#'} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                      View Program <ArrowRight size={12} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Compass size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <p className="text-muted">No career roles available in the ontology yet.</p>
        </div>
      )}

      {/* Floating AI Counselor */}
      <AICareerCounselor />
    </PortalLayout>
  );
}
