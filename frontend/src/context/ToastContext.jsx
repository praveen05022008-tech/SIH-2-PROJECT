import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Overlay */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
        pointerEvents: 'none',
      }}>
        {toasts.map((t) => {
          let bg = '#1E293B';
          let border = '#334155';
          let icon = <Info size={18} color="#60A5FA" />;
          let color = '#F8FAFC';

          if (t.type === 'success') {
            bg = '#F0FDF4';
            border = '#86EFAC';
            color = '#14532D';
            icon = <CheckCircle2 size={18} color="#16A34A" />;
          } else if (t.type === 'error') {
            bg = '#FEF2F2';
            border = '#FCA5A5';
            color = '#7F1D1D';
            icon = <AlertCircle size={18} color="#DC2626" />;
          } else if (t.type === 'warning') {
            bg = '#FFFBEB';
            border = '#FDE68A';
            color = '#78350F';
            icon = <AlertTriangle size={18} color="#D97706" />;
          } else if (t.type === 'info') {
            bg = '#EFF6FF';
            border = '#BFDBFE';
            color = '#1E3A8A';
            icon = <Info size={18} color="#2563EB" />;
          }

          return (
            <div
              key={t.id}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                backgroundColor: bg,
                color: color,
                border: `1px solid ${border}`,
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                fontSize: '13.5px',
                lineHeight: '1.4',
                animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                minWidth: '280px',
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '1px' }}>{icon}</div>
              <div style={{ flex: 1, wordBreak: 'break-word', fontWeight: 500 }}>{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  color: color,
                  opacity: 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '4px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
