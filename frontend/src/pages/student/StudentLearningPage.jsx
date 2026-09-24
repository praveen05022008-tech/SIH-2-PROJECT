import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  ExternalLink,
  Clock,
  Award,
  Sparkles,
  Building2,
  CheckCircle2,
  PlayCircle,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  Layers,
  FileText,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CertificateModal } from '../../components/common/CertificateModal';

export function StudentLearningPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [programs, setPrograms] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'enrolled', 'course', 'bootcamp', 'workshop', 'fdp'
  const [search, setSearch] = useState('');

  // Course Player Modal
  const [activePlayerProgram, setActivePlayerProgram] = useState(null);
  const [activeEnrollment, setActiveEnrollment] = useState(null);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [updatingModuleId, setUpdatingModuleId] = useState(null);

  // Certificate Modal Preview
  const [previewCert, setPreviewCert] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/learning-programs';
      const params = [];
      if (activeTab !== 'all' && activeTab !== 'enrolled') {
        params.push(`program_type=${activeTab}`);
      }
      if (search) {
        params.push(`search=${encodeURIComponent(search)}`);
      }
      if (params.length > 0) url += `?${params.join('&')}`;

      const [progsData, enrollsData] = await Promise.all([
        api.get(url),
        user?.role === 'student' ? api.get('/learning-programs/my-enrollments').catch(() => []) : Promise.resolve([]),
      ]);

      setPrograms(progsData);
      setMyEnrollments(enrollsData);
    } catch (err) {
      toast.error('Error loading programs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleEnroll = async (prog) => {
    try {
      const enr = await api.post(`/learning-programs/${prog.id}/enroll`);
      toast.success(`Successfully enrolled in "${prog.title}"!`);
      await fetchData();
      // Open player directly
      handleOpenPlayer(prog, enr);
    } catch (err) {
      toast.error('Enrollment error: ' + err.message);
    }
  };

  const handleOpenPlayer = (prog, specificEnrollment = null) => {
    const enr = specificEnrollment || myEnrollments.find((e) => e.program_id === prog.id);
    setActivePlayerProgram(prog);
    setActiveEnrollment(enr || null);
    setSelectedModuleIndex(0);
  };

  const handleToggleModuleComplete = async (moduleId, isCurrentlyCompleted) => {
    if (!activeEnrollment) return;

    setUpdatingModuleId(moduleId);
    try {
      const res = await api.post(`/learning-programs/enrollments/${activeEnrollment.id}/progress`, {
        module_id: moduleId,
        completed: !isCurrentlyCompleted,
      });

      // Update local state
      setActiveEnrollment((prev) => ({
        ...prev,
        progress_percent: res.progress_percent,
        status: res.status,
        completed_modules: JSON.stringify(res.completed_modules),
        certificate_issued: res.certificate_issued,
      }));

      // If certificate was generated
      if (res.certificate) {
        toast.success('🎉 Congratulations! You completed 100% of the program and earned your Verified Certificate!');
        setPreviewCert({
          certificate_number: res.certificate.certificate_number,
          student_name: user?.full_name || user?.username,
          program_title: activePlayerProgram.title,
          issuer_name: activePlayerProgram.provider_name,
          issue_date: res.certificate.issue_date,
          verification_hash: res.certificate.verification_hash,
          skills: activePlayerProgram.skills_covered,
        });
      } else {
        toast.success(isCurrentlyCompleted ? 'Module marked incomplete' : 'Module marked completed!');
      }

      fetchData();
    } catch (err) {
      toast.error('Error updating progress: ' + err.message);
    } finally {
      setUpdatingModuleId(null);
    }
  };

  // Filter list for display
  const displayedPrograms = activeTab === 'enrolled'
    ? programs.filter((p) => p.is_enrolled)
    : programs;

  return (
    <PortalLayout title="Learning & Certification Academy" allowedRoles={['student', 'faculty', 'industry', 'institution', 'admin']}>
      {/* ─── Hero Overview Banner ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #1E293B 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#FFFFFF',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.3)',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '4px 12px', borderRadius: '20px', color: '#38BDF8', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
            <Sparkles size={14} /> NATIONAL E-LEARNING & CREDENTIALING HUB
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px', color: '#FFFFFF' }}>
            Industry Certifications, Bootcamps & Upskilling
          </h2>
          <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
            Master job-ready technologies directly from leading enterprises. Complete interactive modules to earn verifiable certificates that automatically link to your student portfolio.
          </p>
        </div>

        {myEnrollments.length > 0 && (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '14px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '12px', color: '#93C5FD', fontWeight: 600 }}>My Active Enrollments</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
              {myEnrollments.length}
            </div>
          </div>
        )}
      </div>

      {/* ─── Search & Category Filters Bar ─── */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Catalog' },
              ...(user?.role === 'student' ? [{ id: 'enrolled', label: `My Courses (${myEnrollments.length})` }] : []),
              { id: 'course', label: 'Certifications' },
              { id: 'bootcamp', label: 'Bootcamps' },
              { id: 'workshop', label: 'Workshops' },
              { id: 'fdp', label: 'Faculty FDPs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: activeTab === tab.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: activeTab === tab.id ? '#EFF6FF' : '#FFFFFF',
                  color: activeTab === tab.id ? '#1D4ED8' : '#64748B',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
              <input
                type="text"
                placeholder="Search skills or programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '8px 12px 8px 32px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  width: '220px',
                }}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ─── Programs Cards Grid ─── */}
      {loading ? (
        <LoadingSpinner message="Loading learning catalog & progress..." />
      ) : displayedPrograms.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <BookOpen size={26} />
          </div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
            {activeTab === 'enrolled' ? 'No enrolled programs yet' : 'No training programs found'}
          </h4>
          <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: '0 auto' }}>
            {activeTab === 'enrolled'
              ? 'Browse the catalog above and enroll in free enterprise certifications.'
              : 'Try adjusting your search criteria or filter tags.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: '20px',
          }}
        >
          {displayedPrograms.map((prog) => {
            let modulesList = [];
            try {
              modulesList = JSON.parse(prog.modules_json || '[]');
            } catch {}

            const isCertified = prog.my_status === 'completed' || prog.my_progress >= 100;

            return (
              <div
                key={prog.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '14px',
                  border: prog.is_enrolled ? '1.5px solid #93C5FD' : '1px solid #E2E8F0',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
              >
                <div>
                  {/* Card Header & Provider */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                          {prog.provider_name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Verified Industry Partner</div>
                      </div>
                    </div>

                    <span className="badge badge-primary" style={{ textTransform: 'capitalize', fontSize: '11px' }}>
                      {prog.program_type}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', lineHeight: 1.35 }}>
                    {prog.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {prog.description}
                  </p>

                  {/* Metadata Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#475569', backgroundColor: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>
                      <Clock size={12} /> {prog.duration || '4 Weeks'}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#475569', backgroundColor: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', textTransform: 'capitalize' }}>
                      <Layers size={12} /> {modulesList.length || 4} Modules
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#047857', backgroundColor: '#ECFDF5', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      <ShieldCheck size={12} /> Verified Certificate
                    </span>
                  </div>

                  {/* Skills tags */}
                  {prog.skills_covered && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                      {prog.skills_covered.split(',').slice(0, 3).map((s, idx) => (
                        <span key={idx} style={{ fontSize: '11px', color: '#1D4ED8', backgroundColor: '#EFF6FF', padding: '2px 7px', borderRadius: '4px', fontWeight: 500 }}>
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* If Enrolled: Show Progress Bar */}
                  {prog.is_enrolled && (
                    <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                        <span style={{ color: '#0F172A' }}>My Progress</span>
                        <span style={{ color: prog.my_progress >= 100 ? '#10B981' : '#2563EB' }}>
                          {prog.my_progress || 0}%
                        </span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${prog.my_progress || 0}%`,
                            backgroundColor: prog.my_progress >= 100 ? '#10B981' : '#2563EB',
                            borderRadius: '6px',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#059669' }}>
                    {prog.fee_amount > 0 ? `₹${prog.fee_amount}` : 'Free Access'}
                  </div>

                  {prog.is_enrolled ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {isCertified && prog.my_verification_hash && (
                        <button
                          onClick={() =>
                            setPreviewCert({
                              certificate_number: `AIC-CERT-${prog.id}`,
                              student_name: user?.full_name || user?.username,
                              program_title: prog.title,
                              issuer_name: prog.provider_name,
                              issue_date: new Date().toISOString(),
                              verification_hash: prog.my_verification_hash,
                              skills: prog.skills_covered,
                            })
                          }
                          className="btn btn-secondary btn-sm"
                          style={{ backgroundColor: '#ECFDF5', color: '#047857', borderColor: '#A7F3D0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Award size={13} /> Certificate
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenPlayer(prog)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <PlayCircle size={13} /> {isCertified ? 'Review Course' : 'Continue'}
                      </button>
                    </div>
                  ) : user?.role === 'student' ? (
                    <button
                      onClick={() => handleEnroll(prog)}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <GraduationCap size={14} /> Enroll Now
                    </button>
                  ) : (
                    <button onClick={() => handleOpenPlayer(prog)} className="btn btn-secondary btn-sm">
                      View Syllabus
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Interactive E-Learning Player Modal ─── */}
      {activePlayerProgram && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActivePlayerProgram(null);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '960px',
              height: '88vh',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Player Top Navigation */}
            <div
              style={{
                padding: '16px 24px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#F8FAFC' }}>
                    {activePlayerProgram.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                    Conducted by {activePlayerProgram.provider_name} &bull; {activePlayerProgram.duration || '4 Weeks'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {activeEnrollment && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '5px 12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>Progress:</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: activeEnrollment.progress_percent >= 100 ? '#4ADE80' : '#38BDF8' }}>
                      {activeEnrollment.progress_percent || 0}%
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setActivePlayerProgram(null)}
                  style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Split Screen Workspace */}
            {(() => {
              let parsedModules = [];
              try {
                parsedModules = JSON.parse(activePlayerProgram.modules_json || '[]');
              } catch {}
              if (parsedModules.length === 0) {
                parsedModules = [
                  { id: 1, title: 'Orientation & Foundations', duration: '2 Hours', description: 'Core principles and setup.' },
                  { id: 2, title: 'Practical Implementation Workflows', duration: '3 Hours', description: 'Hands-on architectural patterns.' },
                ];
              }

              const currentModule = parsedModules[selectedModuleIndex] || parsedModules[0];
              const completedModulesList = activeEnrollment ? JSON.parse(activeEnrollment.completed_modules || '[]') : [];
              const isCurrentCompleted = completedModulesList.includes(currentModule.id);

              return (
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                  {/* Left Sidebar: Modules Navigation Checklist */}
                  <div
                    style={{
                      width: '320px',
                      backgroundColor: '#F8FAFC',
                      borderRight: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      overflowY: 'auto',
                    }}
                  >
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      Course Curriculum ({parsedModules.length} Modules)
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
                      {parsedModules.map((m, idx) => {
                        const isDone = completedModulesList.includes(m.id);
                        const isSelected = selectedModuleIndex === idx;

                        return (
                          <div
                            key={m.id || idx}
                            onClick={() => setSelectedModuleIndex(idx)}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '8px',
                              backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                              border: isSelected ? '1px solid #BFDBFE' : '1px solid transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              marginBottom: '4px',
                              transition: 'all 0.15s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: isDone ? '#10B981' : isSelected ? '#2563EB' : '#E2E8F0',
                                  color: '#FFFFFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                }}
                              >
                                {isDone ? <Check size={13} strokeWidth={3} /> : idx + 1}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1D4ED8' : '#1E293B' }}>
                                  {m.title}
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                                  {m.duration || '1.5 Hours'}
                                </div>
                              </div>
                            </div>
                            <ChevronRight size={14} color={isSelected ? '#2563EB' : '#CBD5E1'} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Main Content Panel */}
                  <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {/* Module Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span className="badge badge-primary" style={{ fontSize: '11.5px' }}>
                          Module {selectedModuleIndex + 1} of {parsedModules.length}
                        </span>
                        <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                          Estimated Time: {currentModule.duration || '2 Hours'}
                        </span>
                      </div>

                      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
                        {currentModule.title}
                      </h2>

                      <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                        {currentModule.description}
                      </p>

                      {/* Topics / Syllabus items */}
                      {currentModule.topics && (
                        <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                            Core Learning Objectives & Topics:
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: '#475569', lineHeight: 1.7 }}>
                            {currentModule.topics.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* External resource / Video Link if available */}
                      {activePlayerProgram.external_link && (
                        <div style={{ backgroundColor: '#EFF6FF', borderRadius: '10px', padding: '14px 18px', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ExternalLink size={18} color="#2563EB" />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                                Supplemental Lab Materials & Repository
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                                Access live course assets on partner portal
                              </div>
                            </div>
                          </div>
                          <a
                            href={activePlayerProgram.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            Open Resources <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Completion Action Footer */}
                    <div style={{ paddingTop: '20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={() => setSelectedModuleIndex((prev) => Math.max(0, prev - 1))}
                        disabled={selectedModuleIndex === 0}
                        className="btn btn-outline btn-sm"
                      >
                        Previous Module
                      </button>

                      {activeEnrollment ? (
                        <button
                          onClick={() => handleToggleModuleComplete(currentModule.id, isCurrentCompleted)}
                          disabled={updatingModuleId === currentModule.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 22px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: isCurrentCompleted ? '#10B981' : '#2563EB',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '13.5px',
                            cursor: 'pointer',
                          }}
                        >
                          <Check size={16} />
                          {updatingModuleId === currentModule.id
                            ? 'Updating...'
                            : isCurrentCompleted
                            ? 'Completed (Click to Reopen)'
                            : 'Mark Module Complete'}
                        </button>
                      ) : (
                        <button onClick={() => handleEnroll(activePlayerProgram)} className="btn btn-primary btn-sm">
                          Enroll to Track Progress
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedModuleIndex((prev) => Math.min(parsedModules.length - 1, prev + 1))}
                        disabled={selectedModuleIndex === parsedModules.length - 1}
                        className="btn btn-outline btn-sm"
                      >
                        Next Module
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ─── Verified Certificate Viewer Modal ─── */}
      {previewCert && (
        <CertificateModal certificate={previewCert} onClose={() => setPreviewCert(null)} />
      )}
    </PortalLayout>
  );
}
