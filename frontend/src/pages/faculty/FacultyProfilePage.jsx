import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function FacultyProfilePage() {
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    designation: '',
    qualification: '',
    specialization: '',
    experience_years: 0,
    research_areas: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/profiles/faculty')
      .then((data) => {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          designation: data.designation || '',
          qualification: data.qualification || '',
          specialization: data.specialization || '',
          experience_years: data.experience_years || 0,
          research_areas: data.research_areas || '',
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
      await api.put('/profiles/faculty', profile);
      setMsg({ type: 'success', text: 'Faculty profile updated successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalLayout title="Faculty Profile" allowedRoles={['faculty']}>
      <div className="card" style={{ maxWidth: '800px' }}>
        <div className="card-header">
          <h3 className="card-title">Academician Credentials</h3>
        </div>

        {msg.text && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: msg.type === 'success' ? '#DEF7EC' : '#FEE2E2',
            border: `1px solid ${msg.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
            borderRadius: '4px',
            padding: '10px 14px',
            color: msg.type === 'success' ? '#166534' : '#991B1B',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-control"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Academic Designation</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Professor / Reader"
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Highest Qualification</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Ph.D / MD (Ayu)"
                value={profile.qualification}
                onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teaching/Research Exp (Years)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={profile.experience_years}
                onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Subject Specialization</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Dravyaguna, Pharmacovigilance, Clinical Informatics"
              value={profile.specialization}
              onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Research Areas & Interests</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Detail your research focus, ongoing projects, and potential consultancy areas..."
              value={profile.research_areas}
              onChange={(e) => setProfile({ ...profile, research_areas: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </PortalLayout>
  );
}
