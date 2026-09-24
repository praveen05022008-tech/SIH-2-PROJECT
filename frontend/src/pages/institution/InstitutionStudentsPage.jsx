import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';
import {
  GraduationCap,
  Users,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Download,
  FileCheck,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function InstitutionStudentsPage() {
  const [stakeholders, setStakeholders] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'student' | 'faculty'
  const [loading, setLoading] = useState(true);

  // Bulk CSV Onboarding Modal State
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

  const toast = useToast();

  const fetchStakeholders = () => {
    setLoading(true);
    let url = '/users';
    if (roleFilter !== 'all') {
      url = `/users?role=${roleFilter}`;
    }

    api.get(url)
      .then((data) => {
        // Only show student and faculty for institution view
        const filtered = data.filter((u) => u.role === 'student' || u.role === 'faculty');
        setStakeholders(filtered);
      })
      .catch((err) => {
        toast.error('Failed to load roster: ' + err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStakeholders();
  }, [roleFilter]);

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
    link.setAttribute('download', 'institution_stakeholder_template.csv');
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
        default_role: defaultRole,
      });
      setBulkResult(res);
      toast.success(
        `Provisioning completed: ${res.created_count} accounts created & emailed, ${res.skipped_count} skipped.`
      );
      fetchStakeholders();
    } catch (err) {
      toast.error('Bulk onboarding error: ' + err.message);
    } finally {
      setUploadingBulk(false);
    }
  };

  const studentCount = stakeholders.filter((s) => s.role === 'student').length;
  const facultyCount = stakeholders.filter((s) => s.role === 'faculty').length;

  return (
    <PortalLayout title="Institutional Stakeholder Rosters" allowedRoles={['institution']}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', color: '#1E2A44', margin: '0 0 4px 0' }}>Enrolled Stakeholders Directory</h2>
          <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>
            Manage and provision student and faculty accounts affiliated with your academic institution.
          </p>
        </div>
        <button
          onClick={() => {
            setBulkResult(null);
            setShowBulkModal(true);
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
        >
          <UploadCloud size={16} /> Bulk Onboard via CSV File
        </button>
      </div>

      {/* Metric Cards & Filter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: '#EEF2FF', padding: '12px', borderRadius: '8px', color: '#3B5BDB' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E2A44' }}>{studentCount}</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Enrolled Students</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: '#F0FDF4', padding: '12px', borderRadius: '8px', color: '#16A34A' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E2A44' }}>{facultyCount}</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Faculty Members</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setRoleFilter('all')}
              className={`btn btn-sm ${roleFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              All Rosters ({stakeholders.length})
            </button>
            <button
              onClick={() => setRoleFilter('student')}
              className={`btn btn-sm ${roleFilter === 'student' ? 'btn-primary' : 'btn-outline'}`}
            >
              Students Only ({studentCount})
            </button>
            <button
              onClick={() => setRoleFilter('faculty')}
              className={`btn btn-sm ${roleFilter === 'faculty' ? 'btn-primary' : 'btn-outline'}`}
            >
              Faculty Only ({facultyCount})
            </button>
          </div>
          <span className="badge badge-info">{stakeholders.length} Total Affiliated</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading institutional directory..." />
        ) : stakeholders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <FileSpreadsheet size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ color: '#1E293B', marginBottom: '6px' }}>No Stakeholders Enrolled Yet</h4>
            <p className="text-muted" style={{ fontSize: '13px', maxWidth: '420px', margin: '0 auto 18px auto' }}>
              Upload your institution's CSV roster containing students and faculty to provision their login credentials.
            </p>
            <button onClick={() => setShowBulkModal(true)} className="btn btn-primary btn-sm">
              <UploadCloud size={14} style={{ marginRight: '6px' }} /> Upload CSV Roster
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Full Name / Username</th>
                  <th>Official Email</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Approval Status</th>
                  <th>Enrolled Date</th>
                  <th>Digital Portfolio</th>
                </tr>
              </thead>
              <tbody>
                {stakeholders.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{s.username}</div>
                    </td>
                    <td>{s.email}</td>
                    <td>
                      <span className={`badge ${s.role === 'student' ? 'badge-primary' : 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>
                        {s.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {s.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${s.is_approved ? 'badge-success' : 'badge-warning'}`}>
                        {s.is_approved ? 'Verified & Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                      {s.role === 'student' ? (
                        <a
                          href={`/portfolio/${s.username || s.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', padding: '4px 10px', color: '#2563EB', borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }}
                          title="View Verified Student Digital Portfolio"
                        >
                          <FolderGit2 size={12} /> View Portfolio
                        </a>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '12px' }}>Faculty Profile</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk CSV Onboarding Modal */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header" style={{ paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: '#EEF2FF', padding: '8px', borderRadius: '8px', color: '#3B5BDB' }}>
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 className="card-title" style={{ margin: 0, fontSize: '16px' }}>Institutional CSV Roster Onboarding</h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Upload your validated student & faculty roster to generate credentials</span>
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
                        Choose CSV roster file or drag & drop here
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 12px 0' }}>
                        Header: <code>S.no, Name, mail, role, dept, year</code>
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
