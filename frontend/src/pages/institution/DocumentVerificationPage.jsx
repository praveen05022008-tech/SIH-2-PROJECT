import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { ShieldCheck, CheckCircle2, XCircle, FileText, ExternalLink } from 'lucide-react';

export function DocumentVerificationPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verStatus, setVerStatus] = useState('verified');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = () => {
    setLoading(true);
    api.get('/documents')
      .then((data) => setDocuments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;
    setSubmitting(true);
    try {
      await api.post('/documents/verify', {
        document_id: selectedDoc.id,
        verification_status: verStatus,
        remarks,
      });
      setSelectedDoc(null);
      setRemarks('');
      fetchDocuments();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout title="Document Verification Desk" allowedRoles={['institution', 'admin']}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Student Credentials & Certificates</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>Validate student academic documents, internships reports, and diplomas</p>
          </div>
          <span className="badge badge-info">{documents.length} Documents</span>
        </div>

        {loading ? (
          <p className="text-muted">Loading documents queue...</p>
        ) : documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <FileText size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">No student documents submitted for verification yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Type</th>
                  <th>Student Owner</th>
                  <th>Verification Status</th>
                  <th>Uploaded Date</th>
                  <th>Document File</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: 600 }}>{doc.title}</td>
                    <td><span className="badge badge-neutral">{doc.document_type}</span></td>
                    <td>{doc.owner_name || `User #${doc.owner_user_id}`}</td>
                    <td>
                      <span className={`badge ${doc.verification_status === 'verified' ? 'badge-success' : doc.verification_status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {doc.verification_status}
                      </span>
                    </td>
                    <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                    <td>
                      <a href={doc.file_path} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <ExternalLink size={13} /> View File
                      </a>
                    </td>
                    <td>
                      <button onClick={() => setSelectedDoc(doc)} className="btn btn-outline btn-sm">
                        Verify / Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedDoc && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Verify Document: {selectedDoc.title}</h3>
              <button onClick={() => setSelectedDoc(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }}>
              <div>Owner: <strong>{selectedDoc.owner_name}</strong></div>
              <div>Type: <span className="badge badge-neutral">{selectedDoc.document_type}</span></div>
              <div style={{ marginTop: '6px' }}>
                <a href={selectedDoc.file_path} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  <ExternalLink size={13} /> Inspect Document File
                </a>
              </div>
            </div>

            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label className="form-label">Verification Decision *</label>
                <select className="form-control" value={verStatus} onChange={(e) => setVerStatus(e.target.value)}>
                  <option value="verified">Verified (Approved Document)</option>
                  <option value="rejected">Rejected (Discrepancy / Illegible)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Verification Remarks</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Notes explaining approval or reasons for rejection..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setSelectedDoc(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
