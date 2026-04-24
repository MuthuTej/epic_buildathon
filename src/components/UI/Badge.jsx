import React from 'react';
import { stageConfig, complexityConfig } from '../../data/mockData';

export function StageBadge({ stage, size = 'sm' }) {
  const cfg = stageConfig[stage];
  if (!cfg) return null;
  const padding = size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide ${padding}`}
      style={{ backgroundColor: cfg.color + '22', color: cfg.color, border: `1px solid ${cfg.color}55` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

const complexityHex = {
  Simple: '#6B7280',
  Medium: '#3B82F6',
  Complex: '#F97316',
  Critical: '#EF4444',
};

export function ComplexityPill({ complexity }) {
  const c = complexityHex[complexity] || '#6B7280';
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: c + '22', color: c, border: `1px solid ${c}55` }}
    >
      {complexity}
    </span>
  );
}

export function RoleBadge({ role }) {
  const isMgr = role === 'manager';
  const color = isMgr ? '#00D4AA' : '#A855F7';
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: color + '22', color: color, border: `1px solid ${color}55` }}
    >
      {isMgr ? 'Manager' : 'Engineer'}
    </span>
  );
}

export function ActionBadge({ action }) {
  const map = {
    ADVANCE:  '#3B82F6',
    APPROVE:  '#22C55E',
    REJECT:   '#EF4444',
    ASSIGN:   '#A855F7',
    CREATE:   '#00D4AA',
    REOPEN:   '#F59E0B',
    OVERRIDE: '#EAB308',
  };
  const c = map[action] || '#94A3B8';
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: c + '22', color: c, border: `1px solid ${c}55` }}
    >
      {action}
    </span>
  );
}

export function Avatar({ initials, size = 32, color = '#00D4AA' }) {
  return (
    <div
      className="inline-flex items-center justify-center rounded-full font-semibold text-[#0B0F1A]"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
