import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BookOpen, ExternalLink, Clock, Plus, Send, Award, Sparkles, Building } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function StudentLearningPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  // Publish Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [providerName, setProviderName] = useState(user?.role === 'industry' ? (user?.username || '') : '');
  const [programType, setProgramType] = useState('course');
  const [learningMode, setLearningMode] = useState('self_paced');
  const [duration, setDuration] = useState('4 Weeks');
  const [skillsCovered, setSkillsCovered] = useState('');
  const [description, setDescription] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, [typeFilter]);

  const fetchPrograms = () => {
    setLoading(true);
    let url = '/learning-programs';
    const params = [];
    if (typeFilter) params.push(`program_type=${typeFilter}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    api.get(url)
      .then((data) => setPrograms(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPrograms();
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/learning-programs', {
        title,
        provider_name: providerName || 'Enterprise Partner',
        program_type: programType,
        learning_mode: learningMode,
        duration,
        skills_covered: skillsCovered,
        description,
        external_link: externalLink || null,
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setSkillsCovered('');
      setExternalLink('');
      toast.success('Learning program published successfully.');
      fetchPrograms();
    } catch (err) {
      toast.error('Error publishing program: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canPublish = ['admin', 'industry', 'institution'].includes(user?.role);

  return (
    <PortalLayout title="Learning Programs & Upskilling Marketplace" allowedRoles={['student', 'faculty', 'industry', 'institution', 'admin']}>
      {/* Header & Filter Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>Curated Upskilling & FDP Catalog</h3>
            <p className="text-muted" style={{ fontSize: '12px', margin: '4px 0 0' }}>Industry certifications, bootcamps, and faculty development training</p>
          </div>
          {canPublish && (
            <button onClick={() => setShowModal(true)} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Publish Program
            </button>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search programs by skill, title, or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '220px' }}
          />

          <select
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">All Program Types</option>
            <option value="course">Online Courses</option>
            <option value="certification">Certifications</option>
            <option value="workshop">Workshops</option>
            <option value="bootcamp">Bootcamps</option>
            <option value="fdp">Faculty Programs (FDP)</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '36px', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner message="Loading available learning programs..." />
        </div>
      ) : programs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <BookOpen size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <p className="text-muted">No learning programs currently listed.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {programs.map((p) => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-info">{p.program_type.toUpperCase()}</span>
                  <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{p.learning_mode.replace('_', ' ')}</span>
                </div>

                <h3 style={{ fontSize: '16px', color: '#1E2A44', marginBottom: '6px' }}>{p.title}</h3>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '10px' }}>
                  Provider: <strong>{p.provider_name}</strong>
                </div>

                <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: '1.6', marginBottom: '12px' }}>
                  {p.description}
                </p>

                {p.skills_covered && (
                  <div style={{ fontSize: '12px', color: '#3B5BDB', fontWeight: 500, marginBottom: '12px' }}>
                    Skills Covered: {p.skills_covered}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #E2E5EA', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12.5px', color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {p.duration || 'Flexible'}
                </span>

                <a
                  href={p.external_link || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  Enroll / Learn More <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Program Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Publish Learning Program / FDP</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <form onSubmit={handleCreateProgram}>
              <div className="form-group">
                <label className="form-label">Program Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Google Cloud Certified Data Engineer Track"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Provider / Organization *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. AWS / IIT Madras"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Program Category *</label>
                  <select className="form-control" value={programType} onChange={(e) => setProgramType(e.target.value)}>
                    <option value="course">Online Course</option>
                    <option value="certification">Professional Certification</option>
                    <option value="workshop">Technical Workshop</option>
                    <option value="bootcamp">Intensive Bootcamp</option>
                    <option value="fdp">Faculty Development Program (FDP)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Learning Mode *</label>
                  <select className="form-control" value={learningMode} onChange={(e) => setLearningMode(e.target.value)}>
                    <option value="self_paced">Self-Paced Online</option>
                    <option value="instructor_led">Instructor-Led Live</option>
                    <option value="hybrid">Hybrid (Online + Hands-on Lab)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 6 Weeks / 40 Hours"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skills Covered (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Python, Machine Learning, PyTorch, BigQuery"
                  value={skillsCovered}
                  onChange={(e) => setSkillsCovered(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Program Description & Outcomes *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Describe curriculum, prerequisites, practical lab exercises, and certification deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Enrollment / LMS Portal Link</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://..."
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  <Send size={13} /> {submitting ? 'Publishing...' : 'Publish to Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

