import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';

import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RotateCcw,
  UploadCloud,
  Users,
  FileText,
  FileSpreadsheet,
  Download,
  Loader2,
  X,
  FileCheck,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function AdminApprovalsPage() {
  const [users, setUsers] = useState([]);
  const [filterApproved, setFilterApproved] = useState('pending');
  const [loading, setLoading] = useState(true);

  // Bulk Onboarding State (Section 18 & 29 of Specification)
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [csvInput, setCsvInput] = useState(`S.no,Name,mail,role,dept,year
1,Aarav Patel,aarav.patel@samplecollege.edu,student,Computer Science,3
2,Dr. Sunita Rao,sunita.rao@samplecollege.edu,faculty,Computer Science,
3,Priya Sharma,priya.sharma@samplecollege.edu,student,Information Technology,4`);
  const [defaultRole, setDefaultRole] = useState('student');
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

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

  const handleFileProcess = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      toast.error('Please upload a valid .csv spreadsheet file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (!text || !text.trim()) {
        toast.error('The selected CSV file is empty.');
        return;
      }
      setCsvInput(text);
      const lines = text.trim().split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      const rowCount = Math.max(0, lines.length - 1);
      setSelectedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        rows: rowCount,
      });
      toast.success(`Loaded "${file.name}" with ${rowCount} stakeholder records.`);
    };
    reader.onerror = () => {
      toast.error('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDownloadTemplate = () => {
    const sampleCsv = `S.no,Name,mail,role,dept,year
1,Aarav Patel,aarav.patel@samplecollege.edu,student,Computer Science,3
2,Dr. Sunita Rao,sunita.rao@samplecollege.edu,faculty,Computer Science,
3,Priya Sharma,priya.sharma@samplecollege.edu,student,Information Technology,4
4,Rahul Verma,rahul.verma@samplecollege.edu,student,Mechanical Engineering,2
5,Dr. Anand Kumar,anand.kumar@samplecollege.edu,faculty,Electrical Engineering,`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'stakeholder_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Sample roster CSV template downloaded.');
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!csvInput.trim()) return;
    setUploadingBulk(true);
    try {
      const res = await api.post('/admin/bulk-upload', {
        csv_content: csvInput,
        default_role: defaultRole
      });
      setBulkResult(res);
      toast.success(`Processed ${res.total_processed} accounts. (${res.created_count} created, ${res.skipped_count} skipped).`);
      fetchUsers();
    } catch (err) {
      toast.error('Bulk onboarding error: ' + err.message);
    } finally {
      setUploadingBulk(false);
    }
  };


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
      {/* Filter Tabs & Bulk Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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

        <button
          onClick={() => setShowBulkModal(true)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <UploadCloud size={14} /> Bulk CSV Onboarding
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

      {/* Bulk CSV Onboarding Modal (Section 18 & 29 of Specification) */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header" style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: '#EEF2FF', padding: '8px', borderRadius: '8px', color: '#3B5BDB' }}>
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 className="card-title" style={{ margin: 0, fontSize: '16px' }}>Bulk Stakeholder CSV Provisioning</h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Upload or paste validated CSV roster to generate accounts and profiles</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkResult(null);
                }}
                className="btn btn-outline btn-sm"
                style={{ padding: '4px 8px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,text/csv,application/vnd.ms-excel"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />

            <form onSubmit={handleBulkUpload} style={{ marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Default Fallback Role</label>
                  <select className="form-control" value={defaultRole} onChange={(e) => setDefaultRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty / Academician</option>
                    <option value="industry">Industry Recruiter</option>
                    <option value="institution">Educational Institution</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12.5px' }}
                  >
                    <Download size={14} /> Download Sample Template (.csv)
                  </button>
                </div>
              </div>

              {/* Mode Toggle Tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: activeTab === 'upload' ? '#3B5BDB' : '#F1F5F9',
                    color: activeTab === 'upload' ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <UploadCloud size={14} /> File Picker & Dropzone
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: activeTab === 'paste' ? '#3B5BDB' : '#F1F5F9',
                    color: activeTab === 'paste' ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={14} /> Direct CSV Text Editor
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div style={{ marginBottom: '16px' }}>
                  {selectedFile ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: '#F0FDF4',
                      border: '1.5px solid #86EFAC',
                      borderRadius: '8px',
                      marginBottom: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ backgroundColor: '#DCFCE7', padding: '10px', borderRadius: '8px', color: '#16A34A' }}>
                          <FileCheck size={24} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#166534', fontSize: '13.5px' }}>{selectedFile.name}</div>
                          <div style={{ fontSize: '12px', color: '#15803D' }}>
                            {selectedFile.size} &bull; <span style={{ fontWeight: 600 }}>{selectedFile.rows} records detected</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '12px', backgroundColor: '#FFFFFF' }}
                        >
                          Replace File
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setCsvInput('');
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '12px', color: '#DC2626', backgroundColor: '#FFFFFF' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: isDragging ? '2px dashed #3B5BDB' : '2px dashed #CBD5E1',
                        backgroundColor: isDragging ? '#EEF2FF' : '#F8FAFC',
                        borderRadius: '8px',
                        padding: '32px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <UploadCloud size={36} color={isDragging ? '#3B5BDB' : '#64748B'} style={{ margin: '0 auto 10px auto' }} />
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', marginBottom: '4px' }}>
                        Choose CSV file or drag & drop here
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 12px 0' }}>
                        Accepts standardized <code>.csv</code> rosters (Header: <code>S.no, Name, mail, role, dept, year</code>)
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ pointerEvents: 'none', backgroundColor: '#FFFFFF' }}
                      >
                        Browse Files
                      </button>
                    </div>
                  )}

                  <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#64748B' }}>
                    * Tip: If the role is <strong>faculty</strong>, leave the year column empty as faculty does not study.
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">
                    CSV Text Content (Header: <code>S.no, Name, mail, role, dept, year</code>) *
                    <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 'normal', marginTop: '2px' }}>
                      Note: If role is faculty, leave the year column empty as faculty does not study.
                    </span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={7}
                    value={csvInput}
                    onChange={(e) => setCsvInput(e.target.value)}
                    style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    placeholder="S.no,Name,mail,role,dept,year..."
                    required
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkResult(null);
                  }}
                  className="btn btn-outline btn-sm"
                  disabled={uploadingBulk}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={uploadingBulk || !csvInput.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {uploadingBulk ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  {uploadingBulk ? 'Provisioning Accounts...' : 'Process Batch Onboarding'}
                </button>
              </div>
            </form>

            {bulkResult && (
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                  <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    {bulkResult.created_count} Accounts Created & Emailed
                  </span>
                  {bulkResult.skipped_count > 0 && (
                    <span className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      {bulkResult.skipped_count} Skipped (Duplicates/Invalid)
                    </span>
                  )}
                </div>

                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px', fontSize: '12px', backgroundColor: '#F8FAFC' }}>
                  {bulkResult.details?.map((d, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 4px', borderBottom: '1px solid #E2E8F0' }}>
                      <div>
                        <strong>{d.email}</strong> &bull; <span className="text-muted">{d.full_name} ({d.role})</span>
                      </div>
                      <span style={{ fontWeight: 600, color: d.status === 'created' ? '#16A34A' : '#DC2626' }}>
                        {d.status === 'created' ? `Password: ${d.initial_password}` : d.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
