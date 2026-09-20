import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export function PortalLayout({ children, title, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#1E2A44', fontWeight: 600 }}>Loading Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'admin') {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopNav title={title} />
        <main className="page-body">
          {!user.is_approved && user.role !== 'admin' && (
            <div style={{
              backgroundColor: '#FEF08A',
              border: '1px solid #FDE047',
              borderRadius: '6px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#854D0E',
              fontSize: '13px'
            }}>
              <strong>Account Pending Administrator Verification:</strong> Your registration has been submitted and is in the governance queue. While awaiting approval, your interactions may be limited.
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
