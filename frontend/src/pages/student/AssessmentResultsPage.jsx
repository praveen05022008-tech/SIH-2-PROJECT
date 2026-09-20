import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Award, CheckCircle, XCircle } from 'lucide-react';

export function AssessmentResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    api.get('/assessments/results/my-results')
      .then((data) => setResults(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout title="Assessment Results" allowedRoles={['student']}>
      {selectedResult && (
        <div className="card" style={{ marginBottom: '24px', border: '1px solid #CBD5E1' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">{selectedResult.assessment_title}</h3>
              <p className="text-muted" style={{ fontSize: '12px' }}>
                Completed: {new Date(selectedResult.completed_at).toLocaleString()}
              </p>
            </div>
            <button onClick={() => setSelectedResult(null)} className="btn btn-outline btn-sm">
              Close Details
            </button>
          </div>

          <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '12px' }}>Total Score</span>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E2A44' }}>{selectedResult.score} pts</div>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '12px' }}>Percentage</span>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E2A44' }}>{selectedResult.percentage}%</div>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '12px' }}>Outcome</span>
              <div>
                <span className={`badge ${selectedResult.status === 'passed' ? 'badge-success' : 'badge-danger'}`}>
                  {selectedResult.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {selectedResult.detailed_answers && (
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Question Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(selectedResult.detailed_answers).map(([qid, info]) => (
                  <div key={qid} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: info.is_correct ? '#F0FDF4' : '#FEF2F2',
                    border: `1px solid ${info.is_correct ? '#BBF7D0' : '#FECACA'}`,
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {info.is_correct ? <CheckCircle size={16} color="#16A34A" /> : <XCircle size={16} color="#DC2626" />}
                      <span>Question #{qid}: Submitted: <strong>{info.submitted_answer || 'None'}</strong></span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{info.marks_earned} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Completed Assessment Records</h3>
          <span className="badge badge-neutral">{results.length} Records</span>
        </div>

        {loading ? (
          <p className="text-muted">Loading completed assessments...</p>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Award size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">No assessment results recorded yet. Take an assessment to view outcomes.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Assessment Title</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Completed Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.assessment_title || `Assessment #${r.assessment_id}`}</td>
                    <td>{r.score} pts</td>
                    <td style={{ fontWeight: 600 }}>{r.percentage}%</td>
                    <td>
                      <span className={`badge ${r.status === 'passed' ? 'badge-success' : 'badge-danger'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{new Date(r.completed_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => setSelectedResult(r)}
                        className="btn btn-outline btn-sm"
                      >
                        View Breakdown
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
