import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  Plus,
  Sparkles,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  Edit,
  ShieldCheck,
  X,
  Layers,
  Upload,
  Download,
  Code
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CertificateModal } from '../../components/common/CertificateModal';

export function IndustryLearningPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Publish / Edit Modal
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('curriculum'); // 'curriculum' or 'assessment'
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // AI Generator state
  const [aiTopic, setAiTopic] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [providerName, setProviderName] = useState(user?.organization_name || user?.username || 'Cognizant IT Services');
  const [programType, setProgramType] = useState('course');
  const [learningMode, setLearningMode] = useState('self_paced');
  const [targetAudience, setTargetAudience] = useState('all');
  const [facultyCredits, setFacultyCredits] = useState(2.0);
  const [deliveryFormat, setDeliveryFormat] = useState('online');
  const [duration, setDuration] = useState('4 Weeks');
  const [skillsCovered, setSkillsCovered] = useState('');
  const [description, setDescription] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [feeAmount, setFeeAmount] = useState(0);
  const [autoCertify, setAutoCertify] = useState(true);
  const [passingScore, setPassingScore] = useState(60);

  const [modules, setModules] = useState([
    { id: 1, title: 'Module 1: Orientation & Foundations', duration: '2 Hours', description: 'Core principles and setup.' },
    { id: 2, title: 'Module 2: Practical Implementation Workflows', duration: '3 Hours', description: 'Hands-on architectural patterns.' },
    { id: 3, title: 'Module 3: Enterprise Best Practices & Security', duration: '2.5 Hours', description: 'Performance and production standards.' },
    { id: 4, title: 'Module 4: Capstone Evaluation & Certification', duration: '2 Hours', description: 'Practical milestone for credentialing.' },
  ]);

  const [quizQuestions, setQuizQuestions] = useState([
    {
      id: 1,
      question: 'Which of the following architectural patterns is recommended for scalable microservices?',
      options: ['Decoupled service layers with interface contracts', 'Tightly coupling presentation and queries', 'Hardcoded configuration files', 'Disabling error logs'],
      correct_answer: 0,
      explanation: 'Decoupled service layers ensure independent scalability and high testability.',
    },
    {
      id: 2,
      question: 'What is the primary objective of enforcing schema validation on API payloads?',
      options: ['Preventing malformed data and injection vulnerabilities', 'Replacing database storage', 'Compressing bandwidth by 90%', 'Automating cloud provisioning'],
      correct_answer: 0,
      explanation: 'Schema validation provides proactive defense against corrupted data and security exploits.',
    },
  ]);

  const [jsonInputText, setJsonInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sampleTemplate = {
    title: "Enterprise Full-Stack Cloud & React Certification",
    provider_name: user?.organization_name || user?.username || "Cognizant Technology Solutions",
    program_type: "course",
    learning_mode: "self_paced",
    duration: "4 Weeks",
    skills_covered: "React, FastAPI, Docker, Microservices, CI/CD, SQL",
    description: "Comprehensive enterprise-grade training covering modern full-stack web architecture, API design, database optimization, and cloud deployment pipelines.",
    eligibility: "Basic knowledge of JavaScript / Python and web basics.",
    fee_amount: 0.0,
    passing_score: 60.0,
    auto_certify: true,
    modules: [
      {
        id: 1,
        title: "Module 1: Architecture & Foundations",
        duration: "2.5 Hours",
        reading_time: "25 mins",
        description: "Core principles of scalable enterprise architectures, layered patterns, and developer environment configuration.",
        topics: [
          "Monolithic vs Microservices Architecture",
          "Layered Clean Architecture & Separation of Concerns",
          "Configuring Local Development & Docker Containers"
        ],
        quiz: [
          {
            id: 1,
            question: "Which architectural pattern provides clean decoupling between UI presentation and business logic?",
            options: [
              "Layered / Clean Architecture with interface contracts",
              "Embedding raw SQL statements directly in React UI components",
              "Hardcoding state variables globally across all modules",
              "Disabling API schema validation middleware"
            ],
            correct_answer: 0,
            explanation: "Layered architecture separates UI, business logic, and persistence layers, ensuring high testability and maintainability."
          },
          {
            id: 2,
            question: "Why is containerization with Docker preferred in modern enterprise deployments?",
            options: [
              "It guarantees environment consistency across development, testing, and production",
              "It eliminates the need for writing unit tests",
              "It automatically writes database migration scripts",
              "It slows down deployment cycles intentionally"
            ],
            correct_answer: 0,
            explanation: "Docker standardizes execution environments, preventing the 'works on my machine' defect across staging and production."
          }
        ]
      },
      {
        id: 2,
        title: "Module 2: High-Performance API & Data Layer",
        duration: "3 Hours",
        reading_time: "30 mins",
        description: "Building resilient REST APIs, schema validation with Pydantic, and database indexing strategies.",
        topics: [
          "FastAPI Async Endpoints & Dependency Injection",
          "Database Indexing & Query Latency Optimization",
          "JWT Token Authentication & Role-Based Access Control"
        ],
        quiz: [
          {
            id: 1,
            question: "What is the primary benefit of creating database indices on frequently filtered columns?",
            options: [
              "Reduces query execution time by avoiding full-table scans",
              "Increases storage consumption indefinitely",
              "Disables foreign key constraints",
              "Replaces data encryption"
            ],
            correct_answer: 0,
            explanation: "Indices allow the database engine to perform rapid B-tree lookups instead of scanning every single row."
          },
          {
            id: 2,
            question: "Which HTTP status code should be returned when an unauthenticated user attempts to access a protected route?",
            options: [
              "401 Unauthorized",
              "200 OK",
              "404 Not Found",
              "500 Internal Server Error"
            ],
            correct_answer: 0,
            explanation: "HTTP 401 Unauthorized indicates that the request lacks valid authentication credentials."
          }
        ]
      },
      {
        id: 3,
        title: "Module 3: Enterprise Best Practices, Security & Capstone",
        duration: "3.5 Hours",
        reading_time: "35 mins",
        description: "Production security hardening, secret management, CI/CD pipeline automation, and certification capstone.",
        topics: [
          "OWASP Security Standards & Secret Management Vaults",
          "Automated CI/CD Workflows & Regression Testing",
          "Final Capstone Review & Certification Assessment"
        ],
        quiz: [
          {
            id: 1,
            question: "What is the industry best practice for handling production secrets and API keys?",
            options: [
              "Using encrypted environment variables and secret management vaults",
              "Committing plaintext secrets to public GitHub repositories",
              "Logging secrets to browser client consoles",
              "Sharing credentials via unencrypted emails"
            ],
            correct_answer: 0,
            explanation: "Secrets must be securely stored in vaults or environment managers to prevent catastrophic leaks."
          },
          {
            id: 2,
            question: "What is the main purpose of an automated CI/CD pipeline?",
            options: [
              "To automatically build, lint, test, and package applications on every code push",
              "To prevent engineers from contributing code",
              "To bypass all security audits",
              "To replace human code reviews entirely"
            ],
            correct_answer: 0,
            explanation: "CI/CD automates quality checks, test execution, and deployment verification."
          }
        ]
      }
    ]
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([JSON.stringify(sampleTemplate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course_and_module_quizzes_template.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sample JSON template downloaded successfully!');
  };

  const handleApplyJson = (rawInput) => {
    const textToParse = rawInput !== undefined ? rawInput : jsonInputText;
    if (!textToParse || !textToParse.trim()) {
      toast.error('Please paste JSON or upload a .json file.');
      return;
    }

    try {
      const parsed = typeof textToParse === 'string' ? JSON.parse(textToParse) : textToParse;

      // Case 1: Direct Array of Questions
      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && parsed[0].question) {
          setQuizQuestions(parsed);
          toast.success(`Imported ${parsed.length} questions into Assessment!`);
          setActiveFormTab('assessment');
          return;
        } else if (parsed.length > 0 && parsed[0].title) {
          setModules(parsed);
          toast.success(`Imported ${parsed.length} modules!`);
          setActiveFormTab('curriculum');
          return;
        }
      }

      // Case 2: Full Course Schema
      if (parsed.title) setTitle(parsed.title);
      if (parsed.provider_name) setProviderName(parsed.provider_name);
      if (parsed.program_type) setProgramType(parsed.program_type);
      if (parsed.learning_mode) setLearningMode(parsed.learning_mode);
      if (parsed.duration) setDuration(parsed.duration);
      if (parsed.skills_covered) setSkillsCovered(parsed.skills_covered);
      if (parsed.description) setDescription(parsed.description);
      if (parsed.eligibility) setEligibility(parsed.eligibility);
      if (parsed.fee_amount !== undefined) setFeeAmount(parsed.fee_amount);
      if (parsed.passing_score !== undefined) setPassingScore(Number(parsed.passing_score));
      if (parsed.auto_certify !== undefined) setAutoCertify(Boolean(parsed.auto_certify));

      if (parsed.modules && Array.isArray(parsed.modules)) {
        setModules(parsed.modules);
        if (!parsed.quiz) {
          const aggregated = [];
          parsed.modules.forEach((m) => {
            if (m.quiz && Array.isArray(m.quiz)) {
              aggregated.push(...m.quiz);
            }
          });
          if (aggregated.length > 0) {
            setQuizQuestions(aggregated);
          }
        }
      }

      if (parsed.quiz && Array.isArray(parsed.quiz)) {
        setQuizQuestions(parsed.quiz);
      }

      toast.success('Successfully imported course parameters, curriculum modules & per-module quizzes!');
      setActiveFormTab('curriculum');
    } catch (err) {
      toast.error('Invalid JSON structure: ' + err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content) {
        setJsonInputText(content);
        handleApplyJson(content);
      }
    };
    reader.readAsText(file);
  };

  // Enrolled Roster Modal
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [activeProgram, setActiveProgram] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [issuingCertId, setIssuingCertId] = useState(null);

  // Certificate Modal Preview
  const [previewCert, setPreviewCert] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = () => {
    setLoading(true);
    api.get('/learning-programs/industry/manage')
      .then((data) => setPrograms(data))
      .catch((err) => toast.error('Error fetching programs: ' + err.message))
      .finally(() => setLoading(false));
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error('Please enter a course topic or skill for AI generation.');
      return;
    }

    setGeneratingAi(true);
    try {
      const res = await api.post('/learning-programs/ai-generate-syllabus', {
        topic: aiTopic,
        program_type: programType,
        duration: duration,
        skill_level: 'Intermediate',
      });

      if (res.title) setTitle(res.title);
      if (res.description) setDescription(res.description);
      if (res.skills_covered) setSkillsCovered(res.skills_covered);
      if (res.duration) setDuration(res.duration);
      if (res.eligibility) setEligibility(res.eligibility);
      if (res.passing_score) setPassingScore(res.passing_score);
      if (res.modules && Array.isArray(res.modules)) {
        setModules(res.modules);
      }
      if (res.quiz && Array.isArray(res.quiz)) {
        setQuizQuestions(res.quiz);
      }
      toast.success('Curriculum modules AND certification questionnaire generated by AI!');
    } catch (err) {
      toast.error('AI generation error: ' + err.message);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleOpenPublish = (progToEdit = null) => {
    setActiveFormTab('curriculum');
    if (progToEdit) {
      setIsEditing(true);
      setEditId(progToEdit.id);
      setTitle(progToEdit.title);
      setProviderName(progToEdit.provider_name);
      setProgramType(progToEdit.program_type);
      setLearningMode(progToEdit.learning_mode);
      setTargetAudience(progToEdit.target_audience || 'all');
      setFacultyCredits(progToEdit.faculty_credits ?? 2.0);
      setDeliveryFormat(progToEdit.delivery_format || 'online');
      setDuration(progToEdit.duration || '4 Weeks');
      setSkillsCovered(progToEdit.skills_covered || '');
      setDescription(progToEdit.description || '');
      setEligibility(progToEdit.eligibility || '');
      setExternalLink(progToEdit.external_link || '');
      setFeeAmount(progToEdit.fee_amount || 0);
      setPassingScore(progToEdit.passing_score || 60);
      setAutoCertify(progToEdit.auto_certify ?? true);
      try {
        setModules(JSON.parse(progToEdit.modules_json || '[]'));
      } catch {
        setModules([]);
      }
      try {
        setQuizQuestions(JSON.parse(progToEdit.quiz_json || '[]'));
      } catch {
        setQuizQuestions([]);
      }
    } else {
      setIsEditing(false);
      setEditId(null);
      setTitle('');
      setAiTopic('');
      setProviderName(user?.organization_name || user?.username || 'Cognizant IT Services');
      setProgramType('course');
      setLearningMode('self_paced');
      setTargetAudience('all');
      setFacultyCredits(2.0);
      setDeliveryFormat('online');
      setDuration('4 Weeks');
      setSkillsCovered('Full-Stack Development, React, Node.js, REST API');
      setDescription('');
      setEligibility('Basic programming knowledge');
      setExternalLink('');
      setFeeAmount(0);
      setPassingScore(60);
      setAutoCertify(true);
      setModules([
        { id: 1, title: 'Module 1: Orientation & Foundations', duration: '2 Hours', description: 'Core principles and setup.' },
        { id: 2, title: 'Module 2: Practical Implementation Workflows', duration: '3 Hours', description: 'Hands-on architectural patterns.' },
        { id: 3, title: 'Module 3: Enterprise Best Practices & Security', duration: '2.5 Hours', description: 'Performance and production standards.' },
        { id: 4, title: 'Module 4: Capstone Evaluation & Certification', duration: '2 Hours', description: 'Practical milestone for credentialing.' },
      ]);
      setQuizQuestions([
        {
          id: 1,
          question: 'Which of the following architectural patterns is recommended for scalable microservices?',
          options: ['Decoupled service layers with interface contracts', 'Tightly coupling presentation and queries', 'Hardcoded configuration files', 'Disabling error logs'],
          correct_answer: 0,
          explanation: 'Decoupled service layers ensure independent scalability and high testability.',
        },
        {
          id: 2,
          question: 'What is the primary objective of enforcing schema validation on API payloads?',
          options: ['Preventing malformed data and injection vulnerabilities', 'Replacing database storage', 'Compressing bandwidth by 90%', 'Automating cloud provisioning'],
          correct_answer: 0,
          explanation: 'Schema validation provides proactive defense against corrupted data and security exploits.',
        },
      ]);
    }
    setShowPublishModal(true);
  };

  const handleSaveProgram = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required.');
      return;
    }

    let finalQuiz = [...quizQuestions];
    if (finalQuiz.length === 0) {
      modules.forEach((m) => {
        if (m.quiz && Array.isArray(m.quiz)) {
          finalQuiz.push(...m.quiz);
        }
      });
    }

    if (finalQuiz.length === 0) {
      toast.error('Please add at least 1 certification exam or module question.');
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      provider_name: providerName || 'Enterprise Partner',
      provider_type: 'industry',
      program_type: programType,
      learning_mode: learningMode,
      target_audience: targetAudience,
      faculty_credits: parseFloat(facultyCredits) || 2.0,
      delivery_format: deliveryFormat,
      duration,
      skills_covered: skillsCovered,
      description,
      eligibility,
      external_link: externalLink || null,
      fee_amount: parseFloat(feeAmount) || 0,
      passing_score: parseFloat(passingScore) || 60.0,
      auto_certify: autoCertify,
      modules_json: JSON.stringify(modules),
      quiz_json: JSON.stringify(quizQuestions),
    };

    try {
      if (isEditing && editId) {
        await api.put(`/learning-programs/${editId}`, payload);
        toast.success('Training program & assessment updated successfully.');
      } else {
        await api.post('/learning-programs', payload);
        toast.success('Training program with certification exam published!');
      }
      setShowPublishModal(false);
      fetchPrograms();
    } catch (err) {
      toast.error('Error saving program: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProgram = async (id) => {
    if (!window.confirm('Are you sure you want to delete this learning program? All associated enrollments will be deleted.')) {
      return;
    }
    try {
      await api.delete(`/learning-programs/${id}`);
      toast.success('Program removed.');
      fetchPrograms();
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
  };

  const handleOpenRoster = async (prog) => {
    setActiveProgram(prog);
    setShowRosterModal(true);
    setLoadingRoster(true);
    try {
      const data = await api.get(`/learning-programs/${prog.id}/students`);
      setRoster(data);
    } catch (err) {
      toast.error('Error loading participant roster: ' + err.message);
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleIssueCertificate = async (enrollmentId) => {
    setIssuingCertId(enrollmentId);
    try {
      const cert = await api.post(`/learning-programs/enrollments/${enrollmentId}/issue-certificate`);
      toast.success(`Verified Certificate #${cert.certificate_number} issued and emailed to student!`);
      if (activeProgram) {
        const updated = await api.get(`/learning-programs/${activeProgram.id}/students`);
        setRoster(updated);
      }
      fetchPrograms();
    } catch (err) {
      toast.error('Error issuing certificate: ' + err.message);
    } finally {
      setIssuingCertId(null);
    }
  };

  // Metrics summary
  const totalPrograms = programs.length;
  const totalEnrollments = programs.reduce((acc, p) => acc + (p.enrollments_count || 0), 0);
  const totalCompletions = programs.reduce((acc, p) => acc + (p.completed_count || 0), 0);
  const completionRate = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;

  return (
    <PortalLayout title="Industry Academy & Training Programs" allowedRoles={['industry', 'institution', 'admin']}>
      {/* ─── Hero Overview Banner ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#FFFFFF',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '4px 12px', borderRadius: '20px', color: '#38BDF8', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
            <Sparkles size={14} /> AI-POWERED CURRICULUM & CERTIFICATION EXAM ENGINE
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px', color: '#FFFFFF' }}>
            Publish Training Programs & Assessment Exams
          </h2>
          <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
            Automate technical course authoring and certification examinations. Students must achieve the required passing score on the final questionnaire to earn verified, cryptographically signed credentials.
          </p>
        </div>

        <button
          onClick={() => handleOpenPublish()}
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 22px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            transition: 'transform 0.15s, background-color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
        >
          <Plus size={16} /> Publish New Program
        </button>
      </div>

      {/* ─── Metric Cards Grid ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Active Programs</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{totalPrograms}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Enrolled Learners</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{totalEnrollments}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Certified Graduates</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{totalCompletions}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#FAF5FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Pass & Completion Rate</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{completionRate}%</div>
          </div>
        </div>
      </div>

      {/* ─── Published Programs Catalog Table ─── */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>Published Training & Certification Initiatives</h3>
            <p className="text-muted" style={{ fontSize: '12px', margin: '3px 0 0' }}>
              Manage curriculum syllabus, exam questionnaires, passing scores, and cohort performance
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading training initiatives..." />
        ) : programs.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <BookOpen size={26} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>No training programs published yet</h4>
            <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: '0 auto 20px' }}>
              Publish your first course. The AI Engine will generate both the complete curriculum and the certification examination questions in seconds.
            </p>
            <button onClick={() => handleOpenPublish()} className="btn btn-primary btn-sm">
              <Plus size={14} /> Publish First Program
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Program Title & Skills</th>
                  <th>Type & Mode</th>
                  <th>Duration</th>
                  <th>Passing Mark</th>
                  <th>Enrollments</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => {
                  let quizCount = 0;
                  try {
                    quizCount = JSON.parse(p.quiz_json || '[]').length;
                  } catch {}

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>{p.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          {p.skills_covered ? `Skills: ${p.skills_covered}` : p.provider_name}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                          <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                            {p.program_type}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'capitalize' }}>
                            {p.learning_mode?.replace('_', ' ') || 'Online'}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={13} color="#64748B" /> {p.duration || 'Self-Paced'}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #BFDBFE',
                          }}
                        >
                          <HelpCircle size={12} /> {p.passing_score || 60}% ({quizCount} MCQs)
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                            {p.enrollments_count || 0}
                          </span>
                          <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>
                            ({p.completed_count || 0} Certified)
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenRoster(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}
                            title="View Enrolled Students"
                          >
                            <Users size={13} /> Cohort ({p.enrollments_count || 0})
                          </button>
                          <button
                            onClick={() => handleOpenPublish(p)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '6px 8px' }}
                            title="Edit Program & Questions"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteProgram(p.id)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '6px 8px', color: '#EF4444', borderColor: '#FCA5A5' }}
                            title="Delete Program"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Publish / Edit Program Modal with Curriculum & Assessment Tabs ─── */}
      {showPublishModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPublishModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '92vh',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                background: 'linear-gradient(90deg, #EFF6FF 0%, #DBEAFE 100%)',
                borderBottom: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                    {isEditing ? 'Edit Training Program & Exam' : 'Publish Training Program & Certification Exam'}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
                    Configure syllabus modules and the exam questionnaire required for certification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-Navigation Tabs: Curriculum vs Assessment */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 24px', backgroundColor: '#F8FAFC' }}>
              <button
                type="button"
                onClick={() => setActiveFormTab('curriculum')}
                style={{
                  padding: '12px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeFormTab === 'curriculum' ? '2.5px solid #2563EB' : '2.5px solid transparent',
                  color: activeFormTab === 'curriculum' ? '#2563EB' : '#64748B',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Layers size={15} /> 1. Course Curriculum & Details
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('assessment')}
                style={{
                  padding: '12px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeFormTab === 'assessment' ? '2.5px solid #2563EB' : '2.5px solid transparent',
                  color: activeFormTab === 'assessment' ? '#2563EB' : '#64748B',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <HelpCircle size={15} /> 2. Certification Exam & MCQs ({quizQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('json')}
                style={{
                  padding: '12px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeFormTab === 'json' ? '2.5px solid #2563EB' : '2.5px solid transparent',
                  color: activeFormTab === 'json' ? '#2563EB' : '#64748B',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Code size={15} /> 3. ⚡ Upload / Paste JSON
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveProgram} style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* AI Quick Generator Box */}
              {!isEditing && (
                <div
                  style={{
                    backgroundColor: '#F0FDF4',
                    border: '1.5px solid #86EFAC',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                    <Sparkles size={16} /> Instant AI Curriculum & Exam Questionnaire Generator
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="e.g. Full-Stack React & FastAPI, AWS Cloud Engineering, GenAI Prompting"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13.5px',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={generatingAi}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '13px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: generatingAi ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {generatingAi ? <LoadingSpinner inline size={14} /> : <Sparkles size={14} />}
                      {generatingAi ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                </div>
              )}

              {activeFormTab === 'curriculum' ? (
                <>
                  {/* Title */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                      Program Title <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Enterprise Full-Stack Engineering Certification"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Two Column Row: Program Type & Delivery Mode */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                        Program Nature <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        value={programType}
                        onChange={(e) => setProgramType(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                      >
                        <option value="course">Certification Course</option>
                        <option value="bootcamp">Intensive Bootcamp</option>
                        <option value="workshop">Hands-on Technical Workshop</option>
                        <option value="mentorship">Live Industry Mentorship Cohort</option>
                        <option value="fdp">Faculty Development Program (FDP)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                        Delivery Mode <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        value={learningMode}
                        onChange={(e) => setLearningMode(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                      >
                        <option value="self_paced">Self-Paced Online (Interactive Modules)</option>
                        <option value="online">Live Online Instructor-led</option>
                        <option value="hybrid">Hybrid (Campus + Online)</option>
                        <option value="offline">On-Campus / Corporate Lab</option>
                      </select>
                    </div>
                  </div>

                  {/* Two Column Row: Target Audience & Faculty Credits */}
                  <div style={{ display: 'grid', gridTemplateColumns: (targetAudience === 'faculty' || programType === 'fdp') ? '1fr 1fr' : '1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                        Target Audience <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                      >
                        <option value="all">All Audiences (Open to All)</option>
                        <option value="faculty">Faculty & Academicians Only (FDP)</option>
                        <option value="student">Students Only</option>
                      </select>
                    </div>

                    {(targetAudience === 'faculty' || programType === 'fdp') && (
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                          FDP Academic Credits (e.g. 2.0 Credits)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="20"
                          placeholder="e.g. 2.0"
                          value={facultyCredits}
                          onChange={(e) => setFacultyCredits(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Two Column Row: Duration & Skills Covered */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                        Estimated Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 4 Weeks, 30 Hours"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                        Skills Covered (Comma-Separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. React, Node.js, REST API, Docker"
                        value={skillsCovered}
                        onChange={(e) => setSkillsCovered(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                      Overview & Learning Objectives <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Detail the course outcomes, practical competencies, and target audience..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Modules Breakdown Section */}
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', backgroundColor: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={16} color="#2563EB" /> Curriculum Modules ({modules.length})
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextId = modules.length + 1;
                          setModules([...modules, { id: nextId, title: `Module ${nextId}: Advanced Application`, duration: '2 Hours', description: 'Advanced workflows and assessments.' }]);
                        }}
                        style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={13} /> Add Module
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {modules.map((m, idx) => (
                        <div key={m.id || idx} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>
                            {idx + 1}
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                placeholder="Module Title"
                                value={m.title}
                                onChange={(e) => {
                                  const copy = [...modules];
                                  copy[idx].title = e.target.value;
                                  setModules(copy);
                                }}
                                style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                              />
                              <input
                                type="text"
                                placeholder="Duration (e.g. 2 Hours)"
                                value={m.duration || ''}
                                onChange={(e) => {
                                  const copy = [...modules];
                                  copy[idx].duration = e.target.value;
                                  setModules(copy);
                                }}
                                style={{ width: '130px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Brief description / Key topics"
                              value={m.description || ''}
                              onChange={(e) => {
                                const copy = [...modules];
                                copy[idx].description = e.target.value;
                                setModules(copy);
                              }}
                              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                            />
                          </div>
                          {modules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setModules(modules.filter((_, i) => i !== idx))}
                              style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : activeFormTab === 'assessment' ? (
                /* ─── Assessment Questionnaire & Passing Score Tab ─── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Passing Score Control */}
                  <div
                    style={{
                      backgroundColor: '#EFF6FF',
                      border: '1.5px solid #BFDBFE',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={18} color="#2563EB" /> Minimum Passing Mark Required for Certificate
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                        Students must achieve this percentage threshold on the exam to receive their verified credential.
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        value={passingScore}
                        onChange={(e) => setPassingScore(Number(e.target.value))}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1px solid #3B82F6',
                          backgroundColor: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#1D4ED8',
                          cursor: 'pointer',
                        }}
                      >
                        <option value={50}>50% Minimum</option>
                        <option value={60}>60% (Recommended)</option>
                        <option value={70}>70% Strict</option>
                        <option value={80}>80% Mastery</option>
                        <option value={90}>90% Expert</option>
                      </select>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                      Certification Examination Questions ({quizQuestions.length} MCQs)
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const nextId = quizQuestions.length + 1;
                        setQuizQuestions([
                          ...quizQuestions,
                          {
                            id: nextId,
                            question: `Question ${nextId}: What is the correct approach to ...?`,
                            options: ['Option A (Correct)', 'Option B', 'Option C', 'Option D'],
                            correct_answer: 0,
                            explanation: 'Explanation for why this is correct.',
                          },
                        ]);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={13} /> Add Question
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {quizQuestions.map((q, qIdx) => (
                      <div
                        key={q.id || qIdx}
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '16px 18px',
                        }}
                      >
                        {/* Question Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
                            Question {qIdx + 1}
                          </span>
                          {quizQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== qIdx))}
                              style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        {/* Question text */}
                        <textarea
                          rows={2}
                          placeholder="Enter question text..."
                          value={q.question}
                          onChange={(e) => {
                            const copy = [...quizQuestions];
                            copy[qIdx].question = e.target.value;
                            setQuizQuestions(copy);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '13.5px',
                            fontWeight: 600,
                            marginBottom: '12px',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                          }}
                        />

                        {/* 4 Options Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.correct_answer === optIdx;
                            return (
                              <div
                                key={optIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  backgroundColor: isCorrect ? '#ECFDF5' : '#FFFFFF',
                                  border: isCorrect ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                                  borderRadius: '8px',
                                  padding: '4px 8px',
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`correct_q_${qIdx}`}
                                  checked={isCorrect}
                                  onChange={() => {
                                    const copy = [...quizQuestions];
                                    copy[qIdx].correct_answer = optIdx;
                                    setQuizQuestions(copy);
                                  }}
                                  title="Mark as correct option"
                                  style={{ cursor: 'pointer', accentColor: '#10B981' }}
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                  onChange={(e) => {
                                    const copy = [...quizQuestions];
                                    copy[qIdx].options[optIdx] = e.target.value;
                                    setQuizQuestions(copy);
                                  }}
                                  style={{
                                    flex: 1,
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '12.5px',
                                    background: 'transparent',
                                    color: isCorrect ? '#065F46' : '#0F172A',
                                    fontWeight: isCorrect ? 600 : 400,
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        <input
                          type="text"
                          placeholder="Explanation (shown to student during exam review)..."
                          value={q.explanation || ''}
                          onChange={(e) => {
                            const copy = [...quizQuestions];
                            copy[qIdx].explanation = e.target.value;
                            setQuizQuestions(copy);
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0',
                            fontSize: '12px',
                            color: '#64748B',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ─── JSON Schema Upload & Template Tab ─── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Download Template Banner */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Download size={18} color="#2563EB" /> Download Standard Course & Quiz Template (.json)
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                        Get the exact JSON structure with sample modules, topics, and MCQs with 0-indexed correct answers.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                    >
                      <Download size={14} /> Download Sample JSON
                    </button>
                  </div>

                  {/* Drag & Drop / File Picker */}
                  <div
                    style={{
                      border: '2px dashed #93C5FD',
                      borderRadius: '12px',
                      padding: '24px',
                      backgroundColor: '#EFF6FF',
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%',
                      }}
                    />
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                      <Upload size={20} />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
                      Click or drag a .json file here to upload
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                      Supports full course schema or array of assessment questions
                    </div>
                  </div>

                  {/* Raw JSON Paste Area */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Code size={15} color="#2563EB" /> Or Paste Raw JSON Directly:
                      </label>
                      <button
                        type="button"
                        onClick={() => handleApplyJson()}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '6px 14px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <CheckCircle2 size={13} /> Parse & Apply Parameters
                      </button>
                    </div>
                    <textarea
                      rows={10}
                      placeholder={`Paste JSON here, e.g.:\n{\n  "title": "Cloud Computing Masterclass",\n  "passing_score": 60,\n  "modules": [...]\n}`}
                      value={jsonInputText}
                      onChange={(e) => setJsonInputText(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12.5px',
                        fontFamily: 'monospace',
                        backgroundColor: '#0F172A',
                        color: '#38BDF8',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Automated Certificate & Dispatch Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: '#EFF6FF',
                  borderRadius: '10px',
                  border: '1px solid #BFDBFE',
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="#2563EB" /> Automated Certificate Generation on Passing Score
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    Instantly generates cryptographic certificate and sends email to student once they achieve {passingScore}% or higher on the exam.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoCertify}
                  onChange={(e) => setAutoCertify(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563EB' }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
                <button type="button" onClick={() => setShowPublishModal(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={14} />
                  {submitting ? 'Publishing...' : isEditing ? 'Save Changes' : 'Publish Program & Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Enrolled Cohort Roster Modal with Exam Scores ─── */}
      {showRosterModal && activeProgram && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRosterModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '860px',
              maxHeight: '90vh',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                  Participant Cohort: {activeProgram.title}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748B' }}>
                  {roster.length} Enrolled Students &bull; Required Exam Passing Score: {activeProgram.passing_score || 60}%
                </p>
              </div>
              <button
                onClick={() => setShowRosterModal(false)}
                style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Roster Table */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {loadingRoster ? (
                <LoadingSpinner message="Fetching cohort roster..." />
              ) : roster.length === 0 ? (
                <div style={{ padding: '36px 0', textAlign: 'center', color: '#64748B' }}>
                  <Users size={32} style={{ margin: '0 auto 8px', color: '#94A3B8' }} />
                  <p style={{ margin: 0, fontSize: '14px' }}>No students have enrolled in this program yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Participant / Role</th>
                        <th>Institution / Dept</th>
                        <th>Module Progress</th>
                        <th>Exam Result</th>
                        <th style={{ textAlign: 'right' }}>Certificate Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((s) => (
                        <tr key={s.enrollment_id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>{s.student_name}</span>
                              {s.participant_role === 'faculty' && (
                                <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#F3E8FF', color: '#7E22CE', fontWeight: 800 }}>FACULTY</span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              {s.participant_role === 'faculty' && s.participant_designation ? `${s.participant_designation} • ` : ''}{s.student_email}
                            </div>
                          </td>
                          <td style={{ fontSize: '12.5px', color: '#475569' }}>
                            <div>{s.student_institution || 'Independent Candidate'}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{s.student_department || ''}</div>
                          </td>
                          <td style={{ width: '130px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '7px', backgroundColor: '#E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${s.progress_percent}%`,
                                    backgroundColor: s.progress_percent >= 100 ? '#10B981' : '#2563EB',
                                    borderRadius: '10px',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                                {s.progress_percent}%
                              </span>
                            </div>
                          </td>
                          <td>
                            {s.quiz_score !== null && s.quiz_score !== undefined ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: s.quiz_passed ? '#ECFDF5' : '#FEF2F2',
                                  color: s.quiz_passed ? '#047857' : '#991B1B',
                                  border: `1px solid ${s.quiz_passed ? '#A7F3D0' : '#FECACA'}`,
                                }}
                              >
                                {s.quiz_passed ? <CheckCircle2 size={12} /> : <X size={12} />}
                                {s.quiz_score}% {s.quiz_passed ? 'Passed' : 'Failed'} ({s.quiz_attempts} {s.quiz_attempts === 1 ? 'try' : 'tries'})
                              </span>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                                Exam Pending
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {s.certificate_issued ? (
                              <button
                                onClick={() =>
                                  setPreviewCert({
                                    certificate_number: s.certificate_number,
                                    student_name: s.student_name,
                                    program_title: activeProgram.title,
                                    issuer_name: activeProgram.provider_name,
                                    issue_date: s.completed_at || new Date().toISOString(),
                                    verification_hash: s.verification_hash,
                                    skills: activeProgram.skills_covered,
                                    recipient_role: s.participant_role,
                                    credits: activeProgram.faculty_credits,
                                    designation: s.participant_designation,
                                    institution_name: s.student_institution,
                                  })
                                }
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '5px 10px',
                                  backgroundColor: '#ECFDF5',
                                  color: '#047857',
                                  border: '1px solid #A7F3D0',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                <ShieldCheck size={13} /> View Cert (#{s.certificate_number?.substring(0, 12)})
                              </button>
                            ) : s.quiz_passed ? (
                              <button
                                onClick={() => handleIssueCertificate(s.enrollment_id)}
                                disabled={issuingCertId === s.enrollment_id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '5px 12px',
                                  backgroundColor: '#2563EB',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  cursor: issuingCertId === s.enrollment_id ? 'not-allowed' : 'pointer',
                                }}
                              >
                                <Award size={13} />
                                {issuingCertId === s.enrollment_id ? 'Dispatching...' : 'Issue & Email'}
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#64748B' }}>
                                Awaiting Exam Pass
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRosterModal(false)} className="btn btn-secondary btn-sm">
                Close Roster
              </button>
            </div>
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
