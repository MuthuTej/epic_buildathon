import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { stageConfig, formatTime } from '../data/mockData';
import { ActionBadge, RoleBadge } from '../components/UI/Badge';

export default function AuditLog() {
  const { user } = useAuth();
  const { auditLog, engineers } = useAppData();

  const [search, setSearch] = useState('');
  const [fBlock, setFBlock] = useState('');
  const [fActor, setFActor] = useState('');
  const [fAction, setFAction] = useState('');

  const visible = useMemo(() => {
    let list = auditLog;
    if (user.role === 'engineer') {
      list = list.filter((a) => a.actor === user.name);
    }
    return list.filter((a) => {
      if (search) {
        const q = search.toLowerCase();
        if (![a.blockId, a.blockName, a.actor].some((s) => s && s.toLowerCase().includes(q))) return false;
      }
      if (fBlock && a.blockId !== fBlock) return false;
      if (fActor && a.actor !== fActor) return false;
      if (fAction && a.action !== fAction) return false;
      return true;
    });
  }, [auditLog, user, search, fBlock, fActor, fAction]);

  const blockIds = Array.from(new Set(auditLog.map((a) => a.blockId))).sort();
  const actorList = Array.from(new Set(auditLog.map((a) => a.actor))).sort();
  const actionList = ['CREATE', 'ADVANCE', 'APPROVE', 'REJECT', 'ASSIGN', 'REOPEN', 'OVERRIDE'];

  return (
    <div className="space-y-4">
      <div className="liq-card p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search log…" className="liq-input pl-9" />
        </div>
        <Select value={fBlock} onChange={setFBlock} placeholder="All blocks" options={blockIds.map(b => ({ value: b, label: b }))} />
        <Select value={fActor} onChange={setFActor} placeholder="All actors" options={actorList.map(a => ({ value: a, label: a }))} />
        <Select value={fAction} onChange={setFAction} placeholder="All actions" options={actionList.map(a => ({ value: a, label: a }))} />
      </div>

      <div className="liq-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-gray-50">
              <tr>
                <Th>Timestamp</Th><Th>Block ID</Th><Th>Block Name</Th>
                <Th>Action</Th><Th>From</Th><Th>To</Th><Th>Actor</Th><Th>Role</Th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">No events match</td></tr>}
              {visible.map((a) => (
                <tr key={a.id} className="border-t border-white/[0.06]">
                  <Td className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">{formatTime(a.timestamp)}</Td>
                  <Td className="font-mono text-[12px]" style={{ color: '#0B6E4F' }}>{a.blockId}</Td>
                  <Td>{a.blockName}</Td>
                  <Td><ActionBadge action={a.action} /></Td>
                  <Td>{a.fromStage ? <StagePill stage={a.fromStage} /> : <span className="text-muted-foreground">—</span>}</Td>
                  <Td>{a.toStage ? <StagePill stage={a.toStage} /> : <span className="text-muted-foreground">—</span>}</Td>
                  <Td>{a.actor}</Td>
                  <Td><RoleBadge role={a.actorRole} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StagePill({ stage }) {
  const c = stageConfig[stage];
  if (!c) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
      style={{ background: c.color + '22', color: c.color, border: `1px solid ${c.color}55` }}>
      {c.label}
    </span>
  );
}

function Select({ value, onChange, placeholder, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="liq-input text-xs py-1.5 max-w-[170px]">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Th({ children, className }) { return <th className={`text-left font-semibold px-4 py-2.5 ${className || ''}`}>{children}</th>; }
function Td({ children, className, style }) { return <td style={style} className={`px-4 py-3 ${className || ''}`}>{children}</td>; }
