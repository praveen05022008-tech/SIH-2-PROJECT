import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  GraduationCap,
  Briefcase,
  Users,
  Award,
  TrendingUp,
  BarChart3,
  Building2,
  Download,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  ChevronDown,
  Layers,
  Sparkles,
  FolderGit2
} from 'lucide-react';

export function InstitutionPlacementsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [period, setPeriod] = useState('30d');

  const fetchInstitutionAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (selectedDept) params.append('department_id', selectedDept);
      if (selectedYear) params.append('graduation_year', selectedYear);
      if (period) params.append('period', period);

      const endpoint = `/analytics/institution?${params.toString()}`;
      const res = await api.get(endpoint);
      setData(res);
    } catch (err) {
      console.error('Failed to load institution analytics:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInstitutionAnalytics();
  }, [selectedDept, selectedYear, period]);

  const handleExportCSV = () => {
    if (!data) return;

    const rows = [
      ['AIC PORTAL - INSTITUTIONAL PLACEMENT & READINESS INTELLIGENCE REPORT'],
      ['Generated On', new Date().toLocaleString()],
      ['Institution Name', data.institution_name || user?.organization_name || 'Academic Institution'],
      ['Reporting Filter', `Dept: ${selectedDept || 'All'}, Year: ${selectedYear || 'All'}, Period: ${period}`],
      [''],
      ['EXECUTIVE INSTITUTIONAL METRICS'],
      ['Metric', 'Value'],
      ['Total Enrolled Students', data.total_students || 0],
      ['Total Eligible Candidates', data.total_eligible_students || 0],
      ['Students Placed / Hired', data.students_placed || 0],
      ['Overall Placement Rate (%)', `${data.placement_rate || 0}%`],
      ['Mean Placement Readiness Score', `${data.average_readiness_score || 0}%`],
      ['Active Internships Tracked', data.active_internships || 0],
      ['Industry Collaborations', data.collaboration_count || 0],
      [''],
      ['STUDENT PLACEMENT READINESS TIERS'],
      ['Tier Name', 'Student Count', 'Cohort Share %'],
      ...(data.readiness_distribution || []).map((t) => [
        t.tier,
        t.count,
        `${t.percentage}%`
      ]),
      [''],
      ['DEPARTMENT-WISE PLACEMENT METRICS'],
      ['Department Name', 'Total Students', 'Placed Count', 'Placement Rate %', 'Average CGPA', 'Mean Readiness %'],
      ...(data.department_metrics || []).map((d) => [
        d.department_name,
        d.total_students,
        d.placed_count,
        `${d.placement_rate}%`,
        d.avg_cgpa,
        `${d.avg_readiness}%`
      ]),
      [''],
      ['IN-DEMAND RECRUITER SKILLS VS CURRICULUM COVERAGE'],
      ['Skill Competency', 'Corporate Demand Postings', 'Student Talent Coverage %', 'Curriculum Status'],
      ...(data.in_demand_skills || []).map((s) => [
        s.skill,
        s.industry_demand_count,
        `${s.student_coverage_pct}%`,
        s.status
      ]),
      [''],
      ['STUDENT PLACEMENT & INTERNSHIP PARTICIPATION RECORDS'],
      ['Student Name', 'Department', 'Opportunity Title', 'Company Name', 'Type', 'CGPA', 'Status', 'Date'],
      ...(data.placement_records || []).map((p) => [
        `"${p.student_name}"`,
        `"${p.department}"`,
        `"${p.opportunity_title}"`,
        `"${p.company_name}"`,
        p.type,
        p.cgpa,
        p.status,
        p.applied_date
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Institution_Placement_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PortalLayout title="Institutional Analytics & Placement Readiness" allowedRoles={['institution', 'admin']}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>

        {/* Top Control Bar & Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            borderRadius: '16px',
            padding: '24px 28px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(96, 165, 250, 0.4)',
                    color: '#93C5FD',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Sparkles size={12} /> Institutional Talent Intelligence
                </span>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                  {data?.institution_name || user?.organization_name || 'Academic Institution'}
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.4px', color: '#F8FAFC' }}>
                Institutional Analytics & Placement Readiness Dashboard
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#CBD5E1' }}>
                Monitor student skill growth, department-wise placement statistics, readiness distribution, and industry demand alignment.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => fetchInstitutionAnalytics(true)}
                disabled={refreshing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  padding: '9px 15px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s'
                }}
              >
                <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={!data || loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#2563EB',
                  border: '1px solid #1D4ED8',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: !data || loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                  transition: 'background-color 0.15s'
                }}
              >
                <Download size={15} />
                <span>Export Placement CSV</span>
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Department Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Building2 size={14} /> Department:
              </span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '240px'
                }}
              >
                <option value="" style={{ background: '#1E293B', color: '#FFFFFF' }}>All Departments</option>
                {(data?.department_breakdown || []).map((d, i) => (
                  <option key={i} value={d.department_id || i + 1} style={{ background: '#1E293B', color: '#FFFFFF' }}>
                    {d.department_name} ({d.student_count} students)
                  </option>
                ))}
              </select>
            </div>

            {/* Graduation Year Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <GraduationCap size={14} /> Batch:
              </span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="" style={{ background: '#1E293B', color: '#FFFFFF' }}>All Batches</option>
                <option value="2026" style={{ background: '#1E293B', color: '#FFFFFF' }}>Class of 2026 (Final Year)</option>
                <option value="2027" style={{ background: '#1E293B', color: '#FFFFFF' }}>Class of 2027 (Pre-Final)</option>
                <option value="2028" style={{ background: '#1E293B', color: '#FFFFFF' }}>Class of 2028</option>
              </select>
            </div>

            {/* Time Period Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {[
                { label: '30 Days', value: '30d' },
                { label: '90 Days', value: '90d' },
                { label: 'Academic Year', value: 'all' }
              ].map((p) => {
                const active = period === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: active ? 700 : 500,
                      backgroundColor: active ? '#3B82F6' : 'rgba(255, 255, 255, 0.06)',
                      color: active ? '#FFFFFF' : '#CBD5E1',
                      border: active ? '1px solid #60A5FA' : '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner message="Calculating institutional placement readiness & analytics..." />
          </div>
        ) : (
          <>
            {/* ─── Executive Summary KPI Cards (6 Grid Cards) ─── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px'
              }}
            >
              {/* Card 1: Total Enrolled Students */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '20px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Student Cohort</span>
                  <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {data?.total_students || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  <strong style={{ color: '#2563EB' }}>{data?.total_eligible_students || 0}</strong> eligible for placements
                </div>
              </div>

              {/* Card 2: Students Placed / Hired */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '20px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Students Placed</span>
                  <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {data?.students_placed || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Across verified industry postings
                </div>
              </div>

              {/* Card 3: Placement Rate % */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '20px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Placement Rate</span>
                  <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {data?.placement_rate || 0}%
                </div>
                <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
                  Of eligible cohort placed
                </div>
              </div>

              {/* Card 4: Placement Readiness Score */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '20px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Readiness Index</span>
                  <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {data?.average_readiness_score || 0}%
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Mean cohort readiness score
                </div>
              </div>

              {/* Card 5: Active Internships */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '20px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Active Internships</span>
                  <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraduationCap size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {data?.active_internships || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Students undergoing industrial training
                </div>
              </div>

              {/* Card 6: Corporate Collaborations */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '20px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Industry Partners</span>
                  <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {data?.collaboration_count || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Active MoUs & recruiter linkages
                </div>
              </div>
            </div>

            {/* ─── 2-Column Section: Readiness Tiers & Top Recruiters ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>

              {/* Left Box: Student Placement Readiness Tiers */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={18} color="#2563EB" /> Student Placement Readiness Distribution
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Cohort segmentation based on assessment scores, verified skills, and academic CGPA
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {(data?.readiness_distribution || []).map((tier, idx) => (
                    <div
                      key={tier.tier_key || idx}
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: tier.color }} />
                          {tier.tier}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>{tier.count} students</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: tier.color, backgroundColor: `${tier.color}15`, padding: '2px 8px', borderRadius: '6px' }}>
                            {tier.percentage}%
                          </span>
                        </div>
                      </div>

                      <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, tier.percentage)}%`,
                            height: '100%',
                            backgroundColor: tier.color,
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Box: Top Hiring Corporate Partners */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={18} color="#059669" /> Top Recruiting Corporate Partners
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Industries hiring the largest volumes from your campus cohorts
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(data?.top_hiring_companies || []).length === 0 ? (
                    <div style={{ padding: '28px', textAlign: 'center', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                      No corporate selections recorded yet for this cohort filter.
                    </div>
                  ) : (
                    (data?.top_hiring_companies || []).map((comp, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#F8FAFC',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px'
                            }}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                              {comp.company_name}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                              {comp.domain} • Avg: {comp.avg_package}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '3px 10px', borderRadius: '6px' }}>
                            {comp.hires_count} Placements
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ─── Department-Wise Placement & Readiness Comparison Matrix ─── */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={18} color="#2563EB" /> Department Placement & Readiness Comparison Matrix
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                  Cross-departmental performance analysis of student placement rates, academic averages, and mean skill readiness
                </p>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Department Name</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Total Enrolled</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Placed Count</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Placement Rate</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Average CGPA</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Mean Readiness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.department_metrics || []).length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                          No department metrics recorded for this institution yet.
                        </td>
                      </tr>
                    ) : (
                      (data?.department_metrics || []).map((dept, index) => (
                        <tr
                          key={dept.department_id || index}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                          }}
                        >
                          <td style={{ padding: '13px 16px', fontWeight: 600, color: '#0F172A' }}>
                            {dept.department_name}
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                            {dept.total_students}
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>
                            {dept.placed_count}
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                            <span
                              style={{
                                backgroundColor: dept.placement_rate >= 70 ? '#ECFDF5' : '#EFF6FF',
                                color: dept.placement_rate >= 70 ? '#059669' : '#2563EB',
                                fontWeight: 700,
                                fontSize: '12px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                display: 'inline-block'
                              }}
                            >
                              {dept.placement_rate}%
                            </span>
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center', fontWeight: 700, color: '#0F172A' }}>
                            {dept.avg_cgpa} / 10.0
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center', fontWeight: 700, color: '#7C3AED' }}>
                            {dept.avg_readiness}%
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ─── In-Demand Recruiter Skills vs. Institutional Curriculum Coverage ─── */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="#D97706" /> In-Demand Recruiter Skills vs. Student Curriculum Coverage
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Identify high-priority industry requirements and curricula skill gaps to tailor student bridge training
                  </p>
                </div>
              </div>

              {(data?.in_demand_skills || []).length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                  No industry skill demand records found. Active industry job requirements will appear here.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '14px'
                  }}
                >
                  {(data?.in_demand_skills || []).map((item, idx) => {
                    let badgeBg = '#ECFDF5';
                    let badgeColor = '#059669';
                    let barColor = '#10B981';

                    if (item.status === 'High Deficit') {
                      badgeBg = '#FEF2F2';
                      badgeColor = '#DC2626';
                      barColor = '#EF4444';
                    } else if (item.status === 'Curriculum Gap') {
                      badgeBg = '#FFFBEB';
                      badgeColor = '#D97706';
                      barColor = '#F59E0B';
                    }

                    return (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#F8FAFC',
                          borderRadius: '12px',
                          padding: '16px',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                            {item.skill}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: badgeBg, color: badgeColor, padding: '3px 8px', borderRadius: '6px' }}>
                            {item.status}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                          <span>Demand in Postings: <strong>{item.industry_demand_count} roles</strong></span>
                          <span>Student Coverage: <strong>{item.student_coverage_pct}%</strong></span>
                        </div>

                        <div style={{ width: '100%', height: '7px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(100, item.student_coverage_pct)}%`,
                              height: '100%',
                              backgroundColor: barColor,
                              borderRadius: '4px',
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ─── Institutional Student Placements & Internships Live Records Table ─── */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={18} color="#2563EB" /> Live Student Placement & Internship Records
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Verified student candidate hiring and internship participation records across partner industries
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '12px' }}>
                  {data?.placement_records?.length || 0} Confirmed Selections
                </span>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Student Candidate</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Department</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Opportunity Role</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Industry Partner</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Type</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Portfolio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.placement_records || []).length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                          No confirmed student selections or placements found for this filter criteria.
                        </td>
                      </tr>
                    ) : (
                      (data?.placement_records || []).map((record, index) => (
                        <tr
                          key={record.student_id || index}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                          }}
                        >
                          <td style={{ padding: '13px 16px', fontWeight: 600, color: '#0F172A' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                                {record.student_name.slice(0, 1)}
                              </div>
                              <span>{record.student_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '13px 16px', color: '#475569' }}>
                            {record.department}
                          </td>
                          <td style={{ padding: '13px 16px', fontWeight: 600, color: '#1E293B' }}>
                            {record.opportunity_title}
                          </td>
                          <td style={{ padding: '13px 16px', color: '#0F172A', fontWeight: 600 }}>
                            {record.company_name}
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center', textTransform: 'capitalize', color: '#64748B' }}>
                            {record.type}
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                            <span style={{ backgroundColor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px' }}>
                              {record.status}
                            </span>
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
                            {record.applied_date}
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                            <a
                              href={`/portfolio/${record.student_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', padding: '4px 10px', color: '#2563EB', borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }}
                              title="View Verified Student Digital Portfolio"
                            >
                              <FolderGit2 size={12} /> View Portfolio
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
