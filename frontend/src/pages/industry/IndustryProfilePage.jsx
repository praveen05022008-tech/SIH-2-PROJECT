import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function IndustryProfilePage() {
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
          company_name: data.company_name || '',
          sector: data.sector || '',
          location: data.location || '',
          description: data.description || '',
          website: data.website || '',
          contact_person: data.contact_person || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          verification_status: data.verification_status || 'pending',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
      <div className="card" style={{ maxWidth: '800px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Enterprise Profile</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>Official credentials visible to colleges and prospective candidates</p>
          </div>
          <span className={`badge ${profile.verification_status === 'verified' ? 'badge-success' : 'badge-warning'}`}>
            {profile.verification_status}
          </span>
        </div>

        {msg.text && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '13px',
            backgroundColor: msg.type === 'success' ? '#DEF7EC' : '#FEE2E2',
            color: msg.type === 'success' ? '#166534' : '#991B1B',
            border: `1px solid ${msg.type === 'success' ? '#86EFAC' : '#FCA5A5'}`
          }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Company / Entity Name *</label>
              <input
                type="text"
                className="form-control"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sector / Domain</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Healthcare, Technology, Biotechnology"
                value={profile.sector}
                onChange={(e) => setProfile({ ...profile, sector: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Headquarters Location</label>
              <input
                type="text"
                className="form-control"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Website</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://..."
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Company Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Detail your industrial products, clinical domains, and innovation activities..."
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                className="form-control"
                value={profile.contact_person}
                onChange={(e) => setProfile({ ...profile, contact_person: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                className="form-control"
                value={profile.contact_email}
                onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="form-control"
                value={profile.contact_phone}
                onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Company Profile'}
          </button>
        </form>
      </div>
    </PortalLayout>
  );
}
