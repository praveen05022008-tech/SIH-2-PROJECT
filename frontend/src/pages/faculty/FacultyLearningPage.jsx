import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  Clock,
  Award,
  Sparkles,
  Building2,
  CheckCircle2,
  PlayCircle,
  ShieldCheck,
  Search,
  Check,
  X,
  Layers,
  FileText,
  GraduationCap,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Video,
  FileCode,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CertificateModal } from '../../components/common/CertificateModal';

export function FacultyLearningPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [programs, setPrograms] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  // Course Player Modal
  const [activePlayerProgram, setActivePlayerProgram] = useState(null);
  const [activeEnrollment, setActiveEnrollment] = useState(null);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0); // number for modules, 'quiz' for exam
  const [updatingModuleId, setUpdatingModuleId] = useState(null);

  // Quiz Exam State inside Player
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Per-Module Quiz State
  const [moduleQuizAnswers, setModuleQuizAnswers] = useState({});
  const [moduleQuizResult, setModuleQuizResult] = useState({});
  const [submittingModuleQuiz, setSubmittingModuleQuiz] = useState(false);

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
        api.get('/learning-programs/my-enrollments').catch(() => []),
      ]);

      const filteredProgs = (progsData || []).filter(
        (p) => !p.target_audience || p.target_audience === 'faculty' || p.target_audience === 'all'
      );
      setPrograms(filteredProgs);
      setMyEnrollments(enrollsData);
    } catch (err) {
      toast.error('Error loading FDP programs: ' + err.message);
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
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleToggleModuleComplete = async (moduleId, isCurrentlyCompleted) => {
    if (!activeEnrollment) return;

    setUpdatingModuleId(moduleId);
    try {
      const res = await api.post(`/learning-programs/enrollments/${activeEnrollment.id}/progress`, {
        module_id: moduleId,
        completed: !isCurrentlyCompleted,
      });

      setActiveEnrollment((prev) => ({
        ...prev,
        progress_percent: res.progress_percent,
        status: res.status,
        completed_modules: JSON.stringify(res.completed_modules),
        quiz_passed: res.quiz_passed,
        certificate_issued: res.certificate_issued,
      }));

      toast.success(isCurrentlyCompleted ? 'Module marked incomplete' : 'Module completed!');
      fetchData();
    } catch (err) {
      toast.error('Error updating progress: ' + err.message);
    } finally {
      setUpdatingModuleId(null);
    }
  };

  const handleSubmitModuleQuiz = async (moduleId, questions) => {
    if (!activePlayerProgram || !activeEnrollment) return;

    const currentAnswers = moduleQuizAnswers[moduleId] || {};
    const answeredCount = Object.keys(currentAnswers).length;
    if (answeredCount < questions.length) {
      if (!window.confirm(`You answered ${answeredCount} of ${questions.length} questions for this module quiz. Submit now?`)) {
        return;
      }
    }

    setSubmittingModuleQuiz(true);
    try {
      const res = await api.post(`/learning-programs/${activePlayerProgram.id}/submit-module-quiz`, {
        module_id: moduleId,
        answers: currentAnswers,
      });

      setModuleQuizResult((prev) => ({
        ...prev,
        [moduleId]: res,
      }));

      if (res.passed) {
        toast.success(`Module ${moduleId} Assessment Passed (${res.score_percent}%)!`);
        setActiveEnrollment((prev) => ({
          ...prev,
          progress_percent: res.progress_percent,
          completed_modules: JSON.stringify(res.completed_modules),
          certificate_issued: res.certificate_issued,
        }));
        if (res.certificate) {
          setPreviewCert({
            ...res.certificate,
            recipient_role: 'faculty',
            credits: activePlayerProgram.faculty_credits,
            designation: user?.profile?.designation || 'Faculty Member',
            institution_name: user?.profile?.institution_name || 'Academic Institution',
          });
          toast.success('All modules passed! Your verified Faculty Certificate is ready.');
        }
      } else {
        toast.error(`Score: ${res.score_percent}%. Passing threshold is ${res.passing_threshold}%. Review the explanations below and retake.`);
      }

      fetchData();
    } catch (err) {
      toast.error('Error evaluating module assessment: ' + err.message);
    } finally {
      setSubmittingModuleQuiz(false);
    }
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!activePlayerProgram || !activeEnrollment) return;

    let questions = [];
    try {
      questions = JSON.parse(activePlayerProgram.quiz_json || '[]');
    } catch {}

    const answeredCount = Object.keys(quizAnswers).length;
    if (answeredCount < questions.length) {
      if (!window.confirm(`You answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setSubmittingQuiz(true);
    try {
      const res = await api.post(`/learning-programs/${activePlayerProgram.id}/submit-quiz`, {
        answers: quizAnswers,
      });

      setQuizResult(res);

      if (res.passed) {
        toast.success(`Congratulations! You scored ${res.score_percent}% and earned your FDP Certificate.`);
        if (res.certificate) {
          setPreviewCert({
            ...res.certificate,
            recipient_role: 'faculty',
            credits: activePlayerProgram.faculty_credits,
            designation: user?.profile?.designation || 'Faculty Member',
            institution_name: user?.profile?.institution_name || 'Academic Institution',
          });
        }
      } else {
        toast.error(`Score: ${res.score_percent}%. Passing threshold is ${res.passing_threshold}%. Review your answers below and retake the exam.`);
      }

      fetchData();
    } catch (err) {
      toast.error('Error submitting exam: ' + err.message);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Calculations for stats
  const completedCount = myEnrollments.filter((e) => e.quiz_passed || e.status === 'completed').length;
  const totalAccruedCredits = programs
    .filter((p) => p.is_enrolled && (p.my_status === 'completed' || p.my_quiz_passed))
    .reduce((sum, p) => sum + (parseFloat(p.faculty_credits) || 0), 0);

  const displayedPrograms = activeTab === 'enrolled'
    ? programs.filter((p) => p.is_enrolled)
    : programs;

  return (
    <PortalLayout title="Faculty Industrial Training & FDPs" allowedRoles={['faculty', 'admin']}>
      {/* ─── Hero Overview Banner ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E293B 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#FFFFFF',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.35)',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(167, 139, 250, 0.2)', padding: '4px 12px', borderRadius: '20px', color: '#C4B5FD', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
            <Sparkles size={14} /> AICTE &amp; CPE CONTINUING PROFESSIONAL DEVELOPMENT ALIGNED
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px', color: '#FFFFFF' }}>
            Faculty Development Programs &amp; Industrial Immersion
          </h2>
          <p style={{ fontSize: '13.5px', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
            Upskill in industry-grade architectures, advanced R&amp;D tooling, and modern pedagogy. Earn accredited Faculty Development credentials and institutional CPE credits verified on-chain.
          </p>
        </div>

        {/* Quick Stats Block */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '12px 18px',
              textAlign: 'center',
              minWidth: '100px',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#C4B5FD', fontWeight: 600 }}>Active Enrolled</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
              {myEnrollments.length}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '12px 18px',
              textAlign: 'center',
              minWidth: '100px',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#6EE7B7', fontWeight: 600 }}>FDPs Completed</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
              {completedCount}
            </div>
          </div>

          {totalAccruedCredits > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '12px 18px',
                textAlign: 'center',
                minWidth: '100px',
              }}
            >
              <div style={{ fontSize: '11.5px', color: '#FDE047', fontWeight: 600 }}>CPE Credits Earned</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#FDE047', marginTop: '2px' }}>
                {totalAccruedCredits.toFixed(1)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Search & Category Filters Bar ─── */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Catalog' },
              { id: 'enrolled', label: `My FDPs (${myEnrollments.length})` },
              { id: 'fdp', label: 'Faculty FDPs' },
              { id: 'workshop', label: 'Technical Workshops' },
              { id: 'course', label: 'Certifications' },
              { id: 'bootcamp', label: 'Bootcamps' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: activeTab === tab.id ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                  backgroundColor: activeTab === tab.id ? '#EEF2FF' : '#FFFFFF',
                  color: activeTab === tab.id ? '#4338CA' : '#64748B',
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
                placeholder="Search FDP topics or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '8px 12px 8px 32px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  width: '230px',
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
        <LoadingSpinner message="Loading faculty development catalog & academic credits..." />
      ) : displayedPrograms.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <BookOpen size={26} />
          </div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
            {activeTab === 'enrolled' ? 'No enrolled FDPs yet' : 'No faculty training programs found'}
          </h4>
          <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: '0 auto' }}>
            {activeTab === 'enrolled'
              ? 'Browse the faculty catalog above and enroll in sponsored Faculty Development Programs.'
              : 'Try adjusting your search criteria or filter tags.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))',
            gap: '20px',
          }}
        >
          {displayedPrograms.map((prog) => {
            let modulesList = [];
            try {
              modulesList = JSON.parse(prog.modules_json || '[]');
            } catch {}

            const isCertified = prog.my_status === 'completed' || prog.my_quiz_passed;
            const hasCredits = prog.faculty_credits && parseFloat(prog.faculty_credits) > 0;

            return (
              <div
                key={prog.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '14px',
                  border: prog.is_enrolled ? '1.5px solid #818CF8' : '1px solid #E2E8F0',
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
                          backgroundColor: '#EEF2FF',
                          color: '#4F46E5',
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
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Industry Enterprise Partner</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {prog.target_audience === 'faculty' && (
                        <span style={{ fontSize: '10.5px', padding: '2px 7px', borderRadius: '4px', backgroundColor: '#F3E8FF', color: '#7E22CE', fontWeight: 700 }}>
                          FACULTY EXCLUSIVE
                        </span>
                      )}
                      <span className="badge badge-primary" style={{ textTransform: 'capitalize', fontSize: '11px' }}>
                        {prog.program_type}
                      </span>
                    </div>
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
                    {hasCredits && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#047857', backgroundColor: '#ECFDF5', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, border: '1px solid #A7F3D0' }}>
                        <Award size={12} /> {prog.faculty_credits} Academic / CPE Credits
                      </span>
                    )}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#475569', backgroundColor: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>
                      <Clock size={12} /> {prog.duration || '4 Weeks'}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#475569', backgroundColor: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>
                      <Layers size={12} /> {modulesList.length || 4} Modules
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#4338CA', backgroundColor: '#EEF2FF', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      <HelpCircle size={12} /> Exam: {prog.passing_score || 60}% Pass
                    </span>
                  </div>

                  {/* Skills tags */}
                  {prog.skills_covered && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                      {prog.skills_covered.split(',').slice(0, 3).map((s, idx) => (
                        <span key={idx} style={{ fontSize: '11px', color: '#4338CA', backgroundColor: '#EEF2FF', padding: '2px 7px', borderRadius: '4px', fontWeight: 500 }}>
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* If Enrolled: Show Progress Bar & Exam Status */}
                  {prog.is_enrolled && (
                    <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                        <span style={{ color: '#0F172A' }}>FDP Progress</span>
                        <span style={{ color: prog.my_progress >= 100 ? '#10B981' : '#4F46E5' }}>
                          {prog.my_progress || 0}%
                        </span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${prog.my_progress || 0}%`,
                            backgroundColor: prog.my_progress >= 100 ? '#10B981' : '#4F46E5',
                            borderRadius: '6px',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '11px', color: prog.my_quiz_passed ? '#047857' : '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {prog.my_quiz_passed ? (
                          <><CheckCircle2 size={12} color="#10B981" /> Exam Passed ({prog.my_quiz_score}%) &bull; Certificate Awarded</>
                        ) : (
                          <><HelpCircle size={12} /> Certification Exam Required</>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#059669' }}>
                    {prog.fee_amount > 0 ? `₹${prog.fee_amount}` : 'Institutional Sponsored'}
                  </div>

                  {prog.is_enrolled ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {isCertified && prog.my_verification_hash && (
                        <button
                          onClick={() =>
                            setPreviewCert({
                              certificate_number: prog.my_certificate_number || `AIC-FDP-${prog.id}`,
                              student_name: user?.profile?.full_name || user?.username,
                              program_title: prog.title,
                              issuer_name: prog.provider_name,
                              issue_date: prog.my_completed_at || new Date().toISOString(),
                              verification_hash: prog.my_verification_hash,
                              skills: prog.skills_covered,
                              recipient_role: 'faculty',
                              credits: prog.faculty_credits,
                              designation: user?.profile?.designation || 'Faculty Member',
                              institution_name: user?.profile?.institution_name || 'Academic Institution',
                            })
                          }
                          className="btn btn-secondary btn-sm"
                          style={{ backgroundColor: '#ECFDF5', color: '#047857', borderColor: '#A7F3D0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Award size={13} /> View Certificate
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenPlayer(prog)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#4338CA', borderColor: '#4338CA' }}
                      >
                        <PlayCircle size={13} /> {isCertified ? 'Review Syllabus' : 'Study & Exam'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnroll(prog)}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#4338CA', borderColor: '#4338CA' }}
                    >
                      <GraduationCap size={14} /> Enroll in FDP
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Interactive E-Learning Player & Exam Modal ─── */}
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
              maxWidth: '1000px',
              height: '90vh',
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
                backgroundColor: '#1E1B4B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#4F46E5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#F8FAFC' }}>
                    {activePlayerProgram.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#C7D2FE' }}>
                    Conducted by {activePlayerProgram.provider_name} &bull; Passing Mark: {activePlayerProgram.passing_score || 60}%
                    {activePlayerProgram.faculty_credits && (
                      <span style={{ marginLeft: '8px', color: '#FDE047', fontWeight: 700 }}>
                        &bull; {activePlayerProgram.faculty_credits} Academic Credits
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {activeEnrollment && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '5px 12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#C7D2FE' }}>Progress:</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: activeEnrollment.progress_percent >= 100 ? '#4ADE80' : '#818CF8' }}>
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
                  { id: 1, title: 'Orientation & Industry Foundations', duration: '2 Hours', description: 'Pedagogical goals and industrial immersion setup.' },
                  { id: 2, title: 'Applied Enterprise Case Studies', duration: '3 Hours', description: 'Advanced architectural patterns and live lab demos.' },
                ];
              }

              let parsedQuiz = [];
              try {
                parsedQuiz = JSON.parse(activePlayerProgram.quiz_json || '[]');
              } catch {}

              const isViewingQuiz = selectedModuleIndex === 'quiz';
              const currentModule = !isViewingQuiz ? (parsedModules[selectedModuleIndex] || parsedModules[0]) : null;
              const completedModulesList = activeEnrollment ? JSON.parse(activeEnrollment.completed_modules || '[]') : [];
              const currentModResult = currentModule ? moduleQuizResult[currentModule.id] : null;
              const isCurrentCompleted = currentModResult !== null && currentModResult !== undefined
                ? Boolean(currentModResult.passed)
                : (currentModule ? (completedModulesList.includes(currentModule.id) || completedModulesList.includes(String(currentModule.id)) || completedModulesList.includes(Number(currentModule.id))) : false);
              const allModulesCompleted = parsedModules.length > 0 && parsedModules.every((m) => {
                const mRes = moduleQuizResult[m.id];
                if (mRes !== undefined && mRes !== null) return Boolean(mRes.passed);
                return completedModulesList.includes(m.id) || completedModulesList.includes(String(m.id)) || completedModulesList.includes(Number(m.id));
              });

              return (
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                  {/* Left Sidebar: Modules Navigation */}
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
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                      Program Syllabus ({parsedModules.length} Modules)
                    </div>

                    <div style={{ flex: 1, padding: '12px' }}>
                      {parsedModules.map((m, idx) => {
                        const isDone = completedModulesList.includes(m.id);
                        const isSelected = selectedModuleIndex === idx;

                        return (
                          <div
                            key={m.id || idx}
                            onClick={() => setSelectedModuleIndex(idx)}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '10px',
                              marginBottom: '8px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#EEF2FF' : '#FFFFFF',
                              border: isSelected ? '1.5px solid #818CF8' : '1px solid #E2E8F0',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                            }}
                          >
                            <div
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: isDone ? '#10B981' : isSelected ? '#4338CA' : '#E2E8F0',
                                color: isDone || isSelected ? '#FFFFFF' : '#64748B',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 700,
                                flexShrink: 0,
                                marginTop: '2px',
                              }}
                            >
                              {isDone ? <Check size={13} /> : idx + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 600, color: '#0F172A', lineHeight: 1.3 }}>
                                {m.title}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '3px' }}>
                                {m.duration || 'Self-paced'} {m.quiz && m.quiz.length > 0 && `• ${m.quiz.length} Qs`}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Final Assessment Option */}
                      {parsedQuiz.length > 0 && (
                        <div
                          onClick={() => setSelectedModuleIndex('quiz')}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            backgroundColor: selectedModuleIndex === 'quiz' ? '#FEF3C7' : '#FFFFFF',
                            border: selectedModuleIndex === 'quiz' ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '12px',
                          }}
                        >
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              backgroundColor: activeEnrollment?.quiz_passed ? '#10B981' : '#F59E0B',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Award size={14} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                              Final Certification Exam
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                              {parsedQuiz.length} Questions &bull; Pass Mark: {activePlayerProgram.passing_score || 60}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Content Area: Module Player or Final Exam */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '28px 36px' }}>
                    {isViewingQuiz ? (
                      <div>
                        {/* Final Certification Exam Screen */}
                        <div style={{ marginBottom: '24px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Mandatory Verification Assessment
                          </span>
                          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '4px 0 8px' }}>
                            Comprehensive FDP Evaluation
                          </h2>
                          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                            Score at least {activePlayerProgram.passing_score || 60}% to successfully conclude your Faculty Development Program and trigger your cryptographically verified academic certificate.
                          </p>
                        </div>

                        {quizResult && (
                          <div
                            style={{
                              padding: '16px 20px',
                              borderRadius: '10px',
                              marginBottom: '24px',
                              backgroundColor: quizResult.passed ? '#ECFDF5' : '#FEF2F2',
                              border: `1px solid ${quizResult.passed ? '#A7F3D0' : '#FECACA'}`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: quizResult.passed ? '#047857' : '#991B1B' }}>
                              {quizResult.passed ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                              <span>
                                {quizResult.passed ? 'Assessment Passed Successfully!' : 'Passing Threshold Not Met'} — Score: {quizResult.score_percent}% ({quizResult.correct_count} / {quizResult.total_questions})
                              </span>
                            </div>
                            <p style={{ fontSize: '12.5px', margin: '6px 0 0', color: quizResult.passed ? '#065F46' : '#991B1B' }}>
                              {quizResult.passed
                                ? 'Your Faculty Certificate with verifiable academic credits has been generated and appended to your profile.'
                                : `You need ${quizResult.passing_threshold}% to qualify. Review the questions and explanations below and retake.`}
                            </p>
                          </div>
                        )}

                        <form onSubmit={handleSubmitQuiz}>
                          {parsedQuiz.map((q, qIndex) => {
                            const qKey = String(q.id || qIndex + 1);
                            const selectedOption = quizAnswers[qKey];
                            const feedback = quizResult?.results?.find((r) => String(r.question_id) === qKey);

                            return (
                              <div
                                key={qIndex}
                                style={{
                                  backgroundColor: '#F8FAFC',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '12px',
                                  padding: '18px 20px',
                                  marginBottom: '16px',
                                }}
                              >
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
                                  <span style={{ color: '#4F46E5', marginRight: '6px' }}>Q{qIndex + 1}.</span>
                                  {q.question}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {(q.options || []).map((opt, optIndex) => {
                                    const isChosen = selectedOption === optIndex;
                                    let optionStyle = {
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      padding: '10px 14px',
                                      borderRadius: '8px',
                                      border: '1px solid #CBD5E1',
                                      backgroundColor: '#FFFFFF',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      color: '#334155',
                                    };

                                    if (feedback) {
                                      if (optIndex === feedback.correct_option) {
                                        optionStyle.backgroundColor = '#ECFDF5';
                                        optionStyle.borderColor = '#10B981';
                                        optionStyle.color = '#047857';
                                        optionStyle.fontWeight = 600;
                                      } else if (isChosen && !feedback.is_correct) {
                                        optionStyle.backgroundColor = '#FEF2F2';
                                        optionStyle.borderColor = '#EF4444';
                                        optionStyle.color = '#991B1B';
                                      }
                                    } else if (isChosen) {
                                      optionStyle.backgroundColor = '#EEF2FF';
                                      optionStyle.borderColor = '#6366F1';
                                      optionStyle.color = '#312E81';
                                      optionStyle.fontWeight = 600;
                                    }

                                    return (
                                      <label key={optIndex} style={optionStyle}>
                                        <input
                                          type="radio"
                                          name={`question_${qKey}`}
                                          checked={isChosen}
                                          onChange={() => setQuizAnswers((prev) => ({ ...prev, [qKey]: optIndex }))}
                                          style={{ accentColor: '#4F46E5' }}
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>

                                {feedback?.explanation && (
                                  <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#F1F5F9', borderRadius: '6px', fontSize: '12px', color: '#475569' }}>
                                    <strong>Explanation:</strong> {feedback.explanation}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedModuleIndex(0)}
                              className="btn btn-secondary btn-sm"
                            >
                              Back to Syllabus
                            </button>

                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={submittingQuiz}
                              style={{ backgroundColor: '#4338CA', borderColor: '#4338CA', padding: '10px 24px', fontWeight: 700 }}
                            >
                              {submittingQuiz ? 'Evaluating Exam...' : quizResult ? 'Retake Certification Exam' : 'Submit Final Assessment'}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div>
                        {/* Module Content Screen */}
                        {currentModule && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                              <div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Module {selectedModuleIndex + 1} of {parsedModules.length}
                                </span>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '4px 0 6px' }}>
                                  {currentModule.title}
                                </h2>
                                <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                                  Estimated Time: {currentModule.duration || '2-3 Hours'} &bull; Delivery: {activePlayerProgram.delivery_format || 'Interactive'}
                                </div>
                              </div>

                              {activeEnrollment && (
                                <button
                                  onClick={() => handleToggleModuleComplete(currentModule.id, isCurrentCompleted)}
                                  disabled={updatingModuleId === currentModule.id}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: isCurrentCompleted ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                                    backgroundColor: isCurrentCompleted ? '#ECFDF5' : '#FFFFFF',
                                    color: isCurrentCompleted ? '#047857' : '#475569',
                                    fontWeight: 700,
                                    fontSize: '12.5px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Check size={14} />
                                  {updatingModuleId === currentModule.id
                                    ? 'Updating...'
                                    : isCurrentCompleted
                                    ? 'Completed'
                                    : 'Mark Complete'}
                                </button>
                              )}
                            </div>

                            {/* Module Description / Content Body */}
                            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '24px', lineHeight: 1.6, fontSize: '13.5px', color: '#334155' }}>
                              <p style={{ margin: '0 0 14px' }}>
                                {currentModule.description || 'Review the core principles, reference architectures, and pedagogical implementation guides prepared by the host industry engineers.'}
                              </p>

                              {currentModule.content && (
                                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: '14px 0' }}>
                                  {currentModule.content}
                                </div>
                              )}

                              {currentModule.video_url && (
                                <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Video size={18} color="#4F46E5" />
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>Session Recording &amp; Lab Walkthrough</span>
                                  </div>
                                  <a href={currentModule.video_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <ExternalLink size={12} /> Watch Video
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Per-Module Knowledge Check Quiz */}
                            {currentModule.quiz && currentModule.quiz.length > 0 && (
                              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', backgroundColor: '#FFFFFF', marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
                                  Module Checkpoint Assessment
                                </h4>
                                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 16px' }}>
                                  Verify your understanding of this topic before proceeding to the subsequent phase.
                                </p>

                                {currentModule.quiz.map((mq, mqIdx) => {
                                  const mKey = String(mq.id || mqIdx + 1);
                                  const mAnswers = moduleQuizAnswers[currentModule.id] || {};
                                  const mChosen = mAnswers[mKey];
                                  const mRes = moduleQuizResult[currentModule.id]?.results?.find((r) => String(r.question_id) === mKey);

                                  return (
                                    <div key={mqIdx} style={{ backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: '8px', marginBottom: '12px' }}>
                                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '10px' }}>
                                        {mqIdx + 1}. {mq.question}
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {(mq.options || []).map((opt, oIdx) => (
                                          <label
                                            key={oIdx}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px',
                                              fontSize: '12.5px',
                                              cursor: 'pointer',
                                              padding: '6px 10px',
                                              borderRadius: '6px',
                                              backgroundColor: mChosen === oIdx ? '#EEF2FF' : 'transparent',
                                            }}
                                          >
                                            <input
                                              type="radio"
                                              name={`mod_${currentModule.id}_q_${mKey}`}
                                              checked={mChosen === oIdx}
                                              onChange={() =>
                                                setModuleQuizAnswers((prev) => ({
                                                  ...prev,
                                                  [currentModule.id]: {
                                                    ...(prev[currentModule.id] || {}),
                                                    [mKey]: oIdx,
                                                  },
                                                }))
                                              }
                                              style={{ accentColor: '#4F46E5' }}
                                            />
                                            <span>{opt}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                                  <button
                                    onClick={() => handleSubmitModuleQuiz(currentModule.id, currentModule.quiz)}
                                    disabled={submittingModuleQuiz}
                                    className="btn btn-secondary btn-sm"
                                  >
                                    {submittingModuleQuiz ? 'Checking Answers...' : 'Verify Module Quiz'}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Bottom Module Pagination */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                              <button
                                onClick={() => setSelectedModuleIndex((prev) => Math.max(0, prev - 1))}
                                disabled={selectedModuleIndex === 0}
                                className="btn btn-secondary btn-sm"
                              >
                                Previous Module
                              </button>

                              {selectedModuleIndex < parsedModules.length - 1 ? (
                                isCurrentCompleted ? (
                                  <button
                                    onClick={() => setSelectedModuleIndex((prev) => prev + 1)}
                                    className="btn btn-primary btn-sm"
                                    style={{ backgroundColor: '#4338CA', borderColor: '#4338CA', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                  >
                                    <span>Next Module ({selectedModuleIndex + 2})</span>
                                    <ArrowRight size={14} />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setModuleQuizResult((prev) => {
                                        const copy = { ...prev };
                                        delete copy[currentModule.id];
                                        return copy;
                                      });
                                      setModuleQuizAnswers((prev) => {
                                        const copy = { ...prev };
                                        delete copy[currentModule.id];
                                        return copy;
                                      });
                                    }}
                                    className="btn btn-primary btn-sm"
                                    style={{ backgroundColor: '#DC2626', borderColor: '#DC2626', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                  >
                                    <RotateCcw size={14} />
                                    <span>Retake Module Test</span>
                                  </button>
                                )
                              ) : (
                                allModulesCompleted ? (
                                  <button
                                    onClick={() => setSelectedModuleIndex('quiz')}
                                    className="btn btn-primary btn-sm"
                                    style={{ backgroundColor: '#D97706', borderColor: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Award size={14} /> Proceed to Final Exam
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setModuleQuizResult((prev) => {
                                        const copy = { ...prev };
                                        delete copy[currentModule.id];
                                        return copy;
                                      });
                                      setModuleQuizAnswers((prev) => {
                                        const copy = { ...prev };
                                        delete copy[currentModule.id];
                                        return copy;
                                      });
                                    }}
                                    className="btn btn-primary btn-sm"
                                    style={{ backgroundColor: '#DC2626', borderColor: '#DC2626', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                  >
                                    <RotateCcw size={14} />
                                    <span>Retake Module Test</span>
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ─── Cryptographically Verifiable Certificate Modal ─── */}
      {previewCert && (
        <CertificateModal certificate={previewCert} onClose={() => setPreviewCert(null)} />
      )}
    </PortalLayout>
  );
}
