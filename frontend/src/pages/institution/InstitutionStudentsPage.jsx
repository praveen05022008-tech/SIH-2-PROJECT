import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { GraduationCap } from 'lucide-react';

export function InstitutionStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API endpoint /users?role=student is ABAC-scoped to current institution in backend
    api.get('/users?role=student')
      .then((data) => setStudents(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout title="Enrolled Student Roster" allowedRoles={['institution']}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Enrolled Students Directory</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>Students affiliated with your academic institution</p>
          </div>
          <span className="badge badge-info">{students.length} Students</span>
        </div>

        {loading ? (
          <p className="text-muted">Loading student directory...</p>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <GraduationCap size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">No students currently registered under this institution.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Official Email</th>
                  <th>Approval Status</th>
                  <th>Account Status</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.username}</td>
                    <td>{s.email}</td>
                    <td>
                      <span className={`badge ${s.is_approved ? 'badge-success' : 'badge-warning'}`}>
                        {s.is_approved ? 'Approved' : 'Pending Verification'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {s.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
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
