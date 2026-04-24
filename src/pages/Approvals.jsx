import React, { useMemo, useState } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { stageConfig, getEngineerById, formatTime, relativeTime } from '../data/mockData';
import { StageBadge, ComplexityPill, Avatar } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { useToast } from '../components/UI/Toast';

export default function Approvals() {
  const { user } = useAuth();
  if (user.role === 'manager') return <ManagerApprovals />;
  return <EngineerApprovals />;
}

function ManagerApprovals() {
  const { user } = useAuth();
  const { blocks, auditLog, approveBlock, rejectBlock } = useAppData();
  const toast = useToast();
  const [expanded, setExpanded] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [reason, setReason] = useState('');

  const pending = blocks.filter((b) => b.stage === 'REVIEW');
  const history = auditLog.filter((a) => a.action === 'APPROVE' || a.action === 'REJECT').slice(0, 30);

  const doApprove = () => { approveBlock(confirm.block.id, user); toast.success('Approved', `${confirm.block.id}`); setConfirm(null); };
  const doReject = () => {
    if (!reason.trim()) { toast.warning('Reason required', ''); return; }
    rejectBlock(confirm.block.id, reason.trim(), user);
    toast.error('Rejected', `${confirm.block.id}`);
    setConfirm(null); setReason('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold">Pending Approvals</h2>
        <span className="text-xs font-bold rounded-full px-2 py-0.5"
          style={{ background: 'rgba(234,179,8,0.18)', color: '#EAB308' }}>{pending.length}</span>
      </div>

      {pending.length === 0 && (
        <div className="liq-card p-8 text-center text-sm text-muted-foreground">
          No blocks are awaiting your review.
        </div>
      )}

      <div className="space-y-3">
        {pending.map((b) => {
          const eng = getEngineerById(b.assignedTo);
          const reviewEntry = b.stageHistory.find((s) => s.stage === 'REVIEW');
          const isOpen = expanded === b.id;
          return (
            <div key={b.id} className="liq-card p-4" style={{ borderLeft: '4px solid #EAB308' }}>
              <div className="flex items-start gap-4">
                <StageBadge stage="REVIEW" size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-mono" style={{ color: '#00D4AA' }}>{b.id}</div>
                  <div className="text-base font-semibold">{b.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{b.type} · {b.techNode} · <ComplexityPill complexity={b.complexity} /></div>
                  {eng && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Avatar initials={eng.initials} size={20} />
                      <span>{eng.name}</span>
                      <span className="text-muted-foreground">· in review {reviewEntry ? relativeTime(reviewEntry.timestamp) : ''}</span>
                      <span className="text-muted-foreground">· est {b.estHours}h / actual {b.actualHours}h</span>
                    </div>
                  )}
                  <button
                    onClick={() => setExpanded(isOpen ? null : b.id)}
                    className="mt-3 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    {isOpen ? <ChevronUp size={12}/> : <ChevronDown size={12}/>} View Stage History
                  </button>
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-4 relative">
                      <span className="absolute left-1 top-2 bottom-2 w-px bg-white/10" />
                      {b.stageHistory.map((h, i) => {
                        const c = stageConfig[h.stage];
                        return (
                          <div key={i} className="relative text-xs">
                            <span className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                            <span style={{ color: c.color }} className="font-medium">{c.label}</span>
                            <span className="text-muted-foreground"> · {h.actor} · {formatTime(h.timestamp)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => setConfirm({ kind: 'approve', block: b })}
                    className="liq-btn text-xs px-4" style={{ background: '#22C55E', color: '#0B0F1A' }}>
                    <Check size={14}/> Approve
                  </button>
                  <button onClick={() => { setReason(''); setConfirm({ kind: 'reject', block: b }); }}
                    className="liq-btn text-xs px-4" style={{ background: '#EF4444', color: '#0B0F1A' }}>
                    <X size={14}/> Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="liq-card overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold">Approval History</div>
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-[#1A2030]">
            <tr><Th>Block ID</Th><Th>Name</Th><Th>Decision</Th><Th>By</Th><Th>Timestamp</Th></tr>
          </thead>
          <tbody>
            {history.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No decisions yet</td></tr>}
            {history.map((a) => {
              const isApprove = a.action === 'APPROVE';
              return (
                <tr key={a.id} className="border-t border-white/[0.06]"
                  style={{ boxShadow: `inset 3px 0 0 0 ${isApprove ? '#22C55E' : '#EF4444'}` }}>
                  <Td className="font-mono text-[12px]" style={{ color: '#00D4AA' }}>{a.blockId}</Td>
                  <Td>{a.blockName}</Td>
                  <Td>
                    <span className="text-[10px] font-bold uppercase tracking-wider rounded px-2 py-0.5"
                      style={{ background: (isApprove ? '#22C55E' : '#EF4444') + '22', color: isApprove ? '#22C55E' : '#EF4444' }}>
                      {isApprove ? 'Approved' : 'Rejected'}
                    </span>
                  </Td>
                  <Td>{a.actor}</Td>
                  <Td className="text-[11px] font-mono text-muted-foreground">{formatTime(a.timestamp)}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!confirm && confirm.kind === 'approve'}
        onClose={() => setConfirm(null)}
        title="Approve Block"
        footer={<>
          <button className="liq-btn liq-btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
          <button className="liq-btn" style={{ background: '#22C55E', color: '#0B0F1A' }} onClick={doApprove}>Confirm Approve</button>
        </>}
      >
        {confirm && <p className="text-sm text-muted-foreground">Mark <span className="font-mono text-[#00D4AA]">{confirm.block.id}</span> as Completed?</p>}
      </Modal>

      <Modal
        open={!!confirm && confirm.kind === 'reject'}
        onClose={() => setConfirm(null)}
        title="Reject Block"
        footer={<>
          <button className="liq-btn liq-btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
          <button className="liq-btn" style={{ background: '#EF4444', color: '#0B0F1A' }} onClick={doReject}>Confirm Reject</button>
        </>}
      >
        {confirm && (
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Rejection Reason (required)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="liq-input min-h-[100px]" placeholder="Explain what needs to change…" />
          </div>
        )}
      </Modal>
    </div>
  );
}

function EngineerApprovals() {
  const { user } = useAuth();
  const { blocks, reopenBlock } = useAppData();
  const toast = useToast();

  const mine = blocks.filter((b) => b.assignedTo === user.id);
  const inReview = mine.filter((b) => b.stage === 'REVIEW');
  const rejected = mine.filter((b) => b.stage === 'REJECTED');
  const recent = mine.filter((b) => b.stage === 'COMPLETED').slice(-5);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold">My Approvals</h2>

      {inReview.map((b) => (
        <div key={b.id} className="liq-card p-4" style={{ borderLeft: '4px solid #EAB308', background: 'rgba(234,179,8,0.06)' }}>
          <div className="text-[11px] font-mono" style={{ color: '#00D4AA' }}>{b.id}</div>
          <div className="text-sm font-semibold">{b.name}</div>
          <div className="text-xs mt-2" style={{ color: '#EAB308' }}>⏳ Awaiting manager review</div>
        </div>
      ))}

      {rejected.map((b) => (
        <div key={b.id} className="liq-card p-4" style={{ borderLeft: '4px solid #EF4444', background: 'rgba(239,68,68,0.06)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-mono" style={{ color: '#00D4AA' }}>{b.id}</div>
              <div className="text-sm font-semibold">{b.name} — rejected</div>
              <blockquote className="mt-2 text-sm italic text-foreground/85 border-l-2 border-[#EF4444]/60 pl-3">
                “{b.rejectionComment}”
              </blockquote>
              <div className="text-[11px] text-muted-foreground mt-2">Rejected by {b.rejectedBy} on {formatTime(b.rejectedAt)}</div>
            </div>
            <button
              onClick={() => { reopenBlock(b.id, user); toast.info('Reopened', `${b.id} back to In Progress`); }}
              className="liq-btn liq-btn-primary text-xs shrink-0"
            >Reopen & Fix</button>
          </div>
        </div>
      ))}

      {inReview.length === 0 && rejected.length === 0 && (
        <div className="liq-card p-8 text-center text-sm text-muted-foreground">
          No blocks awaiting review and no rejections. Nice work!
        </div>
      )}

      {recent.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Recently Approved</h3>
          <div className="liq-card divide-y divide-white/5">
            {recent.map((b) => (
              <div key={b.id} className="p-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full" style={{ background: '#22C55E' }} />
                <span className="font-mono text-[12px] text-[#00D4AA]">{b.id}</span>
                <span className="text-sm">{b.name}</span>
                <span className="ml-auto text-[11px] text-muted-foreground">Completed</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children, className }) { return <th className={`text-left font-semibold px-4 py-2.5 ${className || ''}`}>{children}</th>; }
function Td({ children, className, style }) { return <td style={style} className={`px-4 py-3 ${className || ''}`}>{children}</td>; }
