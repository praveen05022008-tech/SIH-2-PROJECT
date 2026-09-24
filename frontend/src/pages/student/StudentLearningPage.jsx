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
  CheckCircle,
  Lock,
  Unlock,
  ArrowRight,
  BookMarked
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CertificateModal } from '../../components/common/CertificateModal';
import { MarkdownRenderer } from '../../components/common/MarkdownRenderer';

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

      const filteredProgs = (progsData || []).filter(
        (p) => !p.target_audience || p.target_audience === 'student' || p.target_audience === 'all'
      );
      setPrograms(filteredProgs);
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
      toast.success(`Successfully enrolled in "${prog.title}"`);
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
    setModuleQuizAnswers({});
    setModuleQuizResult({});
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!activePlayerProgram) return;

    let parsedQuestions = [];
    try {
      parsedQuestions = JSON.parse(activePlayerProgram.quiz_json || '[]');
    } catch {}

    const answeredCount = Object.keys(quizAnswers).length;
    if (answeredCount < parsedQuestions.length) {
      toast.error(`Please answer all ${parsedQuestions.length} questions before submitting.`);
      return;
    }

    setSubmittingQuiz(true);
    try {
      const res = await api.post(`/learning-programs/${activePlayerProgram.id}/submit-quiz`, {
        answers: quizAnswers,
      });
      setQuizResult(res);
      if (res.passed) {
        toast.success(`Congratulations! You passed the final certification exam with ${res.score_percent}%.`);
      } else {
        toast.error(`Score: ${res.score_percent}%. Required: ${res.passing_threshold}%. You can review the material and retake.`);
      }
      await fetchData();
      const updatedEnrolls = await api.get('/learning-programs/my-enrollments');
      setMyEnrollments(updatedEnrolls);
      const updatedCurr = updatedEnrolls.find((e) => e.program_id === activePlayerProgram.id);
      if (updatedCurr) setActiveEnrollment(updatedCurr);
    } catch (err) {
      toast.error('Submission failed: ' + err.message);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleSubmitModuleQuiz = async (moduleId, questionsList) => {
    if (!activePlayerProgram) return;

    const currentAnswers = moduleQuizAnswers[moduleId] || {};
    const answeredCount = Object.keys(currentAnswers).length;
    if (answeredCount < questionsList.length) {
      toast.error(`Please answer all ${questionsList.length} questions for Module ${moduleId} before submitting.`);
      return;
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
        toast.success(`Module ${moduleId} test passed (${res.score_percent}%). Next module unlocked!`);
      } else {
        toast.error(`Module ${moduleId} score: ${res.score_percent}%. Required: ${res.passing_threshold}%. Please retake.`);
      }

      await fetchData();
      const updatedEnrolls = await api.get('/learning-programs/my-enrollments');
      setMyEnrollments(updatedEnrolls);
      const updatedCurr = updatedEnrolls.find((e) => e.program_id === activePlayerProgram.id);
      if (updatedCurr) setActiveEnrollment(updatedCurr);
    } catch (err) {
      toast.error('Module test submission failed: ' + err.message);
    } finally {
      setSubmittingModuleQuiz(false);
    }
  };

  const displayedPrograms =
    activeTab === 'enrolled'
      ? programs.filter((p) => myEnrollments.some((e) => e.program_id === p.id))
      : programs;

  return (
    <PortalLayout
      title="Student Learning & Industry Academy"
      subtitle="Complete industry-certified curriculums with sequential module assessments and verified credentials"
      allowedRoles={['student']}
    >
      {/* ─── Hero Overview Banner ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1E40AF 100%)',
          borderRadius: '16px',
          padding: '28px 36px',
          color: '#FFFFFF',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(30, 58, 138, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.12)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '12px', color: '#93C5FD' }}>
            <Sparkles size={14} /> National Enterprise Learning Portal
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>
            Industry-Certified Modular Training & Credentials
          </h2>
          <p style={{ fontSize: '13.5px', color: '#CBD5E1', lineHeight: 1.6, margin: 0 }}>
            Read through structured module reading materials, pass each sequential knowledge check to unlock the next module, and complete the final comprehensive exam to earn authentic certificates.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 20px', border: '1px solid rgba(255, 255, 255, 0.12)', minWidth: '120px' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#60A5FA' }}>
              {myEnrollments.length}
            </div>
            <div style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 600, marginTop: '2px' }}>
              Enrolled Programs
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 20px', border: '1px solid rgba(255, 255, 255, 0.12)', minWidth: '120px' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#4ADE80' }}>
              {myEnrollments.filter((e) => e.status === 'completed' || e.certificate_issued).length}
            </div>
            <div style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 600, marginTop: '2px' }}>
              Certificates Earned
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filtering & Search Bar ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Curriculums' },
            { id: 'enrolled', label: `My Enrolled (${myEnrollments.length})` },
            { id: 'course', label: 'Certification Courses' },
            { id: 'workshop', label: 'Workshops' },
            { id: 'bootcamp', label: 'Bootcamps' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === tab.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
                backgroundColor: activeTab === tab.id ? '#EFF6FF' : '#FFFFFF',
                color: activeTab === tab.id ? '#1D4ED8' : '#64748B',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search skills, titles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '8px 14px' }}>
            Filter
          </button>
        </form>
      </div>

      {/* ─── Programs Grid ─── */}
      {loading ? (
        <LoadingSpinner message="Loading course marketplace..." />
      ) : displayedPrograms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <BookOpen size={24} />
          </div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
            No Programs Available
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Check back later as enterprise partners publish new industry certifications.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {displayedPrograms.map((prog) => {
            const enrollment = myEnrollments.find((e) => e.program_id === prog.id);
            const isEnrolled = Boolean(enrollment);
            const isCertified = enrollment?.certificate_issued || enrollment?.status === 'completed';

            let moduleCount = 0;
            try {
              moduleCount = JSON.parse(prog.modules_json || '[]').length;
            } catch {}

            return (
              <div
                key={prog.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: isCertified ? '1.5px solid #86EFAC' : isEnrolled ? '1.5px solid #93C5FD' : '1px solid #E2E8F0',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Card Header Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: '#1D4ED8', textTransform: 'capitalize' }}>
                      {prog.program_type}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isCertified ? (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={12} /> Certified
                        </span>
                      ) : isEnrolled ? (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '4px' }}>
                          In Progress ({enrollment?.progress_percent || 0}%)
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                    {prog.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#475569', marginBottom: '12px' }}>
                    <Building2 size={14} color="#64748B" />
                    <span>{prog.provider_name}</span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {prog.description}
                  </p>

                  {/* Skills tags */}
                  {prog.skills_covered && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                      {prog.skills_covered.split(',').slice(0, 4).map((skill, sIdx) => (
                        <span key={sIdx} style={{ fontSize: '11px', backgroundColor: '#F1F5F9', color: '#334155', padding: '2px 7px', borderRadius: '4px', fontWeight: 500 }}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  {/* Meta metrics row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {prog.duration || 'Self-Paced'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={13} /> {moduleCount} Modules
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#2563EB' }}>
                      Pass: {prog.passing_score || 60}%
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEnrolled ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
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
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center' }}
                      >
                        <PlayCircle size={13} /> {isCertified ? 'Review Curriculum' : 'Study & Pass Modules'}
                      </button>
                    </div>
                  ) : user?.role === 'student' ? (
                    <button
                      onClick={() => handleEnroll(prog)}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', width: '100%', justifyContent: 'center' }}
                    >
                      <GraduationCap size={14} /> Enroll in Program
                    </button>
                  ) : (
                    <button onClick={() => handleOpenPlayer(prog)} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                      View Curriculum
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Interactive E-Learning Player, Reading Content & Sequential Assessment Modal ─── */}
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
              maxWidth: '1060px',
              height: '92vh',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Player Top Navigation Bar */}
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
                    Conducted by {activePlayerProgram.provider_name} &bull; Passing Threshold: {activePlayerProgram.passing_score || 60}%
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
              const allModulesCompleted = parsedModules.length > 0 && parsedModules.every((m) => completedModulesList.includes(m.id));

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
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Curriculum & Progression</span>
                      <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                        {completedModulesList.length}/{parsedModules.length} Done
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
                      {/* Sequential Modules List */}
                      {parsedModules.map((m, idx) => {
                        const isDone = completedModulesList.includes(m.id);
                        const isSelected = selectedModuleIndex === idx;
                        const isUnlocked = idx === 0 || completedModulesList.includes(parsedModules[idx - 1].id);

                        return (
                          <div
                            key={m.id || idx}
                            onClick={() => {
                              if (isUnlocked) {
                                setSelectedModuleIndex(idx);
                              } else {
                                toast.error(`Module ${idx + 1} is locked. Complete and pass the assessment for Module ${idx} first.`);
                              }
                            }}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '8px',
                              backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                              border: isSelected ? '1px solid #BFDBFE' : '1px solid transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: isUnlocked ? 'pointer' : 'not-allowed',
                              opacity: isUnlocked ? 1 : 0.6,
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
                                  backgroundColor: isDone ? '#10B981' : isUnlocked ? (isSelected ? '#2563EB' : '#94A3B8') : '#CBD5E1',
                                  color: '#FFFFFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                }}
                              >
                                {isDone ? <Check size={13} strokeWidth={3} /> : isUnlocked ? idx + 1 : <Lock size={11} />}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1D4ED8' : isUnlocked ? '#1E293B' : '#94A3B8' }}>
                                  {m.title}
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                                  {m.duration || '2 Hours'} &bull; {isDone ? 'Passed' : isUnlocked ? 'Unlocked' : 'Locked'}
                                </div>
                              </div>
                            </div>
                            {isUnlocked ? (
                              <ChevronRight size={14} color={isSelected ? '#2563EB' : '#CBD5E1'} />
                            ) : (
                              <Lock size={13} color="#94A3B8" />
                            )}
                          </div>
                        );
                      })}

                      {/* Final Certification Exam Milestone Button */}
                      {parsedQuiz.length > 0 && (
                        <div
                          onClick={() => {
                            if (allModulesCompleted) {
                              setSelectedModuleIndex('quiz');
                            } else {
                              toast.error(`Complete and pass all ${parsedModules.length} modules to unlock the final certification exam.`);
                            }
                          }}
                          style={{
                            padding: '14px 14px',
                            borderRadius: '10px',
                            backgroundColor: isViewingQuiz ? '#FEF3C7' : allModulesCompleted ? '#EFF6FF' : '#F1F5F9',
                            border: isViewingQuiz ? '1.5px solid #F59E0B' : allModulesCompleted ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: allModulesCompleted ? 'pointer' : 'not-allowed',
                            opacity: allModulesCompleted ? 1 : 0.65,
                            marginTop: '12px',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: activeEnrollment?.quiz_passed ? '#10B981' : allModulesCompleted ? '#F59E0B' : '#94A3B8',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {activeEnrollment?.quiz_passed ? <Check size={14} strokeWidth={3} /> : allModulesCompleted ? <Award size={15} /> : <Lock size={13} />}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 800, color: allModulesCompleted ? (isViewingQuiz ? '#92400E' : '#1E293B') : '#64748B' }}>
                                Final Certification Exam
                              </div>
                              <div style={{ fontSize: '11px', color: allModulesCompleted ? '#78350F' : '#94A3B8' }}>
                                {activeEnrollment?.quiz_passed
                                  ? `Passed (${activeEnrollment?.quiz_score}%)`
                                  : allModulesCompleted
                                  ? `Unlocked &bull; Pass: ${activePlayerProgram.passing_score || 60}%`
                                  : `Locked (Finish All Modules)`}
                              </div>
                            </div>
                          </div>
                          {allModulesCompleted ? (
                            <ChevronRight size={14} color="#D97706" />
                          ) : (
                            <Lock size={14} color="#94A3B8" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Main Content Panel */}
                  <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {isViewingQuiz ? (
                      /* ─── Final Certification Examination Screen ─── */
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
                              <Award size={18} color="#D97706" /> Final Comprehensive Certification Exam
                            </div>
                            <div style={{ fontSize: '12.5px', color: '#78350F', marginTop: '3px' }}>
                              Comprehensive assessment spanning all course modules. Achieve at least <strong>{activePlayerProgram.passing_score || 60}%</strong> to earn your verified certificate.
                            </div>
                          </div>
                          {activeEnrollment?.quiz_passed && (
                            <span style={{ backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 700, fontSize: '12px', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={13} /> Credential Earned
                            </span>
                          )}
                        </div>

                        {/* Quiz Result Feedback Card */}
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
                                    {quizResult.passed ? 'Final Exam Passed! Official Certificate Awarded' : 'Score Below Passing Threshold'}
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
                                  <Award size={15} /> View Verified Certificate
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
                                  <RotateCcw size={14} /> Retake Final Exam
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
                                {submittingQuiz ? 'Grading Final Answers...' : 'Submit Final Certification Exam'}
                              </button>
                            </div>
                          )}
                        </form>
                      </div>
                    ) : (
                      /* ─── Regular Module Reading & Module Test Screen ─── */
                      <div>
                        {/* Module Header Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="badge badge-primary" style={{ fontSize: '11.5px' }}>
                              Module {selectedModuleIndex + 1} of {parsedModules.length}
                            </span>
                            <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                              Estimated Time: {currentModule.duration || '2 Hours'}
                            </span>
                          </div>
                          {isCurrentCompleted && (
                            <span style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontWeight: 700, fontSize: '12px', padding: '3px 9px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={13} /> Module Completed & Passed
                            </span>
                          )}
                        </div>

                        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
                          {currentModule.title}
                        </h2>

                        <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                          {currentModule.description}
                        </p>

                        {/* Module Learning Content & In-Depth Reading Material */}
                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '14px', borderBottom: '1px solid #EEF2F6', paddingBottom: '10px' }}>
                            <BookMarked size={17} color="#2563EB" /> Module Study & Reading Material
                          </div>

                          {currentModule.content ? (
                            <MarkdownRenderer content={currentModule.content} />
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#334155', lineHeight: 1.7 }}>
                              <div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                                  1. Architectural Overview & Foundations
                                </h4>
                                <p style={{ margin: 0, color: '#475569' }}>
                                  {currentModule.description} Understanding foundational design patterns, loose coupling, and defensive programming ensures high throughput and maintainability across distributed production microservices.
                                </p>
                              </div>

                              {currentModule.topics && currentModule.topics.length > 0 && (
                                <div>
                                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                                    2. Core Learning Objectives & Technical Focus
                                  </h4>
                                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569' }}>
                                    {currentModule.topics.map((t, tIdx) => (
                                      <li key={tIdx}>{t}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                                  3. Key Industry Best Practices
                                </h4>
                                <p style={{ margin: 0, color: '#475569' }}>
                                  Enforce schema validation on incoming payloads, implement structured logging for observability, isolate sensitive secrets using environment configuration, and write unit tests to prevent regressions.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Per-Module Assessment Quiz */}
                        {currentModule.quiz && currentModule.quiz.length > 0 && (
                          <div style={{ marginTop: '24px', borderTop: '1.5px solid #E2E8F0', paddingTop: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                                  <HelpCircle size={18} color="#2563EB" /> Module {selectedModuleIndex + 1} Knowledge Assessment
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                  Score &ge; {activePlayerProgram.passing_score || 60}% on this test to pass and unlock the next module.
                                </div>
                              </div>
                              {isCurrentCompleted && (
                                <span style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontWeight: 700, fontSize: '12px', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Check size={14} /> Passed
                                </span>
                              )}
                            </div>

                            {/* Module Quiz Feedback Card */}
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
                                    {moduleQuizResult[currentModule.id].passed ? 'Module Test Passed! Next Module Unlocked' : 'Score Below Passing Threshold'}
                                  </div>
                                  <div style={{ fontSize: '12px', color: moduleQuizResult[currentModule.id].passed ? '#047857' : '#B91C1C', marginTop: '2px' }}>
                                    Your Score: {moduleQuizResult[currentModule.id].score_percent}% &bull; Correct: {moduleQuizResult[currentModule.id].correct_count}/{moduleQuizResult[currentModule.id].total_questions} (Pass Mark: {moduleQuizResult[currentModule.id].passing_threshold}%)
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Module Questions Form */}
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
                                    ? 'Retake Module Test'
                                    : 'Submit Module Test'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sequential Navigation Action Footer */}
                    {!isViewingQuiz && (
                      <div style={{ paddingTop: '20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                        <button
                          onClick={() => setSelectedModuleIndex((prev) => Math.max(0, prev - 1))}
                          disabled={selectedModuleIndex === 0}
                          className="btn btn-outline btn-sm"
                        >
                          Previous Module
                        </button>

                        {selectedModuleIndex < parsedModules.length - 1 ? (
                          <button
                            onClick={() => {
                              if (isCurrentCompleted) {
                                setSelectedModuleIndex((prev) => prev + 1);
                              } else {
                                toast.error(`Please pass the test for Module ${selectedModuleIndex + 1} to proceed.`);
                              }
                            }}
                            disabled={!isCurrentCompleted}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span>Next Module ({selectedModuleIndex + 2})</span>
                            <ArrowRight size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (allModulesCompleted) {
                                setSelectedModuleIndex('quiz');
                              } else {
                                toast.error('Please pass all module tests before attempting the final exam.');
                              }
                            }}
                            disabled={!allModulesCompleted}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#D97706', borderColor: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Award size={14} />
                            <span>Proceed to Final Certification Exam</span>
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

      {/* ─── Official Certificate Modal ─── */}
      <CertificateModal
        certificate={previewCert}
        isOpen={Boolean(previewCert)}
        onClose={() => setPreviewCert(null)}
      />
    </PortalLayout>
  );
}
