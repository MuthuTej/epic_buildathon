import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Layers, Kanban, Clock, Users, CheckCircle, ScrollText,
  ChevronsLeft, ChevronsRight, LogOut, Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Avatar, RoleBadge } from '../UI/Badge';

const items = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/blocks', label: 'Blocks', Icon: Layers },
  { to: '/kanban', label: 'Kanban', Icon: Kanban },
  { to: '/effort', label: 'Effort', Icon: Clock },
  { to: '/resources', label: 'Resources', Icon: Users },
  { to: '/approvals', label: 'Approvals', Icon: CheckCircle },
  { to: '/audit', label: 'Audit Log', Icon: ScrollText },
];

export function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { blocks } = useAppData();
  const pendingCount = blocks.filter((b) => b.stage === 'REVIEW').length;
  const width = collapsed ? 64 : 240;

  return (
    <aside
      className="h-screen sticky top-0 flex flex-col bg-white border-r border-gray-200 transition-[width] duration-200"
      style={{ width }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-200">
        <LogoMark />
        {!collapsed && (
          <div className="text-lg font-bold tracking-tight">
            Layout<span style={{ color: '#000000' }}>IQ</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              [
                'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-black/5 text-black'
                  : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r" style={{ background: '#000000' }} />
                )}
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
                {label === 'Approvals' && pendingCount > 0 && (
                  <span
                    className={`${collapsed ? 'absolute top-1.5 right-1.5 h-1.5 w-1.5' : 'ml-auto h-2 w-2'} rounded-full pulse-dot`}
                    style={{ background: '#EF4444' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-200 p-3">
        {user && (
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar initials={user.initials} />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground truncate">{user.name}</div>
                <div className="mt-0.5"><RoleBadge role={user.role} /></div>
              </div>
            )}
            {!collapsed && (
              <button onClick={logout} title="Sign out" className="p-2 text-muted-foreground hover:text-foreground">
                <LogOut size={16} />
              </button>
            )}
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-md py-1.5 text-xs text-muted-foreground hover:bg-gray-50 hover:text-foreground"
        >
          {collapsed ? <ChevronsRight size={14} /> : <><ChevronsLeft size={14} /> Collapse</>}
        </button>
      </div>
    </aside>
  );
}

function LogoMark() {
  return (
    <div
      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: 'linear-gradient(135deg, #222222, #000000)' }}
    >
      <Cpu size={18} color="#FFFFFF" strokeWidth={2.5} />
    </div>
  );
}
