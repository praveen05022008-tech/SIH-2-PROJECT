import React from 'react';

/**
 * Reusable Circular Progress Indicator with sleek micro-animations.
 * Props:
 * - size: 'sm' (20px), 'md' (36px), 'lg' (48px), 'xl' (64px) or number
 * - message: optional text below spinner
 * - fullScreen: boolean (covers entire screen)
 * - inline: boolean (fits inside buttons or text lines)
 * - color: CSS color string
 */
export function LoadingSpinner({
  size = 'md',
  message,
  fullScreen = false,
  inline = false,
  color = '#3B5BDB',
  className = '',
  style = {}
}) {
  const pixelSize = typeof size === 'number'
    ? size
    : size === 'sm'
    ? 20
    : size === 'lg'
    ? 48
    : size === 'xl'
    ? 64
    : 36;

  const strokeWidth = pixelSize < 24 ? 2.5 : pixelSize < 48 ? 3.5 : 4;
  const radius = (pixelSize - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  const spinnerSvg = (
    <div
      className={`circular-spinner-container ${className}`}
      style={{
        display: inline ? 'inline-flex' : 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: inline ? '0' : fullScreen ? '0' : '28px 16px',
        ...style
      }}
    >
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox={`0 0 ${pixelSize} ${pixelSize}`}
        className="circular-progress-svg"
        style={{
          animation: 'spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          transformOrigin: 'center center'
        }}
      >
        {/* Background track circle */}
        <circle
          cx={pixelSize / 2}
          cy={pixelSize / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        {/* Animated colored progress circle */}
        <circle
          cx={pixelSize / 2}
          cy={pixelSize / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.35}
          style={{
            animation: 'circular-dash 1.4s ease-in-out infinite',
            transformOrigin: 'center center'
          }}
        />
      </svg>
      {message && (
        <span
          style={{
            fontSize: pixelSize < 30 ? '12px' : '13.5px',
            color: '#475569',
            fontWeight: 500,
            letterSpacing: '0.2px'
          }}
        >
          {message}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        {spinnerSvg}
      </div>
    );
  }

  return spinnerSvg;
}
