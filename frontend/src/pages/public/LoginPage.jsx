import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(usernameOrEmail, password);
      // Role-based routing
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoProfiles = [
    { label: 'Student', icon: '🎓', email: 'student@aicportal.in', pass: 'StudentPassword@2026' },
    { label: 'Faculty', icon: '👨‍🏫', email: 'faculty@aicportal.in', pass: 'FacultyPassword@2026' },
    { label: 'Industry', icon: '🏢', email: 'industry@aicportal.in', pass: 'IndustryPassword@2026' },
    { label: 'Institution', icon: '🏛️', email: 'institution@aicportal.in', pass: 'InstPassword@2026' },
    { label: 'Super Admin', icon: '🛡️', email: 'admin@aicportal.in', pass: 'AdminPassword@2026' },
  ];

  const handleQuickLogin = async (emailVal, passVal) => {
    setUsernameOrEmail(emailVal);
    setPassword(passVal);
    setError('');
    setLoading(true);
    try {
      const user = await login(emailVal, passVal);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F6F8' }}>
      <PublicHeader />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', color: '#1E2A44', marginBottom: '6px', fontWeight: 700 }}>Portal Authentication</h2>
            <p className="text-muted" style={{ fontSize: '13px' }}>
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
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 500 }}>Email or Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px', borderRadius: '6px' }}
                  placeholder="name@domain.com"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '38px', paddingRight: '38px', borderRadius: '6px' }}
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '9px',
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
              style={{ width: '100%', padding: '11px', marginTop: '10px', fontSize: '14.5px', fontWeight: 600, borderRadius: '6px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* 5-Stakeholder Quick Access Bar */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Quick Demo Sign-In:
              </span>
              <span style={{ fontSize: '11px', color: '#64748B', backgroundColor: '#E2E8F0', padding: '2px 8px', borderRadius: '10px' }}>
                One-Click
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '6px' }}>
              {demoProfiles.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleQuickLogin(p.email, p.pass)}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '8px 4px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#1E293B',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3B5BDB'; e.currentTarget.style.backgroundColor = '#EFF6FF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                  title={`Sign in as ${p.label} (${p.email})`}
                >
                  <span style={{ fontSize: '16px' }}>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '13px' }}>
            <span className="text-muted">Do not have an account? </span>
            <Link to="/register" style={{ fontWeight: 600, color: '#3B5BDB' }}>Register as a Stakeholder</Link>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
