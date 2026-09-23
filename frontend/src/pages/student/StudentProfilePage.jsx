import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';
import { getDocumentViewUrl } from '../../utils/fileUrl';
import { CheckCircle, AlertCircle, Upload, Sparkles, Loader2, FileText, Check } from 'lucide-react';
import { ENGINEERING_DEPARTMENTS } from '../../constants/departments';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';


export function StudentProfilePage() {
  const toast = useToast();
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    address: '',
    course: '',
    year_of_study: 1,
    cgpa: 0.0,
    graduation_year: 2026,
    career_interests: '',
    preferred_roles: '',
    preferred_locations: '',
    resume_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  // AI Resume Parser
  const [showAiResumeModal, setShowAiResumeModal] = useState(false);
  const [resumeTextInput, setResumeTextInput] = useState('');
  const [parsingResume, setParsingResume] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    api.get('/profiles/student')
      .then((data) => {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          course: data.course || '',
          year_of_study: data.year_of_study || 1,
          cgpa: data.cgpa || 0.0,
          graduation_year: data.graduation_year || 2026,
          career_interests: data.career_interests || '',
          preferred_roles: data.preferred_roles || '',
          preferred_locations: data.preferred_locations || '',
          resume_url: data.resume_url || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      await api.put('/profiles/student', profile);
      setMsg({ type: 'success', text: 'Student profile updated successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('title', `${profile.full_name || 'Student'} Resume`);
    formData.append('document_type', 'resume');
    formData.append('file', resumeFile);

    try {
      const doc = await api.post('/documents/upload', formData);
      setProfile((prev) => ({ ...prev, resume_url: doc.file_path }));
      setMsg({ type: 'success', text: 'Resume uploaded to Cloudinary and linked to profile.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to upload resume.' });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleExtractResumeSkills = async (e) => {
    e.preventDefault();
    if (!resumeTextInput.trim()) {
      toast.warning('Please paste resume text to extract skills.');
      return;
    }
    setParsingResume(true);
    try {
      const res = await api.post('/ai/extract-resume', {
        resume_text: resumeTextInput
      });
      setParsedData(res);
      if (res.suggested_roles?.length > 0) {
        setProfile((prev) => ({
          ...prev,
          preferred_roles: res.suggested_roles.join(', ')
        }));
      }
      toast.success('Skills and career roles extracted successfully via Groq AI.');
    } catch (err) {
      toast.error('Failed to extract resume: ' + err.message);
    } finally {
      setParsingResume(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout title="My Profile" allowedRoles={['student']}>
        <LoadingSpinner message="Loading Profile credentials from TiDB..." />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="My Profile & Credentials" allowedRoles={['student']}>
      <div style={{ maxWidth: '840px' }}>
        {msg.text && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: msg.type === 'success' ? '#DEF7EC' : '#FEE2E2',
            border: `1px solid ${msg.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
            borderRadius: '4px',
            padding: '10px 14px',
            color: msg.type === 'success' ? '#166534' : '#991B1B',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <h3 className="card-title">Academic & Personal Details</h3>
            <button
              type="button"
              onClick={() => setShowAiResumeModal(true)}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#3B5BDB', color: '#3B5BDB' }}
            >
              <Sparkles size={14} /> Groq AI Resume Skill Extractor
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Degree / Course</label>
                <select
                  className="form-control"
                  value={profile.course}
                  onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                >
                  <option value="">-- Select Degree / Branch --</option>
                  {ENGINEERING_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Year of Study</label>
                <select
                  className="form-control"
                  value={profile.year_of_study}
                  onChange={(e) => setProfile({ ...profile, year_of_study: parseInt(e.target.value) })}
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current CGPA (Scale 10.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="form-control"
                  value={profile.cgpa}
                  onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Preferred Job Roles</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Data Analyst, Research Associate, Software Engineer"
                  value={profile.preferred_roles}
                  onChange={(e) => setProfile({ ...profile, preferred_roles: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Work Locations</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. New Delhi, Bengaluru, Remote"
                  value={profile.preferred_locations}
                  onChange={(e) => setProfile({ ...profile, preferred_locations: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Cloudinary Resume Upload Box */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Curriculum Vitae / Resume on Cloudinary</h3>
          </div>
          {profile.resume_url ? (
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="badge badge-success">Cloudinary Secured</span>
              <a href={getDocumentViewUrl(profile.resume_url)} target="_blank" rel="noreferrer" style={{ fontSize: '13px' }}>
                View Current Resume Document
              </a>
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: '13px', marginBottom: '14px' }}>
              Upload your PDF resume to Cloudinary to automatically attach it to internship and job applications.
            </p>
          )}

          <form onSubmit={handleResumeUpload} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="form-control"
              style={{ maxWidth: '360px' }}
            />
            <button type="submit" className="btn btn-secondary btn-sm" disabled={!resumeFile || uploadingResume}>
              <Upload size={14} />
              {uploadingResume ? 'Uploading to Cloudinary...' : 'Upload Resume'}
            </button>
          </form>
        </div>
      </div>

      {/* AI Resume Skill Extractor Modal */}
      {showAiResumeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#3B5BDB" />
                <h3 className="card-title">Groq AI Resume Skill Extractor</h3>
              </div>
              <button onClick={() => setShowAiResumeModal(false)} className="btn btn-outline btn-sm">Close</button>
            </div>

            <form onSubmit={handleExtractResumeSkills}>
              <div className="form-group">
                <label className="form-label">Paste Resume Text / Summary</label>
                <textarea
                  className="form-control"
                  rows={6}
                  placeholder="Paste your resume content, summary, projects, and work experience here..."
                  value={resumeTextInput}
                  onChange={(e) => setResumeTextInput(e.target.value)}
                  disabled={parsingResume}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
                <button type="button" onClick={() => setShowAiResumeModal(false)} className="btn btn-outline btn-sm" disabled={parsingResume}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={parsingResume || !resumeTextInput.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#3B5BDB' }}
                >
                  {parsingResume ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {parsingResume ? 'Extracting with Groq...' : 'Extract Skills & Roles'}
                </button>
              </div>
            </form>

            {parsedData && (
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '14px', fontSize: '13px' }}>
                <h4 style={{ fontSize: '14px', color: '#1E2A44', marginBottom: '8px' }}>AI Extracted Profile Insights:</h4>
                
                {parsedData.technical_skills?.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Technical Skills:</strong>{' '}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {parsedData.technical_skills.map((s, idx) => (
                        <span key={idx} className="badge badge-info">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {parsedData.suggested_roles?.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Suggested Career Roles:</strong>{' '}
                    <span style={{ color: '#3B5BDB', fontWeight: 600 }}>{parsedData.suggested_roles.join(', ')}</span>
                  </div>
                )}

                {parsedData.experience_summary && (
                  <div style={{ color: '#475569', fontSize: '12px', marginTop: '6px' }}>
                    <em>{parsedData.experience_summary}</em>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
