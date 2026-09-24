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
  GraduationCap,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CertificateModal } from '../../components/common/CertificateModal';

export function StudentLearningPage() {
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
  const [quizAnswers, setQuizAnswers] = useState({}); // { "1": 0, "2": 3 }
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null); // SubmitQuizResponse

  // Per-Module Quiz State
  const [moduleQuizAnswers, setModuleQuizAnswers] = useState({}); // { [moduleId]: { [qId]: optionIndex } }
  const [moduleQuizResult, setModuleQuizResult] = useState({}); // { [moduleId]: SubmitModuleQuizResponse }
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

      toast.success(isCurrentlyCompleted ? 'Module marked incomplete' : 'Module marked completed!');
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
        toast.success(`🎉 Module ${moduleId} Assessment Passed (${res.score_percent}%)!`);
        setActiveEnrollment((prev) => ({
          ...prev,
          progress_percent: res.progress_percent,
          completed_modules: JSON.stringify(res.completed_modules),
          certificate_issued: res.certificate_issued,
        }));
        if (res.certificate) {
          setPreviewCert(res.certificate);
          toast.success('🏆 All modules passed! Your verified certificate is ready!');
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
        toast.success(`🎉 Congratulations! You scored ${res.score_percent}% and passed the certification exam!`);
        if (res.certificate) {
          setPreviewCert(res.certificate);
        }
      } else {
        toast.error(`Score: ${res.score_percent}%. Passing threshold is ${res.passing_threshold}%. Review your answers below and retake the exam.`);
      }

      // Refresh enrollments & program state
      fetchData();
    } catch (err) {
      toast.error('Error submitting exam: ' + err.message);
    } finally {
      setSubmittingQuiz(false);
    }
  };

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
            <Sparkles size={14} /> RIGOROUS CREDENTIALING & CERTIFICATION SYSTEM
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px', color: '#FFFFFF' }}>
            Enterprise Courses & Certification Examinations
          </h2>
          <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
            Master job-ready technologies with structured curriculum modules. Pass the final multiple-choice certification exam to earn verified credentials that automatically link to your student portfolio.
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

            let quizList = [];
            try {
              quizList = JSON.parse(prog.quiz_json || '[]');
            } catch {}

            const isCertified = prog.my_status === 'completed' || prog.my_quiz_passed;

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
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#475569', backgroundColor: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>
                      <Layers size={12} /> {modulesList.length || 4} Modules
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#1D4ED8', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      <HelpCircle size={12} /> Exam: {prog.passing_score || 60}% Pass Mark
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

                  {/* If Enrolled: Show Progress Bar & Exam Status */}
                  {prog.is_enrolled && (
                    <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                        <span style={{ color: '#0F172A' }}>My Progress</span>
                        <span style={{ color: prog.my_progress >= 100 ? '#10B981' : '#2563EB' }}>
                          {prog.my_progress || 0}%
                        </span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${prog.my_progress || 0}%`,
                            backgroundColor: prog.my_progress >= 100 ? '#10B981' : '#2563EB',
                            borderRadius: '6px',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '11px', color: prog.my_quiz_passed ? '#047857' : '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {prog.my_quiz_passed ? (
                          <><CheckCircle2 size={12} color="#10B981" /> Exam Passed ({prog.my_quiz_score}%)</>
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
                        <PlayCircle size={13} /> {isCertified ? 'Review Course' : 'Study & Take Exam'}
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
                      View Syllabus & Exam
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
                    Conducted by {activePlayerProgram.provider_name} &bull; Passing Mark: {activePlayerProgram.passing_score || 60}%
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

              let parsedQuiz = [];
              try {
                parsedQuiz = JSON.parse(activePlayerProgram.quiz_json || '[]');
              } catch {}

              const isViewingQuiz = selectedModuleIndex === 'quiz';
              const currentModule = !isViewingQuiz ? (parsedModules[selectedModuleIndex] || parsedModules[0]) : null;
              const completedModulesList = activeEnrollment ? JSON.parse(activeEnrollment.completed_modules || '[]') : [];
              const isCurrentCompleted = currentModule ? completedModulesList.includes(currentModule.id) : false;

              return (
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                  {/* Left Sidebar: Modules & Final Assessment Navigation */}
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
                      Course Syllabus & Exam
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
                      {/* Modules list */}
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

                      {/* Final Certification Exam Milestone Button */}
                      {parsedQuiz.length > 0 && (
                        <div
                          onClick={() => setSelectedModuleIndex('quiz')}
                          style={{
                            padding: '14px 14px',
                            borderRadius: '10px',
                            backgroundColor: isViewingQuiz ? '#FEF3C7' : '#FFFFFF',
                            border: isViewingQuiz ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            marginTop: '10px',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: activeEnrollment?.quiz_passed ? '#10B981' : '#F59E0B',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Award size={15} />
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 800, color: '#92400E' }}>
                                Certification Exam
                              </div>
                              <div style={{ fontSize: '11px', color: '#78350F' }}>
                                {activeEnrollment?.quiz_passed
                                  ? `Passed (${activeEnrollment?.quiz_score}%)`
                                  : `${parsedQuiz.length} MCQs &bull; Pass Mark: ${activePlayerProgram.passing_score || 60}%`}
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={14} color="#D97706" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Main Content Panel */}
                  <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {isViewingQuiz ? (
                      /* ─── Certification Examination Screen ─── */
                      <div>
                        {/* Exam Header Banner */}
                        <div
                          style={{
                            backgroundColor: '#FEF3C7',
                            border: '1.5px solid #FCD34D',
                            borderRadius: '12px',
                            padding: '18px 22px',
                            marginBottom: '24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400E', fontWeight: 800, fontSize: '15px' }}>
                              <Award size={18} color="#D97706" /> Final Certification Examination
                            </div>
                            <div style={{ fontSize: '12.5px', color: '#78350F', marginTop: '3px' }}>
                              Answer all questions and achieve at least <strong>{activePlayerProgram.passing_score || 60}%</strong> to unlock and receive your verified certificate.
                            </div>
                          </div>
                          {activeEnrollment?.quiz_passed && (
                            <span style={{ backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 700, fontSize: '12px', padding: '4px 10px', borderRadius: '6px' }}>
                              ✓ Credential Earned
                            </span>
                          )}
                        </div>

                        {/* If Quiz Result is available: Show Score Card */}
                        {quizResult && (
                          <div
                            style={{
                              backgroundColor: quizResult.passed ? '#ECFDF5' : '#FEF2F2',
                              border: `1.5px solid ${quizResult.passed ? '#A7F3D0' : '#FECACA'}`,
                              borderRadius: '12px',
                              padding: '20px',
                              marginBottom: '24px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                  style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    backgroundColor: quizResult.passed ? '#10B981' : '#EF4444',
                                    color: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {quizResult.passed ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                </div>
                                <div>
                                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: quizResult.passed ? '#065F46' : '#991B1B' }}>
                                    {quizResult.passed ? 'Assessment Passed! Certificate Awarded' : 'Assessment Not Passed'}
                                  </h3>
                                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: quizResult.passed ? '#047857' : '#B91C1C' }}>
                                    Your Score: <strong>{quizResult.score_percent}%</strong> ({quizResult.correct_count}/{quizResult.total_questions} correct) &bull; Required Pass Mark: {quizResult.passing_threshold}%
                                  </p>
                                </div>
                              </div>

                              {quizResult.passed ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewCert({
                                      certificate_number: quizResult.certificate?.certificate_number || `AIC-CERT-${activePlayerProgram.id}`,
                                      student_name: user?.full_name || user?.username,
                                      program_title: activePlayerProgram.title,
                                      issuer_name: activePlayerProgram.provider_name,
                                      issue_date: new Date().toISOString(),
                                      verification_hash: quizResult.certificate?.verification_hash || 'verified',
                                      skills: activePlayerProgram.skills_covered,
                                    })
                                  }
                                  className="btn btn-primary btn-sm"
                                  style={{ backgroundColor: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <Award size={15} /> View & Download Certificate
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuizResult(null);
                                    setQuizAnswers({});
                                  }}
                                  className="btn btn-primary btn-sm"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <RotateCcw size={14} /> Retake Assessment
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Questions Form */}
                        <form onSubmit={handleSubmitQuiz}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {parsedQuiz.map((q, qIdx) => {
                              const qidStr = String(q.id);
                              const selectedAnswer = quizAnswers[qidStr];
                              const detailResult = quizResult?.detailed_results?.find((r) => r.question_id === q.id);

                              return (
                                <div
                                  key={q.id || qIdx}
                                  style={{
                                    backgroundColor: '#FFFFFF',
                                    border: detailResult
                                      ? detailResult.is_correct
                                        ? '1.5px solid #86EFAC'
                                        : '1.5px solid #FCA5A5'
                                      : '1px solid #E2E8F0',
                                    borderRadius: '12px',
                                    padding: '18px 22px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
                                      Question {qIdx + 1}
                                    </span>
                                    {detailResult && (
                                      <span
                                        style={{
                                          fontSize: '11.5px',
                                          fontWeight: 700,
                                          color: detailResult.is_correct ? '#059669' : '#DC2626',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                        }}
                                      >
                                        {detailResult.is_correct ? <CheckCircle2 size={13} /> : <X size={13} />}
                                        {detailResult.is_correct ? 'Correct' : 'Incorrect'}
                                      </span>
                                    )}
                                  </div>

                                  <h4 style={{ margin: '0 0 14px 0', fontSize: '14.5px', fontWeight: 700, color: '#0F172A', lineHeight: 1.4 }}>
                                    {q.question}
                                  </h4>

                                  {/* Radio Options */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {q.options?.map((opt, optIdx) => {
                                      const isSelected = selectedAnswer === optIdx;
                                      const isCorrectOption = detailResult && q.correct_answer === optIdx;

                                      return (
                                        <label
                                          key={optIdx}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: isCorrectOption
                                              ? '1.5px solid #10B981'
                                              : isSelected
                                              ? '1.5px solid #2563EB'
                                              : '1px solid #E2E8F0',
                                            backgroundColor: isCorrectOption
                                              ? '#ECFDF5'
                                              : isSelected
                                              ? '#EFF6FF'
                                              : '#FFFFFF',
                                            cursor: quizResult?.passed ? 'default' : 'pointer',
                                            transition: 'all 0.15s',
                                          }}
                                        >
                                          <input
                                            type="radio"
                                            name={`question_${q.id}`}
                                            value={optIdx}
                                            checked={isSelected}
                                            disabled={Boolean(quizResult?.passed)}
                                            onChange={() => {
                                              setQuizAnswers((prev) => ({
                                                ...prev,
                                                [qidStr]: optIdx,
                                              }));
                                            }}
                                            style={{ cursor: 'pointer', accentColor: '#2563EB' }}
                                          />
                                          <span style={{ fontSize: '13.5px', color: isCorrectOption ? '#065F46' : '#1E293B', fontWeight: isSelected || isCorrectOption ? 600 : 400 }}>
                                            {opt}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>

                                  {/* Explanation if reviewed */}
                                  {detailResult && detailResult.explanation && (
                                    <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', fontSize: '12.5px', color: '#475569', borderLeft: '3px solid #3B82F6' }}>
                                      <strong>Explanation:</strong> {detailResult.explanation}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Submit Assessment Action */}
                          {!quizResult?.passed && (
                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                type="submit"
                                disabled={submittingQuiz}
                                className="btn btn-primary"
                                style={{ padding: '11px 28px', fontSize: '14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                              >
                                <Award size={16} />
                                {submittingQuiz ? 'Grading Answers...' : 'Submit Certification Exam'}
                              </button>
                            </div>
                          )}
                        </form>
                      </div>
                    ) : (
                      /* ─── Regular Module Reader Screen ─── */
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

                        {/* Per-Module Assessment Quiz */}
                        {currentModule.quiz && currentModule.quiz.length > 0 && (
                          <div style={{ marginTop: '28px', borderTop: '1.5px solid #E2E8F0', paddingTop: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                                  <HelpCircle size={18} color="#2563EB" /> Module {selectedModuleIndex + 1} Assessment & Knowledge Check
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                  Score &ge; {activePlayerProgram.passing_score || 60}% to pass this module and earn completion credit.
                                </div>
                              </div>
                              {isCurrentCompleted && (
                                <span style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontWeight: 700, fontSize: '12px', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Check size={14} /> Module Passed
                                </span>
                              )}
                            </div>

                            {/* Module Quiz Results Card if available */}
                            {moduleQuizResult[currentModule.id] && (
                              <div
                                style={{
                                  backgroundColor: moduleQuizResult[currentModule.id].passed ? '#ECFDF5' : '#FEF2F2',
                                  border: `1.5px solid ${moduleQuizResult[currentModule.id].passed ? '#A7F3D0' : '#FECACA'}`,
                                  borderRadius: '12px',
                                  padding: '14px 18px',
                                  marginBottom: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: moduleQuizResult[currentModule.id].passed ? '#065F46' : '#991B1B' }}>
                                    {moduleQuizResult[currentModule.id].passed ? '✓ Module Quiz Passed!' : '✕ Score Below Passing Threshold'}
                                  </div>
                                  <div style={{ fontSize: '12px', color: moduleQuizResult[currentModule.id].passed ? '#047857' : '#B91C1C', marginTop: '2px' }}>
                                    Your Score: {moduleQuizResult[currentModule.id].score_percent}% &bull; Correct: {moduleQuizResult[currentModule.id].correct_count}/{moduleQuizResult[currentModule.id].total_questions}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Questions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {currentModule.quiz.map((q, qIdx) => {
                                const qidStr = String(q.id || qIdx + 1);
                                const currentModuleAns = moduleQuizAnswers[currentModule.id] || {};
                                const selectedOption = currentModuleAns[qidStr];
                                const modRes = moduleQuizResult[currentModule.id];
                                const detail = modRes?.detailed_results?.find((r) => String(r.question_id) === qidStr);

                                return (
                                  <div
                                    key={q.id || qIdx}
                                    style={{
                                      backgroundColor: '#F8FAFC',
                                      border: detail
                                        ? detail.is_correct
                                          ? '1.5px solid #86EFAC'
                                          : '1.5px solid #FCA5A5'
                                        : '1px solid #E2E8F0',
                                      borderRadius: '10px',
                                      padding: '16px',
                                    }}
                                  >
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', marginBottom: '4px' }}>
                                      Question {qIdx + 1}
                                    </div>
                                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
                                      {q.question}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      {q.options?.map((opt, optIdx) => {
                                        const isSelected = selectedOption === optIdx;
                                        const isCorrect = detail && q.correct_answer === optIdx;
                                        return (
                                          <label
                                            key={optIdx}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px',
                                              padding: '8px 12px',
                                              borderRadius: '6px',
                                              border: isCorrect
                                                ? '1.5px solid #10B981'
                                                : isSelected
                                                ? '1.5px solid #2563EB'
                                                : '1px solid #E2E8F0',
                                              backgroundColor: isCorrect
                                                ? '#ECFDF5'
                                                : isSelected
                                                ? '#EFF6FF'
                                                : '#FFFFFF',
                                              cursor: 'pointer',
                                              fontSize: '13px',
                                            }}
                                          >
                                            <input
                                              type="radio"
                                              name={`mod_${currentModule.id}_q_${q.id || qIdx}`}
                                              value={optIdx}
                                              checked={isSelected}
                                              onChange={() => {
                                                setModuleQuizAnswers((prev) => ({
                                                  ...prev,
                                                  [currentModule.id]: {
                                                    ...(prev[currentModule.id] || {}),
                                                    [qidStr]: optIdx,
                                                  },
                                                }));
                                              }}
                                              style={{ accentColor: '#2563EB' }}
                                            />
                                            <span>{opt}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                    {detail && detail.explanation && (
                                      <div style={{ marginTop: '10px', padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: '6px', fontSize: '12px', color: '#475569', borderLeft: '3px solid #3B82F6' }}>
                                        <strong>Explanation:</strong> {detail.explanation}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {activeEnrollment && (
                              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  onClick={() => handleSubmitModuleQuiz(currentModule.id, currentModule.quiz)}
                                  disabled={submittingModuleQuiz}
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '8px 20px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <CheckCircle2 size={15} />
                                  {submittingModuleQuiz
                                    ? 'Grading Answers...'
                                    : isCurrentCompleted
                                    ? 'Retake Module Quiz'
                                    : 'Submit Module Quiz & Pass'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Completion Action Footer for Modules */}
                    {!isViewingQuiz && (
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

                        {selectedModuleIndex < parsedModules.length - 1 ? (
                          <button
                            onClick={() => setSelectedModuleIndex((prev) => prev + 1)}
                            className="btn btn-outline btn-sm"
                          >
                            Next Module
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedModuleIndex('quiz')}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#D97706', borderColor: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Award size={14} /> Take Final Exam
                          </button>
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

      {/* ─── Verified Certificate Viewer Modal ─── */}
      {previewCert && (
        <CertificateModal certificate={previewCert} onClose={() => setPreviewCert(null)} />
      )}
    </PortalLayout>
  );
}
