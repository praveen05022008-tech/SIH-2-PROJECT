import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, AlertTriangle, Menu } from 'lucide-react';

export function TopNav({ title, onToggleMobileSidebar }) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          title="Open menu"
          aria-label="Open navigation drawer"
        >
          <Menu size={20} />
        </button>
        <h1 className="topbar-title">{title || 'Collaboration Portal'}</h1>
        {!user.is_approved && user.role !== 'admin' && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#FEF08A',
            color: '#854D0E',
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid #FDE047'
          }}>
            <AlertTriangle size={13} />
            <span style={{ display: 'none' }} className="d-sm-inline">Pending Admin Approval</span>
          </span>
        )}
      </div>

      <div className="topbar-actions">
        <div className="user-badge">
          <Shield size={14} color="#3B5BDB" />
          <span className="user-email" style={{ color: '#1E2A44', fontWeight: 600 }}>{user.email}</span>
          <span className="badge badge-info" style={{ marginLeft: '4px' }}>
            {user.role.toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
