import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  BarChart3,
  Users,
  Briefcase,
  GraduationCap,
  Building2,
  BookOpen,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';


function AicLogo({ size = 36 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
        color: '#FFFFFF',
        flexShrink: 0
      }}
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </div>
  );
}

export function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoLogins, setShowDemoLogins] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const demoRoles = [
    {
      roleKey: 'student',
      title: 'Student',
      email: 'student@aicportal.in',
      password: 'DemoPassword@2026',
      icon: GraduationCap,
      color: '#2563EB',
      bgLight: '#EFF6FF',
    },
    {
      roleKey: 'faculty',
      title: 'Faculty / Academician',
      email: 'faculty@aicportal.in',
      password: 'DemoPassword@2026',
      icon: BookOpen,
      color: '#0284C7',
      bgLight: '#F0F9FF',
    },
    {
      roleKey: 'industry',
      title: 'Industry / Recruiter',
      email: 'industry@aicportal.in',
      password: 'DemoPassword@2026',
      icon: Briefcase,
      color: '#7C3AED',
      bgLight: '#FAF5FF',
    },
    {
      roleKey: 'institution',
      title: 'Educational Institution',
      email: 'institution@aicportal.in',
      password: 'DemoPassword@2026',
      icon: Building2,
      color: '#D97706',
      bgLight: '#FFFBEB',
    },
    {
      roleKey: 'admin',
      title: 'Super Administrator',
      email: 'admin@aicportal.in',
      password: 'AdminPassword@2026',
      icon: ShieldCheck,
      color: '#16803C',
      bgLight: '#F0FDF4',
    }
  ];

  const handleLoginSubmit = async (e, customEmail = null, customPassword = null) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const emailToUse = customEmail || usernameOrEmail;
    const pwdToUse = customPassword || password;

    try {
      const user = await login(emailToUse, pwdToUse);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAndLoginDemo = async (demo) => {
    setUsernameOrEmail(demo.email);
    setPassword(demo.password);
    setActiveDemoRole(demo.roleKey);
    await handleLoginSubmit(null, demo.email, demo.password);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F8FAFC',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#0F172A',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* ─── Top Navbar ─── */}
      <header
        style={{
          height: '72px',
          padding: '0 clamp(16px, 4vw, 48px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #EEF2F6',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <AicLogo size={36} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              AIC PORTAL
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
              Centralized Skill Mapping & Placement Platform
            </div>
          </div>
        </Link>
      </header>

      {/* ─── Hero Section with Split Layout & 3D Background ─── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(24px, 4vw, 56px) clamp(16px, 4vw, 48px)',
          position: 'relative',
          backgroundImage: "linear-gradient(135deg, rgba(248, 250, 252, 0.86) 0%, rgba(241, 245, 249, 0.72) 50%, rgba(238, 242, 255, 0.82) 100%), url('/loginpage.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: 'clamp(32px, 6vw, 64px)',
            alignItems: 'center'
          }}
        >
          {/* ─── Left Column: Hero Content & Feature Highlights ─── */}
          <div>
            {/* Pill Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                backgroundColor: '#EEF2FF',
                border: '1px solid #C7D2FE',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#3730A3',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}
            >
              <span>ACADEMIA</span>
              <span style={{ color: '#818CF8' }}>×</span>
              <span>INDUSTRY</span>
              <span style={{ color: '#818CF8' }}>×</span>
              <span>OPPORTUNITIES</span>
            </div>

            {/* Big Headline */}
            <h1
              style={{
                fontSize: 'clamp(36px, 4.5vw, 54px)',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-1.5px',
                color: '#0F172A',
                marginBottom: '18px'
              }}
            >
              Skills<br />
              <span style={{ color: '#2563EB' }}>Connect</span><br />
              Opportunities
            </h1>

            {/* Paragraph Subtitle */}
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#475569',
                maxWidth: '460px',
                marginBottom: '32px'
              }}
            >
              A unified platform to map skills, collaborate with industry, and create meaningful placement opportunities for a brighter future.
            </p>

            {/* Feature Highlights Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '18px 24px',
                marginBottom: '32px'
              }}
            >
              {/* Feature 1 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <BarChart3 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Skill Mapping</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', lineHeight: 1.3 }}>
                    Identify and showcase real-world skills
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Industry Collaboration</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', lineHeight: 1.3 }}>
                    Connect with leading industry partners
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#FFF7ED',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Briefcase size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Placement Opportunities</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', lineHeight: 1.3 }}>
                    Discover internships and full-time roles
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#FAF5FF',
                    color: '#9333EA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <GraduationCap size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Stronger Ecosystem</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', lineHeight: 1.3 }}>
                    Empowering students, institutions and industry
                  </div>
                </div>
              </div>
            </div>

            {/* Quote with Blue Left Accent Bar */}
            <div
              style={{
                borderLeft: '3px solid #2563EB',
                paddingLeft: '14px',
                fontSize: '13.5px',
                fontStyle: 'italic',
                color: '#475569',
                lineHeight: 1.4
              }}
            >
              “Bridging the gap between learning and real-world impact.”
            </div>
          </div>

          {/* ─── Right Column: Modern Sign In Card ─── */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: 'clamp(24px, 4vw, 36px) clamp(20px, 3.5vw, 32px)',
                width: '100%',
                maxWidth: '430px',
                boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.85)'
              }}
            >
              {/* Card Header */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', margin: 0 }}>
                  Welcome to AIC Portal
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '6px', margin: 0 }}>
                  Sign in to access your account
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    marginBottom: '18px',
                    lineHeight: 1.4
                  }}
                >
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit}>
                {/* Email / Username Field */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                    Email or Username
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="name@domain.com"
                      value={usernameOrEmail}
                      onChange={(e) => {
                        setUsernameOrEmail(e.target.value);
                        setActiveDemoRole(null);
                      }}
                      required
                      style={{
                        width: '100%',
                        height: '46px',
                        paddingLeft: '40px',
                        paddingRight: '14px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '14px',
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF',
                        outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563EB';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <Mail size={17} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
                  </div>
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setActiveDemoRole(null);
                      }}
                      required
                      style={{
                        width: '100%',
                        height: '46px',
                        paddingLeft: '40px',
                        paddingRight: '40px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '14px',
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF',
                        outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563EB';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <Lock size={17} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '13px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8',
                        padding: '2px'
                      }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    fontSize: '13px'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: '#2563EB',
                        cursor: 'pointer'
                      }}
                    />
                    Remember me
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Please contact your institutional or platform administrator to reset your credentials.');
                    }}
                    style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Sign In Primary Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '46px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = '#1D4ED8';
                  }}
                  onMouseOut={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = '#2563EB';
                  }}
                >
                  {loading ? 'Signing in...' : (
                    <>
                      Sign In <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>


              {/* Register Link */}
              <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '13.5px', color: '#64748B' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                  Register here
                </Link>
              </div>

              {/* ─── Quick Demo Logins Drawer / Accordion ─── */}
              <div style={{ marginTop: '20px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowDemoLogins(!showDemoLogins)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    color: '#64748B',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={13} color="#2563EB" /> 1-Click Demo Accounts
                  </span>
                  {showDemoLogins ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showDemoLogins && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {demoRoles.map((demo) => {
                      const IconComp = demo.icon;
                      return (
                        <div
                          key={demo.roleKey}
                          onClick={() => fillAndLoginDemo(demo)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            backgroundColor: demo.bgLight,
                            border: `1px solid ${demo.color}30`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'transform 0.1s ease',
                            fontSize: '12px'
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                          onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ color: demo.color }}>
                              <IconComp size={15} />
                            </div>
                            <span style={{ fontWeight: 600, color: '#1E293B' }}>{demo.title}</span>
                          </div>
                          <span style={{ fontSize: '11px', color: demo.color, fontWeight: 700 }}>Log In →</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Bottom Footer ─── */}
      <footer
        style={{
          padding: '24px clamp(16px, 4vw, 48px)',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #EEF2F6',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '12.5px',
          color: '#64748B'
        }}
      >
        {/* Left Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AicLogo size={26} />
          <div>
            <span style={{ fontWeight: 800, color: '#0F172A' }}>AIC PORTAL</span>
            <span style={{ margin: '0 8px', color: '#CBD5E1' }}>•</span>
            <span style={{ fontSize: '11.5px', color: '#64748B' }}>Centralized Skill Mapping & Placement Platform</span>
          </div>
        </div>



        {/* Right Copyright */}
        <div style={{ textAlign: 'right', fontSize: '11.5px' }}>
          <div>© 2026 AIC Portal. All rights reserved.</div>
          <div style={{ color: '#94A3B8', marginTop: '2px' }}>Building a skilled tomorrow, together.</div>
        </div>
      </footer>
    </div>
  );
}
