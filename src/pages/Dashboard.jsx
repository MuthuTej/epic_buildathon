import React, { useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Layers, CheckCircle2, Clock, AlertCircle, Zap, Activity, Signal, X, Check, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { stageConfig, complexityConfig, nextStage, getEngineerById, formatTime, relativeTime, STAGE_ORDER } from '../data/mockData';
import { StageBadge, ComplexityPill, Avatar } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { useToast } from '../components/UI/Toast';

export default function Dashboard() {
  const { user } = useAuth();
  if (user.role === 'manager') return <ManagerDashboard />;
  return <EngineerDashboard />;
}

/* ============== MANAGER DASHBOARD ============== */
function ManagerDashboard() {
  const { user } = useAuth();
  const { blocks, auditLog, approveBlock, rejectBlock, engineers } = useAppData();
  const toast = useToast();
  const [confirm, setConfirm] = useState(null); // {kind, block}
  const [rejectReason, setRejectReason] = useState('');

  const kpis = useMemo(() => {
    return {
      total: blocks.length,
      completed: blocks.filter((b) => b.stage === 'COMPLETED').length,
      inReview: blocks.filter((b) => b.stage === 'REVIEW').length,
      unassigned: blocks.filter((b) => !b.assignedTo).length,
      critical: blocks.filter((b) => b.complexity === 'Critical').length,
      totalEst: blocks.reduce((s, b) => s + b.estHours, 0),
    };
  }, [blocks]);

  const donutData = useMemo(() => {
    const counts = {};
    Object.keys(stageConfig).forEach((s) => (counts[s] = 0));
    blocks.forEach((b) => (counts[b.stage] = (counts[b.stage] || 0) + 1));
    return Object.entries(counts)
      .filter(([_, v]) => v > 0)
      .map(([stage, value]) => ({ name: stageConfig[stage].label, stage, value, color: stageConfig[stage].color }));
  }, [blocks]);

  const engineerHoursData = useMemo(() => {
    return engineers
      .filter((e) => e.role === 'engineer')
      .map((e) => {
        const mine = blocks.filter((b) => b.assignedTo === e.id);
        const est = mine.reduce((s, b) => s + b.estHours, 0);
        const act = mine.reduce((s, b) => s + b.actualHours, 0);
        const variance = est ? Math.round(((act - est) / est) * 100) : 0;
        return { name: e.name.split(' ')[0], est, actual: act, variance };
      });
  }, [blocks, engineers]);

  // Bottleneck analysis
  const stageStats = useMemo(() => {
    return STAGE_ORDER.map((stage) => {
      const inStage = blocks.filter((b) => b.stage === stage);
      let avgDays = 0;
      if (inStage.length) {
        const total = inStage.reduce((sum, b) => {
          const last = b.stageHistory[b.stageHistory.length - 1];
          return sum + (Date.now() - new Date(last.timestamp).getTime()) / 86400000;
        }, 0);
        avgDays = total / inStage.length;
      }
      return { stage, count: inStage.length, avgDays };
    }).filter((s) => s.stage !== 'COMPLETED');
  }, [blocks]);

  const pendingApprovals = blocks.filter((b) => b.stage === 'REVIEW');
  const recent = auditLog.slice(0, 8);

  const handleApprove = (b) => setConfirm({ kind: 'approve', block: b });
  const handleReject = (b) => { setRejectReason(''); setConfirm({ kind: 'reject', block: b }); };

  const doApprove = () => {
    approveBlock(confirm.block.id, user);
    toast.success('Approved', `${confirm.block.id} marked Completed`);
    setConfirm(null);
  };
  const doReject = () => {
    if (!rejectReason.trim()) { toast.warning('Reason required', 'Add a rejection comment'); return; }
    rejectBlock(confirm.block.id, rejectReason.trim(), user);
    toast.error('Rejected', `${confirm.block.id} sent back to engineer`);
    setConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <Kpi label="Total Blocks" value={kpis.total} Icon={Layers} color="#94A3B8" />
        <Kpi label="Completed" value={kpis.completed} Icon={CheckCircle2} color="#046307" />
        <Kpi label="In Review" value={kpis.inReview} Icon={Clock} color="#EAB308" />
        <Kpi label="Unassigned" value={kpis.unassigned} Icon={AlertCircle} color="#EF4444" pulse={kpis.unassigned > 0} />
        <Kpi label="Critical" value={kpis.critical} Icon={Zap} color="#A855F7" />
        <Kpi label="Total Est. Hrs" value={kpis.totalEst} Icon={Activity} color="#0B6E4F" suffix="h" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="liq-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Blocks by Stage</h3>
            <span className="text-xs text-muted-foreground">{blocks.length} total</span>
          </div>
          <div className="h-64 relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={donutData} dataKey="value" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="none">
                  {donutData.map((d) => <Cell key={d.stage} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-3xl font-bold">{blocks.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Blocks</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {donutData.map((d) => (
              <div key={d.stage} className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="liq-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Hours per Engineer</h3>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#0B6E4F]" />Est</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#3B82F6]" />Actual</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={engineerHoursData} margin={{ top: 24, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="est" fill="#0B6E4F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {engineerHoursData.map((d) => (
              <div key={d.name} className="text-center text-[11px]">
                <div className="text-muted-foreground">{d.name}</div>
                <div className={d.variance > 0 ? 'text-[#EF4444]' : 'text-[#046307]'}>
                  {d.variance > 0 ? '+' : ''}{d.variance}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottleneck + Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="liq-card p-5 lg:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <Signal size={16} style={{ color: '#0B6E4F' }} />
            <h3 className="text-sm font-semibold">Pipeline Health</h3>
          </div>
          <div className="space-y-2">
            {stageStats.map((s) => {
              const cfg = stageConfig[s.stage];
              const bottleneck = s.count >= 2;
              return (
                <div
                  key={s.stage}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5"
                  style={{
                    background: bottleneck ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.05)',
                    borderLeft: `3px solid ${bottleneck ? '#F59E0B' : cfg.color}`,
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
                  <span className="text-sm font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {bottleneck
                      ? `⚠ Bottleneck — ${s.count} blocks stalled, avg ${s.avgDays.toFixed(1)} days`
                      : s.count === 1
                        ? `${s.count} block · ${s.avgDays.toFixed(1)}d`
                        : `Flowing · ${s.count} block${s.count === 1 ? '' : 's'}`}
                  </span>
                  <span className="ml-auto text-xs font-mono text-muted-foreground">{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="liq-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Awaiting Approval</h3>
            <span
              className="text-[11px] font-bold rounded-full px-2 py-0.5"
              style={{ background: 'rgba(234,179,8,0.18)', color: '#EAB308' }}
            >
              {pendingApprovals.length}
            </span>
          </div>
          {pendingApprovals.length === 0 && (
            <div className="text-sm text-muted-foreground py-6 text-center">No blocks awaiting review</div>
          )}
          <div className="space-y-2">
            {pendingApprovals.map((b) => {
              const eng = getEngineerById(b.assignedTo);
              const reviewEntry = b.stageHistory.find((s) => s.stage === 'REVIEW');
              return (
                <div key={b.id} className="rounded-md p-3" style={{ background: 'rgba(0,0,0,0.03)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono" style={{ color: '#0B6E4F' }}>{b.id}</div>
                      <div className="text-sm font-semibold truncate">{b.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {eng ? eng.name : '—'} · in review {reviewEntry ? relativeTime(reviewEntry.timestamp) : ''}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleApprove(b)}
                        className="liq-btn px-2 py-1 text-xs"
                        style={{ background: '#046307', color: '#FFFFFF' }}
                      ><Check size={12} /></button>
                      <button
                        onClick={() => handleReject(b)}
                        className="liq-btn px-2 py-1 text-xs"
                        style={{ background: '#EF4444', color: '#FFFFFF' }}
                      ><X size={12} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="liq-card p-5">
        <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {recent.map((a) => {
            const dotColor = a.toStage ? (stageConfig[a.toStage]?.color || '#94A3B8') : '#94A3B8';
            return (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: dotColor }} />
                <span className="text-[11px] font-mono text-muted-foreground w-32 shrink-0">{formatTime(a.timestamp)}</span>
                <span className="text-foreground/90">
                  <strong>{a.actor}</strong>{' '}
                  {a.action === 'CREATE' ? 'created' :
                    a.action === 'APPROVE' ? 'approved' :
                      a.action === 'REJECT' ? 'rejected' :
                        a.action === 'ASSIGN' ? 'assigned' :
                          a.action === 'REOPEN' ? 'reopened' :
                            a.action === 'OVERRIDE' ? 'overrode hours on' :
                              'advanced'}{' '}
                  <span className="font-mono text-[#0B6E4F]">{a.blockId}</span>
                  {a.fromStage && a.toStage && a.action === 'ADVANCE' && (
                    <> from {a.fromStage} → {a.toStage}</>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm modals */}
      <Modal
        open={!!confirm && confirm.kind === 'approve'}
        onClose={() => setConfirm(null)}
        title="Approve block"
        footer={
          <>
            <button className="liq-btn liq-btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
            <button className="liq-btn" style={{ background: '#046307', color: '#FFFFFF' }} onClick={doApprove}>Confirm Approve</button>
          </>
        }
      >
        {confirm && (
          <p className="text-sm text-muted-foreground">
            Mark <span className="font-mono text-[#0B6E4F]">{confirm.block.id}</span>{' '}
            <strong className="text-foreground">{confirm.block.name}</strong> as Completed?
          </p>
        )}
      </Modal>

      <Modal
        open={!!confirm && confirm.kind === 'reject'}
        onClose={() => setConfirm(null)}
        title="Reject block"
        footer={
          <>
            <button className="liq-btn liq-btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
            <button className="liq-btn" style={{ background: '#EF4444', color: '#FFFFFF' }} onClick={doReject}>Confirm Reject</button>
          </>
        }
      >
        {confirm && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Reject <span className="font-mono text-[#0B6E4F]">{confirm.block.id}</span> {confirm.block.name}?
            </p>
            <label className="text-xs text-muted-foreground block mb-1">Rejection Reason (required)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="liq-input min-h-[100px]"
              placeholder="Explain what needs to change…"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ============== ENGINEER DASHBOARD ============== */
function EngineerDashboard() {
  const { user } = useAuth();
  const { blocks, advanceStage, reopenBlock } = useAppData();
  const toast = useToast();
  const [confirm, setConfirm] = useState(null);

  const mine = useMemo(() => blocks.filter((b) => b.assignedTo === user.id), [blocks, user.id]);

  const kpis = {
    total: mine.length,
    inProgress: mine.filter((b) => b.stage === 'IN PROGRESS').length,
    hoursLogged: mine.reduce((s, b) => s + b.actualHours, 0),
    hoursRemaining: Math.max(0, mine.reduce((s, b) => s + Math.max(0, b.estHours - b.actualHours), 0)),
  };

  const rejected = mine.filter((b) => b.stage === 'REJECTED');

  const chartData = mine.map((b) => ({
    name: b.id,
    full: b.name,
    est: b.estHours,
    actual: b.actualHours,
    color: stageConfig[b.stage].color,
  }));

  const handleAdvance = (b) => setConfirm({ kind: 'advance', block: b, target: nextStage(b.stage) });
  const handleSubmitReview = (b) => setConfirm({ kind: 'advance', block: b, target: 'REVIEW' });

  const doAdvance = () => {
    // direct submit-for-review path moves stage forward by one (LVS → REVIEW)
    advanceStage(confirm.block.id, user);
    toast.success('Stage advanced', `${confirm.block.id} → ${confirm.target}`);
    setConfirm(null);
  };
  const doReopen = (b) => {
    reopenBlock(b.id, user);
    toast.info('Block reopened', `${b.id} moved back to In Progress`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="My Blocks" value={kpis.total} Icon={Layers} color="#0B6E4F" />
        <Kpi label="In Progress" value={kpis.inProgress} Icon={Activity} color="#3B82F6" />
        <Kpi label="Hours Logged" value={kpis.hoursLogged} Icon={Clock} color="#A855F7" suffix="h" />
        <Kpi label="Hours Remaining" value={kpis.hoursRemaining} Icon={Zap} color="#EAB308" suffix="h" />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">My Active Blocks</h3>
        {mine.length === 0 && <div className="liq-card p-6 text-sm text-muted-foreground text-center">No blocks assigned to you yet</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mine.map((b) => {
            const cfg = stageConfig[b.stage];
            const pct = b.estHours ? Math.min(100, Math.round((b.actualHours / b.estHours) * 100)) : 0;
            const showAdvance = !['REVIEW', 'COMPLETED', 'REJECTED'].includes(b.stage);
            const showSubmit = b.stage === 'LVS';
            return (
              <div key={b.id} className="liq-card p-4" style={{ borderLeft: `3px solid ${cfg.color}` }}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono" style={{ color: '#0B6E4F' }}>{b.id}</div>
                    <div className="text-sm font-semibold truncate">{b.name}</div>
                  </div>
                  <StageBadge stage={b.stage} />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ComplexityPill complexity={b.complexity} />
                  <span className="text-[11px] text-muted-foreground">{b.techNode}</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Effort</span>
                    <span>{b.actualHours}h / {b.estHours}h</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full" style={{ width: `${pct}%`, background: cfg.color }} />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {showSubmit ? (
                    <button
                      onClick={() => handleSubmitReview(b)}
                      className="liq-btn flex-1 py-1.5 text-xs"
                      style={{ background: '#EAB308', color: '#FFFFFF' }}
                    >Submit for Review</button>
                  ) : showAdvance ? (
                    <button
                      onClick={() => handleAdvance(b)}
                      className="liq-btn liq-btn-ghost flex-1 py-1.5 text-xs"
                      style={{ borderColor: '#0B6E4F', color: '#0B6E4F' }}
                    >Advance Stage <ArrowRight size={12} /></button>
                  ) : (
                    <div className="text-[11px] text-muted-foreground">No actions available</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {rejected.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Rejection Feedback</h3>
          {rejected.map((b) => (
            <div key={b.id} className="liq-card p-4" style={{ borderLeft: '3px solid #EF4444', background: 'rgba(239,68,68,0.06)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    <span className="font-mono text-[#0B6E4F]">{b.id}</span> — {b.name} was rejected
                  </div>
                  <blockquote className="mt-2 text-sm italic text-foreground/80 border-l-2 border-[#EF4444]/60 pl-3">
                    “{b.rejectionComment}”
                  </blockquote>
                  <div className="text-[11px] text-muted-foreground mt-2">
                    by {b.rejectedBy} · {formatTime(b.rejectedAt)}
                  </div>
                </div>
                <button
                  onClick={() => doReopen(b)}
                  className="liq-btn liq-btn-primary text-xs shrink-0"
                >Reopen & Fix</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {chartData.length > 0 && (
        <div className="liq-card p-5">
          <h3 className="text-sm font-semibold mb-3">My Progress (Est vs Actual)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  formatter={(v, k, p) => [v + 'h', k === 'est' ? 'Estimated' : 'Actual']}
                  labelFormatter={(l, p) => p && p[0] ? `${l} — ${p[0].payload.full}` : l}
                />
                <Bar dataKey="est" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.45} />)}
                </Bar>
                <Bar dataKey="actual" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* advance modal */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Advance Block Stage"
        footer={
          <>
            <button className="liq-btn liq-btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
            <button className="liq-btn liq-btn-primary" onClick={doAdvance}>Confirm Advance</button>
          </>
        }
      >
        {confirm && (
          <div>
            <div className="text-sm">
              <span className="font-mono text-[#0B6E4F]">{confirm.block.id}</span> — {confirm.block.name}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <StageBadge stage={confirm.block.stage} size="lg" />
              <ArrowRight size={16} className="text-muted-foreground" />
              <StageBadge stage={confirm.target} size="lg" />
            </div>
            {confirm.target === 'REVIEW' && (
              <div className="mt-4 text-xs rounded-md p-3" style={{ background: 'rgba(234,179,8,0.10)', color: '#EAB308' }}>
                ⚠ This will notify the manager for approval.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ============== SHARED ============== */
function Kpi({ label, value, Icon, color, suffix, pulse }) {
  return (
    <div className="liq-card p-4 relative overflow-hidden">
      {pulse && <span className="absolute top-3 right-3 h-2 w-2 rounded-full pulse-dot" style={{ background: color }} />}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wider">
        <Icon size={14} style={{ color }} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold" style={{ color }}>
        {value}{suffix && <span className="text-sm text-muted-foreground ml-0.5">{suffix}</span>}
      </div>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: 8,
  fontSize: 12,
  color: '#111827',
};
