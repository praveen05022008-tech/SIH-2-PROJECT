import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { ShieldCheck, Clock } from 'lucide-react';

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit-logs')
      .then((data) => setLogs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout title="Immutable Audit Trails" allowedRoles={['admin']}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">System Audit Log Register</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>Cryptographically traceable log of stakeholder activities and administrative actions</p>
          </div>
          <span className="badge badge-info">{logs.length} Recent Events</span>
        </div>

        {loading ? (
          <p className="text-muted">Loading audit entries...</p>
        ) : logs.length === 0 ? (
          <p className="text-muted" style={{ padding: '24px 0' }}>No audit records found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor User ID</th>
                  <th>Resource Type</th>
                  <th>Resource ID</th>
                  <th>IP Address</th>
                  <th>Event Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: '#6B7280' }}>
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                        {l.action}
                      </span>
                    </td>
                    <td>{l.user_id ? `#${l.user_id}` : 'System'}</td>
                    <td>{l.resource_type || '-'}</td>
                    <td>{l.resource_id || '-'}</td>
                    <td style={{ fontSize: '12px', color: '#6B7280' }}>{l.ip_address || '127.0.0.1'}</td>
                    <td style={{ fontSize: '12px', color: '#4B5563', maxWidth: '300px', wordBreak: 'break-all' }}>
                      {l.details_json || '-'}
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
