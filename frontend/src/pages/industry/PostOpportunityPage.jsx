import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Plus, Trash2, Send } from 'lucide-react';

export function PostOpportunityPage() {
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    type: 'internship',
    description: '',
    responsibilities: '',
    required_qualifications: '',
    eligibility_cgpa: 6.5,
    eligibility_year: 3,
    location: '',
    work_mode: 'remote',
    duration: '3 Months',
    stipend_salary: 'Rs. 20,000 / month',
    openings_count: 2,
  });

  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currSkillId, setCurrSkillId] = useState('');
  const [currLevel, setCurrLevel] = useState('intermediate');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/skills')
      .then((data) => setSkillsList(data))
      .catch(() => {});
  }, []);

  const handleAddSkill = () => {
    if (!currSkillId) return;
    const skillObj = skillsList.find((s) => s.id === parseInt(currSkillId));
    if (!skillObj) return;

    if (selectedSkills.some((s) => s.skill_id === skillObj.id)) return;

    setSelectedSkills([
      ...selectedSkills,
      {
        skill_id: skillObj.id,
        skill_name: skillObj.name,
        minimum_level: currLevel,
        is_mandatory: true,
      },
    ]);
    setCurrSkillId('');
  };

  const handleRemoveSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter((s) => s.skill_id !== skillId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    const payload = {
      ...formData,
      eligibility_cgpa: parseFloat(formData.eligibility_cgpa) || 0,
      eligibility_year: parseInt(formData.eligibility_year) || null,
      openings_count: parseInt(formData.openings_count) || 1,
      skills: selectedSkills.map((s) => ({
        skill_id: s.skill_id,
        minimum_level: s.minimum_level,
        is_mandatory: s.is_mandatory,
      })),
    };

    try {
      await api.post('/opportunities', payload);
      setMsg({ type: 'success', text: 'Opportunity published successfully!' });
      setTimeout(() => navigate('/industry/my-opportunities'), 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to post opportunity.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout title="Post New Opportunity" allowedRoles={['industry']}>
      <div className="card" style={{ maxWidth: '840px' }}>
        <div className="card-header">
          <h3 className="card-title">Opportunity Details & Competency Requirements</h3>
        </div>

        {msg.text && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '13px',
            backgroundColor: msg.type === 'success' ? '#DEF7EC' : '#FEE2E2',
            color: msg.type === 'success' ? '#166534' : '#991B1B',
            border: `1px solid ${msg.type === 'success' ? '#86EFAC' : '#FCA5A5'}`
          }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Position Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Clinical Data Science Intern"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Opportunity Type *</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="internship">Internship</option>
                <option value="job">Entry-level Job</option>
                <option value="apprenticeship">Apprenticeship</option>
                <option value="live_project">Live Project</option>
                <option value="faculty_internship">Faculty Internship / Sabbatical</option>
                <option value="industrial_training">Industrial Training</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role Description *</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Provide a comprehensive summary of this opening..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Core Responsibilities</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Outline daily duties and milestone expectations..."
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. New Delhi / Hybrid"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work Mode</label>
              <select
                className="form-control"
                value={formData.work_mode}
                onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
              >
                <option value="remote">Remote</option>
                <option value="on-site">On-Site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Number of Openings</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.openings_count}
                onChange={(e) => setFormData({ ...formData, openings_count: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input
                type="text"
                className="form-control"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stipend / Salary Offer</label>
              <input
                type="text"
                className="form-control"
                value={formData.stipend_salary}
                onChange={(e) => setFormData({ ...formData, stipend_salary: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Eligibility CGPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                className="form-control"
                value={formData.eligibility_cgpa}
                onChange={(e) => setFormData({ ...formData, eligibility_cgpa: e.target.value })}
              />
            </div>
          </div>

          {/* Tag Required Skills */}
          <div style={{ marginTop: '16px', borderTop: '1px solid #E2E5EA', paddingTop: '16px' }}>
            <label className="form-label">Tag Required Technical / Domain Skills</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <select
                className="form-control"
                value={currSkillId}
                onChange={(e) => setCurrSkillId(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">-- Choose Skill from Catalog --</option>
                {skillsList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                className="form-control"
                value={currLevel}
                onChange={(e) => setCurrLevel(e.target.value)}
                style={{ width: '160px' }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>

              <button type="button" onClick={handleAddSkill} className="btn btn-outline btn-sm">
                <Plus size={14} /> Add Skill
              </button>
            </div>

            {selectedSkills.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {selectedSkills.map((sk) => (
                  <span key={sk.skill_id} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    backgroundColor: '#EEF2FF',
                    border: '1px solid #C7D2FE',
                    color: '#3730A3',
                    borderRadius: '4px',
                    fontSize: '12.5px'
                  }}>
                    <strong>{sk.skill_name}</strong> ({sk.minimum_level})
                    <Trash2 size={13} style={{ cursor: 'pointer', color: '#EF4444' }} onClick={() => handleRemoveSkill(sk.skill_id)} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Send size={14} /> {submitting ? 'Publishing Opportunity...' : 'Publish Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}
