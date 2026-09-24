import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Clock,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  Briefcase,
  Layers,
  ArrowRight,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Target,
  GraduationCap
} from 'lucide-react';

export function IndustryAnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (selectedOpportunityId) params.append('opportunity_id', selectedOpportunityId);

      const endpoint = `/analytics/industry?${params.toString()}`;
      const res = await api.get(endpoint);
      setData(res);
    } catch (err) {
      console.error('Failed to load industry analytics:', err);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period, selectedOpportunityId]);

  const handleExportCSV = () => {
    if (!data) return;

    const rows = [
      ['AIC PORTAL - INDUSTRY RECRUITMENT & TALENT ANALYTICS REPORT'],
      ['Generated On', new Date().toLocaleString()],
      ['Company Name', data.company_name || user?.organization_name || 'Organization'],
      ['Reporting Period', period.toUpperCase()],
      [''],
      ['EXECUTIVE RECRUITMENT KPIs'],
      ['Metric', 'Value'],
      ['Active Postings', data.active_opportunities || 0],
      ['Applications Received', data.applications_received || 0],
      ['Shortlisted Candidates', data.shortlisted_candidates || 0],
      ['Selected / Hired Candidates', data.selected_candidates || 0],
      ['Placement / Conversion Rate (%)', `${data.placement_rate || 0}%`],
      ['Average Time to Hire (Days)', `${data.average_time_to_hire_days || 0} days`],
      ['Average Candidate Match Quality', `${data.average_match_score || 0}%`],
      ['Active Interns Managed', data.active_interns || 0],
      [''],
      ['RECRUITMENT CONVERSION FUNNEL'],
      ['Stage Name', 'Candidate Count', 'Funnel Retention %', 'Drop-Off %'],
      ...(data.recruitment_funnel || []).map((f) => [
        f.stage_name,
        f.count,
        `${f.percentage}%`,
        `${f.drop_off_pct}%`
      ]),
      [''],
      ['HIRING PIPELINE DISTRIBUTION'],
      ['Stage Status', 'Stage Label', 'Candidate Count'],
      ...(data.pipeline_distribution || []).map((p) => [
        p.status,
        p.label,
        p.count
      ]),
      [''],
      ['SKILL DEMAND VS TALENT SUPPLY GAP MATRIX'],
      ['Skill', 'Required Postings Count', 'Applicant Supply Volume', 'Coverage %', 'Demand Tier', 'Gap Assessment'],
      ...(data.skill_demand_trends || []).map((s) => [
        s.skill,
        s.postings_count,
        s.applicant_supply_count,
        `${s.coverage_pct}%`,
        s.demand_level,
        s.gap_status
      ]),
      [''],
      ['INSTITUTIONAL TALENT SOURCING PERFORMANCE'],
      ['Institution / College Name', 'Applicants', 'Shortlisted', 'Selections', 'Conversion Rate %', 'Average CGPA'],
      ...(data.institution_sourcing || []).map((inst) => [
        inst.institution_name,
        inst.applicant_count,
        inst.shortlisted_count,
        inst.selected_count,
        `${inst.conversion_rate}%`,
        inst.avg_cgpa
      ]),
      [''],
      ['OPPORTUNITIES BREAKDOWN'],
      ['Opportunity ID', 'Title', 'Type', 'Status', 'Openings', 'Applications', 'Hired'],
      ...(data.opportunities_breakdown || []).map((o) => [
        o.id,
        `"${o.title.replace(/"/g, '""')}"`,
        o.type,
        o.status,
        o.openings || 0,
        o.applications_count || 0,
        o.hired_count || 0
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Industry_Recruitment_Report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PortalLayout title="Industry Analytics & Intelligence" allowedRoles={['industry', 'admin']}>
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
                  <Sparkles size={12} /> Executive Talent Intelligence
                </span>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                  {data?.company_name || user?.organization_name || 'Enterprise Recruiter'}
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.4px', color: '#F8FAFC' }}>
                Recruitment Outcomes & Skill Trend Dashboards
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#CBD5E1' }}>
                Monitor hiring pipelines, applicant conversion funnels, feeder institution quality, and skill demand gaps in real-time.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => fetchAnalytics(true)}
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
                <span>Export CSV Report</span>
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
            {/* Period Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12.5px', color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={14} /> Time Horizon:
              </span>
              {[
                { label: 'Past 7 Days', value: '7d' },
                { label: 'Past 30 Days', value: '30d' },
                { label: 'Past 90 Days', value: '90d' },
                { label: 'All Time History', value: 'all' }
              ].map((p) => {
                const active = period === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
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

            {/* Opportunity Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Briefcase size={14} /> Opportunity:
              </span>
              <select
                value={selectedOpportunityId}
                onChange={(e) => setSelectedOpportunityId(e.target.value)}
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
                  maxWidth: '260px'
                }}
              >
                <option value="" style={{ background: '#1E293B', color: '#FFFFFF' }}>All Active & Closed Roles</option>
                {(data?.opportunities_breakdown || []).map((opp) => (
                  <option key={opp.id} value={opp.id} style={{ background: '#1E293B', color: '#FFFFFF' }}>
                    {opp.title} ({opp.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner message="Calculating recruitment pipeline metrics & intelligence..." />
          </div>
        ) : (
          <>
            {/* ─── Executive KPI Stat Cards (6 Grid Cards) ─── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px'
              }}
            >
              {/* Card 1: Applications Received */}
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
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Total Applicants</span>
                  <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {data?.applications_received || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={13} color="#10B981" />
                  <span style={{ color: '#10B981', fontWeight: 600 }}>Active Inflow</span> across postings
                </div>
              </div>

              {/* Card 2: Shortlisted Candidates */}
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
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Shortlisted</span>
                  <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {data?.shortlisted_candidates || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  <span style={{ fontWeight: 700, color: '#7C3AED' }}>
                    {data?.applications_received > 0 ? Math.round((data.shortlisted_candidates / data.applications_received) * 100) : 0}%
                  </span> screening pass rate
                </div>
              </div>

              {/* Card 3: Placed / Hired Candidates */}
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
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Selections & Hires</span>
                  <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {data?.selected_candidates || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  <span style={{ fontWeight: 700, color: '#059669' }}>{data?.placement_rate || 0}%</span> overall placement rate
                </div>
              </div>

              {/* Card 4: Avg Time to Hire */}
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
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Avg Time-to-Hire</span>
                  <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {data?.average_time_to_hire_days || 14.2} <span style={{ fontSize: '15px', fontWeight: 500, color: '#64748B' }}>days</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  From applied to final offer
                </div>
              </div>

              {/* Card 5: AI Candidate Match Quality */}
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
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Match Compatibility</span>
                  <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {data?.average_match_score || 0}%
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Mean profile-to-role match
                </div>
              </div>

              {/* Card 6: Feeder Academic Institutions */}
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
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Feeder Colleges</span>
                  <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {data?.institution_sourcing?.length || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Campuses supplying talent
                </div>
              </div>
            </div>

            {/* ─── 2-Column Section: Conversion Funnel & Pipeline Distribution ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>

              {/* Left Box: Recruitment Conversion Funnel */}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart3 size={18} color="#2563EB" /> Recruitment Conversion Funnel
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                      Progression and stage-by-stage drop-off tracking from initial application to offer
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#2563EB',
                      backgroundColor: '#EFF6FF',
                      padding: '4px 10px',
                      borderRadius: '12px'
                    }}
                  >
                    {data?.applications_received || 0} Total Applied
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
                  {(data?.recruitment_funnel || []).map((stage, idx) => {
                    const widthPct = Math.max(stage.percentage > 0 ? 8 : 0, stage.percentage);
                    const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#10B981'];
                    const barColor = colors[idx % colors.length];

                    return (
                      <div key={stage.stage_key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: '#F1F5F9',
                                color: '#475569',
                                fontSize: '11px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {idx + 1}
                            </span>
                            {stage.stage_name}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, color: '#0F172A' }}>{stage.count} candidates</span>
                            <span
                              style={{
                                fontSize: '11.5px',
                                fontWeight: 700,
                                color: barColor,
                                backgroundColor: `${barColor}15`,
                                padding: '2px 8px',
                                borderRadius: '6px'
                              }}
                            >
                              {stage.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '9px', backgroundColor: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${widthPct}%`,
                              height: '100%',
                              backgroundColor: barColor,
                              borderRadius: '5px',
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>

                        {idx < (data.recruitment_funnel.length - 1) && stage.drop_off_pct > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '11px', color: '#94A3B8' }}>
                            <span>Stage Drop-off: <strong style={{ color: '#EF4444' }}>-{stage.drop_off_pct}%</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Box: Live Hiring Pipeline Distribution */}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={18} color="#7C3AED" /> Hiring Pipeline Stage Distribution
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                      Candidate breakdown by active status across the recruitment workflow
                    </p>
                  </div>
                </div>

                {/* Status List with Visual Indicators */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  {(data?.pipeline_distribution || []).map((stage) => {
                    const total = data.applications_received || 1;
                    const pctVal = data.applications_received > 0 ? Math.round((stage.count / total) * 100) : 0;

                    return (
                      <div
                        key={stage.status}
                        style={{
                          backgroundColor: '#F8FAFC',
                          borderRadius: '12px',
                          padding: '14px',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: stage.color || '#3B82F6',
                              flexShrink: 0
                            }}
                          />
                          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>
                            {stage.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
                          <span style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
                            {stage.count}
                          </span>
                          <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B' }}>
                            {pctVal}% share
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Opportunities Breakdown Quick Table */}
                <div style={{ marginTop: '10px' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#1E293B', marginBottom: '10px' }}>
                    Active Postings Performance
                  </h4>
                  <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                          <th style={{ padding: '8px 12px', fontWeight: 600 }}>Title</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600 }}>Type</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>Openings</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>Applicants</th>
                          <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>Hired</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data?.opportunities_breakdown || []).length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>
                              No postings found. Create job or internship postings to track recruitment metrics.
                            </td>
                          </tr>
                        ) : (
                          (data?.opportunities_breakdown || []).slice(0, 4).map((opp, i) => (
                            <tr key={opp.id || i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '9px 12px', fontWeight: 600, color: '#0F172A' }}>{opp.title}</td>
                              <td style={{ padding: '9px 12px', color: '#64748B', textTransform: 'capitalize' }}>{opp.type}</td>
                              <td style={{ padding: '9px 12px', textAlign: 'center', color: '#334155' }}>{opp.openings || 1}</td>
                              <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#2563EB' }}>{opp.applications_count || 0}</td>
                              <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>{opp.hired_count || 0}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Skill Demand vs Talent Supply Gap Matrix ─── */}
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
                    <Target size={18} color="#D97706" /> Skill Demand & Talent Supply Gap Intelligence
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Compare your required role competencies against candidate talent pool supply to detect talent deficit skills
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669', fontWeight: 600 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#059669' }} /> Surplus Talent
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#D97706', fontWeight: 600 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#D97706' }} /> Balanced Supply
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#DC2626', fontWeight: 600 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#DC2626' }} /> Talent Deficit
                  </span>
                </div>
              </div>

              {/* Skill Matrix Grid */}
              {(data?.skill_demand_trends || []).length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                  No skill demand data recorded yet. Skill requirements defined in your active postings will appear here.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px'
                  }}
                >
                  {(data?.skill_demand_trends || []).map((item) => {
                    let badgeBg = '#ECFDF5';
                    let badgeColor = '#059669';
                    let barColor = '#10B981';

                    if (item.gap_status === 'Talent Deficit') {
                      badgeBg = '#FEF2F2';
                      badgeColor = '#DC2626';
                      barColor = '#EF4444';
                    } else if (item.gap_status === 'Balanced Supply') {
                      badgeBg = '#FFFBEB';
                      badgeColor = '#D97706';
                      barColor = '#F59E0B';
                    }

                    return (
                      <div
                        key={item.skill}
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
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                            {item.skill}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: badgeBg,
                              color: badgeColor,
                              padding: '3px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            {item.gap_status}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                          <span>Postings Demand: <strong>{item.postings_count} roles</strong></span>
                          <span>Applicant Pool: <strong>{item.applicant_supply_count} profiles</strong></span>
                        </div>

                        {/* Coverage Bar */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                            <span>Talent Availability Ratio</span>
                            <span style={{ fontWeight: 700, color: barColor }}>{item.coverage_pct}%</span>
                          </div>
                          <div style={{ width: '100%', height: '7px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, item.coverage_pct)}%`,
                                height: '100%',
                                backgroundColor: barColor,
                                borderRadius: '4px',
                                transition: 'width 0.4s ease'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ─── Institutional Talent Sourcing Performance Table ─── */}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'gap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={18} color="#2563EB" /> Institutional Talent Sourcing Intelligence
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Evaluate feeder universities and engineering colleges based on candidate conversion rate, volume, and academic CGPA
                  </p>
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Institution Name</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Total Applicants</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Shortlisted</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Selections / Hired</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Conversion Rate</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Average CGPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.institution_sourcing || []).length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                          No institutional candidate sourcing data found yet. Applicants from partner institutions will populate here.
                        </td>
                      </tr>
                    ) : (
                      (data?.institution_sourcing || []).map((inst, index) => (
                        <tr
                          key={inst.institution_name || index}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                          }}
                        >
                          <td style={{ padding: '13px 16px', fontWeight: 600, color: '#0F172A' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '6px',
                                  backgroundColor: '#EFF6FF',
                                  color: '#2563EB',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                <GraduationCap size={15} />
                              </div>
                              <span>{inst.institution_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                            {inst.applicant_count}
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center', fontWeight: 600, color: '#7C3AED' }}>
                            {inst.shortlisted_count}
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>
                            {inst.selected_count}
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                            <span
                              style={{
                                backgroundColor: inst.conversion_rate >= 25 ? '#ECFDF5' : '#EFF6FF',
                                color: inst.conversion_rate >= 25 ? '#059669' : '#2563EB',
                                fontWeight: 700,
                                fontSize: '12px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                display: 'inline-block'
                              }}
                            >
                              {inst.conversion_rate}%
                            </span>
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center', fontWeight: 700, color: '#0F172A' }}>
                            {inst.avg_cgpa} / 10.0
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ─── Bottom Application Velocity Time Trend ─── */}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="#059669" /> Application Velocity & Hiring Trends Over Time
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Weekly candidate inflow cadence and successful placements timeline
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px'
                }}
              >
                {(data?.applications_time_trend || []).map((trend, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      padding: '14px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                      {trend.period_label}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                      {trend.date_range}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Applied</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563EB' }}>
                          {trend.applications_count}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Hired</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                          {trend.hires_count}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
