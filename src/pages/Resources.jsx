import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { Avatar } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { useToast } from '../components/UI/Toast';
import { formatTime, getEngineerById } from '../data/mockData';

export default function Resources() {
  const { user } = useAuth();
  const { blocks, engineers, auditLog, assignBlock } = useAppData();
  const toast = useToast();
  const [assignFor, setAssignFor] = useState(null);
  const [pickedEng, setPickedEng] = useState('');

  const engs = engineers.filter((e) => e.role === 'engineer');
  const unassigned = blocks.filter((b) => !b.assignedTo);

  const stats = useMemo(() => {
    return engs.map((e) => {
      const mine = blocks.filter((b) => b.assignedTo === e.id);
      const committed = mine.reduce((s, b) => s + b.estHours, 0);
      const pct = e.maxHours ? Math.round((committed / e.maxHours) * 100) : 0;
      return { engineer: e, blocks: mine, committed, pct };
    });
  }, [blocks, engs]);

  const assignmentHistory = auditLog.filter((a) => a.action === 'ASSIGN').slice(0, 10);

  const openAssign = (b) => { setPickedEng(''); setAssignFor(b); };
  const submitAssign = () => {
    if (!pickedEng) { toast.warning('Pick an engineer', ''); return; }
    assignBlock(assignFor.id, pickedEng, user);
    toast.success('Assigned', `${assignFor.id} → ${getEngineerById(pickedEng).name}`);
    setAssignFor(null);
  };

  const isManager = user.role === 'manager';

  return (
    <div className="space-y-5">
      {/* Capacity cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ engineer, blocks: bs, committed, pct }) => {
          const color = pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#046307';
          return (
            <div key={engineer.id} className="liq-card p-4">
              <div className="flex items-center gap-3">
                <Avatar initials={engineer.initials} size={48} />
                <div className="min-w-0">
                  <div className="font-semibold text-sm">{engineer.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{engineer.email}</div>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Assigned</div>
                  <div className="text-lg font-bold">{bs.length} <span className="text-xs text-muted-foreground font-normal">blocks</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Hours</div>
                  <div className="text-lg font-bold font-mono" style={{ color }}>{committed}h <span className="text-xs text-muted-foreground font-normal">/ {engineer.maxHours}h</span></div>
                </div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full transition-all" style={{ width: Math.min(100, pct) + '%', background: color }} />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>{pct}% utilization</span>
                {pct > 100 && <span className="font-bold uppercase tracking-wider" style={{ color: '#EF4444' }}>Overloaded</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {bs.map((b) => (
                  <span key={b.id} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-muted-foreground" title={b.name}>
                    {b.name.length > 16 ? b.name.slice(0, 16) + '…' : b.name}
                  </span>
                ))}
                {bs.length === 0 && <span className="text-[11px] text-muted-foreground italic">No blocks assigned</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned panel */}
      <div className="liq-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 rounded-full pulse-dot" style={{ background: '#EF4444' }} />
          <h3 className="text-sm font-semibold">Unassigned Blocks ({unassigned.length})</h3>
        </div>
        {unassigned.length === 0 && <div className="text-sm text-muted-foreground">All blocks have an owner ✓</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {unassigned.map((b) => (
            <div key={b.id} className="liq-card p-3" style={{ borderLeft: '3px solid #EF4444' }}>
              <div className="text-[11px] font-mono" style={{ color: '#0B6E4F' }}>{b.id}</div>
              <div className="text-sm font-semibold">{b.name}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{b.type} · {b.techNode} · {b.estHours}h</div>
              {isManager ? (
                <button onClick={() => openAssign(b)} className="liq-btn liq-btn-primary w-full text-xs py-1.5 mt-3">
                  Assign Engineer
                </button>
              ) : (
                <div className="mt-3 text-[11px] text-muted-foreground italic">Manager-only action</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assignment history */}
      <div className="liq-card overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold">Recent Assignments</div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-gray-50">
              <tr><Th>Block ID</Th><Th>Block Name</Th><Th>Note</Th><Th>By</Th><Th>Timestamp</Th></tr>
            </thead>
            <tbody>
              {assignmentHistory.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">No assignment events yet</td></tr>
              )}
              {assignmentHistory.map((a) => (
                <tr key={a.id} className="border-t border-white/[0.06]">
                  <Td className="font-mono text-[12px]" style={{ color: '#0B6E4F' }}>{a.blockId}</Td>
                  <Td>{a.blockName}</Td>
                  <Td className="text-muted-foreground">{a.note || '—'}</Td>
                  <Td>{a.actor}</Td>
                  <Td className="text-[11px] font-mono text-muted-foreground">{formatTime(a.timestamp)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!assignFor}
        onClose={() => setAssignFor(null)}
        title={assignFor ? `Assign Block — ${assignFor.id} ${assignFor.name}` : ''}
        width="max-w-xl"
        footer={
          <>
            <button className="liq-btn liq-btn-ghost" onClick={() => setAssignFor(null)}>Cancel</button>
            <button className="liq-btn liq-btn-primary" onClick={submitAssign} disabled={!pickedEng}>Confirm Assignment</button>
          </>
        }
      >
        <div className="space-y-2">
          {stats.map(({ engineer, committed, pct }) => {
            const isOver = pct > 100;
            const color = pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#046307';
            const selected = pickedEng === engineer.id;
            return (
              <button
                key={engineer.id}
                disabled={isOver}
                onClick={() => setPickedEng(engineer.id)}
                className="w-full text-left liq-card p-3 transition-all"
                style={{
                  borderColor: selected ? '#0B6E4F' : 'rgba(255,255,255,0.09)',
                  background: selected ? 'rgba(0,212,170,0.08)' : undefined,
                  opacity: isOver ? 0.55 : 1,
                  cursor: isOver ? 'not-allowed' : 'pointer',
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar initials={engineer.initials} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{engineer.name}</div>
                    <div className="text-[11px] text-muted-foreground">{committed}h committed · {pct}%</div>
                  </div>
                  {isOver && <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#EF4444' }}>Overloaded</span>}
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full" style={{ width: Math.min(100, pct) + '%', background: color }} />
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Assigned by: <span className="text-foreground">{user.name}</span>
        </div>
      </Modal>
    </div>
  );
}

function Th({ children, className }) { return <th className={`text-left font-semibold px-4 py-2.5 ${className || ''}`}>{children}</th>; }
function Td({ children, className, style }) { return <td style={style} className={`px-4 py-3 ${className || ''}`}>{children}</td>; }
