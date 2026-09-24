import React, { useRef } from 'react';
import { Award, CheckCircle2, Download, ExternalLink, ShieldCheck, X, Copy, Check, Sparkles, Building2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function CertificateModal({ certificate, onClose }) {
  const toast = useToast();
  const certRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  if (!certificate) return null;

  const verificationUrl = `${window.location.origin}/verify-certificate/${certificate.verification_hash}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    toast.success('Certificate verification link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = certificate.issue_date
    ? new Date(certificate.issue_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
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
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
        }}
      >
        {/* Top Control Bar */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#38BDF8" />
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#F8FAFC' }}>
              Verified National Credential #{certificate.certificate_number}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {copied ? <Check size={13} color="#4ADE80" /> : <Copy size={13} />}
              {copied ? 'Link Copied!' : 'Share Link'}
            </button>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: '#2563EB',
                border: 'none',
                borderRadius: '6px',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              <Download size={13} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Certificate Canvas / Render Area */}
        <div style={{ padding: '24px', overflowY: 'auto', backgroundColor: '#F8FAFC' }}>
          <div
            ref={certRef}
            id="printable-certificate"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '8px solid #1E293B',
              outline: '2px solid #D97706',
              outlineOffset: '-5px',
              padding: 'clamp(28px, 4vw, 44px)',
              position: 'relative',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              background: 'radial-gradient(circle at center, #FFFFFF 0%, #FAFCFF 100%)',
            }}
          >
            {/* Watermark Crest */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.03,
                pointerEvents: 'none',
              }}
            >
              <Award size={320} color="#0F172A" />
            </div>

            {/* Header / National Emblem Branding */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2.5px', color: '#2563EB', textTransform: 'uppercase' }}>
                  National Academia-Industry Collaboration Framework
                </span>
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px', margin: '4px 0 0 0', textTransform: 'uppercase' }}>
                Certificate of Completion
              </h1>
              <div style={{ width: '80px', height: '3px', background: 'linear-gradient(90deg, #2563EB, #D97706)', margin: '10px auto 0' }} />
            </div>

            {/* Recipient */}
            <p style={{ fontSize: '14px', color: '#64748B', fontStyle: 'italic', margin: '18px 0 6px' }}>
              This certifies that
            </p>
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#1E293B',
                letterSpacing: '-0.5px',
                margin: '4px 0 6px',
                textDecoration: 'underline',
                textDecorationColor: '#93C5FD',
                textUnderlineOffset: '6px',
              }}
            >
              {certificate.student_name}
            </h2>
            {(certificate.designation || certificate.institution_name) && (
              <p style={{ fontSize: '13.5px', color: '#64748B', fontWeight: 600, margin: '0 0 16px' }}>
                {[certificate.designation, certificate.institution_name].filter(Boolean).join(' • ')}
              </p>
            )}

            {/* Achievement Text */}
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, maxWidth: '620px', margin: '0 auto 16px' }}>
              has successfully fulfilled all curriculum requirements, practical assignments, and competency milestones for the {certificate.program_type === 'fdp' ? 'Faculty Development Program (FDP)' : 'professional training program'} in
            </p>

            {/* Course Title Badge */}
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                borderRadius: '10px',
                padding: '10px 24px',
                margin: '0 auto 14px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1D4ED8' }}>
                {certificate.program_title}
              </h3>
            </div>

            {certificate.credits && (
              <div style={{ marginBottom: '14px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: '20px',
                    color: '#92400E',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  <Sparkles size={13} color="#D97706" /> {certificate.credits} FDP / CPE Academic Credits Conferred
                </span>
              </div>
            )}

            {certificate.skills && (
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 auto 20px', maxWidth: '580px' }}>
                <strong>Key Competencies Verified:</strong> {certificate.skills}
              </p>
            )}

            {/* Signatures & Issuer Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '32px',
                paddingTop: '20px',
                borderTop: '1px dashed #CBD5E1',
                textAlign: 'left',
              }}
            >
              {/* Left: Issuing Partner */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Building2 size={16} color="#2563EB" />
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                    {certificate.issuer_name}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  Industry Training Partner &bull; Issued {formattedDate}
                </div>
              </div>

              {/* Center: Gold Seal */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#FEF3C7',
                    border: '2px solid #F59E0B',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(245, 158, 11, 0.2)',
                    margin: '0 auto 4px',
                  }}
                >
                  <Award size={24} color="#D97706" />
                  <span style={{ fontSize: '8px', fontWeight: 800, color: '#92400E', letterSpacing: '0.5px' }}>VERIFIED</span>
                </div>
                <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>AUTHENTIC</span>
              </div>

              {/* Right: National Seal / QR Hash */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>
                  ID: {certificate.certificate_number}
                </div>
                <div style={{ fontSize: '10px', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px', fontWeight: 600 }}>
                  <CheckCircle2 size={11} /> Cryptographically Signed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
