import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { CheckCircle, AlertCircle, Building2, Landmark, Info } from 'lucide-react';

export function RegisterPage() {
  const [role, setRole] = useState('industry');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Role-specific fields
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [institutionName, setInstitutionName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      role,
      full_name: fullName,
      email,
      username,
      password,
      phone,
      address,
      company_name: role === 'industry' ? companyName : null,
      sector: role === 'industry' ? sector : null,
      institution_name: role === 'institution' ? institutionName : null,
    };

    try {
      await register(payload);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F6F8' }}>
      <PublicHeader />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div className="card" style={{ maxWidth: '640px', width: '100%', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', color: '#1E2A44', marginBottom: '6px' }}>Stakeholder Registration</h2>
            <p className="text-muted" style={{ fontSize: '13px' }}>
              Create an official partner account for Industry or Academic Institutions.
            </p>
          </div>

          {/* Student & Faculty Direct Registration Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '6px',
            padding: '12px 14px',
            color: '#1E40AF',
            fontSize: '12.5px',
            lineHeight: '1.5',
            marginBottom: '20px'
          }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Student & Faculty Onboarding:</strong> Students and faculty members do not register manually. Accounts are provisioned directly by verified educational institutions via bulk roster sync. Contact your institution administrator for access credentials.
            </div>
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ color: '#16803C', marginBottom: '16px' }}>
                <CheckCircle size={48} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ color: '#1E2A44', marginBottom: '8px' }}>Registration Submitted Successfully</h3>
              <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                Your registration for <strong>{fullName}</strong> ({email}) has been queued for platform administrator verification. You will receive an email confirmation once activated.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ padding: '8px 24px' }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              {/* Role Selection Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {[
                  { id: 'industry', label: 'Industry & Enterprise', icon: Building2, desc: 'Post internships, hire students & fund R&D' },
                  { id: 'institution', label: 'Academic Institution', icon: Landmark, desc: 'Manage departments, students & faculty' },
                ].map((r) => {
                  const Icon = r.icon;
                  const isSelected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '6px',
                        border: isSelected ? '2px solid #3B5BDB' : '1px solid #E2E5EA',
                        backgroundColor: isSelected ? '#EEF2FF' : '#FFFFFF',
                        color: isSelected ? '#3B5BDB' : '#4B5563',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13.5px' }}>
                        <Icon size={16} />
                        {r.label}
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 400 }}>
                        {r.desc}
                      </span>
                    </button>
                  );
                })}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Person / Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. rajesh_sharma"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Official Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="official@organization.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Headquarters / City</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Bengaluru, Karnataka"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                {/* Role Specific Fields */}
                {role === 'industry' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Company / Organization Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Tata Consultancy Services"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sector / Domain</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Information Technology, AI"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {role === 'institution' && (
                  <div className="form-group">
                    <label className="form-label">College / University Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. National Institute of Technology Trichy"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', marginTop: '12px' }}
                  disabled={loading}
                >
                  {loading ? 'Submitting Registration...' : `Register as ${role === 'industry' ? 'Industry Partner' : 'Academic Institution'}`}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
                <span className="text-muted">Already have an account? </span>
                <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
              </div>
            </>
          )}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
