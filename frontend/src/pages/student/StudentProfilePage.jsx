import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';
import { getDocumentViewUrl } from '../../utils/fileUrl';
import {
  CheckCircle,
  AlertCircle,
  Upload,
  Sparkles,
  Loader2,
  FileText,
  User,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  ExternalLink,
  Code,
  Globe
} from 'lucide-react';
import { ENGINEERING_DEPARTMENTS } from '../../constants/departments';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function StudentProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

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

  const [portfolio, setPortfolio] = useState({
    bio: '',
    github_url: '',
    linkedin_url: '',
    website_url: '',
    projects: [],
    certifications: []
  });

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  // AI Resume Parser
  const [showAiResumeModal, setShowAiResumeModal] = useState(false);
  const [resumeTextInput, setResumeTextInput] = useState('');
  const [parsingResume, setParsingResume] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  // Project modal
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projUrl, setProjUrl] = useState('');
  const [projRepo, setProjRepo] = useState('');

  // Certification modal
  const [showCertModal, setShowCertModal] = useState(false);
  const [certTitle, setCertTitle] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certCredId, setCertCredId] = useState('');

  // Document Upload State
  const [showDocModal, setShowDocModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('resume');
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [profileData, portfolioData, docsData] = await Promise.all([
        api.get('/profiles/student').catch(() => ({})),
        api.get('/portfolios/my-portfolio').catch(() => ({ bio: '', github_url: '', linkedin_url: '', website_url: '', projects: [], certifications: [] })),
        api.get('/documents').catch(() => [])
      ]);

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          course: profileData.course || '',
          year_of_study: profileData.year_of_study || 1,
          cgpa: profileData.cgpa || 0.0,
          graduation_year: profileData.graduation_year || 2026,
          career_interests: profileData.career_interests || '',
          preferred_roles: profileData.preferred_roles || '',
          preferred_locations: profileData.preferred_locations || '',
          resume_url: profileData.resume_url || '',
        });
      }

      if (portfolioData) {
        setPortfolio(portfolioData);
      }

      if (docsData) {
        setDocuments(docsData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMsg({ type: '', text: '' });

    try {
      await api.put('/profiles/student', profile);
      setMsg({ type: 'success', text: 'Student profile updated successfully.' });
      toast.success('Profile details saved.');
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
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
      toast.success('Resume uploaded to Cloudinary.');
      fetchAllData();
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to upload resume.' });
      toast.error('Failed to upload resume.');
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

  const handleUpdateBio = async (e) => {
    e.preventDefault();
    setSavingBio(true);
    try {
      await api.put('/portfolios/my-portfolio', {
        bio: portfolio.bio,
        github_url: portfolio.github_url,
        linkedin_url: portfolio.linkedin_url,
        website_url: portfolio.website_url,
      });
      toast.success('Portfolio bio and social links updated successfully.');
    } catch (err) {
      toast.error('Failed to update: ' + err.message);
    } finally {
      setSavingBio(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/portfolios/projects', {
        title: projTitle,
        technologies: projTech,
        description: projDesc,
        project_url: projUrl,
        repo_url: projRepo,
      });
      setShowProjectModal(false);
      setProjTitle('');
      setProjTech('');
      setProjDesc('');
      setProjUrl('');
      setProjRepo('');
      const data = await api.get('/portfolios/my-portfolio');
      setPortfolio(data);
      toast.success('Project added to portfolio.');
    } catch (err) {
      toast.error('Error creating project: ' + err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/portfolios/projects/${id}`);
      const data = await api.get('/portfolios/my-portfolio');
      setPortfolio(data);
      toast.success('Project removed.');
    } catch (err) {
      toast.error('Error deleting: ' + err.message);
    }
  };

  const handleCreateCertification = async (e) => {
    e.preventDefault();
    try {
      await api.post('/portfolios/certifications', {
        title: certTitle,
        issuing_organization: certOrg,
        credential_id: certCredId,
      });
      setShowCertModal(false);
      setCertTitle('');
      setCertOrg('');
      setCertCredId('');
      const data = await api.get('/portfolios/my-portfolio');
      setPortfolio(data);
      toast.success('Certification registered.');
    } catch (err) {
      toast.error('Error adding certification: ' + err.message);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docFile) {
      toast.warning('Please select a file to upload.');
      return;
    }
    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('title', docTitle);
    formData.append('document_type', docType);
    formData.append('file', docFile);

    try {
      await api.post('/documents/upload', formData);
      setShowDocModal(false);
      setDocTitle('');
      setDocFile(null);
      const docs = await api.get('/documents');
      setDocuments(docs);
      toast.success('Document securely uploaded to Cloudinary.');
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout title="My Profile & Digital Portfolio" allowedRoles={['student']}>
        <LoadingSpinner message="Loading Profile & Portfolio credentials from TiDB..." />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="My Profile & Digital Portfolio" allowedRoles={['student']}>
      {/* Navigation Tabs for Unified Profile + Digi Portfolio */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '2px solid #E2E5EA',
        paddingBottom: '2px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => handleTabChange('profile')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'profile' ? '3px solid #3B5BDB' : '3px solid transparent',
            backgroundColor: activeTab === 'profile' ? '#EEF2FF' : 'transparent',
            color: activeTab === 'profile' ? '#1E2A44' : '#6B7280',
            fontWeight: activeTab === 'profile' ? 600 : 500,
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.15s ease'
          }}
        >
          <User size={16} color={activeTab === 'profile' ? '#3B5BDB' : '#6B7280'} />
          Personal & Academic Info
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('portfolio')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'portfolio' ? '3px solid #3B5BDB' : '3px solid transparent',
            backgroundColor: activeTab === 'portfolio' ? '#EEF2FF' : 'transparent',
            color: activeTab === 'portfolio' ? '#1E2A44' : '#6B7280',
            fontWeight: activeTab === 'portfolio' ? 600 : 500,
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.15s ease'
          }}
        >
          <FolderGit2 size={16} color={activeTab === 'portfolio' ? '#3B5BDB' : '#6B7280'} />
          Digital Portfolio & Projects
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('credentials')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'credentials' ? '3px solid #3B5BDB' : '3px solid transparent',
            backgroundColor: activeTab === 'credentials' ? '#EEF2FF' : 'transparent',
            color: activeTab === 'credentials' ? '#1E2A44' : '#6B7280',
            fontWeight: activeTab === 'credentials' ? 600 : 500,
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.15s ease'
          }}
        >
          <Award size={16} color={activeTab === 'credentials' ? '#3B5BDB' : '#6B7280'} />
          Certifications & Documents
        </button>
      </div>

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

      {/* TAB 1: ACADEMIC & PERSONAL PROFILE */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '880px' }}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 className="card-title">Academic & Personal Details</h3>
                <p className="text-muted" style={{ fontSize: '12px' }}>Maintain your institutional and personal records</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAiResumeModal(true)}
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#3B5BDB', color: '#3B5BDB' }}
              >
                <Sparkles size={14} /> Groq AI Resume Skill Extractor
              </button>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Preferred Job Roles</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Data Analyst, Software Engineer, Cloud Architect"
                    value={profile.preferred_roles}
                    onChange={(e) => setProfile({ ...profile, preferred_roles: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Work Locations</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bengaluru, Hyderabad, Chennai, Remote"
                    value={profile.preferred_locations}
                    onChange={(e) => setProfile({ ...profile, preferred_locations: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Cloudinary Resume Upload Box */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Curriculum Vitae / Resume (Cloudinary)</h3>
                <p className="text-muted" style={{ fontSize: '12px' }}>Your primary resume document for employer applications</p>
              </div>
            </div>
            {profile.resume_url ? (
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge badge-success">Cloudinary Secured</span>
                <a href={getDocumentViewUrl(profile.resume_url)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ExternalLink size={12} /> View Current Resume Document
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
      )}

      {/* TAB 2: DIGITAL PORTFOLIO & PROJECTS */}
      {activeTab === 'portfolio' && (
        <div>
          {/* Professional Bio & Social Links */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Professional Bio & Social Links</h3>
                <p className="text-muted" style={{ fontSize: '12px' }}>Highlight your profile and public portfolio profiles</p>
              </div>
            </div>
            <form onSubmit={handleUpdateBio}>
              <div className="form-group">
                <label className="form-label">Professional Summary</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Highlight your academic focus, technical strengths, and career aspirations..."
                  value={portfolio.bio || ''}
                  onChange={(e) => setPortfolio({ ...portfolio, bio: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code size={14} /> GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://github.com/username"
                    value={portfolio.github_url || ''}
                    onChange={(e) => setPortfolio({ ...portfolio, github_url: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={14} /> LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://linkedin.com/in/username"
                    value={portfolio.linkedin_url || ''}
                    onChange={(e) => setPortfolio({ ...portfolio, linkedin_url: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={14} /> Personal Website / Portfolio
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://mywebsite.com"
                    value={portfolio.website_url || ''}
                    onChange={(e) => setPortfolio({ ...portfolio, website_url: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm" disabled={savingBio}>
                {savingBio ? 'Saving...' : 'Save Portfolio Links'}
              </button>
            </form>
          </div>

          {/* Projects Section */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Academic & Industry Projects</h3>
                <p className="text-muted" style={{ fontSize: '12px' }}>Demonstrated hands-on engineering, hackathons, and research work</p>
              </div>
              <button onClick={() => setShowProjectModal(true)} className="btn btn-secondary btn-sm">
                <Plus size={13} /> Add Project
              </button>
            </div>

            {portfolio.projects?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <FolderGit2 size={32} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
                <p className="text-muted" style={{ fontSize: '13px' }}>No projects registered yet. Showcase your work by clicking 'Add Project'.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {portfolio.projects?.map((proj) => (
                  <div key={proj.id} style={{ border: '1px solid #E2E5EA', borderRadius: '6px', padding: '16px', backgroundColor: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '15px', color: '#1E2A44', marginBottom: '4px' }}>{proj.title}</h4>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444' }}
                        title="Delete project"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#3B5BDB', fontWeight: 600, marginBottom: '8px' }}>
                      {proj.technologies}
                    </div>
                    <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '12px', lineHeight: '1.5' }}>
                      {proj.description}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12.5px' }}>
                      {proj.project_url && (
                        <a href={proj.project_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ExternalLink size={12} /> Live Demo
                        </a>
                      )}
                      {proj.repo_url && (
                        <a href={proj.repo_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Code size={12} /> Repository
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CERTIFICATIONS & DOCUMENTS */}
      {activeTab === 'credentials' && (
        <div>
          {/* Cloudinary Verified Documents */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Cloudinary Stored Credentials & Resumes</h3>
                <p className="text-muted" style={{ fontSize: '12px' }}>Secure cloud storage for resumes, transcripts, and verified certificates</p>
              </div>
              <button onClick={() => setShowDocModal(true)} className="btn btn-secondary btn-sm">
                <Upload size={13} /> Upload Document
              </button>
            </div>

            {documents.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '13px' }}>No documents uploaded yet. Upload your resume or certificate to Cloudinary.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {documents.map((doc) => (
                  <div key={doc.id} style={{ border: '1px solid #E2E5EA', borderRadius: '6px', padding: '16px', backgroundColor: '#F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} color="#3B5BDB" />
                        <h4 style={{ fontSize: '14.5px', color: '#1E2A44', margin: 0 }}>{doc.title}</h4>
                      </div>
                      <span className={`badge ${doc.verification_status === 'verified' ? 'badge-success' : 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>
                        {doc.verification_status}
                      </span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '12px', marginBottom: '10px' }}>
                      Type: <strong style={{ textTransform: 'capitalize' }}>{doc.document_type}</strong> • Size: {Math.round(doc.file_size / 1024)} KB
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </span>
                      <a href={getDocumentViewUrl(doc)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ExternalLink size={12} /> View File
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certifications Section */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Certifications & Credentials</h3>
                <p className="text-muted" style={{ fontSize: '12px' }}>Verified professional and domain credentials</p>
              </div>
              <button onClick={() => setShowCertModal(true)} className="btn btn-secondary btn-sm">
                <Plus size={13} /> Add Certification
              </button>
            </div>

            {portfolio.certifications?.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '13px' }}>No certifications added yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {portfolio.certifications?.map((c) => (
                  <div key={c.id} style={{ border: '1px solid #E2E5EA', borderRadius: '4px', padding: '14px', backgroundColor: '#F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Award size={18} color="#3B5BDB" />
                      <h4 style={{ fontSize: '14.5px', color: '#1E2A44' }}>{c.title}</h4>
                    </div>
                    <p className="text-muted" style={{ fontSize: '12.5px' }}>Issuing Org: {c.issuing_organization}</p>
                    {c.credential_id && <div style={{ fontSize: '12px', color: '#64748B' }}>ID: {c.credential_id}</div>}
                    <div style={{ marginTop: '8px' }}>
                      <span className={`badge ${c.verification_status === 'verified' ? 'badge-success' : 'badge-neutral'}`}>
                        {c.verification_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: AI Resume Skill Extractor */}
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

      {/* MODAL: Upload Document */}
      {showDocModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Upload Document to Cloudinary</h3>
              <button onClick={() => setShowDocModal(false)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <form onSubmit={handleUploadDocument}>
              <div className="form-group">
                <label className="form-label">Document Title *</label>
                <input type="text" className="form-control" placeholder="e.g. Master Resume 2026, AWS Certificate" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Document Type *</label>
                <select className="form-control" value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value="resume">Resume / CV</option>
                  <option value="certificate">Certification</option>
                  <option value="transcript">Academic Transcript</option>
                  <option value="other">Other Academic Credential</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Select File (PDF, PNG, JPG, DOCX) *</label>
                <input type="file" className="form-control" onChange={(e) => setDocFile(e.target.files[0])} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowDocModal(false)} className="btn btn-outline btn-sm" disabled={uploadingDoc}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={uploadingDoc}>
                  {uploadingDoc ? 'Uploading to Cloudinary...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Project */}
      {showProjectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Add Academic / Industry Project</h3>
              <button onClick={() => setShowProjectModal(false)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input type="text" className="form-control" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Technologies Used *</label>
                <input type="text" className="form-control" placeholder="e.g. Python, SQL, FastAPI, React" value={projTech} onChange={(e) => setProjTech(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={projDesc} onChange={(e) => setProjDesc(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Demo / Deployment Link</label>
                <input type="url" className="form-control" placeholder="https://..." value={projUrl} onChange={(e) => setProjUrl(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Repository Link</label>
                <input type="url" className="form-control" placeholder="https://github.com/..." value={projRepo} onChange={(e) => setProjRepo(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowProjectModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Certification */}
      {showCertModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Add Certification</h3>
              <button onClick={() => setShowCertModal(false)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <form onSubmit={handleCreateCertification}>
              <div className="form-group">
                <label className="form-label">Certification Title *</label>
                <input type="text" className="form-control" value={certTitle} onChange={(e) => setCertTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Issuing Organization *</label>
                <input type="text" className="form-control" placeholder="e.g. AWS, Google Cloud, Microsoft, NPTEL" value={certOrg} onChange={(e) => setCertOrg(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Credential ID / Number</label>
                <input type="text" className="form-control" value={certCredId} onChange={(e) => setCertCredId(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowCertModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Certification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
