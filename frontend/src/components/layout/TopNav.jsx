import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, AlertTriangle, Menu, ChevronDown } from 'lucide-react';

export function TopNav({ title, subtitle, onToggleMobileSidebar }) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header
      className="topbar"
      style={{
        minHeight: '74px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #EEF2F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          title="Open menu"
          aria-label="Open navigation drawer"
        >
          <Menu size={20} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px', margin: 0 }}>
              {title || 'Collaboration Portal'}
            </h1>
            {!user.is_approved && user.role !== 'admin' && (
              <span
                style={{
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
                }}
              >
                <AlertTriangle size={13} />
                <span style={{ display: 'none' }} className="d-sm-inline">
                  Pending Admin Approval
                </span>
              </span>
            )}
          </div>
          {subtitle && (
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Profile Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '6px 14px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
          }}
        >
          <Shield size={15} color="#3B82F6" />
          <span style={{ color: '#0F172A', fontWeight: 600, fontSize: '13.5px' }}>{user.email}</span>
          <ChevronDown size={14} color="#94A3B8" />
        </div>

        {/* Role Tag */}
        <span
          style={{
            backgroundColor: '#EEF2FF',
            color: '#2563EB',
            fontSize: '11px',
            fontWeight: 700,
            padding: '6px 10px',
            borderRadius: '8px',
            letterSpacing: '0.6px',
            textTransform: 'uppercase'
          }}
        >
          {user.role}
        </span>
      </div>
    </header>
  );
}
