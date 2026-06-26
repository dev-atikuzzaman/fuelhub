// src/components/Badge.js
import React from 'react';

export default function Badge({ children, tone = 'default' }) {
  const tones = {
    default: { bg: '#f1f5f9', color: '#475569' },
    success: { bg: '#dcfce7', color: '#16a34a' },
    danger: { bg: '#fee2e2', color: '#dc2626' },
    info: { bg: '#e0f2fe', color: '#0284c7' },
    warning: { bg: '#fef3c7', color: '#d97706' },
    admin: { bg: '#ede9fe', color: '#7c3aed' },
  };
  const t = tones[tone] || tones.default;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: t.bg,
        color: t.color,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
