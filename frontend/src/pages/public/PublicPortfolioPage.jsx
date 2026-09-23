import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Award,
  CheckCircle2,
  FolderGit2,
  Globe,
  ExternalLink,
  Code,
  GraduationCap,
  Building,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

export function PublicPortfolioPage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (username) {
      api.get(`/portfolios/public/${username}`)
        .then((res) => setData(res))
        .catch((err) => setError(err.message || 'Portfolio not found'))
        .finally(() => setLoading(false));
    }
  }, [username]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      <PublicHeader />

      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <LoadingSpinner message="Verifying digital credentials from TiDB records..." />
          </div>
        ) : error || !data ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <ShieldCheck size={48} color="#94A3B8" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '20px', color: '#1E293B', marginBottom: '8px' }}>Portfolio Not Found</h2>
            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '20px' }}>
              The requested student portfolio '{username}' does not exist or has not been published yet.
            </p>
            <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center' }}>
              Return to Homepage
            </Link>
          </div>
        ) : (
          <div>
            {/* Header Hero Profile Card */}
            <div className="card" style={{ padding: '32px', marginBottom: '24px', borderTop: '4px solid #3B5BDB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h1 style={{ fontSize: '26px', color: '#1E2A44', margin: 0 }}>{data.full_name}</h1>
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <CheckCircle2 size={12} /> Verified Digital Portfolio
                    </span>
                  </div>

                  <p className="text-muted" style={{ fontSize: '14px', margin: '4px 0 12px' }}>
                    {data.course} • {data.institution_name} (Class of {data.graduation_year})
                  </p>

                  {data.bio && (
                    <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.6', maxWidth: '650px', margin: '0 0 16px' }}>
                      {data.bio}
                    </p>
                  )}

                  {/* Social & Repo Links */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {data.github_url && (
                      <a href={data.github_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <FolderGit2 size={14} /> GitHub Repository
                      </a>
                    )}
                    {data.linkedin_url && (
                      <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={14} /> LinkedIn Profile
                      </a>
                    )}
                    {data.website_url && (
                      <a href={data.website_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={14} /> Personal Website
                      </a>
                    )}
                  </div>
                </div>


                {data.cgpa && (
                  <div style={{ padding: '16px 20px', backgroundColor: '#EFF6FF', borderRadius: '8px', textAlign: 'center', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#1D4ED8' }}>{data.cgpa}</div>
                    <span style={{ fontSize: '12px', color: '#1E40AF', fontWeight: 600 }}>Cumulative CGPA</span>
                  </div>
                )}
              </div>
            </div>

            {/* Verified Skills Grid */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">Verified Skill Telemetry</h3>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Platform-tested and assessed technical proficiencies</p>
                </div>
                <span className="badge badge-info">{data.verified_skills?.length || 0} Competencies</span>
              </div>

              {data.verified_skills?.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '13px' }}>No skills published yet.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {data.verified_skills.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: s.verified ? '#DCFCE7' : '#F1F5F9',
                        color: s.verified ? '#14532D' : '#334155',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: s.verified ? '1px solid #86EFAC' : '1px solid #CBD5E1',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {s.verified && <CheckCircle2 size={13} color="#16A34A" />}
                      {s.skill_name}
                      <span style={{ fontSize: '11px', textTransform: 'capitalize', color: s.verified ? '#15803D' : '#64748B' }}>
                        ({s.level})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verified Assessment Scores */}
            {data.assessments?.length > 0 && (
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Standardized Skill Assessments</h3>
                    <p className="text-muted" style={{ fontSize: '12px' }}>Officially proctored technical evaluations</p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Assessment Title</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.assessments.map((a, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600, color: '#1E2A44' }}>{a.title}</td>
                          <td style={{ fontWeight: 700, color: '#3B5BDB' }}>{a.percentage}%</td>
                          <td>
                            <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>
                              {a.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: '#64748B' }}>
                            {new Date(a.completed_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Showcase Projects */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">Projects & Applied Engineering</h3>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Hands-on repositories, capstones, and deployed live demonstrations</p>
                </div>
              </div>

              {data.projects?.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '13px' }}>No projects showcased yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {data.projects.map((proj, idx) => (
                    <div key={idx} style={{ border: '1px solid #E2E5EA', borderRadius: '6px', padding: '16px', backgroundColor: '#FFFFFF' }}>
                      <h4 style={{ fontSize: '15px', color: '#1E2A44', marginBottom: '4px' }}>{proj.title}</h4>
                      <div style={{ fontSize: '12px', color: '#3B5BDB', fontWeight: 600, marginBottom: '8px' }}>
                        {proj.technologies}
                      </div>
                      <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: '1.5', marginBottom: '12px' }}>
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
                            <Code size={12} /> Source Code
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications */}
            {data.certifications?.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Professional Certifications</h3>
                    <p className="text-muted" style={{ fontSize: '12px' }}>Verified industry credentials & accreditations</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {data.certifications.map((c, idx) => (
                    <div key={idx} style={{ border: '1px solid #E2E5EA', borderRadius: '6px', padding: '14px', backgroundColor: '#F8FAFC' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Award size={18} color="#3B5BDB" />
                        <h4 style={{ fontSize: '14.5px', color: '#1E2A44', margin: 0 }}>{c.title}</h4>
                      </div>
                      <p className="text-muted" style={{ fontSize: '12.5px', margin: '4px 0' }}>
                        Issuing Org: <strong>{c.issuing_organization}</strong>
                      </p>
                      {c.credential_id && <div style={{ fontSize: '12px', color: '#64748B' }}>Credential ID: {c.credential_id}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
