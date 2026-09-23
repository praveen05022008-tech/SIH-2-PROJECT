import React from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import {
  GraduationCap,
  Briefcase,
  Building2,
  Award,
  Layers,
  CheckCircle,
  FileCheck,
  TrendingUp,
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F6F8' }}>
      <PublicHeader />

      {/* Hero Section */}
      <section style={{ backgroundColor: '#1E2A44', color: '#FFFFFF', padding: 'clamp(44px, 8vw, 80px) 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span style={{
            backgroundColor: 'rgba(59, 91, 219, 0.2)',
            color: '#93C5FD',
            border: '1px solid #3B5BDB',
            fontSize: '12px',
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Centralized Enterprise Collaboration Platform
          </span>

          <h1 style={{ fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 700, marginTop: '20px', marginBottom: '16px', color: '#FFFFFF', lineHeight: '1.2' }}>
            Connect Skills. Discover Opportunities. Build Careers.
          </h1>

          <p style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: '#CBD5E1', maxWidth: '750px', margin: '0 auto 32px', lineHeight: '1.6' }}>
            A centralized enterprise platform bridging the gap between academic education and industry requirements. Empowering Students, Academicians, Industries, and Institutions through deterministic skill mapping, internships, placements, and verified collaboration.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-secondary" style={{ padding: '10px 22px', fontSize: '14.5px' }}>
              Get Started <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn btn-outline" style={{ padding: '10px 22px', fontSize: '14.5px', color: '#FFFFFF', borderColor: '#475569', backgroundColor: 'transparent' }}>
              Stakeholder Login
            </Link>
          </div>
        </div>
      </section>

      {/* Stakeholder Roles */}
      <section style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', color: '#1E2A44' }}>Built for Five Dedicated Stakeholders</h2>
          <p className="text-muted" style={{ marginTop: '6px' }}>Strict role-based governance with dedicated portals for each entity</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ color: '#3B5BDB', marginBottom: '12px' }}><GraduationCap size={28} /></div>
            <h3 style={{ marginBottom: '8px' }}>Students</h3>
            <p className="text-muted" style={{ fontSize: '13px', lineHeight: '1.5' }}>
              Assess skills, identify technical gaps, explore learning paths, apply for vetted internships, and showcase verified digital portfolios.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ color: '#3B5BDB', marginBottom: '12px' }}><Award size={28} /></div>
            <h3 style={{ marginBottom: '8px' }}>Academicians</h3>
            <p className="text-muted" style={{ fontSize: '13px', lineHeight: '1.5' }}>
              Explore faculty internships, industrial training, Faculty Development Programs (FDPs), consultancy, and joint research.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ color: '#3B5BDB', marginBottom: '12px' }}><Briefcase size={28} /></div>
            <h3 style={{ marginBottom: '8px' }}>Industries</h3>
            <p className="text-muted" style={{ fontSize: '13px', lineHeight: '1.5' }}>
              Post internships and jobs, review candidate match scores, manage recruitment pipelines, mentor interns, and collaborate with colleges.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ color: '#3B5BDB', marginBottom: '12px' }}><Building2 size={28} /></div>
            <h3 style={{ marginBottom: '8px' }}>Institutions</h3>
            <p className="text-muted" style={{ fontSize: '13px', lineHeight: '1.5' }}>
              Monitor student skill acquisition, track placement and internship statistics, verify documents, and foster enterprise partnerships.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ color: '#3B5BDB', marginBottom: '12px' }}><ShieldCheck size={28} /></div>
            <h3 style={{ marginBottom: '8px' }}>Super Admin</h3>
            <p className="text-muted" style={{ fontSize: '13px', lineHeight: '1.5' }}>
              Registration approvals, global skill ontology, assessment authoring, system-wide audits, and compliance management.
            </p>
          </div>
        </div>
      </section>

      {/* 7-Layer Architecture Overview */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '60px 20px', borderTop: '1px solid #E2E5EA', borderBottom: '1px solid #E2E5EA' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '22px', color: '#1E2A44' }}>7-Layer Enterprise Architecture</h2>
            <p className="text-muted" style={{ marginTop: '4px' }}>Modular, secure, and compliant with enterprise architectural standards</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { num: 'Layer 1', title: 'Stakeholders', desc: 'Separate portals for Student, Academician, Industry, Institution, and Admin.' },
              { num: 'Layer 2', title: 'Digital Experience', desc: 'Unified responsive web portal, PWA ready, accessible navigation, and deep navy enterprise theme.' },
              { num: 'Layer 3', title: 'Access & Orchestration', desc: 'FastAPI Gateway (/api/v1), JWT authentication, RBAC/ABAC role isolation, workflow & audit engine.' },
              { num: 'Layer 4', title: 'Core Domain Services', desc: 'Profiles, Assessments, Skill Ontology, Learning Programs, Internships, Placements, and Portfolios.' },
              { num: 'Layer 5', title: 'Intelligence & Recommendations', desc: 'Explainable skill gap analysis, deterministic opportunity matching, transparent factors without fake AI.' },
              { num: 'Layer 6', title: 'Data & Integration Platform', desc: 'Relational data models (TiDB / MySQL / PostgreSQL compatible), secure document storage, audit trails.' },
              { num: 'Layer 7', title: 'Cloud Platform & Operations', desc: 'Production-ready containers, health checks, strict security headers, and environment-driven configurations.' },
            ].map((layer) => (
              <div key={layer.num} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 18px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E5EA',
                borderRadius: '4px'
              }}>
                <span style={{
                  backgroundColor: '#1E2A44',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  minWidth: '65px',
                  textAlign: 'center'
                }}>
                  {layer.num}
                </span>
                <span style={{ fontWeight: 600, color: '#1E2A44', fontSize: '14px', minWidth: '220px' }}>
                  {layer.title}
                </span>
                <span style={{ color: '#4B5563', fontSize: '13px' }}>
                  {layer.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', color: '#1E2A44' }}>System Workflow: Assess → Learn → Apply → Grow</h2>
          <p className="text-muted" style={{ marginTop: '6px' }}>Transparent lifecycle from academic onboarding to industry employment</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '20px', color: '#3B5BDB', marginBottom: '8px' }}>01</div>
            <h4 style={{ marginBottom: '6px' }}>Skill Assessment</h4>
            <p className="text-muted" style={{ fontSize: '13px' }}>Students undertake standardized technical and domain assessments to verify proficiencies.</p>
          </div>
          <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '20px', color: '#3B5BDB', marginBottom: '8px' }}>02</div>
            <h4 style={{ marginBottom: '6px' }}>Gap Analysis</h4>
            <p className="text-muted" style={{ fontSize: '13px' }}>The system evaluates strengths against targeted industry roles and suggests learning programs.</p>
          </div>
          <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '20px', color: '#3B5BDB', marginBottom: '8px' }}>03</div>
            <h4 style={{ marginBottom: '6px' }}>Apply & Match</h4>
            <p className="text-muted" style={{ fontSize: '13px' }}>Candidates apply for vetted internships & jobs with deterministic match transparency.</p>
          </div>
          <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '20px', color: '#3B5BDB', marginBottom: '8px' }}>04</div>
            <h4 style={{ marginBottom: '6px' }}>Mentorship & Portfolio</h4>
            <p className="text-muted" style={{ fontSize: '13px' }}>Track internship milestones, receive industry feedback, and produce verified digital credentials.</p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
