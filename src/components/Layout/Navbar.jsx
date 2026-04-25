import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Avatar, RoleBadge } from '../UI/Badge';
import { TAPEOUT_DATE } from '../../data/mockData';
import { Rocket } from 'lucide-react';

const titles = {
  '/dashboard': 'Dashboard',
  '/blocks': 'Blocks',
  '/kanban': 'Kanban Board',
  '/effort': 'Effort Estimation',
  '/resources': 'Resource Assignment',
  '/approvals': 'Approvals',
  '/audit': 'Audit Log',
};

export function Navbar() {
  const { user } = useAuth();
  const { blocks } = useAppData();
  const loc = useLocation();
  const title = titles[loc.pathname] || 'LayoutIQ';

  const daysLeft = useMemo(() => {
    const ms = TAPEOUT_DATE.getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86400000));
  }, []);
  const danger = daysLeft < 14;

  const completedPct = useMemo(() => {
    if (!blocks.length) return 0;
    const done = blocks.filter((b) => b.stage === 'COMPLETED').length;
    return Math.round((done / blocks.length) * 100);
  }, [blocks]);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/85 backdrop-blur border-b border-gray-200 flex items-center px-6 gap-6">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>

      <div className="flex-1 flex justify-center">
        <div
          className="flex items-center gap-3 rounded-full px-4 py-1.5"
          style={{
            background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(0,212,170,0.10)',
            border: `1px solid ${danger ? 'rgba(239,68,68,0.45)' : 'rgba(0,212,170,0.45)'}`,
          }}
        >
          <CountdownRing pct={completedPct} color={danger ? '#EF4444' : '#0B6E4F'} />
          <Rocket size={14} style={{ color: danger ? '#EF4444' : '#0B6E4F' }} />
          <span className="text-sm font-semibold" style={{ color: danger ? '#EF4444' : '#111827' }}>
            Tapeout in {daysLeft} day{daysLeft === 1 ? '' : 's'}
          </span>
          <span className="text-xs text-muted-foreground">· {completedPct}% complete</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <>
            <RoleBadge role={user.role} />
            <span className="text-sm text-foreground">{user.name}</span>
            <Avatar initials={user.initials} size={32} />
          </>
        )}
      </div>
    </header>
  );
}

function CountdownRing({ pct, color }) {
  const r = 10;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26">
      <circle cx="13" cy="13" r={r} stroke="rgba(0,0,0,0.12)" strokeWidth="2.5" fill="none" />
      <circle
        cx="13" cy="13" r={r}
        stroke={color} strokeWidth="2.5" fill="none"
        strokeDasharray={c} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 13 13)"
      />
    </svg>
  );
}
