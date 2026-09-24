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
  UploadCloud,
  Sparkles,
  Loader2,
  FileText,
  FileCheck,
  User,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  ExternalLink,
  Code,
  Globe,
  Eye,
  X,
  Target,
  Search,
  ArrowRight
} from 'lucide-react';
import { ENGINEERING_DEPARTMENTS } from '../../constants/departments';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function StudentProfilePage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [previewDoc, setPreviewDoc] = useState(null); // { title: string, url: string }
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
    skills: '',
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

  // AI Resume Skill Extractor State (Direct PDF Upload)
  const [showAiResumeModal, setShowAiResumeModal] = useState(false);
  const [resumeExtractFile, setResumeExtractFile] = useState(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  // AI Resume Optimizer & Critique State (Direct PDF Upload)
  const [showCritiqueModal, setShowCritiqueModal] = useState(false);
  const [critiqueFile, setCritiqueFile] = useState(null);
  const [critiqueTargetRole, setCritiqueTargetRole] = useState('');
  const [critiquing, setCritiquing] = useState(false);
  const [critiqueResult, setCritiqueResult] = useState(null);

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
          skills: profileData.skills || '',
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
    if (!resumeExtractFile) {
      toast.warning('Please select or drop a Resume PDF file to extract skills.');
      return;
    }
    setParsingResume(true);
    try {
      const formData = new FormData();
      formData.append('file', resumeExtractFile);
      const res = await api.post('/ai/extract-resume-file', formData);
      setParsedData(res);
      const extractedSkills = [
        ...(res.technical_skills || []),
        ...(res.soft_skills || [])
      ];
      setProfile((prev) => ({
        ...prev,
        preferred_roles: res.suggested_roles?.length > 0 ? res.suggested_roles.join(', ') : prev.preferred_roles,
        skills: extractedSkills.length > 0 ? extractedSkills.join(', ') : prev.skills
      }));
      toast.success('Skills and career roles extracted successfully from PDF via AI.');
    } catch (err) {
      toast.error('Failed to extract resume: ' + err.message);
    } finally {
      setParsingResume(false);
    }
  };

  const handleCritiqueResume = async (e) => {
    e.preventDefault();
    if (!critiqueFile) {
      toast.warning('Please select or drop a Resume PDF file for critique.');
      return;
    }
    setCritiquing(true);
    try {
      const formData = new FormData();
      formData.append('file', critiqueFile);
      if (critiqueTargetRole || profile.preferred_roles) {
        formData.append('target_role', critiqueTargetRole || profile.preferred_roles || 'Software Engineer');
      }
      const data = await api.post('/ai/resume-critique-file', formData);
      setCritiqueResult(data);
      toast.success('AI Resume Critique generated successfully from PDF!');
    } catch (err) {
      toast.error('Failed to generate critique: ' + err.message);
    } finally {
      setCritiquing(false);
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
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none'
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Skills (Extracted & Technical)</label>
                    {profile.skills && profile.skills.trim() && (
                      <span className="badge badge-info" style={{ fontSize: '11px', padding: '2px 7px' }}>
                        {profile.skills.split(',').filter((s) => s.trim()).length} Mapped
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Python, React, FastAPI, SQL, Docker (auto-mapped from resume)"
                    value={profile.skills}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
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

              {profile.skills && profile.skills.trim() && (
                <div style={{ marginTop: '-4px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Mapped Skills:</span>
                    {profile.skills
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="badge badge-neutral"
                          style={{
                            fontSize: '12px',
                            padding: '3px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: '#EEF2FF',
                            color: '#3730A3',
                            border: '1px solid #C7D2FE',
                          }}
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => {
                              const remaining = profile.skills
                                .split(',')
                                .map((x) => x.trim())
                                .filter((x) => x && x.toLowerCase() !== skill.toLowerCase())
                                .join(', ');
                              setProfile({ ...profile, skills: remaining });
                            }}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              padding: 0,
                              lineHeight: 1,
                              color: '#6366F1',
                              fontWeight: 'bold',
                              fontSize: '13px',
                            }}
                            title={`Remove ${skill}`}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                  </div>
                </div>
              )}

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
                <button
                  type="button"
                  onClick={() => setPreviewDoc({ title: 'Curriculum Vitae / Resume', url: getDocumentViewUrl(profile.resume_url) })}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={13} /> View Current Resume Document
                </button>
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
              <button
                type="button"
                onClick={() => setShowCritiqueModal(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#3B5BDB' }}
              >
                <Sparkles size={14} /> AI Resume Optimizer & Critique
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
                  <div key={doc.id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', backgroundColor: '#F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} color="#3B5BDB" />
                        <h4 style={{ fontSize: '14.5px', color: '#1E2A44', margin: 0, fontWeight: 700 }}>{doc.title}</h4>
                      </div>
                    </div>
                    <p className="text-muted" style={{ fontSize: '12px', marginBottom: '10px' }}>
                      Type: <strong style={{ textTransform: 'capitalize' }}>{doc.document_type}</strong> • Size: {Math.round(doc.file_size / 1024)} KB
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc({ title: doc.title, url: getDocumentViewUrl(doc) })}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600 }}
                      >
                        <Eye size={13} /> View File
                      </button>
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
          <div className="modal-content" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#3B5BDB" />
                <div>
                  <h3 className="card-title" style={{ margin: 0 }}>AI Resume Skill Extractor</h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Upload your resume PDF to extract skills & roles via AI</span>
                </div>
              </div>
              <button onClick={() => setShowAiResumeModal(false)} className="btn btn-outline btn-sm">Close</button>
            </div>

            <form onSubmit={handleExtractResumeSkills}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>
                  Upload Resume File (PDF / DOCX) *
                </label>
                {!resumeExtractFile ? (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #93C5FD',
                      borderRadius: '8px',
                      padding: '28px 16px',
                      backgroundColor: '#F0F9FF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <UploadCloud size={40} color="#2563EB" style={{ marginBottom: '10px' }} />
                    <span style={{ fontWeight: 600, color: '#1E40AF', fontSize: '14.5px' }}>Click or drag & drop Resume PDF here</span>
                    <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Supports .pdf, .docx, and .txt files (up to 15MB)</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,application/pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResumeExtractFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={22} color="#1D4ED8" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1E3A8A' }}>{resumeExtractFile.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          {(resumeExtractFile.size / 1024).toFixed(1)} KB • <span style={{ color: '#16A34A', fontWeight: 600 }}>Ready to extract</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResumeExtractFile(null)}
                      style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', padding: '6px' }}
                      title="Remove file"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px', marginBottom: '16px' }}>
                <button type="button" onClick={() => setShowAiResumeModal(false)} className="btn btn-outline btn-sm" disabled={parsingResume}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={parsingResume || !resumeExtractFile}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#3B5BDB' }}
                >
                  {parsingResume ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {parsingResume ? 'Extracting from PDF...' : 'Extract Skills & Roles'}
                </button>
              </div>
            </form>

            {parsedData && (
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '14px', color: '#1E2A44', margin: 0, fontWeight: 700 }}>AI Extracted Profile Insights:</h4>
                  <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileCheck size={12} /> Successfully Parsed
                  </span>
                </div>

                {parsedData.technical_skills?.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: '#0F172A' }}>Technical Skills ({parsedData.technical_skills.length}):</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {parsedData.technical_skills.map((s, idx) => (
                        <span key={idx} className="badge badge-info" style={{ fontSize: '12px', padding: '4px 8px' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {parsedData.soft_skills?.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: '#0F172A' }}>Soft Skills:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {parsedData.soft_skills.map((s, idx) => (
                        <span key={idx} className="badge badge-neutral" style={{ fontSize: '12px', padding: '4px 8px' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {parsedData.suggested_roles?.length > 0 && (
                  <div style={{ marginBottom: '12px', padding: '10px 12px', backgroundColor: '#EFF6FF', borderRadius: '6px', border: '1px solid #DBEAFE' }}>
                    <strong style={{ color: '#1E40AF' }}>Suggested Career Roles:</strong>
                    <div style={{ color: '#1D4ED8', fontWeight: 600, marginTop: '2px' }}>{parsedData.suggested_roles.join(', ')}</div>
                  </div>
                )}

                {parsedData.experience_summary && (
                  <div style={{ color: '#475569', fontSize: '12px', marginTop: '8px', lineHeight: 1.5, borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                    <strong>Profile Summary:</strong> {parsedData.experience_summary}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const extractedSkills = [
                      ...(parsedData.technical_skills || []),
                      ...(parsedData.soft_skills || [])
                    ];
                    setProfile((prev) => ({
                      ...prev,
                      preferred_roles: parsedData.suggested_roles?.length > 0 ? parsedData.suggested_roles.join(', ') : prev.preferred_roles,
                      skills: extractedSkills.length > 0 ? extractedSkills.join(', ') : prev.skills
                    }));
                    setShowAiResumeModal(false);
                    toast.success('Skills and career roles mapped to profile!');
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#3B5BDB' }}
                >
                  <Sparkles size={14} /> Apply & Map Extracted Skills to Profile
                </button>
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

      {/* MODAL: AI Resume Optimizer & Live Critique (Section 39 of Specification) */}
      {showCritiqueModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#3B5BDB" />
                <div>
                  <h3 className="card-title" style={{ margin: 0 }}>AI Resume Optimizer & Critique</h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Actionable improvements, metric quantification & verb optimization</span>
                </div>
              </div>
              <button onClick={() => setShowCritiqueModal(false)} className="btn btn-outline btn-sm">Close</button>
            </div>

            <form onSubmit={handleCritiqueResume}>
              <div className="form-group">
                <label className="form-label">Target Industry Role</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Full Stack Developer, Data Engineer, Cloud Intern"
                  value={critiqueTargetRole}
                  onChange={(e) => setCritiqueTargetRole(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>
                  Select or Drop Resume File (PDF / DOCX) *
                </label>
                {!critiqueFile ? (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #93C5FD',
                      borderRadius: '8px',
                      padding: '24px 16px',
                      backgroundColor: '#F0F9FF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <UploadCloud size={36} color="#2563EB" style={{ marginBottom: '8px' }} />
                    <span style={{ fontWeight: 600, color: '#1E40AF', fontSize: '14px' }}>Click or drag & drop Resume PDF here</span>
                    <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Supports .pdf, .docx, and .txt formats</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,application/pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCritiqueFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '6px', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} color="#1D4ED8" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#1E3A8A' }}>{critiqueFile.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{(critiqueFile.size / 1024).toFixed(1)} KB • <span style={{ color: '#16A34A', fontWeight: 600 }}>Ready</span></div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCritiqueFile(null)}
                      style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                      title="Remove file"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', marginBottom: '16px' }}>
                <button type="button" onClick={() => setShowCritiqueModal(false)} className="btn btn-outline btn-sm" disabled={critiquing}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={critiquing || !critiqueFile}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#3B5BDB' }}
                >
                  {critiquing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {critiquing ? 'Analyzing PDF with AI...' : 'Generate Resume Critique'}
                </button>
              </div>
            </form>

            {critiqueResult && (
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                {/* Score Banner */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#F0F9FF',
                  borderRadius: '6px',
                  border: '1px solid #BAE6FD',
                  marginBottom: '16px'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#0369A1' }}>Resume Impact Score</span>
                    <div style={{ fontSize: '13px', color: '#0C4A6E', marginTop: '2px' }}>{critiqueResult.summary_feedback}</div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284C7' }}>
                    {critiqueResult.impact_score || 85}/100
                  </div>
                </div>

                {/* Quantification Fixes */}
                {critiqueResult.quantification_fixes?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '13.5px', color: '#1E293B', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} color="#2563EB" /> Recommended Bullet Point Quantifications:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {critiqueResult.quantification_fixes.map((q, idx) => (
                        <div key={idx} style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px', fontSize: '12.5px' }}>
                          <div style={{ color: '#DC2626', textDecoration: 'line-through', marginBottom: '4px' }}>
                            {q.original_phrase}
                          </div>
                          <div style={{ color: '#16A34A', fontWeight: 600, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ArrowRight size={12} color="#16A34A" /> {q.improved_phrase_suggestion}
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>Why: {q.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weak Verbs */}
                {critiqueResult.weak_action_verbs_to_replace?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '13.5px', color: '#1E293B', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Search size={14} color="#D97706" /> Action Verbs to Strengthen:
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {critiqueResult.weak_action_verbs_to_replace.map((v, idx) => (
                        <div key={idx} style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '8px 10px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#B45309', fontWeight: 600 }}>Replace '{v.weak_verb}'</span>
                          <ArrowRight size={12} color="#B45309" />
                          <strong style={{ color: '#15803D' }}>{Array.isArray(v.recommended_action_verbs) ? v.recommended_action_verbs.join(', ') : v.recommended_action_verbs}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Keywords */}
                {critiqueResult.tailored_role_keywords?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '13px', color: '#1E293B', marginBottom: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Target size={14} color="#7C3AED" /> Role Keywords to Include:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {critiqueResult.tailored_role_keywords.map((kw, idx) => (
                        <span key={idx} className="badge badge-info">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: In-App Document Preview Modal */}
      {previewDoc && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setPreviewDoc(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '920px', width: '92vw', height: '88vh', display: 'flex', flexDirection: 'column', padding: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="#2563EB" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {previewDoc.title || 'Document Preview'}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Close preview"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
              <iframe
                src={previewDoc.url}
                title={previewDoc.title || 'Document Preview'}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
