import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import {
  Briefcase,
  Users,
  UserPlus,
  GraduationCap,
  Plus,
  ArrowRight,
  BarChart3,
  Zap,
  ChevronRight
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';


function EmptyPostingsGraphic() {
  return (
    <div style={{ display: 'inline-block', position: 'relative', marginBottom: '14px' }}>
      <svg width="150" height="96" viewBox="0 0 150 96" fill="none">
        {/* Ground shadow */}
        <ellipse cx="75" cy="84" rx="60" ry="10" fill="#F1F5F9" />

        {/* Document Body */}
        <rect x="46" y="10" width="58" height="70" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="46" y="10" width="58" height="70" rx="8" fill="#EFF6FF" fillOpacity="0.6" />

        {/* Document items */}
        <circle cx="60" cy="26" r="6" fill="#93C5FD" />
        <rect x="71" y="22" width="22" height="4" rx="2" fill="#93C5FD" />
        <rect x="71" y="29" width="16" height="3" rx="1.5" fill="#BFDBFE" />

        <rect x="54" y="42" width="42" height="4" rx="2" fill="#DBEAFE" />
        <rect x="54" y="50" width="34" height="4" rx="2" fill="#DBEAFE" />
        <rect x="54" y="58" width="26" height="4" rx="2" fill="#E2E8F0" />

        {/* Magnifying Glass */}
        <circle cx="88" cy="54" r="15" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="3" />
        <line x1="99" y1="65" x2="112" y2="78" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />

        {/* Sparkle decorative lines */}
        <line x1="36" y1="36" x2="42" y2="34" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="46" x2="42" y2="44" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
        <line x1="112" y1="24" x2="118" y2="22" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
        <line x1="114" y1="34" x2="118" y2="32" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function IndustryDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    company_name: '',
    active_opportunities: 0,
    applications_received: 0,
    shortlisted_candidates: 0,
    selected_candidates: 0,
    active_interns: 0,
    opportunities_breakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/industry')
      .then((data) => setMetrics(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const companyDisplayName = metrics.company_name || user?.organization_name || user?.username || 'Cognizant IT Services';

  return (
    <PortalLayout title="Industry Recruitment Dashboard" allowedRoles={['industry']}>
      {/* ─── Top Welcome & Recruitment Portal Banner Card with Full Soft Blue Gradient ─── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #E6F0FE 0%, #DCEAFC 40%, #D4E5FB 100%)',
          borderRadius: '16px',
          border: '1px solid #BFDBFE',
          borderLeft: '4px solid #2563EB',
          padding: 'clamp(24px, 3.5vw, 32px) clamp(24px, 4vw, 36px)',
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '22px'
        }}
      >
        {/* The 3D artwork image positioned on the right with soft fade into the blue background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: 'clamp(320px, 48%, 560px)',
            backgroundImage: "url('/ind-dash.png')",
            backgroundPosition: 'right center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 15%)',
            pointerEvents: 'none'
          }}
        />

        {/* Text Content */}
        <div style={{ maxWidth: '600px', position: 'relative', zIndex: 1 }}>
          <h2
            style={{
              fontSize: '21px',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.4px',
              marginBottom: '8px'
            }}
          >
            {companyDisplayName} - Recruitment Portal
          </h2>
          <p
            style={{
              fontSize: '13.5px',
              color: '#334155',
              fontWeight: 500,
              lineHeight: 1.55,
              margin: 0
            }}
          >
            Connect with vetted talent from partner institutions, evaluate candidate match metrics, and manage internship deliverables.
          </p>
        </div>
      </div>

      {/* ─── 4 Metric / Stat Cards Row ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '22px'
        }}
      >
        {/* Active Postings */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {metrics.active_opportunities || 0}
            </div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>
              Active Postings
            </div>
          </div>
        </div>

        {/* Applications Received */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#FAF5FF',
              color: '#9333EA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {metrics.applications_received || 0}
            </div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>
              Applications Received
            </div>
          </div>
        </div>

        {/* Shortlisted Candidates */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <UserPlus size={22} />
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {metrics.shortlisted_candidates || 0}
            </div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>
              Shortlisted Candidates
            </div>
          </div>
        </div>

        {/* Selected Offers */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#FFFBEB',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {metrics.selected_candidates || 0}
            </div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>
              Selected Offers
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Split: Live Postings Summary & Recruitment Actions ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '20px',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Live Postings Summary */}
        <div
          style={{
            gridColumn: 'span 2',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '14px',
              borderBottom: '1px solid #F1F5F9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={20} color="#2563EB" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Live Postings Summary
              </h3>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px 0' }}>
              <LoadingSpinner message="Loading postings..." />
            </div>
          ) : metrics.opportunities_breakdown?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px 30px 16px' }}>
              <EmptyPostingsGraphic />
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#475569', margin: '0 0 16px 0' }}>
                No opportunities posted yet.
              </p>
              <Link
                to="/industry/post-opportunity"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                  transition: 'background-color 0.15s'
                }}
              >
                <Plus size={16} /> Post First Opening
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Openings</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.opportunities_breakdown.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600, color: '#0F172A' }}>{o.title}</td>
                      <td>
                        <span className="badge badge-neutral">{o.type}</span>
                      </td>
                      <td>
                        <span className="badge badge-success">{o.status}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{o.openings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Recruitment Actions */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              paddingBottom: '14px',
              borderBottom: '1px solid #F1F5F9'
            }}
          >
            <Zap size={20} color="#2563EB" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Recruitment Actions
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Primary Action Button (Dark Navy) */}
            <Link
              to="/industry/post-opportunity"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                padding: '13px 18px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13.5px',
                transition: 'background-color 0.15s, transform 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Plus size={16} />
                <span>Post Internship / Job</span>
              </div>
              <ChevronRight size={16} color="#94A3B8" />
            </Link>

            {/* Action 2: Review Candidate Pipeline */}
            <Link
              to="/industry/applications"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                padding: '13px 18px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13.5px',
                transition: 'border-color 0.15s, background-color 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={16} color="#2563EB" />
                <span>Review Candidate Pipeline</span>
              </div>
              <ChevronRight size={16} color="#94A3B8" />
            </Link>

            {/* Action 3: Manage Intern Milestones */}
            <Link
              to="/industry/mentorship"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                padding: '13px 18px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13.5px',
                transition: 'border-color 0.15s, background-color 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GraduationCap size={16} color="#2563EB" />
                <span>Manage Intern Milestones</span>
              </div>
              <ChevronRight size={16} color="#94A3B8" />
            </Link>

            {/* Action 4: Institutional Partnerships */}
            <Link
              to="/industry/collaborations"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                padding: '13px 18px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13.5px',
                transition: 'border-color 0.15s, background-color 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ArrowRight size={16} color="#2563EB" />
                <span>Institutional Partnerships</span>
              </div>
              <ChevronRight size={16} color="#94A3B8" />
            </Link>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
