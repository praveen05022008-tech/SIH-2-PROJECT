import React from 'react';
import { Link } from 'react-router-dom';

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        <div>
          <div style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>
            Academia–Industry Collaboration Portal
          </div>
          <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.6' }}>
            National Portal for Skill Mapping, Internships,<br />
            Placements, and Enterprise Partnerships.
          </p>
        </div>

        <div>
          <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Platform Portals</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link to="/login" style={{ color: '#94A3B8', fontSize: '13px' }}>Student Portal</Link></li>
            <li><Link to="/login" style={{ color: '#94A3B8', fontSize: '13px' }}>Faculty & Academician Portal</Link></li>
            <li><Link to="/login" style={{ color: '#94A3B8', fontSize: '13px' }}>Industry Recruitment Portal</Link></li>
            <li><Link to="/login" style={{ color: '#94A3B8', fontSize: '13px' }}>Institution Management Portal</Link></li>
            <li><Link to="/login" style={{ color: '#94A3B8', fontSize: '13px' }}>Super Admin Governance</Link></li>
          </ul>
        </div>

        <div>
          <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Core Capabilities</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><span style={{ color: '#94A3B8', fontSize: '13px' }}>Deterministic Skill Mapping</span></li>
            <li><span style={{ color: '#94A3B8', fontSize: '13px' }}>Automated Skill Assessments</span></li>
            <li><span style={{ color: '#94A3B8', fontSize: '13px' }}>Internship & Placement Pipeline</span></li>
            <li><span style={{ color: '#94A3B8', fontSize: '13px' }}>Verified Digital Portfolios</span></li>
            <li><span style={{ color: '#94A3B8', fontSize: '13px' }}>Institutional Collaborations</span></li>
          </ul>
        </div>

        <div>
          <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Legal & Compliance</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link to="/privacy" style={{ color: '#94A3B8', fontSize: '13px' }}>Privacy Policy</Link></li>
            <li><Link to="/terms" style={{ color: '#94A3B8', fontSize: '13px' }}>Terms of Use</Link></li>
            <li><span style={{ color: '#94A3B8', fontSize: '13px' }}>Security & Audit Compliance</span></li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #2B3856', paddingTop: '20px', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
        © {new Date().getFullYear()} Academia–Industry Collaboration Portal. Built in compliance with national enterprise security standards.
      </div>
    </footer>
  );
}
