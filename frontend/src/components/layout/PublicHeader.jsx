import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

export function PublicHeader() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="public-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.svg" alt="AIC Logo" width="34" height="34" />
          <div>
            <Link to="/" style={{ textDecoration: 'none', color: '#FFFFFF' }}>
              <div style={{ fontSize: '15.5px', fontWeight: 700, letterSpacing: '0.5px' }}>AIC PORTAL</div>
              <div style={{ fontSize: '10.5px', color: '#94A3B8' }} className="d-none d-sm-block">Centralized Skill Mapping & Placement Platform</div>
            </Link>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="public-header-nav" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          className="mobile-menu-btn public-mobile-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          style={{ color: '#FFFFFF', borderColor: '#334155' }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="public-mobile-menu">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500, padding: '6px 0' }}>Home</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ color: '#E2E8F0', fontSize: '14px', fontWeight: 500, padding: '6px 0' }}>About</Link>
          <Link to="/features" onClick={() => setMobileMenuOpen(false)} style={{ color: '#E2E8F0', fontSize: '14px', fontWeight: 500, padding: '6px 0' }}>Features</Link>
          <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ color: '#E2E8F0', fontSize: '14px', fontWeight: 500, padding: '6px 0' }}>How It Works</Link>

          <div style={{ borderTop: '1px solid #334155', paddingTop: '12px', marginTop: '4px', display: 'flex', gap: '10px' }}>
            {user ? (
              <Link to={`/${user.role}/dashboard`} onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                Go to Dashboard ({user.role})
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center', color: '#FFFFFF', borderColor: '#475569' }}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
