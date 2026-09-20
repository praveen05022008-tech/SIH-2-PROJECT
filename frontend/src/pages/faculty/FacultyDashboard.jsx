import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Award, Briefcase, Building2, FileCheck, ArrowRight } from 'lucide-react';

export function FacultyDashboard() {
  const { user } = useAuth();
  const [oppCount, setOppCount] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [collabCount, setCollabCount] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/opportunities?type=faculty_internship').catch(() => []),
      api.get('/applications').catch(() => []),
      api.get('/collaborations').catch(() => []),
    ]).then(([opps, apps, collabs]) => {
      setOppCount(opps.length);
      setAppCount(apps.length);
      setCollabCount(collabs.length);
    });
  }, []);

  return (
    <PortalLayout title="Faculty & Academician Dashboard" allowedRoles={['faculty']}>
      <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderLeft: '4px solid #3B5BDB' }}>
        <h2 style={{ fontSize: '18px', color: '#1E2A44', marginBottom: '6px' }}>
          Welcome, {user?.profile?.full_name || user?.username}
        </h2>
        <p className="text-muted" style={{ fontSize: '13.5px' }}>
          Designation: {user?.profile?.designation || 'Faculty Member'} • Affiliation: {user?.profile?.institution_name || 'Academic Institution'}
        </p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper"><Briefcase size={22} /></div>
          <div>
            <div className="stat-value">{oppCount}</div>
            <div className="stat-label">Faculty Opportunities</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper"><FileCheck size={22} /></div>
          <div>
            <div className="stat-value">{appCount}</div>
            <div className="stat-label">My Applications</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper"><Building2 size={22} /></div>
          <div>
            <div className="stat-value">{collabCount}</div>
            <div className="stat-label">Joint Collaborations</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Industrial Training & FDPs</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px', lineHeight: '1.6' }}>
            Explore industry sabbatical opportunities, Faculty Development Programs, and corporate training partnerships.
          </p>
          <Link to="/faculty/opportunities" className="btn btn-secondary btn-sm">
            Explore Opportunities <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Research & Consultancy Proposals</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px', lineHeight: '1.6' }}>
            Initiate and coordinate joint academia-industry research projects, clinical trials, and technical consultancy.
          </p>
          <Link to="/faculty/collaborations" className="btn btn-primary btn-sm">
            Manage Collaborations <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </PortalLayout>
  );
}
