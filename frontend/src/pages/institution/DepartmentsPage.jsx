import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { FolderGit2, Plus } from 'lucide-react';

export function DepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);

  const instId = user?.institution_id || 1;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = () => {
    setLoading(true);
    api.get(`/users/institutions/${instId}/departments`)
      .then((data) => setDepartments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/users/institutions/${instId}/departments`, { name, code });
      setName('');
      setCode('');
      fetchDepartments();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalLayout title="Academic Departments & Faculties" allowedRoles={['institution']}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Registered Departments</h3>
            <span className="badge badge-info">{departments.length} Departments</span>
          </div>

          {loading ? (
            <p className="text-muted">Loading departments...</p>
          ) : departments.length === 0 ? (
            <p className="text-muted" style={{ padding: '20px 0' }}>No departments registered for your institution yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Code</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td><span className="badge badge-neutral">{d.code}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Add Department</h3>
          </div>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">Department Name *</label>
              <input type="text" className="form-control" placeholder="e.g. Dravyaguna Vigyana" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Department Code *</label>
              <input type="text" className="form-control" placeholder="e.g. DGV" value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }} disabled={saving}>
              <Plus size={13} /> Add Department
            </button>
          </form>
        </div>
      </div>
    </PortalLayout>
  );
}
