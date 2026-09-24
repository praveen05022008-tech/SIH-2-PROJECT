import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function PortalLayout({ children, title, subtitle, allowedRoles }) {
  const { user, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <LoadingSpinner size="lg" message="Initializing Collaboration Portal..." />
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
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="main-content">
        <TopNav title={title} subtitle={subtitle} onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
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
