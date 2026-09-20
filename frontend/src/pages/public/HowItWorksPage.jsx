import React from 'react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

export function HowItWorksPage() {
  const steps = [
    { step: '01', title: 'Onboarding & Administrative Verification', text: 'Students, Faculty, Industry partners, and Institutions register on the platform. The Super Admin reviews credentials to maintain trusted verification.' },
    { step: '02', title: 'Competency Assessment & Skill Profiling', text: 'Students take standardized domain and programming assessments. The system updates their skill profile with objective proficiency tiers.' },
    { step: '03', title: 'Deterministic Gap Analysis', text: 'The platform benchmarks the student’s validated skill matrix against targeted career paths and suggests targeted learning programs to close identified gaps.' },
    { step: '04', title: 'Vetted Opportunities & Explainable Matching', text: 'Industries publish internships, apprenticeships, and jobs. The engine calculates an explainable match score highlighting satisfied and missing criteria.' },
    { step: '05', title: 'Recruitment, Milestones & Digital Portfolio', text: 'Industries shortlist candidates, monitor internship milestones, and record ratings. Successful deliverables automatically enrich the student’s verified digital portfolio.' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F6F8' }}>
      <PublicHeader />
      <div style={{ flex: 1, maxWidth: '900px', margin: '0 auto', padding: '48px 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '26px', color: '#1E2A44' }}>How the Collaboration Portal Operates</h1>
          <p className="text-muted" style={{ marginTop: '8px' }}>A structured, 5-stage pipeline connecting academic learning directly with enterprise outcomes</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {steps.map((s) => (
            <div key={s.step} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: 0 }}>
              <div style={{
                backgroundColor: '#EEF2FF',
                color: '#3B5BDB',
                fontWeight: 700,
                fontSize: '18px',
                padding: '10px 14px',
                borderRadius: '4px',
                flexShrink: 0
              }}>
                {s.step}
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '6px', color: '#1E2A44' }}>{s.title}</h3>
                <p className="text-muted" style={{ fontSize: '13.5px', lineHeight: '1.6' }}>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
