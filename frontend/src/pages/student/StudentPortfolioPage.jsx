import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';
import { getDocumentViewUrl } from '../../utils/fileUrl';
import {
  FileText,
  Award,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
  Code
} from 'lucide-react';

export function StudentPortfolioPage() {
  const toast = useToast();

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
  const [savingBio, setSavingBio] = useState(false);
  
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

  const fetchPortfolio = useCallback(() => {
    setLoading(true);
    api.get('/portfolios/my-portfolio')
      .then((data) => setPortfolio(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchDocuments = useCallback(() => {
    api.get('/documents')
      .then((data) => setDocuments(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPortfolio();
    fetchDocuments();
  }, [fetchPortfolio, fetchDocuments]);


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
      toast.success('Portfolio links updated successfully.');
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
      fetchPortfolio();
      toast.success('Project added to portfolio.');
    } catch (err) {
      toast.error('Error creating project: ' + err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/portfolios/projects/${id}`);
      fetchPortfolio();
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
      fetchPortfolio();
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
      fetchDocuments();
      toast.success('Document securely uploaded to Cloudinary.');
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  return (
    <PortalLayout title="Digital Portfolio & Cloudinary Credentials" allowedRoles={['student']}>
      {/* Portfolio Info & Links */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Professional Bio & Social Links</h3>
        </div>
        <form onSubmit={handleUpdateBio}>
          <div className="form-group">
            <label className="form-label">Professional Summary</label>
            <textarea
              className="form-control"
              placeholder="Highlight your academic focus, technical strengths, and career aspirations..."
              value={portfolio.bio || ''}
              onChange={(e) => setPortfolio({ ...portfolio, bio: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://github.com/username"
                value={portfolio.github_url || ''}
                onChange={(e) => setPortfolio({ ...portfolio, github_url: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://linkedin.com/in/username"
                value={portfolio.linkedin_url || ''}
                onChange={(e) => setPortfolio({ ...portfolio, linkedin_url: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Personal Website / Portfolio</label>
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

      {/* Cloudinary Verified Documents & Resumes */}
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

      {/* Projects Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Academic & Industry Projects</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>Demonstrated hands-on engineering and research work</p>
          </div>
          <button onClick={() => setShowProjectModal(true)} className="btn btn-secondary btn-sm">
            <Plus size={13} /> Add Project
          </button>
        </div>

        {portfolio.projects?.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '13px' }}>No projects registered yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {portfolio.projects?.map((proj) => (
              <div key={proj.id} style={{ border: '1px solid #E2E5EA', borderRadius: '4px', padding: '16px', backgroundColor: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '15px', color: '#1E2A44', marginBottom: '4px' }}>{proj.title}</h4>
                  <button onClick={() => handleDeleteProject(proj.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444' }}>
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

      {/* Upload Document Modal */}
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

      {/* Add Project Modal */}
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

      {/* Add Cert Modal */}
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
