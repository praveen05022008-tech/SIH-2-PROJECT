import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Award, Plus, CheckCircle, ShieldCheck } from 'lucide-react';

export function StudentSkillsPage() {
  const [studentSkills, setStudentSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mySkills, allSkills] = await Promise.all([
        api.get('/skills/my-skills'),
        api.get('/skills'),
      ]);
      setStudentSkills(mySkills);
      setAvailableSkills(allSkills);
    } catch {}
    setLoading(false);
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    setSaving(true);
    setMsg('');

    try {
      await api.post('/skills/my-skills', {
        skill_id: parseInt(selectedSkillId),
        skill_level: skillLevel,
      });
      setMsg('Skill added to your profile.');
      setSelectedSkillId('');
      fetchData();
    } catch (err) {
      setMsg(err.message || 'Failed to add skill.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalLayout title="My Skills & Competencies" allowedRoles={['student']}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Skills Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Registered Competencies</h3>
            <span className="badge badge-info">{studentSkills.length} Skills</span>
          </div>

          {loading ? (
            <p className="text-muted">Loading registered skills...</p>
          ) : studentSkills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Award size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
              <p className="text-muted">No skills registered on your profile yet. Add your competencies using the form on the right.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Skill Name</th>
                    <th>Proficiency Level</th>
                    <th>Verification Status</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {studentSkills.map((sk) => (
                    <tr key={sk.id}>
                      <td style={{ fontWeight: 600 }}>{sk.skill?.name || `Skill #${sk.skill_id}`}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                          {sk.skill_level}
                        </span>
                      </td>
                      <td>
                        {sk.verified_by_assessment ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', gap: '4px' }}>
                            <ShieldCheck size={13} /> Assessment Verified
                          </span>
                        ) : (
                          <span className="badge badge-warning">Self-Declared</span>
                        )}
                      </td>
                      <td>{sk.score ? `${sk.score}%` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Skill Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Add / Update Skill</h3>
          </div>

          {msg && (
            <div style={{
              backgroundColor: '#DEF7EC',
              border: '1px solid #86EFAC',
              borderRadius: '4px',
              padding: '8px 12px',
              color: '#166534',
              fontSize: '12.5px',
              marginBottom: '14px'
            }}>
              {msg}
            </div>
          )}

          <form onSubmit={handleAddSkill}>
            <div className="form-group">
              <label className="form-label">Select Skill from Catalog *</label>
              <select
                className="form-control"
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                required
              >
                <option value="">-- Choose Skill --</option>
                {availableSkills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category?.name || 'General'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Self-Assessed Proficiency *</label>
              <select
                className="form-control"
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
              <Plus size={14} /> {saving ? 'Adding...' : 'Add to Skill Profile'}
            </button>
          </form>

          <p className="text-muted" style={{ fontSize: '11.5px', marginTop: '16px', lineHeight: '1.5' }}>
            Note: Self-declared skills will be marked with a warning until verified by taking the corresponding standardized assessment.
          </p>
        </div>
      </div>
    </PortalLayout>
  );
}
