import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import {
  Award,
  Briefcase,
  GraduationCap,
  FileCheck,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    assessed_skills_count: 0,
    average_assessment_score: 0.0,
    applications_submitted: 0,
    applications_shortlisted: 0,
    active_internships: 0,
    completed_internships: 0,
    verified_documents_count: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/student')
      .then((data) => setMetrics(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout title="Student Dashboard" allowedRoles={['student']}>
      {/* Welcome Banner */}
      <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderLeft: '4px solid #3B5BDB' }}>
        <h2 style={{ fontSize: '18px', color: '#1E2A44', marginBottom: '6px' }}>
          Welcome back, {user?.profile?.full_name || user?.username}!
        </h2>
        <p className="text-muted" style={{ fontSize: '13.5px' }}>
          Affiliation: {user?.profile?.institution_name || 'Academic Institution'} • Course: {user?.profile?.course || 'General'} (Year {user?.profile?.year_of_study || 1})
        </p>
      </div>

      {/* Real-time Dynamic Database Metric Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Award size={22} />
          </div>
          <div>
            <div className="stat-value">{metrics.assessed_skills_count}</div>
            <div className="stat-label">Assessed Skills</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-value">{metrics.average_assessment_score}%</div>
            <div className="stat-label">Avg Assessment Score</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Briefcase size={22} />
          </div>
          <div>
            <div className="stat-value">{metrics.applications_submitted}</div>
            <div className="stat-label">Submitted Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <FileCheck size={22} />
          </div>
          <div>
            <div className="stat-value">{metrics.applications_shortlisted}</div>
            <div className="stat-label">Shortlisted / Selected</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="stat-value">{metrics.active_internships}</div>
            <div className="stat-label">Active Internships</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="stat-value">{metrics.verified_documents_count}</div>
            <div className="stat-label">Verified Documents</div>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Skill Assessment & Profiling</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px', lineHeight: '1.6' }}>
            Verify your competencies through timed domain tests to unlock validated proficiency badges and increase your candidate match score.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/student/assessments" className="btn btn-secondary btn-sm">
              Take Assessments <ArrowRight size={14} />
            </Link>
            <Link to="/student/skills" className="btn btn-outline btn-sm">
              My Skill Profile
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Career Guidance & Gap Analysis</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px', lineHeight: '1.6' }}>
            Benchmark your current skills against industry career roles to discover missing competencies and receive tailored course recommendations.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/student/gap-analysis" className="btn btn-secondary btn-sm">
              Analyze Skill Gaps <Compass size={14} />
            </Link>
            <Link to="/student/opportunities" className="btn btn-outline btn-sm">
              Explore Openings
            </Link>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
