import React, { useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AlertCircle, Send, Loader2, X } from 'lucide-react';

export function ReportIssueModal({ isOpen, onClose }) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('bug');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/issues', {
        title,
        category,
        severity,
        description
      });
      toast.success('Issue reported successfully. Administrative team will triage.');
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      toast.error('Failed to submit issue: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} color="#DC2626" />
            <div>
              <h3 className="card-title" style={{ margin: 0 }}>Report Issue / System Bug</h3>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Submit a ticket for administrative review and technical triage</span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-sm" disabled={submitting}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Issue Summary / Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Assessment timer lag, Document upload timeout, Data mismatch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="bug">Bug / Defect</option>
                <option value="access_issue">Access / RBAC Issue</option>
                <option value="data_correction">Data Correction</option>
                <option value="feature_request">Feature Request</option>
                <option value="other">Other Inquiry</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Severity Level *</label>
              <select className="form-control" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="low">Low - Minor cosmetic</option>
                <option value="medium">Medium - Standard workflow</option>
                <option value="high">High - Feature blocked</option>
                <option value="critical">Critical - System blocker</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description & Steps to Reproduce *</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Explain what happened, expected behavior, and exact page/action taken..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm" disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting || !title.trim() || !description.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#DC2626' }}
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {submitting ? 'Submitting Ticket...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
