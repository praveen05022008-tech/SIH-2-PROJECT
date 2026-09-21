import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { ENGINEERING_DEPARTMENTS } from '../../constants/departments';


export function RegisterPage() {
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Role-specific fields
  const [course, setCourse] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState(1);
  const [designation, setDesignation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [institutionName, setInstitutionName] = useState('');

  // Institutions list from DB
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/institutions')
      .then((data) => setInstitutions(data))
      .catch(() => {});
  }, []);

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
      institution_id: selectedInstitutionId ? parseInt(selectedInstitutionId) : null,
      course: role === 'student' ? course : null,
      year_of_study: role === 'student' ? parseInt(yearOfStudy) : null,
      designation: role === 'faculty' ? designation : null,
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
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', color: '#1E2A44', marginBottom: '6px' }}>Stakeholder Registration</h2>
            <p className="text-muted" style={{ fontSize: '13px' }}>
              Create an official account. Newly registered stakeholders require administrative verification.
            </p>
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ color: '#16803C', marginBottom: '16px' }}>
                <CheckCircle size={48} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ color: '#1E2A44', marginBottom: '8px' }}>Registration Submitted Successfully</h3>
              <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                Your account for <strong>{fullName}</strong> ({email}) has been queued for administrator verification. Once approved, you will be able to log in.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ padding: '8px 24px' }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              {/* Role Selection Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '24px' }}>
                {[
                  { id: 'student', label: 'Student' },
                  { id: 'faculty', label: 'Faculty' },
                  { id: 'industry', label: 'Industry' },
                  { id: 'institution', label: 'Institution' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    style={{
                      padding: '8px 4px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: role === r.id ? '1px solid #3B5BDB' : '1px solid #E2E5EA',
                      backgroundColor: role === r.id ? '#EEF2FF' : '#FFFFFF',
                      color: role === r.id ? '#3B5BDB' : '#4B5563',
                      cursor: 'pointer'
                    }}
                  >
                    {r.label}
                  </button>
                ))}
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
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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
                    <label className="form-label">Address / City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                {/* Role Specific Fields */}
                {role === 'student' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Degree / Course</label>
                      <select
                        className="form-control"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        required
                      >
                        <option value="">-- Select Degree / Branch --</option>
                        {ENGINEERING_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Year of Study</label>
                      <select
                        className="form-control"
                        value={yearOfStudy}
                        onChange={(e) => setYearOfStudy(e.target.value)}
                      >
                        <option value={1}>1st Year</option>
                        <option value={2}>2nd Year</option>
                        <option value={3}>3rd Year</option>
                        <option value={4}>4th Year</option>
                      </select>
                    </div>
                  </div>
                )}

                {role === 'faculty' && (
                  <div className="form-group">
                    <label className="form-label">Academic Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Associate Professor / Reader"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                    />
                  </div>
                )}

                {role === 'industry' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Company / Organization Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. HealthCorp Industries / Tech Innovations"
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
                        placeholder="e.g. Healthcare, Biotech, Technology"
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
                      placeholder="e.g. National Institute of Technology / Apex University"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      required
                    />
                  </div>
                )}

                {(role === 'student' || role === 'faculty') && (
                  <div className="form-group">
                    <label className="form-label">Affiliated Institution</label>
                    <select
                      className="form-control"
                      value={selectedInstitutionId}
                      onChange={(e) => setSelectedInstitutionId(e.target.value)}
                    >
                      <option value="">-- Select Institution (Optional) --</option>
                      {institutions.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', marginTop: '12px' }}
                  disabled={loading}
                >
                  {loading ? 'Submitting Registration...' : `Register as ${role.toUpperCase()}`}
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
