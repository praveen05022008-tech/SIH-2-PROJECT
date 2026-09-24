import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getDocumentViewUrl } from '../../utils/fileUrl';
import {
  Award,
  CheckCircle2,
  FolderGit2,
  Globe,
  ExternalLink,
  Code,
  GraduationCap,
  Building2,
  ShieldCheck,
  Calendar,
  Sparkles,
  FileCheck,
  BookOpen,
  Share2,
  Check,
  Target,
  FileText,
  Download
} from 'lucide-react';

export function PublicPortfolioPage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (username) {
      api.get(`/portfolios/public/${username}`)
        .then((res) => setData(res))
        .catch((err) => setError(err.message || 'Portfolio not found'))
        .finally(() => setLoading(false));
    }
  }, [username]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      <PublicHeader />

      <main style={{ flex: 1, padding: '36px 20px', maxWidth: '1060px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <LoadingSpinner message="Verifying digital credentials from TiDB database..." />
          </div>
        ) : error || !data ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              textAlign: 'center',
              padding: '60px 20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <ShieldCheck size={48} color="#94A3B8" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '20px', color: '#1E293B', marginBottom: '8px', fontWeight: 800 }}>
              Digital Portfolio Not Found
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '20px' }}>
              The requested candidate portfolio '{username}' does not exist or has not been published yet.
            </p>
            <Link
              to="/"
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                padding: '9px 18px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              Return to Homepage
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* Top Verified Candidate Hero Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid #E2E8F0',
                borderTop: '5px solid #2563EB',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '20px'
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {data.full_name}
                  </h1>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    <CheckCircle2 size={13} /> Verified Digital Portfolio
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748B', fontSize: '13.5px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#334155' }}>
                    <GraduationCap size={15} color="#2563EB" /> {data.course || 'Bachelor of Engineering'}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Building2 size={15} /> {data.institution_name}
                  </span>
                  <span>•</span>
                  <span>Class of {data.graduation_year}</span>
                </div>

                {data.bio && (
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 18px 0', maxWidth: '720px' }}>
                    {data.bio}
                  </p>
                )}

                {/* External Social, Resume & Code Repositories */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {data.resume_url && (
                    <a
                      href={getDocumentViewUrl(data.resume_url)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 16px',
                        borderRadius: '8px',
                        backgroundColor: '#2563EB',
                        border: '1px solid #1D4ED8',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
                      }}
                    >
                      <FileText size={14} /> View Verified Resume
                    </a>
                  )}
                  {data.github_url && (
                    <a
                      href={data.github_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        color: '#1E293B',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      <FolderGit2 size={14} /> GitHub Profile
                    </a>
                  )}
                  {data.linkedin_url && (
                    <a
                      href={data.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        color: '#1E293B',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      <Globe size={14} /> LinkedIn Profile
                    </a>
                  )}
                  {data.website_url && (
                    <a
                      href={data.website_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        color: '#1E293B',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      <Globe size={14} /> Personal Website
                    </a>
                  )}

                  <button
                    onClick={handleCopyLink}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      backgroundColor: copied ? '#ECFDF5' : '#EFF6FF',
                      border: copied ? '1px solid #86EFAC' : '1px solid #BFDBFE',
                      color: copied ? '#059669' : '#2563EB',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {copied ? <Check size={14} /> : <Share2 size={14} />}
                    <span>{copied ? 'Link Copied!' : 'Share Portfolio'}</span>
                  </button>
                </div>
              </div>

              {/* CGPA Badge */}
              {data.cgpa && (
                <div
                  style={{
                    padding: '20px 24px',
                    backgroundColor: '#EFF6FF',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '1px solid #BFDBFE',
                    minWidth: '120px'
                  }}
                >
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#1D4ED8', lineHeight: 1 }}>
                    {data.cgpa}
                  </div>
                  <div style={{ fontSize: '12px', color: '#1E40AF', fontWeight: 700, marginTop: '4px' }}>
                    Cumulative CGPA
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#60A5FA', marginTop: '2px' }}>
                    Verified Academic Record
                  </div>
                </div>
              )}
            </div>

            {/* Verified Skills & Competencies */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={18} color="#2563EB" /> Verified Skill Telemetry & Proficiencies
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Platform-assessed and certified competencies
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 10px', borderRadius: '12px' }}>
                  {data.verified_skills?.length || 0} Competencies
                </span>
              </div>

              {data.verified_skills?.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>No verified skills published yet.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {data.verified_skills.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: s.verified ? '#ECFDF5' : '#F8FAFC',
                        color: s.verified ? '#065F46' : '#334155',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: s.verified ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {s.verified && <CheckCircle2 size={14} color="#059669" />}
                      <span>{s.skill_name}</span>
                      <span style={{ fontSize: '11px', textTransform: 'capitalize', color: s.verified ? '#047857' : '#64748B' }}>
                        ({s.level})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Standardized Skill Assessments */}
            {data.assessments?.length > 0 && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={18} color="#7C3AED" /> Standardized Skill Assessments
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Officially evaluated technical exams with score transcripts
                  </p>
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                        <th style={{ padding: '10px 14px', fontWeight: 700 }}>Assessment Title</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'center' }}>Score</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'center' }}>Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.assessments.map((a, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0F172A' }}>{a.title}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: '#2563EB' }}>
                            {a.percentage}%
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, textTransform: 'capitalize' }}>
                              {a.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
                            {a.completed_at ? new Date(a.completed_at).toLocaleDateString() : 'Recently'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Learning Program Certificates */}
            {data.learning_certificates?.length > 0 && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={18} color="#059669" /> Learning Program & Academy Certifications
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Tamper-proof verifiable micro-credentials issued upon program completion
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                  {data.learning_certificates.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>
                            {c.program_type} Certificate
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>{c.issue_date}</span>
                        </div>
                        <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                          {c.program_title}
                        </h4>
                        <div style={{ fontSize: '12px', color: '#475569' }}>
                          Issued by: <strong>{c.issuer_name}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B' }}>
                          {c.certificate_number}
                        </span>
                        <Link
                          to={`/verify-certificate/${c.verification_hash}`}
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#2563EB',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <ShieldCheck size={13} /> Verify SHA-256
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Professional Certifications */}
            {data.certifications?.length > 0 && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={18} color="#D97706" /> Verified External Industry Certifications
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Industry-recognized certifications and verified credentials
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {data.certifications.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>
                          Professional Certificate
                        </span>
                        <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A', margin: '4px 0 2px 0' }}>
                          {c.title}
                        </h4>
                        <div style={{ fontSize: '12px', color: '#475569' }}>
                          {c.issuing_organization}
                        </div>
                      </div>

                      {c.credential_id && (
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
                          ID: {c.credential_id}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Projects & Repositories */}
            {data.projects?.length > 0 && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderGit2 size={18} color="#2563EB" /> Featured Projects & Code Repositories
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Practical engineering projects and open-source contributions
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                  {data.projects.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                          {p.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                          {p.description}
                        </p>
                        {p.technologies && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {p.technologies.split(',').map((t, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  backgroundColor: '#EFF6FF',
                                  color: '#1D4ED8',
                                  padding: '2px 8px',
                                  borderRadius: '4px'
                                }}
                              >
                                {t.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '12px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                        {p.repo_url && (
                          <a
                            href={p.repo_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#334155',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FolderGit2 size={13} /> Source Code
                          </a>
                        )}
                        {p.project_url && (
                          <a
                            href={p.project_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#2563EB',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <ExternalLink size={13} /> Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Document Vault Summary */}
            {data.documents_summary?.length > 0 && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#059669" /> Verified Academic Records & Documents
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Institutional marksheets and credentials verified by university registrar
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {data.documents_summary.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        color: '#065F46',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle2 size={14} color="#059669" />
                      <span>{doc.title}</span>
                      <span style={{ fontSize: '11px', color: '#047857', textTransform: 'capitalize' }}>
                        ({doc.document_type})
                      </span>
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
