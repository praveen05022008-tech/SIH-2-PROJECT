import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Building2,
  Calendar,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  Award,
  GraduationCap,
  X
} from 'lucide-react';

export function IndustryOpportunitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit Modal State
  const [editingOpp, setEditingOpp] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [skillsList, setSkillsList] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currSkillId, setCurrSkillId] = useState('');
  const [currLevel, setCurrLevel] = useState('intermediate');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal State
  const [deletingOpp, setDeletingOpp] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Notification / Feedback State
  const [toastMsg, setToastMsg] = useState({ type: '', text: '' });

  const showToast = (type, text) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg({ type: '', text: '' }), 4000);
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await api.get('/opportunities?my_only=true');
      setOpportunities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
      showToast('error', 'Failed to fetch posted opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    api.get('/skills')
      .then((data) => setSkillsList(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleOpenEdit = (opp) => {
    setEditingOpp(opp);
    setEditFormData({
      title: opp.title || '',
      company_name: opp.company_name || '',
      type: opp.type || 'internship',
      description: opp.description || '',
      responsibilities: opp.responsibilities || '',
      required_qualifications: opp.required_qualifications || '',
      eligibility_cgpa: opp.eligibility_cgpa ?? 6.0,
      eligibility_year: opp.eligibility_year ?? 3,
      min_experience_years: opp.min_experience_years ?? 2,
      academic_qualification: opp.academic_qualification || 'Ph.D / Post-Graduate',
      target_departments: opp.target_departments || '',
      location: opp.location || '',
      work_mode: opp.work_mode || 'remote',
      duration: opp.duration || '',
      stipend_salary: opp.stipend_salary || '',
      openings_count: opp.openings_count || 1,
      deadline: opp.deadline ? opp.deadline.split('T')[0] : '',
      status: opp.status || 'open'
    });
    setSelectedSkills(
      (opp.skills || []).map((s) => ({
        skill_id: s.skill_id,
        skill_name: s.skill_name || `Skill #${s.skill_id}`,
        minimum_level: s.minimum_level || 'intermediate',
        is_mandatory: s.is_mandatory ?? true
      }))
    );
  };

  const handleAddSkillToEdit = () => {
    if (!currSkillId) return;
    const skillObj = skillsList.find((s) => s.id === parseInt(currSkillId));
    if (!skillObj) return;

    if (selectedSkills.some((s) => s.skill_id === skillObj.id)) return;

    setSelectedSkills([
      ...selectedSkills,
      {
        skill_id: skillObj.id,
        skill_name: skillObj.name,
        minimum_level: currLevel,
        is_mandatory: true
      }
    ]);
    setCurrSkillId('');
  };

  const handleRemoveSkillFromEdit = (skillId) => {
    setSelectedSkills(selectedSkills.filter((s) => s.skill_id !== skillId));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingOpp) return;

    setSavingEdit(true);
    const isFacultyOffering = ['faculty_internship', 'industrial_training'].includes(editFormData.type);

    const payload = {
      ...editFormData,
      eligibility_cgpa: isFacultyOffering ? 0 : (parseFloat(editFormData.eligibility_cgpa) || 0),
      eligibility_year: isFacultyOffering ? null : (parseInt(editFormData.eligibility_year) || null),
      min_experience_years: isFacultyOffering ? (parseInt(editFormData.min_experience_years) || 0) : null,
      target_departments: isFacultyOffering ? editFormData.target_departments : null,
      academic_qualification: isFacultyOffering ? editFormData.academic_qualification : null,
      openings_count: parseInt(editFormData.openings_count) || 1,
      deadline: editFormData.deadline ? new Date(editFormData.deadline).toISOString() : null,
      skills: selectedSkills.map((s) => ({
        skill_id: s.skill_id,
        minimum_level: s.minimum_level,
        is_mandatory: s.is_mandatory
      }))
    };

    try {
      const updated = await api.put(`/opportunities/${editingOpp.id}`, payload);
      setOpportunities((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
      );
      setEditingOpp(null);
      showToast('success', 'Opportunity updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      showToast('error', err.message || 'Failed to update opportunity.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (opp) => {
    const nextStatus = opp.status === 'open' ? 'closed' : 'open';
    try {
      const updated = await api.put(`/opportunities/${opp.id}`, { status: nextStatus });
      setOpportunities((prev) =>
        prev.map((item) => (item.id === opp.id ? { ...item, status: nextStatus } : item))
      );
      showToast('success', `Posting status changed to ${nextStatus.toUpperCase()}`);
    } catch (err) {
      showToast('error', err.message || 'Failed to change status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOpp) return;
    setDeleting(true);
    try {
      await api.delete(`/opportunities/${deletingOpp.id}`);
      setOpportunities((prev) => prev.filter((item) => item.id !== deletingOpp.id));
      showToast('success', 'Opportunity deleted successfully.');
      setDeletingOpp(null);
    } catch (err) {
      showToast('error', err.message || 'Failed to delete opportunity.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered list
  const filteredOpportunities = opportunities.filter((opp) => {
    const matchSearch =
      (opp.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opp.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opp.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = typeFilter === 'all' || opp.type === typeFilter;
    const matchStatus = statusFilter === 'all' || opp.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  const totalPostings = opportunities.length;
  const activePostings = opportunities.filter((o) => o.status === 'open').length;
  const totalApplications = opportunities.reduce((acc, o) => acc + (o.applications_count || 0), 0);
  const totalOpenings = opportunities.reduce((acc, o) => acc + (o.openings_count || 1), 0);

  const inputStyle = {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    fontSize: '13.5px',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s'
  };

  const textareaStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    fontSize: '13.5px',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'border-color 0.15s, box-shadow 0.15s'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '6px'
  };

  return (
    <PortalLayout title="Manage Opportunities & Job Postings" allowedRoles={['industry', 'admin']}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '40px' }}>

        {/* ─── Feedback Toast Notification ─── */}
        {toastMsg.text && (
          <div
            style={{
              padding: '14px 20px',
              borderRadius: '10px',
              backgroundColor: toastMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: toastMsg.type === 'success' ? '#065F46' : '#991B1B',
              border: `1px solid ${toastMsg.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
              fontSize: '13.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {toastMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{toastMsg.text}</span>
            </div>
            <button
              onClick={() => setToastMsg({ type: '', text: '' })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ─── Top Hero Banner Card ─── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            borderRadius: '16px',
            padding: '26px 30px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '18px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}
              >
                Recruitment Management
              </span>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                Corporate Portal
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
              Manage Posted Opportunities & Internship Programs
            </h2>
            <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: 0, maxWidth: '650px', lineHeight: 1.5 }}>
              Review, edit parameters, toggle status, and inspect incoming applications for all your active student and faculty postings.
            </p>
          </div>

          <Link
            to="/industry/post-opportunity"
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              padding: '12px 22px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'background-color 0.15s'
            }}
          >
            <Plus size={18} /> Post New Opportunity
          </Link>
        </div>

        {/* ─── 4 Metric Cards Row ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Total Opportunities</span>
              <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={18} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {totalPostings}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>All created openings</div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Active / Open</span>
              <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {activePostings}
            </div>
            <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>Currently accepting applicants</div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Applications Received</span>
              <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {totalApplications}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Candidate submissions</div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Available Positions</span>
              <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={18} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {totalOpenings}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Total target headcount</div>
          </div>
        </div>

        {/* ─── Search and Filter Toolbar ─── */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '400px' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search title, role, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                paddingLeft: '38px',
                paddingRight: '12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Types</option>
                <option value="internship">Student Internship</option>
                <option value="job">Full-Time Job</option>
                <option value="apprenticeship">Apprenticeship</option>
                <option value="live_project">Live Industry Project</option>
                <option value="faculty_internship">Faculty Internship / Sabbatical</option>
                <option value="industrial_training">Faculty Industrial Training</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open / Active</option>
                <option value="closed">Closed / Archived</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── Opportunity Cards List ─── */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <LoadingSpinner size={36} />
            <div style={{ marginTop: '12px', color: '#64748B', fontSize: '14px' }}>
              Loading your opportunity listings...
            </div>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              border: '1px dashed #CBD5E1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Briefcase size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                No Opportunity Postings Found
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '440px', margin: 0, lineHeight: 1.5 }}>
                {opportunities.length === 0
                  ? 'You have not created any job or internship openings yet. Publish your first opportunity to start sourcing candidate talent.'
                  : 'No postings match the specified search or filter criteria. Try adjusting your filters.'}
              </p>
            </div>
            {opportunities.length === 0 && (
              <Link
                to="/industry/post-opportunity"
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px'
                }}
              >
                <Plus size={16} /> Create First Opportunity
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredOpportunities.map((opp) => {
              const isFacultyType = ['faculty_internship', 'industrial_training'].includes(opp.type);
              const isOpen = opp.status === 'open';

              let typeBadgeColor = '#2563EB';
              let typeBadgeBg = '#EFF6FF';
              let typeLabel = 'Internship';

              if (opp.type === 'job') {
                typeBadgeColor = '#059669';
                typeBadgeBg = '#ECFDF5';
                typeLabel = 'Full-Time Job';
              } else if (opp.type === 'apprenticeship') {
                typeBadgeColor = '#D97706';
                typeBadgeBg = '#FFFBEB';
                typeLabel = 'Apprenticeship';
              } else if (opp.type === 'live_project') {
                typeBadgeColor = '#7C3AED';
                typeBadgeBg = '#F5F3FF';
                typeLabel = 'Live Project';
              } else if (opp.type === 'faculty_internship') {
                typeBadgeColor = '#9333EA';
                typeBadgeBg = '#FAF5FF';
                typeLabel = 'Faculty Sabbatical';
              } else if (opp.type === 'industrial_training') {
                typeBadgeColor = '#0284C7';
                typeBadgeBg = '#F0F9FF';
                typeLabel = 'Faculty Training';
              }

              return (
                <div
                  key={opp.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transition: 'box-shadow 0.2s, border-color 0.2s'
                  }}
                >
                  {/* Top Bar: Badges & Actions */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          backgroundColor: typeBadgeBg,
                          color: typeBadgeColor,
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '6px'
                        }}
                      >
                        {typeLabel}
                      </span>

                      <span
                        style={{
                          backgroundColor: isOpen ? '#ECFDF5' : '#F1F5F9',
                          color: isOpen ? '#059669' : '#64748B',
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            backgroundColor: isOpen ? '#059669' : '#94A3B8'
                          }}
                        />
                        {opp.status ? opp.status.toUpperCase() : 'OPEN'}
                      </span>

                      <span
                        style={{
                          backgroundColor: '#F8FAFC',
                          color: '#475569',
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                          textTransform: 'capitalize'
                        }}
                      >
                        {opp.work_mode || 'Remote'}
                      </span>
                    </div>

                    {/* Action Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Quick Status Toggle */}
                      <button
                        onClick={() => handleToggleStatus(opp)}
                        style={{
                          backgroundColor: isOpen ? '#FFFBEB' : '#ECFDF5',
                          color: isOpen ? '#B45309' : '#059669',
                          border: `1px solid ${isOpen ? '#FDE68A' : '#A7F3D0'}`,
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title={isOpen ? 'Close applications for this posting' : 'Re-open this posting for applications'}
                      >
                        {isOpen ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                        {isOpen ? 'Close Posting' : 'Re-open'}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(opp)}
                        style={{
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeletingOpp(opp)}
                        style={{
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          border: '1px solid #FECACA',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Opportunity Details */}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                      {opp.title}
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: 1.5, maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {opp.description}
                    </p>
                  </div>

                  {/* Metadata Chips Grid */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                      fontSize: '13px',
                      color: '#475569',
                      padding: '12px 16px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '10px',
                      border: '1px solid #F1F5F9'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={15} color="#64748B" />
                      <span>{opp.company_name || user?.organization_name || 'Organization'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} color="#64748B" />
                      <span>{opp.location || 'Location Flexible'}</span>
                    </div>

                    {opp.stipend_salary && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0F172A' }}>
                        <span>Stipend:</span>
                        <span>{opp.stipend_salary}</span>
                      </div>
                    )}

                    {opp.duration && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={15} color="#64748B" />
                        <span>{opp.duration}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Openings:</span>
                      <strong style={{ color: '#0F172A' }}>{opp.openings_count || 1}</strong>
                    </div>

                    {opp.deadline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={15} color="#64748B" />
                        <span>Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills tags */}
                  {(opp.skills || []).length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Required Skills:</span>
                      {opp.skills.map((sk) => (
                        <span
                          key={sk.id || sk.skill_id}
                          style={{
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid #DBEAFE'
                          }}
                        >
                          {sk.skill_name} ({sk.minimum_level})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom Footer: Applicant Pipeline Link */}
                  <div
                    style={{
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div style={{ fontSize: '13px', color: '#64748B' }}>
                      Posted on <strong style={{ color: '#334155' }}>{new Date(opp.created_at).toLocaleDateString()}</strong>
                    </div>

                    <Link
                      to={`/industry/applications?opportunity_id=${opp.id}`}
                      style={{
                        color: '#2563EB',
                        fontSize: '13px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Users size={15} />
                      <span>View {opp.applications_count || 0} Candidate Applicants</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Edit Opportunity Modal ─── */}
        {editingOpp && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                width: '100%',
                maxWidth: '780px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#FFFFFF',
                  zIndex: 2
                }}
              >
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    Edit Opportunity Listing
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                    Modify opportunity requirements, parameters, and application criteria
                  </p>
                </div>
                <button
                  onClick={() => setEditingOpp(null)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form Content */}
              <form onSubmit={handleSaveEdit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  {/* Opportunity Title */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Opportunity Title *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.title || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  {/* Opportunity Type */}
                  <div>
                    <label style={labelStyle}>Opportunity Category</label>
                    <select
                      value={editFormData.type || 'internship'}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="internship">Student Internship</option>
                      <option value="job">Full-Time Job</option>
                      <option value="apprenticeship">Apprenticeship</option>
                      <option value="live_project">Live Industry Project</option>
                      <option value="faculty_internship">Faculty Internship / Sabbatical</option>
                      <option value="industrial_training">Faculty Industrial Training</option>
                    </select>
                  </div>

                  {/* Work Mode */}
                  <div>
                    <label style={labelStyle}>Work Mode</label>
                    <select
                      value={editFormData.work_mode || 'remote'}
                      onChange={(e) => setEditFormData({ ...editFormData, work_mode: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="remote">Remote / Virtual</option>
                      <option value="on-site">On-Site (Office / Campus)</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label style={labelStyle}>Work Location</label>
                    <input
                      type="text"
                      value={editFormData.location || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      style={inputStyle}
                      placeholder="e.g. Bangalore, India"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label style={labelStyle}>Duration</label>
                    <input
                      type="text"
                      value={editFormData.duration || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                      style={inputStyle}
                      placeholder="e.g. 3 Months"
                    />
                  </div>

                  {/* Stipend / Salary */}
                  <div>
                    <label style={labelStyle}>Stipend / Remuneration</label>
                    <input
                      type="text"
                      value={editFormData.stipend_salary || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, stipend_salary: e.target.value })}
                      style={inputStyle}
                      placeholder="e.g. Rs. 25,000 / month"
                    />
                  </div>

                  {/* Openings Count */}
                  <div>
                    <label style={labelStyle}>Total Openings</label>
                    <input
                      type="number"
                      min="1"
                      value={editFormData.openings_count || 1}
                      onChange={(e) => setEditFormData({ ...editFormData, openings_count: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label style={labelStyle}>Posting Status</label>
                    <select
                      value={editFormData.status || 'open'}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="open">Open / Active</option>
                      <option value="closed">Closed / Archived</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  {/* Application Deadline */}
                  <div>
                    <label style={labelStyle}>Application Deadline</label>
                    <input
                      type="date"
                      value={editFormData.deadline || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Role Description & Overview</label>
                  <textarea
                    rows={4}
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    style={textareaStyle}
                  />
                </div>

                {/* Responsibilities */}
                <div>
                  <label style={labelStyle}>Key Responsibilities & Deliverables</label>
                  <textarea
                    rows={3}
                    value={editFormData.responsibilities || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, responsibilities: e.target.value })}
                    style={textareaStyle}
                  />
                </div>

                {/* Required Skills Management */}
                <div>
                  <label style={labelStyle}>Required Skill Competencies</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <select
                      value={currSkillId}
                      onChange={(e) => setCurrSkillId(e.target.value)}
                      style={{ ...inputStyle, flex: '1 1 200px' }}
                    >
                      <option value="">Select skill from taxonomy...</option>
                      {skillsList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.category})
                        </option>
                      ))}
                    </select>

                    <select
                      value={currLevel}
                      onChange={(e) => setCurrLevel(e.target.value)}
                      style={{ ...inputStyle, flex: '0 1 150px' }}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleAddSkillToEdit}
                      style={{
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0 16px',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Plus size={15} /> Add
                    </button>
                  </div>

                  {/* Skills Badges List */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '38px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    {selectedSkills.length === 0 ? (
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>No specific skill tags attached yet.</span>
                    ) : (
                      selectedSkills.map((sk) => (
                        <span
                          key={sk.skill_id}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#1E293B',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>{sk.skill_name} ({sk.minimum_level})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillFromEdit(sk.skill_id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 0 }}
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Modal Footer Controls */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    borderTop: '1px solid #E2E8F0',
                    paddingTop: '16px',
                    marginTop: '8px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setEditingOpp(null)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingEdit}
                    style={{
                      backgroundColor: '#2563EB',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 22px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      cursor: savingEdit ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {savingEdit ? <LoadingSpinner size={16} /> : <CheckCircle2 size={16} />}
                    {savingEdit ? 'Saving Changes...' : 'Save Opportunity Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── Delete Confirmation Modal ─── */}
        {deletingOpp && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '480px',
                padding: '24px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    Delete Opportunity Listing?
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5, backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                Are you sure you want to permanently delete <strong>"{deletingOpp.title}"</strong>? All associated candidate applications and matching evaluations will also be removed.
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setDeletingOpp(null)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  style={{
                    backgroundColor: '#DC2626',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {deleting ? <LoadingSpinner size={14} /> : <Trash2 size={14} />}
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
