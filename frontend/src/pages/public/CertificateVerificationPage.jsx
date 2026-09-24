import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Award, CheckCircle2, ShieldCheck, AlertCircle, Building2, Calendar, User, ArrowLeft, Download } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function CertificateVerificationPage() {
  const { hash } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hash) {
      setError('Invalid certificate verification link.');
      setLoading(false);
      return;
    }

    api.get(`/learning-programs/certificates/${hash}`)
      .then((data) => setCert(data))
      .catch((err) => setError(err.message || 'Certificate not found or verification hash invalid.'))
      .finally(() => setLoading(false));
  }, [hash]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <header
        style={{
          height: '64px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.2px' }}>
            National Credential Registry
          </span>
        </div>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#2563EB',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} /> Back to Portal
        </Link>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '780px' }}>
          {loading ? (
            <LoadingSpinner message="Verifying credential authenticity against national ledger..." />
          ) : error || !cert ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #FEE2E2',
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF2F2',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <AlertCircle size={28} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
                Credential Verification Failed
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px' }}>
                {error || 'The requested certificate could not be located in our verified records.'}
              </p>
              <Link to="/" className="btn btn-primary btn-sm">
                Return to Home
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Verification Status Banner */}
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#065F46' }}>
                      Authentic Verified Credential
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#047857' }}>
                      Certificate #{cert.certificate_number} is authentic and registered on the AIC National Portal.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handlePrint}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} /> Download Certificate
                </button>
              </div>

              {/* Certificate Details Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '32px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    Certified Achievement
                  </span>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '6px 0 8px' }}>
                    {cert.program_title}
                  </h1>
                  <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                    Conducted by <strong style={{ color: '#0F172A' }}>{cert.issuer_name}</strong>
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '24px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                      {cert.recipient_role === 'faculty' ? 'Recipient Academician' : 'Recipient Student'}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{cert.student_name}</span>
                      {cert.recipient_role === 'faculty' && (
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#F3E8FF', color: '#7E22CE', fontWeight: 800 }}>FACULTY</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      {cert.designation ? `${cert.designation}` : ''}
                      {cert.designation && cert.institution_name ? ` • ${cert.institution_name}` : cert.institution_name ? `${cert.institution_name}` : cert.student_email}
                    </div>
                    {cert.credits && (
                      <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#047857', fontWeight: 700 }}>
                        ★ {cert.credits} FDP / CPE Academic Credits
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                      Issuing Entity
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>
                      {cert.issuer_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>Verified Industry Partner</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                      Date of Issuance
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>
                      {new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Status: Active & Valid</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                      Credential Hash
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace', marginTop: '3px', wordBreak: 'break-all' }}>
                      {cert.verification_hash.substring(0, 16)}...
                    </div>
                    <div style={{ fontSize: '11px', color: '#059669' }}>Cryptographic Match</div>
                  </div>
                </div>

                {cert.skills && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                      Validated Technical Competencies:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {cert.skills.split(',').map((s, i) => (
                        <span
                          key={i}
                          style={{
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #BFDBFE',
                          }}
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
