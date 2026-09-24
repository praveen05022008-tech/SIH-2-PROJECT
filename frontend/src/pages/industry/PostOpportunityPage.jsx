import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Plus, Trash2, ChevronDown } from 'lucide-react';

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
    min_experience_years: 2,
    academic_qualification: 'Ph.D / Post-Graduate',
    target_departments: '',
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

  const isFacultyOffering = ['faculty_internship', 'industrial_training'].includes(formData.type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    const payload = {
      ...formData,
      eligibility_cgpa: isFacultyOffering ? 0 : (parseFloat(formData.eligibility_cgpa) || 0),
      eligibility_year: isFacultyOffering ? null : (parseInt(formData.eligibility_year) || null),
      min_experience_years: isFacultyOffering ? (parseInt(formData.min_experience_years) || 0) : null,
      target_departments: isFacultyOffering ? formData.target_departments : null,
      academic_qualification: isFacultyOffering ? formData.academic_qualification : null,
      openings_count: parseInt(formData.openings_count) || 1,
      skills: selectedSkills.map((s) => ({
        skill_id: s.skill_id,
        minimum_level: s.minimum_level,
        is_mandatory: s.is_mandatory,
      })),
    };

    try {
      await api.post('/opportunities', payload);
      setMsg({ type: 'success', text: isFacultyOffering ? 'Faculty Sabbatical / Training published successfully!' : 'Opportunity published successfully!' });
      setTimeout(() => navigate('/industry/opportunities'), 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to post opportunity.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    height: '46px',
    padding: '0 14px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    fontSize: '14px',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s'
  };

  const textareaStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    fontSize: '14px',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'border-color 0.15s, box-shadow 0.15s'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13.5px',
    fontWeight: 600,
    color: '#0F172A',
    marginBottom: '8px'
  };

  return (
    <PortalLayout title="Post New Opportunity" allowedRoles={['industry']}>
      {/* Subtitle Under Page Title */}
      <div style={{ marginTop: '-12px', marginBottom: '22px', fontSize: '13px', color: '#64748B' }}>
        Create a new job or internship opening to attract suitable candidates
      </div>

      {/* ─── Top Banner Header Card with Soft Blue Gradient ─── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #E6F0FE 0%, #DCEAFC 40%, #D4E5FB 100%)',
          borderRadius: '16px',
          border: '1px solid #BFDBFE',
          borderLeft: '4px solid #2563EB',
          padding: 'clamp(20px, 3.5vw, 26px) clamp(24px, 4vw, 36px)',
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.3px',
              margin: '0 0 6px 0'
            }}
          >
            Opportunity Details & Competency Requirements
          </h2>
          <p
            style={{
              fontSize: '13.5px',
              color: '#475569',
              margin: 0
            }}
          >
            Provide complete details to publish your job or internship opportunity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/industry/opportunities')}
          style={{
            backgroundColor: '#FFFFFF',
            color: '#2563EB',
            border: '1px solid #BFDBFE',
            padding: '9px 18px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          View All Postings
        </button>
      </div>

      {/* ─── Form Container Card ─── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: 'clamp(24px, 4vw, 36px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
        }}
      >
        {msg.text && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '13.5px',
              fontWeight: 500,
              backgroundColor: msg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: msg.type === 'success' ? '#065F46' : '#991B1B',
              border: `1px solid ${msg.type === 'success' ? '#A7F3D0' : '#FCA5A5'}`
            }}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Position Title & Opportunity Type */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '20px',
              marginBottom: '22px'
            }}
          >
            <div style={{ flex: 1.5 }}>
              <label style={labelStyle}>Position Title *</label>
              <input
                type="text"
                placeholder="e.g. Clinical Data Science Intern"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Opportunity Type *</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    ...inputStyle,
                    appearance: 'none',
                    paddingRight: '36px',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="internship">Internship</option>
                  <option value="job">Full-time Job</option>
                  <option value="apprenticeship">Apprenticeship</option>
                  <option value="live_project">Project / Research</option>
                  <option value="faculty_internship">Faculty Internship / Sabbatical</option>
                  <option value="industrial_training">Industrial Training</option>
                </select>
                <ChevronDown
                  size={17}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '15px',
                    color: '#64748B',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Role Description */}
          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>Role Description *</label>
            <textarea
              rows={4}
              placeholder="Provide a comprehensive summary of this opening..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              style={textareaStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563EB';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Row 3: Core Responsibilities */}
          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>Core Responsibilities</label>
            <textarea
              rows={3}
              placeholder="Outline daily duties and milestone expectations..."
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              style={textareaStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563EB';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Row 4: Location, Work Mode, Openings */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '20px',
              marginBottom: '22px'
            }}
          >
            <div>
              <label style={labelStyle}>Location *</label>
              <input
                type="text"
                placeholder="e.g. New Delhi / Hybrid"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>Work Mode</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={formData.work_mode}
                  onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                  style={{
                    ...inputStyle,
                    appearance: 'none',
                    paddingRight: '36px',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="remote">Remote</option>
                  <option value="on-site">On-Site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <ChevronDown
                  size={17}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '15px',
                    color: '#64748B',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Number of Openings</label>
              <input
                type="number"
                min="1"
                value={formData.openings_count}
                onChange={(e) => setFormData({ ...formData, openings_count: e.target.value })}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Row 5: Duration, Stipend, and Criteria */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '20px',
              marginBottom: '26px'
            }}
          >
            <div>
              <label style={labelStyle}>{isFacultyOffering ? 'Sabbatical / Residency Duration' : 'Duration'}</label>
              <input
                type="text"
                placeholder={isFacultyOffering ? 'e.g. 8 Weeks (Summer) / 6 Months' : '3 Months'}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>{isFacultyOffering ? 'Faculty Stipend / Sabbatical Honorarium' : 'Stipend / Salary Offer'}</label>
              <input
                type="text"
                placeholder={isFacultyOffering ? 'e.g. Rs. 50,000 / month + Lab Allowance' : 'Rs. 20,000 / month'}
                value={formData.stipend_salary}
                onChange={(e) => setFormData({ ...formData, stipend_salary: e.target.value })}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {isFacultyOffering ? (
              <div>
                <label style={labelStyle}>Min Academic Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 2"
                  value={formData.min_experience_years}
                  onChange={(e) => setFormData({ ...formData, min_experience_years: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            ) : (
              <div>
                <label style={labelStyle}>Min Eligibility CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.eligibility_cgpa}
                  onChange={(e) => setFormData({ ...formData, eligibility_cgpa: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Optional Faculty Academic Criteria Row */}
          {isFacultyOffering && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: '20px',
                marginBottom: '26px',
                padding: '16px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
              }}
            >
              <div>
                <label style={labelStyle}>Academic Qualification Desired</label>
                <select
                  value={formData.academic_qualification}
                  onChange={(e) => setFormData({ ...formData, academic_qualification: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="Ph.D / Doctorate">Ph.D / Doctorate Degree</option>
                  <option value="Post-Doctoral Fellow">Post-Doctoral Fellow</option>
                  <option value="M.Tech / M.E / M.S">M.Tech / M.E / M.S (Post-Graduate)</option>
                  <option value="Any Academic Qualification">Any Post-Graduate / Faculty</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Target Academic Departments</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Information Technology, AI/Data Science"
                  value={formData.target_departments}
                  onChange={(e) => setFormData({ ...formData, target_departments: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Row 6: Tag Required Skills */}
          <div style={{ marginBottom: '26px' }}>
            <label style={labelStyle}>Tag Required Technical / Domain Skills</label>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: '12px'
              }}
            >
              <div style={{ flex: '2 1 240px', position: 'relative' }}>
                <select
                  value={currSkillId}
                  onChange={(e) => setCurrSkillId(e.target.value)}
                  style={{
                    ...inputStyle,
                    appearance: 'none',
                    paddingRight: '36px',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">-- Choose Skill from Catalog --</option>
                  {skillsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={17}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '15px',
                    color: '#64748B',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              <div style={{ flex: '1 1 150px', position: 'relative' }}>
                <select
                  value={currLevel}
                  onChange={(e) => setCurrLevel(e.target.value)}
                  style={{
                    ...inputStyle,
                    appearance: 'none',
                    paddingRight: '36px',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <ChevronDown
                  size={17}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '15px',
                    color: '#64748B',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleAddSkill}
                style={{
                  height: '46px',
                  padding: '0 20px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#2563EB',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.15s, border-color 0.15s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#DBEAFE';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
              >
                <Plus size={16} /> Add Skill
              </button>
            </div>

            {selectedSkills.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {selectedSkills.map((sk) => (
                  <span
                    key={sk.skill_id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#EEF2FF',
                      border: '1px solid #C7D2FE',
                      color: '#3730A3',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    <span>{sk.skill_name}</span>
                    <span style={{ fontSize: '11px', color: '#6366F1', fontWeight: 500 }}>
                      ({sk.minimum_level})
                    </span>
                    <Trash2
                      size={14}
                      style={{ cursor: 'pointer', color: '#EF4444', marginLeft: '2px' }}
                      onClick={() => handleRemoveSkill(sk.skill_id)}
                      title="Remove skill"
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                padding: '13px 28px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.28)',
                transition: 'background-color 0.15s'
              }}
              onMouseOver={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = '#1D4ED8';
              }}
              onMouseOut={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = '#2563EB';
              }}
            >
              {submitting ? 'Publishing Opportunity...' : 'Publish Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}
