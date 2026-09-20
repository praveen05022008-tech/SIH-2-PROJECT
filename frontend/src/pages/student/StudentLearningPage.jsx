import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { BookOpen, ExternalLink, Clock, ShieldCheck } from 'lucide-react';

export function StudentLearningPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPrograms();
  }, [typeFilter]);

  const fetchPrograms = () => {
    setLoading(true);
    let url = '/learning-programs';
    const params = [];
    if (typeFilter) params.push(`program_type=${typeFilter}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    api.get(url)
      .then((data) => setPrograms(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPrograms();
  };

  return (
    <PortalLayout title="Learning Programs Marketplace" allowedRoles={['student', 'faculty']}>
      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search programs by skill, title, or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '220px' }}
          />

          <select
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">All Program Types</option>
            <option value="course">Online Courses</option>
            <option value="certification">Certifications</option>
            <option value="workshop">Workshops</option>
            <option value="bootcamp">Bootcamps</option>
            <option value="fdp">Faculty Programs (FDP)</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-muted">Loading available learning programs...</p>
      ) : programs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <BookOpen size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <p className="text-muted">No learning programs currently listed.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {programs.map((p) => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-info">{p.program_type.toUpperCase()}</span>
                  <span className="badge badge-neutral">{p.learning_mode}</span>
                </div>

                <h3 style={{ fontSize: '16px', color: '#1E2A44', marginBottom: '6px' }}>{p.title}</h3>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '10px' }}>
                  Provider: <strong>{p.provider_name}</strong>
                </div>

                <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: '1.6', marginBottom: '12px' }}>
                  {p.description}
                </p>

                {p.skills_covered && (
                  <div style={{ fontSize: '12px', color: '#3B5BDB', fontWeight: 500, marginBottom: '12px' }}>
                    Skills Covered: {p.skills_covered}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #E2E5EA', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12.5px', color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {p.duration || 'Flexible'}
                </span>

                <a
                  href={p.external_link || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  Enroll <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
