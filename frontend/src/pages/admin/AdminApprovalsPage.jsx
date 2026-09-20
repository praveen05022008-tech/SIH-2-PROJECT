import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { UserCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function AdminApprovalsPage() {
  const [users, setUsers] = useState([]);
  const [filterApproved, setFilterApproved] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [filterApproved]);

  const fetchUsers = () => {
    setLoading(true);
    const isApprovedParam = filterApproved === 'pending' ? 'false' : 'true';
    api.get(`/users?is_approved=${isApprovedParam}`)
      .then((data) => setUsers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleUpdateApproval = async (userId, isApproved, isActive = true) => {
    try {
      await api.put(`/users/${userId}/approval`, {
        is_approved: isApproved,
        is_active: isActive,
      });
      fetchUsers();
    } catch (err) {
      alert('Error updating user: ' + err.message);
    }
  };

  return (
    <PortalLayout title="Stakeholder Registration Approvals" allowedRoles={['admin']}>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setFilterApproved('pending')}
          className={`btn btn-sm ${filterApproved === 'pending' ? 'btn-primary' : 'btn-outline'}`}
        >
          Pending Review Queue
        </button>
        <button
          onClick={() => setFilterApproved('approved')}
          className={`btn btn-sm ${filterApproved === 'approved' ? 'btn-primary' : 'btn-outline'}`}
        >
          Verified Stakeholders
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              {filterApproved === 'pending' ? 'Pending Registrations Requiring Verification' : 'Approved Platform Stakeholders'}
            </h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>
              Ensure identity authenticity and proper role permissions
            </p>
          </div>
          <span className="badge badge-info">{users.length} Accounts</span>
        </div>

        {loading ? (
          <p className="text-muted">Loading registrations from database...</p>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <UserCheck size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">No accounts found in this category.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Official Email</th>
                  <th>Stakeholder Role</th>
                  <th>Affiliated Institution ID</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'uppercase' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.institution_id ? `#${u.institution_id}` : 'None'}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {!u.is_approved ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleUpdateApproval(u.id, true, true)}
                            className="btn btn-success btn-sm"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateApproval(u.id, false, false)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUpdateApproval(u.id, false, false)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11.5px', color: '#DC2626' }}
                        >
                          Revoke Access
                        </button>
                      )}
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
