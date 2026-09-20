import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { CheckCircle, AlertCircle, Upload } from 'lucide-react';

export function StudentProfilePage() {
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
      setMsg({ type: 'success', text: 'Resume uploaded and linked to profile.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to upload resume.' });
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return <PortalLayout title="My Profile" allowedRoles={['student']}><p>Loading Profile...</p></PortalLayout>;
  }

  return (
    <PortalLayout title="My Profile" allowedRoles={['student']}>
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
          <div className="card-header">
            <h3 className="card-title">Academic & Personal Details</h3>
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
                <input
                  type="text"
                  className="form-control"
                  value={profile.course}
                  onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                />
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

        {/* Resume Upload Box */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Curriculum Vitae / Resume</h3>
          </div>
          {profile.resume_url ? (
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="badge badge-success">Resume Uploaded</span>
              <a href={profile.resume_url} target="_blank" rel="noreferrer" style={{ fontSize: '13px' }}>
                View Current Resume Document
              </a>
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: '13px', marginBottom: '14px' }}>
              Upload your PDF resume to automatically attach it to internship and job applications.
            </p>
          )}

          <form onSubmit={handleResumeUpload} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="form-control"
              style={{ maxWidth: '360px' }}
            />
            <button type="submit" className="btn btn-secondary btn-sm" disabled={!resumeFile || uploadingResume}>
              <Upload size={14} />
              {uploadingResume ? 'Uploading...' : 'Upload Resume'}
            </button>
          </form>
        </div>
      </div>
    </PortalLayout>
  );
}
