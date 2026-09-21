import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';

import { UserCheck, CheckCircle2, XCircle, Clock, Trash2, RotateCcw } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function AdminApprovalsPage() {
  const [users, setUsers] = useState([]);
  const [filterApproved, setFilterApproved] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [filterApproved]);

  const fetchUsers = () => {
    setLoading(true);
    let url = '/users';
    if (filterApproved === 'pending') {
      url = '/users?is_approved=false&is_active=true';
    } else if (filterApproved === 'approved') {
      url = '/users?is_approved=true&is_active=true';
    } else if (filterApproved === 'rejected') {
      url = '/users?is_active=false';
    }

    api.get(url)
      .then((data) => setUsers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const toast = useToast();

  const handleUpdateApproval = async (userId, isApproved, isActive = true) => {
    try {
      await api.put(`/users/${userId}/approval`, {
        is_approved: isApproved,
        is_active: isActive,
      });
      fetchUsers();
      if (isApproved) {
        toast.success('Stakeholder account verified & approved.');
      } else if (!isActive) {
        toast.warning('Account rejected and moved to inactive queue.');
      }
    } catch (err) {
      toast.error('Error updating user: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete registration for '${username}'?`)) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
      toast.success(`Account for '${username}' permanently deleted.`);
    } catch (err) {
      toast.error('Error deleting user: ' + err.message);
    }
  };

  return (
    <PortalLayout title="Stakeholder Registration Approvals" allowedRoles={['admin']}>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
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
        <button
          onClick={() => setFilterApproved('rejected')}
          className={`btn btn-sm ${filterApproved === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
          style={filterApproved === 'rejected' ? { backgroundColor: '#DC2626', borderColor: '#DC2626' } : { color: '#DC2626', borderColor: '#DC2626' }}
        >
          Rejected / Inactive Accounts
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              {filterApproved === 'pending' && 'Pending Registrations Requiring Verification'}
              {filterApproved === 'approved' && 'Approved Platform Stakeholders'}
              {filterApproved === 'rejected' && 'Rejected & Deactivated Registrations'}
            </h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>
              Ensure identity authenticity and proper role permissions across the portal
            </p>
          </div>
          <span className="badge badge-info">{users.length} Accounts</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading registrations from TiDB..." />
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
                      {filterApproved === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleUpdateApproval(u.id, true, true)}
                            className="btn btn-success btn-sm"
                            style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateApproval(u.id, false, false)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      )}

                      {filterApproved === 'approved' && (
                        <button
                          onClick={() => handleUpdateApproval(u.id, false, false)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11.5px', color: '#DC2626' }}
                        >
                          Revoke Access
                        </button>
                      )}

                      {filterApproved === 'rejected' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleUpdateApproval(u.id, true, true)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11.5px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <RotateCcw size={12} /> Restore & Approve
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11.5px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
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
