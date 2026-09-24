import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Award, Briefcase, Building2, FileCheck, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

export function FacultyDashboard() {
  const { user } = useAuth();
  const [oppCount, setOppCount] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [collabCount, setCollabCount] = useState(0);
  const [fdpEnrollCount, setFdpEnrollCount] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/opportunities?type=faculty_internship').catch(() => []),
      api.get('/applications').catch(() => []),
      api.get('/collaborations').catch(() => []),
      api.get('/learning-programs/my-enrollments').catch(() => []),
    ]).then(([opps, apps, collabs, enrolls]) => {
      setOppCount(opps.length);
      setAppCount(apps.length);
      setCollabCount(collabs.length);
      setFdpEnrollCount(enrolls.length);
    });
  }, []);

  return (
    <PortalLayout title="Faculty & Academician Dashboard" allowedRoles={['faculty']}>
      <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderLeft: '4px solid #4F46E5', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#1E1B4B', margin: '0 0 6px 0' }}>
              Welcome, {user?.profile?.full_name || user?.username}
            </h2>
            <p className="text-muted" style={{ fontSize: '13.5px', margin: 0 }}>
              Designation: <strong>{user?.profile?.designation || 'Faculty Member'}</strong> &bull; Affiliation: <strong>{user?.profile?.institution_name || 'Academic Institution'}</strong>
            </p>
          </div>
          <Link to="/faculty/learning-programs" className="btn btn-primary btn-sm" style={{ backgroundColor: '#4338CA', borderColor: '#4338CA', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} /> Browse FDPs
          </Link>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div className="stat-value">{oppCount}</div>
            <div className="stat-label">Faculty Sabbaticals</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#047857' }}>
            <FileCheck size={22} />
          </div>
          <div>
            <div className="stat-value">{appCount}</div>
            <div className="stat-label">My Applications</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div className="stat-value">{fdpEnrollCount}</div>
            <div className="stat-label">Enrolled FDPs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>
            <Building2 size={22} />
          </div>
          <div>
            <div className="stat-value">{collabCount}</div>
            <div className="stat-label">Joint Collaborations</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Industrial Sabbaticals &amp; Residencies</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px', lineHeight: '1.6' }}>
            Explore industry sabbatical opportunities, institutional training partnerships, and applied engineering residencies.
          </p>
          <Link to="/faculty/opportunities" className="btn btn-secondary btn-sm">
            Explore Opportunities <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Faculty Development Programs (FDPs)</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px', lineHeight: '1.6' }}>
            Participate in structured, industry-curated curriculum cohorts, earn AICTE/CPE academic credits, and secure verifiable completion credentials.
          </p>
          <Link to="/faculty/learning-programs" className="btn btn-primary btn-sm" style={{ backgroundColor: '#4338CA', borderColor: '#4338CA' }}>
            Access FDP Academy <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Research &amp; Consultancy Proposals</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px', lineHeight: '1.6' }}>
            Initiate and coordinate joint academia-industry research projects, IP filings, and commercial consultancy arrangements.
          </p>
          <Link to="/faculty/collaborations" className="btn btn-outline btn-sm">
            Manage Collaborations <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </PortalLayout>
  );
}
