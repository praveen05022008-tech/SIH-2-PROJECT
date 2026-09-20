import React from 'react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

export function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F6F8' }}>
      <PublicHeader />
      <div style={{ flex: 1, maxWidth: '960px', margin: '0 auto', padding: '48px 20px', width: '100%' }}>
        <div className="card" style={{ padding: '36px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#3B5BDB', textTransform: 'uppercase' }}>
            Enterprise Strategic Initiative
          </span>
          <h1 style={{ fontSize: '26px', marginTop: '8px', marginBottom: '16px' }}>About the Collaboration Portal</h1>
          <p style={{ color: '#4B5563', lineHeight: '1.7', marginBottom: '20px' }}>
            The <strong>Academia–Industry Collaboration Portal</strong> is an enterprise platform designed to address the critical disconnect between academic curriculum outcomes and the rapidly evolving technological and industrial competencies required by modern enterprise.
          </p>

          <h3 style={{ marginTop: '28px', marginBottom: '12px' }}>Institutional Objectives</h3>
          <ul style={{ paddingLeft: '20px', color: '#4B5563', lineHeight: '1.8' }}>
            <li><strong>Objective Skill Profiling:</strong> Replacing self-declarations with verifiable skill assessments and transparent proficiency tiers.</li>
            <li><strong>Explainable Gap Analysis:</strong> Providing deterministic feedback detailing exact missing competencies for target career pathways.</li>
            <li><strong>Industry Apprenticeships & Internships:</strong> Fostering end-to-end recruitment, from application review to task progress tracking and mentor evaluations.</li>
            <li><strong>Faculty Development & Research:</strong> Empowering educators through industrial training, consultancy opportunities, and joint innovation initiatives.</li>
            <li><strong>Institution Governance:</strong> Equipping university administrators with real-time cohort analytics, placement rates, and verified digital credentials.</li>
          </ul>

          <h3 style={{ marginTop: '28px', marginBottom: '12px' }}>Zero-Fabrication Policy</h3>
          <p style={{ color: '#4B5563', lineHeight: '1.7' }}>
            In strict compliance with governance guidelines, all metrics, candidate match scores, and institutional statistics across this portal are computed dynamically from verified database records. No synthetic mock data or non-verifiable AI claims are utilized.
          </p>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
