import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function PublicHeader() {
  const { user } = useAuth();

  return (
    <header className="public-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img src="/logo.svg" alt="AIC Logo" width="36" height="36" />
        <div>
          <Link to="/" style={{ textDecoration: 'none', color: '#FFFFFF' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.5px' }}>AIC PORTAL</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Centralized Skill Mapping & Placement Platform</div>
          </Link>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/" style={{ color: '#E2E8F0', fontSize: '13.5px', fontWeight: 500 }}>Home</Link>
        <Link to="/about" style={{ color: '#E2E8F0', fontSize: '13.5px', fontWeight: 500 }}>About</Link>
        <Link to="/features" style={{ color: '#E2E8F0', fontSize: '13.5px', fontWeight: 500 }}>Features</Link>
        <Link to="/how-it-works" style={{ color: '#E2E8F0', fontSize: '13.5px', fontWeight: 500 }}>How It Works</Link>

        {user ? (
          <Link to={`/${user.role}/dashboard`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
            Dashboard ({user.role})
          </Link>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/login" className="btn btn-outline btn-sm" style={{ color: '#FFFFFF', borderColor: '#475569', backgroundColor: 'transparent' }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
