import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Briefcase,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Check
} from 'lucide-react';

export function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const demoRoles = [
    {
      roleKey: 'student',
      title: 'Student',
      subtitle: 'Skill assessments, internships & portfolio',
      email: 'student@aicportal.in',
      password: 'DemoPassword@2026',
      icon: GraduationCap,
      color: '#3B5BDB',
      bgLight: '#EEF2FF',
      border: '#C7D2FE'
    },
    {
      roleKey: 'faculty',
      title: 'Faculty / Academician',
      subtitle: 'FDPs, research proposals & consultancy',
      email: 'faculty@aicportal.in',
      password: 'DemoPassword@2026',
      icon: BookOpen,
      color: '#0284C7',
      bgLight: '#F0F9FF',
      border: '#BAE6FD'
    },
    {
      roleKey: 'industry',
      title: 'Industry / Recruiter',
      subtitle: 'Post opportunities, AI quizzes & hire',
      email: 'industry@aicportal.in',
      password: 'DemoPassword@2026',
      icon: Briefcase,
      color: '#7C3AED',
      bgLight: '#F5F3FF',
      border: '#DDD6FE'
    },
    {
      roleKey: 'institution',
      title: 'Educational Institution',
      subtitle: 'Placement telemetry & document verification',
      email: 'institution@aicportal.in',
      password: 'DemoPassword@2026',
      icon: Building2,
      color: '#D97706',
      bgLight: '#FFFBEB',
      border: '#FDE68A'
    },
    {
      roleKey: 'admin',
      title: 'Super Administrator',
      subtitle: 'Platform governance, approvals & audits',
      email: 'admin@aicportal.in',
      password: 'AdminPassword@2026',
      icon: ShieldCheck,
      color: '#16803C',
      bgLight: '#F0FDF4',
      border: '#BBF7D0'
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

  const fillCredentialsOnly = (demo) => {
    setUsernameOrEmail(demo.email);
    setPassword(demo.password);
    setActiveDemoRole(demo.roleKey);
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F6F8' }}>
      <PublicHeader />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 14px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '24px',
          maxWidth: '960px',
          width: '100%',
          alignItems: 'start'
        }}>
          {/* Main Login Form Card */}
          <div className="card" style={{ padding: 'clamp(18px, 4vw, 32px)' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', color: '#1E2A44', marginBottom: '6px', fontWeight: 700 }}>
                Portal Authentication
              </h2>
              <p className="text-muted" style={{ fontSize: '13.5px' }}>
                Sign in to access your designated stakeholder dashboard
              </p>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: '6px',
                padding: '10px 14px',
                color: '#991B1B',
                fontSize: '13px',
                marginBottom: '18px'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email or Username</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    placeholder="name@domain.com"
                    value={usernameOrEmail}
                    onChange={(e) => {
                      setUsernameOrEmail(e.target.value);
                      setActiveDemoRole(null);
                    }}
                    required
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingLeft: '38px', paddingRight: '38px' }}
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setActiveDemoRole(null);
                    }}
                    required
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94A3B8'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '11px', marginTop: '10px', fontSize: '14.5px', fontWeight: 600 }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13.5px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              <span className="text-muted">Do not have an account? </span>
              <Link to="/register" style={{ fontWeight: 600, color: '#3B5BDB' }}>Register as a Stakeholder</Link>
            </div>
          </div>

          {/* Quick Demo Logins for All Roles */}
          <div className="card" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sparkles size={18} color="#3B5BDB" />
              <h3 style={{ fontSize: '17px', color: '#1E2A44', fontWeight: 700, margin: 0 }}>
                Demo Stakeholder Logins
              </h3>
            </div>
            <p className="text-muted" style={{ fontSize: '12.5px', marginBottom: '18px' }}>
              Select any stakeholder role to pre-fill credentials or log in instantly:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {demoRoles.map((demo) => {
                const IconComponent = demo.icon;
                const isSelected = activeDemoRole === demo.roleKey;

                return (
                  <div
                    key={demo.roleKey}
                    style={{
                      border: isSelected ? `2px solid ${demo.color}` : '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      backgroundColor: isSelected ? demo.bgLight : '#F8FAFC',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div
                      style={{ cursor: 'pointer', flex: 1 }}
                      onClick={() => fillCredentialsOnly(demo)}
                      title="Click to fill form"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: demo.bgLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: demo.color
                        }}>
                          <IconComponent size={15} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '13.5px', color: '#1E2A44' }}>
                          {demo.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                        {demo.email}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => fillAndLoginDemo(demo)}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: demo.color,
                          color: '#FFFFFF',
                          fontSize: '11.5px',
                          padding: '5px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: 'none'
                        }}
                        disabled={loading}
                      >
                        Login <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: '16px',
              padding: '10px 12px',
              backgroundColor: '#F1F5F9',
              borderRadius: '6px',
              fontSize: '11.5px',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>💡 Password for all demo accounts: <code>DemoPassword@2026</code> (Admin: <code>AdminPassword@2026</code>)</span>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
