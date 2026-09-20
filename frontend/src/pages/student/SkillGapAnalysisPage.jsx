import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Compass, CheckCircle2, AlertTriangle, XCircle, BookOpen, ArrowRight } from 'lucide-react';

export function SkillGapAnalysisPage() {
  const [careerRoles, setCareerRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    api.get('/skills/career-roles')
      .then((roles) => {
        setCareerRoles(roles);
        if (roles.length > 0) {
          setSelectedRoleId(roles[0].id);
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
    runAnalysis(rId);
  };

  return (
    <PortalLayout title="Skill Gap Analysis" allowedRoles={['student']}>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 className="card-title">Select Targeted Career Pathway</h3>
            <p className="text-muted" style={{ fontSize: '13px' }}>
              Compare your validated skills against industry-defined competencies
            </p>
          </div>

          <div style={{ minWidth: '280px' }}>
            <select
              className="form-control"
              value={selectedRoleId}
              onChange={handleRoleChange}
              disabled={initialLoading}
            >
              {careerRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.sector || 'Industry'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Analyzing skill competencies from database records...</p>
      ) : analysis ? (
        <div>
          {/* Readiness Score Card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>
                Pathway Readiness
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
    </PortalLayout>
  );
}
