import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PortalLayout } from '../../components/layout/PortalLayout';
import {
  Building2,
  MapPin,
  Globe,
  FileText,
  User,
  Mail,
  Phone,
  Save,
  Layers
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function IndustryProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    company_name: '',
    sector: '',
    location: '',
    description: '',
    website: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    verification_status: 'pending',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/profiles/industry')
      .then((data) => {
        setProfile({
          company_name: data.company_name || user?.organization_name || user?.full_name || '',
          sector: data.sector || '',
          location: data.location || '',
          description: data.description || '',
          website: data.website || '',
          contact_person: data.contact_person || user?.full_name || user?.username || '',
          contact_email: data.contact_email || user?.email || '',
          contact_phone: data.contact_phone || '',
          verification_status: data.verification_status || 'pending',
        });
      })
      .catch(() => {
        setProfile((prev) => ({
          ...prev,
          company_name: user?.organization_name || user?.full_name || '',
          contact_person: user?.full_name || user?.username || '',
          contact_email: user?.email || ''
        }));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      await api.put('/profiles/industry', profile);
      setMsg({ type: 'success', text: 'Company profile updated successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update company profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout title="Company Profile" allowedRoles={['industry']}>
        <LoadingSpinner message="Loading Enterprise Profile..." />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Company Profile" allowedRoles={['industry']}>
      {/* ─── Top Banner Card with 3D Profile Artwork & Seamless Gradient ─── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #E6F0FE 0%, #DCEAFC 40%, #D4E5FB 100%)',
          borderRadius: '16px',
          border: '1px solid #BFDBFE',
          borderLeft: '4px solid #2563EB',
          padding: 'clamp(22px, 3.5vw, 28px) clamp(24px, 4vw, 36px)',
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}
      >
        {/* The 3D artwork image positioned on the right with soft fade into the blue background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: 'clamp(320px, 48%, 560px)',
            backgroundImage: "url('/ind-profile.png')",
            backgroundPosition: 'right center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 15%)',
            pointerEvents: 'none'
          }}
        />

        {/* Left Icon & Heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#DBEAFE',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
              flexShrink: 0
            }}
          >
            <Building2 size={26} />
          </div>
          <div>
            <h2
              style={{
                fontSize: '21px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.4px',
                margin: 0,
                lineHeight: 1.2
              }}
            >
              Enterprise Profile
            </h2>
            <p
              style={{
                fontSize: '13.5px',
                color: '#475569',
                marginTop: '4px',
                margin: 0
              }}
            >
              Official credentials visible to colleges and prospective candidates
            </p>
          </div>
        </div>
      </div>

      {/* ─── Profile Form Card ─── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: 'clamp(24px, 4vw, 36px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
        }}
      >
        {msg.text && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '13.5px',
              fontWeight: 500,
              backgroundColor: msg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: msg.type === 'success' ? '#065F46' : '#991B1B',
              border: `1px solid ${msg.type === 'success' ? '#A7F3D0' : '#FCA5A5'}`
            }}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Company Name & Sector */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: '8px'
                }}
              >
                Company / Entity Name *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={profile.company_name}
                  onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                  required
                  placeholder="Company name"
                  style={{
                    width: '100%',
                    height: '46px',
                    paddingLeft: '42px',
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
                <Building2 size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: '8px'
                }}
              >
                Sector / Domain
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. Healthcare, Technology, Biotech"
                  value={profile.sector}
                  onChange={(e) => setProfile({ ...profile, sector: e.target.value })}
                  style={{
                    width: '100%',
                    height: '46px',
                    paddingLeft: '42px',
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
                <Layers size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
              </div>
            </div>
          </div>

          {/* Row 2: Location & Website */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: '8px'
                }}
              >
                Headquarters Location
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. Chennai, Tamil Nadu, India"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  style={{
                    width: '100%',
                    height: '46px',
                    paddingLeft: '42px',
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
                <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: '8px'
                }}
              >
                Official Website
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  placeholder="https://..."
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  style={{
                    width: '100%',
                    height: '46px',
                    paddingLeft: '42px',
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
                <Globe size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
              </div>
            </div>
          </div>

          {/* Row 3: Description */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#0F172A',
                marginBottom: '8px'
              }}
            >
              Company Description
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                rows={4}
                placeholder="Detail your industrial products, clinical domains, and innovation activities..."
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                style={{
                  width: '100%',
                  paddingLeft: '42px',
                  paddingRight: '14px',
                  paddingTop: '12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical'
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
              <FileText size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
            </div>
          </div>

          {/* Row 4: Contact Person, Email & Phone */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '20px',
              marginBottom: '26px'
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: '8px'
                }}
              >
                Contact Person
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. CTS Representative"
                  value={profile.contact_person}
                  onChange={(e) => setProfile({ ...profile, contact_person: e.target.value })}
                  style={{
                    width: '100%',
                    height: '46px',
                    paddingLeft: '42px',
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
                <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: '8px'
                }}
              >
                Contact Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  placeholder="smvec@aic.in"
                  value={profile.contact_email}
                  onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                  style={{
                    width: '100%',
                    height: '46px',
                    paddingLeft: '42px',
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
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#0F172A',
                  marginBottom: '8px'
                }}
              >
                Contact Phone
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  placeholder="+91..."
                  value={profile.contact_phone}
                  onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value })}
                  style={{
                    width: '100%',
                    height: '46px',
                    paddingLeft: '42px',
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
                <Phone size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              padding: '13px 24px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
              transition: 'background-color 0.15s'
            }}
            onMouseOver={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = '#1E293B';
            }}
            onMouseOut={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = '#0F172A';
            }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Company Profile'}</span>
          </button>
        </form>
      </div>
    </PortalLayout>
  );
}
