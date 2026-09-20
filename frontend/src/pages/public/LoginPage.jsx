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

  const fillAdminCredentials = () => {
    setUsernameOrEmail('admin@aicportal.in');
    setPassword('AdminPassword@2026');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F6F8' }}>
      <PublicHeader />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', color: '#1E2A44', marginBottom: '6px' }}>Portal Authentication</h2>
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
              borderRadius: '4px',
              padding: '10px 12px',
              color: '#991B1B',
              fontSize: '13px',
              marginBottom: '18px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email or Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder="name@domain.com"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
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
                  style={{ paddingLeft: '36px', paddingRight: '36px' }}
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              style={{ width: '100%', padding: '10px', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Initial Super Admin Quick Access */}
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '4px', fontSize: '12px' }}>
            <div style={{ fontWeight: 600, color: '#1E2A44', marginBottom: '4px' }}>Initial Super Admin Bootstrapped:</div>
            <div style={{ color: '#475569' }}>User: <code>admin@aicportal.in</code></div>
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="btn btn-outline btn-sm"
              style={{ marginTop: '8px', width: '100%', fontSize: '11.5px' }}
            >
              Use Initial Super Admin Credentials
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
            <span className="text-muted">Do not have an account? </span>
            <Link to="/register" style={{ fontWeight: 600 }}>Register as a Stakeholder</Link>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
