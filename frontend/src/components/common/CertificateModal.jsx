import React, { useRef } from 'react';
import { Download, ShieldCheck, X, Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { CertificateDocument } from './CertificateDocument';

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

  return (
    <div
      className="certificate-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="certificate-modal-card"
        style={{
          width: '100%',
          maxWidth: '960px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '96vh',
        }}
      >
        {/* Top Control Bar */}
        <div
          className="certificate-control-bar"
          style={{
            padding: '14px 22px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 600,
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
                padding: '7px 16px',
                backgroundColor: '#2563EB',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              <Download size={13} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
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

        {/* Certificate Render Area */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            backgroundColor: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div ref={certRef} id="printable-certificate" style={{ width: '100%' }}>
            <CertificateDocument certificate={certificate} />
          </div>
        </div>
      </div>
    </div>
  );
}
