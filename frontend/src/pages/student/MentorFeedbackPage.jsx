import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { FileText, Star } from 'lucide-react';

export function MentorFeedbackPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/internships')
      .then((data) => setInternships(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          fill={i <= rating ? '#F59E0B' : 'none'}
          color={i <= rating ? '#F59E0B' : '#CBD5E1'}
        />
      );
    }
    return <span style={{ display: 'inline-flex', gap: '2px' }}>{stars}</span>;
  };

  const allFeedbacks = [];
  internships.forEach((intern) => {
    (intern.feedbacks || []).forEach((fb) => {
      allFeedbacks.push({
        ...fb,
        company_name: intern.company_name,
        opportunity_title: intern.opportunity_title,
      });
    });
  });

  return (
    <PortalLayout title="Mentor Feedback & Evaluations" allowedRoles={['student']}>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Industry Supervisor Evaluation Reports</h3>
          <span className="badge badge-info">{allFeedbacks.length} Reviews</span>
        </div>

        {loading ? (
          <p className="text-muted">Loading supervisor evaluations...</p>
        ) : allFeedbacks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <FileText size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">No mentor feedback records published yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {allFeedbacks.map((fb) => (
              <div key={fb.id} style={{ border: '1px solid #E2E5EA', borderRadius: '4px', padding: '18px', backgroundColor: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', color: '#1E2A44', marginBottom: '2px' }}>{fb.opportunity_title}</h4>
                    <span className="text-muted" style={{ fontSize: '12.5px' }}>Provider: {fb.company_name}</span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '12px' }}>
                    {new Date(fb.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px', backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '4px', border: '1px solid #E2E5EA' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Technical Competency</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {renderStars(fb.rating_technical)}
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{fb.rating_technical}/5</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Communication & Soft Skills</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {renderStars(fb.rating_soft_skills)}
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{fb.rating_soft_skills}/5</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Punctuality & Reliability</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {renderStars(fb.rating_punctuality)}
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{fb.rating_punctuality}/5</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                  <strong>Mentor Evaluation:</strong> "{fb.feedback_text}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
