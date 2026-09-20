import React from 'react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Award, Briefcase, FileCheck, Layers, ShieldCheck, GraduationCap, Building2, TrendingUp } from 'lucide-react';

export function FeaturesPage() {
  const features = [
    { title: 'Standardized Skill Assessments', icon: Award, desc: 'Timed technical, programming, and soft-skill assessments with automated evaluation and instant skill profile verification.' },
    { title: 'Explainable Opportunity Matching', icon: TrendingUp, desc: 'Transparent matching algorithm comparing mandatory skills, proficiency levels, and CGPA requirements with clear explanations.' },
    { title: 'Internship Milestones & Mentorship', icon: GraduationCap, desc: 'Structured task assignments, deliverable submissions, and multidimensional mentor feedback (technical, soft skills, punctuality).' },
    { title: 'Digital Credential Portfolios', icon: FileCheck, desc: 'Interactive showcase for student projects, verified certifications, and validated academic achievements.' },
    { title: 'Institutional Governance & ABAC', icon: Building2, desc: 'Strict attribute-based isolation ensuring institutions monitor their own cohorts without cross-tenant data leaks.' },
    { title: 'Industry Collaboration Hub', icon: Briefcase, desc: 'Formal proposal creation for live industry projects, Faculty Development Programs (FDPs), research, and guest lectures.' },
    { title: 'System-Wide Audit Logs', icon: ShieldCheck, desc: 'Immutable activity tracking for all critical stakeholder actions, login events, and administrative approvals.' },
    { title: 'Modular 7-Layer Architecture', icon: Layers, desc: 'Engineered with FastAPI, SQLAlchemy, and TiDB compatibility for enterprise-grade scalability.' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F6F8' }}>
      <PublicHeader />
      <div style={{ flex: 1, maxWidth: '1100px', margin: '0 auto', padding: '48px 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '26px', color: '#1E2A44' }}>Core Platform Features</h1>
          <p className="text-muted" style={{ marginTop: '8px' }}>Comprehensive enterprise capabilities supporting the entire academia-to-industry transition</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card" style={{ marginBottom: 0 }}>
                <div style={{ color: '#3B5BDB', marginBottom: '14px' }}>
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{f.title}</h3>
                <p className="text-muted" style={{ fontSize: '13px', lineHeight: '1.6' }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
