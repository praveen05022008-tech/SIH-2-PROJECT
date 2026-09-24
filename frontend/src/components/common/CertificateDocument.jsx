import React from 'react';
import { CheckCircle2, ShieldCheck, Award } from 'lucide-react';

export function CertificateDocument({ certificate, className = '' }) {
  if (!certificate) return null;

  const formattedDate = certificate.issue_date
    ? new Date(certificate.issue_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const programTitle = certificate.program_title || 'Enterprise Training & Certification Program';
  const recipientName = certificate.student_name || 'Participant Name';
  const issuerName = certificate.issuer_name || 'National Industry Training Partner';
  const certNumber = certificate.certificate_number || 'CERT-2026-XXXXXX';
  const skillsText = certificate.skills || 'Full-Stack Engineering, Cloud Architecture, DevOps, Security, Automated Testing';

  return (
    <div
      className={`certificate-root-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '920px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
        borderRadius: '4px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ─── SVG VECTOR GRAPHICS LAYER (Geometric Corners, Gold Ribbons, Guilloche Waves, Golden Frames) ─── */}
      <svg
        viewBox="0 0 1000 680"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gold Metallic Linear Gradient */}
          <linearGradient id="goldRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ECC875" />
            <stop offset="35%" stopColor="#C99738" />
            <stop offset="70%" stopColor="#E8CA7C" />
            <stop offset="100%" stopColor="#A87722" />
          </linearGradient>

          {/* Deep Navy Polygonal Gradient */}
          <linearGradient id="navyCornerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B2042" />
            <stop offset="60%" stopColor="#0D2E5C" />
            <stop offset="100%" stopColor="#06152D" />
          </linearGradient>

          {/* Secondary Facet Navy */}
          <linearGradient id="navyFacetGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#123B75" />
            <stop offset="100%" stopColor="#091E3D" />
          </linearGradient>
        </defs>

        {/* ─── WATERMARK GUILLOCHE WAVES (Top-Right & Bottom-Left) ─── */}
        <g opacity="0.22" stroke="#3B82F6" fill="none" strokeWidth="0.75">
          <path d="M 650,0 C 750,80 850,40 1000,120" />
          <path d="M 680,0 C 770,100 870,60 1000,150" />
          <path d="M 710,0 C 790,120 890,80 1000,180" />
          <path d="M 740,0 C 810,140 910,100 1000,210" />
          <path d="M 770,0 C 830,160 930,120 1000,240" />
          <path d="M 800,0 C 850,180 950,140 1000,270" />
          <path d="M 830,0 C 870,200 970,160 1000,300" />

          {/* Bottom Left Guilloche */}
          <path d="M 0,560 C 120,520 160,620 280,680" />
          <path d="M 0,530 C 140,490 180,590 310,680" />
          <path d="M 0,500 C 160,460 200,560 340,680" />
          <path d="M 0,470 C 180,430 220,530 370,680" />
          <path d="M 0,440 C 200,400 240,500 400,680" />
          <path d="M 0,410 C 220,370 260,470 430,680" />
        </g>

        {/* ─── DOUBLE GOLDEN DIPLOMA BORDERS WITH CORNER NOTCHES ─── */}
        {/* Outer Fine Gold Border */}
        <rect
          x="18"
          y="18"
          width="964"
          height="644"
          fill="none"
          stroke="url(#goldRibbonGrad)"
          strokeWidth="1.75"
        />

        {/* Inner Stepped L-Notched Gold Border */}
        <path
          d="
            M 44,28
            L 956,28
            L 956,44
            L 972,44
            L 972,636
            L 956,636
            L 956,652
            L 44,652
            L 44,636
            L 28,636
            L 28,44
            L 44,44
            Z
          "
          fill="none"
          stroke="url(#goldRibbonGrad)"
          strokeWidth="1.25"
          opacity="0.9"
        />

        {/* Thin Blue Accent Inner Frame */}
        <rect
          x="34"
          y="34"
          width="932"
          height="612"
          fill="none"
          stroke="#1E3A8A"
          strokeWidth="0.5"
          opacity="0.3"
        />

        {/* ─── TOP-LEFT CORNER GEOMETRIC POLYGON LAYER ─── */}
        {/* Navy Facet 1 */}
        <polygon points="0,0 215,0 0,165" fill="url(#navyCornerGrad)" />
        {/* Navy Facet 2 */}
        <polygon points="0,0 145,0 0,225" fill="url(#navyFacetGrad)" opacity="0.95" />
        {/* Navy Facet 3 Sharp Slice */}
        <polygon points="0,0 260,0 0,115" fill="#071933" />
        {/* Diagonal Gold Accent Ribbon Strip 1 */}
        <polygon points="215,0 230,0 0,178 0,165" fill="url(#goldRibbonGrad)" />
        {/* Diagonal Gold Accent Ribbon Strip 2 */}
        <polygon points="145,0 155,0 0,240 0,225" fill="url(#goldRibbonGrad)" opacity="0.8" />
      </svg>

      {/* ─── CERTIFICATE MAIN CONTENT ─── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: 'clamp(32px, 5vw, 48px) clamp(36px, 6vw, 64px) clamp(28px, 4vw, 38px)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '620px',
        }}
      >
        {/* Top Header Group */}
        <div style={{ width: '100%', marginTop: '4px' }}>
          {/* Subtitle */}
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '3.5px',
              color: '#1D4ED8',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            National Academia-Industry Collaboration Framework
          </div>

          {/* Main Certificate Title */}
          <h1
            style={{
              margin: '0 0 8px 0',
              fontFamily: "'Cinzel', 'Playfair Display', Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(24px, 3.4vw, 36px)',
              fontWeight: 900,
              letterSpacing: '1.2px',
              color: '#0A1C3B',
              textTransform: 'uppercase',
            }}
          >
            Certificate of Completion
          </h1>

          {/* 3-Piece Central Blue & Gold Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '130px',
              margin: '0 auto 18px',
            }}
          >
            <div style={{ height: '2px', flex: 1, backgroundColor: '#2563EB' }} />
            <div style={{ width: '10px', height: '4px', backgroundColor: '#C99738', borderRadius: '1px' }} />
            <div style={{ height: '2px', flex: 1, backgroundColor: '#2563EB' }} />
          </div>
        </div>

        {/* Recipient & Statement Body */}
        <div style={{ width: '100%', maxWidth: '780px' }}>
          {/* "This certifies that" */}
          <div
            style={{
              fontSize: '15px',
              fontStyle: 'italic',
              fontFamily: "'Playfair Display', Georgia, serif",
              color: '#334155',
              marginBottom: '4px',
            }}
          >
            This certifies that
          </div>

          {/* Recipient Full Name */}
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(28px, 3.8vw, 40px)',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.4px',
              lineHeight: 1.2,
              margin: '2px 0 6px',
            }}
          >
            {recipientName}
          </div>

          {/* Gold Underline Bar */}
          <div
            style={{
              width: '180px',
              height: '1.5px',
              backgroundColor: '#C99738',
              margin: '0 auto 14px',
            }}
          />

          {/* Description / Fulfillment Text */}
          <p
            style={{
              fontSize: '13.5px',
              color: '#475569',
              lineHeight: 1.6,
              maxWidth: '660px',
              margin: '0 auto 16px',
            }}
          >
            has successfully fulfilled all curriculum requirements, practical assignments, and competency milestones for the professional training program in
          </p>

          {/* ─── PROGRAM / COURSE TITLE ─── */}
          <div
            style={{
              margin: '0 auto 14px',
              maxWidth: '90%',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', 'Inter', Georgia, serif",
                fontSize: 'clamp(18px, 2.4vw, 25px)',
                fontWeight: 800,
                color: '#0F2942',
                letterSpacing: '0.4px',
                lineHeight: 1.3,
                textAlign: 'center',
                display: 'inline-block',
              }}
            >
              {programTitle}
            </span>
          </div>

          {/* Key Competencies Verified Section */}
          <div style={{ margin: '4px auto 14px', maxWidth: '650px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
              Key Competencies Verified:
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', lineHeight: 1.5 }}>
              List of key skills, tools, and technologies covered in this program can be mentioned here.
              <br />
              <span style={{ color: '#475569', fontWeight: 500 }}>
                ({skillsText})
              </span>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM SIGNATURE & VERIFICATION ROW ─── */}
        <div style={{ width: '100%', marginTop: '6px' }}>
          {/* Subtle Horizontal Separator Line */}
          <div
            style={{
              width: '88%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #CBD5E1 20%, #CBD5E1 80%, transparent)',
              margin: '0 auto 16px',
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              padding: '0 16px',
            }}
          >
            {/* ─── Left Column: Classical Building Icon & Organization ─── */}
            <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Classical Pillars / University Icon */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB',
                  flexShrink: 0,
                }}
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V10" />
                  <path d="M9 21V10" />
                  <path d="M15 21V10" />
                  <path d="M19 21V10" />
                  <path d="M2 10h20" />
                  <path d="M12 2L2 7h20L12 2z" fill="#2563EB" fillOpacity="0.15" />
                </svg>
              </div>

              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {issuerName}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  Industry Training Partner
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                  Issued {formattedDate}
                </div>
              </div>
            </div>

            {/* ─── Center Column: Gold Laurel Wreath & Wax Seal Badge ─── */}
            <div style={{ textAlign: 'center', padding: '0 18px' }}>
              <div
                style={{
                  position: 'relative',
                  width: '68px',
                  height: '68px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}
              >
                {/* SVG Laurel Wreath & Gold Seal */}
                <svg width="68" height="68" viewBox="0 0 80 80">
                  <defs>
                    <linearGradient id="sealGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFF2B2" />
                      <stop offset="50%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#996515" />
                    </linearGradient>
                    <radialGradient id="sealRadial">
                      <stop offset="60%" stopColor="#FFFBEB" />
                      <stop offset="100%" stopColor="#FEF3C7" />
                    </radialGradient>
                  </defs>

                  {/* Laurel Leaves (Left Branch) */}
                  <g fill="#D4AF37" opacity="0.9">
                    <path d="M 16,36 C 12,30 8,36 10,42 C 12,40 14,38 16,36 Z" />
                    <path d="M 18,26 C 14,20 10,26 12,32 C 14,30 16,28 18,26 Z" />
                    <path d="M 23,17 C 20,11 15,16 16,22 C 19,21 21,19 23,17 Z" />
                    <path d="M 31,11 C 28,5 23,9 23,15 C 26,15 29,13 31,11 Z" />
                    <path d="M 17,47 C 13,42 9,48 11,54 C 13,52 15,49 17,47 Z" />
                    <path d="M 21,57 C 17,53 14,60 17,65 C 19,63 20,60 21,57 Z" />
                    <path d="M 28,65 C 25,62 23,69 27,73 C 28,70 29,67 28,65 Z" />
                  </g>

                  {/* Laurel Leaves (Right Branch) */}
                  <g fill="#D4AF37" opacity="0.9">
                    <path d="M 64,36 C 68,30 72,36 70,42 C 68,40 66,38 64,36 Z" />
                    <path d="M 62,26 C 66,20 70,26 68,32 C 66,30 64,28 62,26 Z" />
                    <path d="M 57,17 C 60,11 65,16 64,22 C 61,21 59,19 57,17 Z" />
                    <path d="M 49,11 C 52,5 57,9 57,15 C 54,15 51,13 49,11 Z" />
                    <path d="M 63,47 C 67,42 71,48 69,54 C 67,52 65,49 63,47 Z" />
                    <path d="M 59,57 C 63,53 66,60 63,65 C 61,63 60,60 59,57 Z" />
                    <path d="M 52,65 C 55,62 57,69 53,73 C 52,70 51,67 52,65 Z" />
                  </g>

                  {/* Main Seal Golden Ring */}
                  <circle cx="40" cy="40" r="26" fill="url(#sealRadial)" stroke="url(#sealGoldGrad)" strokeWidth="2.5" />
                  <circle cx="40" cy="40" r="22.5" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2,2" />

                  {/* Ribbon Medal Shape in Center */}
                  <path
                    d="M 40,24 C 36,24 33,27 33,31 C 33,34 35,36 37,37.5 L 34,46 L 40,43 L 46,46 L 43,37.5 C 45,36 47,34 47,31 C 47,27 44,24 40,24 Z"
                    fill="none"
                    stroke="#B45309"
                    strokeWidth="1.75"
                  />
                  <circle cx="40" cy="31" r="3.5" fill="none" stroke="#B45309" strokeWidth="1.5" />

                  {/* Text: VERIFIED */}
                  <text
                    x="40"
                    y="52"
                    textAnchor="middle"
                    fill="#92400E"
                    fontSize="6"
                    fontWeight="900"
                    letterSpacing="0.8"
                    fontFamily="'Inter', sans-serif"
                  >
                    VERIFIED
                  </text>
                </svg>
              </div>
            </div>

            {/* ─── Right Column: ID & Cryptographic Verification Badge ─── */}
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#334155',
                  fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
                  letterSpacing: '0.4px',
                }}
              >
                ID: {certNumber}
              </div>
              <div
                style={{
                  fontSize: '11.5px',
                  color: '#059669',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  marginTop: '4px',
                }}
              >
                <CheckCircle2 size={14} color="#10B981" />
                <span>Cryptographically Signed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
