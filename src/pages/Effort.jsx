import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Edit3, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { complexityConfig, stageConfig, getEngineerById } from '../data/mockData';
import { useToast } from '../components/UI/Toast';

export default function Effort() {
  const { user } = useAuth();
  const { blocks, engineers, overrideEstHours } = useAppData();
  const toast = useToast();
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState('');

  const totals = useMemo(() => {
    const est = blocks.reduce((s, b) => s + b.estHours, 0);
    const act = blocks.reduce((s, b) => s + b.actualHours, 0);
    const diff = act - est;
    const pct = est ? Math.round((diff / est) * 100) : 0;
    return { est, act, diff, pct };
  }, [blocks]);

  const startEdit = (b) => { setEditingId(b.id); setEditVal(String(b.estHours)); };
  const saveEdit = (b) => {
    const v = Number(editVal);
    if (!v || v <= 0) { toast.warning('Invalid value', 'Enter a positive number'); return; }
    overrideEstHours(b.id, v, user);
    toast.success('Hours overridden', `${b.id} now estimated at ${v}h`);
    setEditingId(null);
  };

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="liq-card p-4 flex flex-wrap items-center gap-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Complexity factors</div>
        {Object.entries(complexityConfig).map(([k, c]) => (
          <div key={k}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: c.color + '22', color: c.color, border: `1px solid ${c.color}55` }}
          >
            {k} <span className="font-mono">{c.factor}×</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="liq-card p-4 grid grid-cols-3 gap-4">
        <Stat label="Total Estimated" value={`${totals.est}h`} />
        <Stat label="Total Actual" value={`${totals.act}h`} />
        <Stat
          label="Variance"
          value={`${totals.diff >= 0 ? '+' : ''}${totals.diff}h (${totals.pct >= 0 ? '+' : ''}${totals.pct}%)`}
          color={totals.diff > 0 ? '#EF4444' : '#22C55E'}
        />
      </div>

      {/* Table */}
      <div className="liq-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-[#1A2030]">
              <tr>
                <Th>Block ID</Th><Th>Name</Th><Th>Complexity</Th>
                <Th className="text-right">Base</Th><Th className="text-right">Factor</Th>
                <Th className="text-right">Est Hrs</Th><Th className="text-right">Actual Hrs</Th>
                <Th className="text-right">Variance</Th>
                {user.role === 'manager' && <Th>Override</Th>}
              </tr>
            </thead>
            <tbody>
              {blocks.map((b) => {
                const cfg = complexityConfig[b.complexity];
                const variance = b.actualHours - b.estHours;
                const pct = b.estHours ? Math.round((variance / b.estHours) * 100) : 0;
                const stageColor = stageConfig[b.stage].color;
                const isEditing = editingId === b.id;
                const isOver = variance > 0;
                return (
                  <tr key={b.id} className="border-t border-white/[0.06]" style={{ boxShadow: `inset 3px 0 0 0 ${stageColor}` }}>
                    <Td className="font-mono text-[12px]" style={{ color: '#00D4AA' }}>{b.id}</Td>
                    <Td className="font-medium">{b.name}</Td>
                    <Td>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{ background: cfg.color + '22', color: cfg.color, border: `1px solid ${cfg.color}55` }}>{b.complexity}</span>
                    </Td>
                    <Td className="text-right font-mono text-muted-foreground">{cfg.baseHours}</Td>
                    <Td className="text-right font-mono">{cfg.factor}×</Td>
                    <Td className="text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          className="liq-input w-20 text-right py-1"
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          {b.estHours}h
                          {b.overridden && (
                            <span className="text-[9px] font-bold uppercase rounded px-1 py-0.5"
                              style={{ background: 'rgba(234,179,8,0.20)', color: '#EAB308' }}>
                              ovr
                            </span>
                          )}
                        </span>
                      )}
                    </Td>
                    <Td className="text-right font-mono">{b.actualHours}h</Td>
                    <Td className="text-right">
                      {b.actualHours === 0 ? (
                        <span className="text-muted-foreground text-xs">—</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold"
                          style={{ color: isOver ? '#EF4444' : '#22C55E' }}>
                          {isOver ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          {Math.abs(variance)}h ({Math.abs(pct)}%)
                        </span>
                      )}
                    </Td>
                    {user.role === 'manager' && (
                      <Td>
                        {isEditing ? (
                          <div className="flex gap-1">
                            <button onClick={() => saveEdit(b)} className="p-1.5 rounded text-[#22C55E] hover:bg-white/5"><Check size={14} /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 rounded text-muted-foreground hover:bg-white/5"><X size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(b)} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"><Edit3 size={14} /></button>
                        )}
                      </Td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gantt-style timeline */}
      <div className="liq-card p-5">
        <h3 className="text-sm font-semibold mb-4">Effort Timeline by Engineer</h3>
        <Gantt blocks={blocks} engineers={engineers.filter((e) => e.role === 'engineer')} />
      </div>
    </div>
  );
}

function Gantt({ blocks, engineers }) {
  const maxHours = Math.max(...blocks.map((b) => b.estHours), 100);
  const ticks = [0, 25, 50, 75, 100].map((p) => Math.round((maxHours * p) / 100));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[120px_1fr] items-center text-[11px] text-muted-foreground">
        <div />
        <div className="relative h-4">
          {ticks.map((t, i) => (
            <span key={i} className="absolute -translate-x-1/2 font-mono" style={{ left: `${(t / maxHours) * 100}%` }}>{t}h</span>
          ))}
        </div>
      </div>
      {engineers.map((e) => {
        const mine = blocks.filter((b) => b.assignedTo === e.id);
        return (
          <div key={e.id} className="grid grid-cols-[120px_1fr] items-center gap-3">
            <div className="text-xs font-medium truncate">{e.name}</div>
            <div className="relative h-9 rounded bg-white/[0.03]">
              <GridLines ticks={ticks} max={maxHours} />
              <div className="relative h-full flex flex-wrap items-center gap-y-0.5 p-0.5">
                {mine.map((b) => {
                  const w = (b.estHours / maxHours) * 100;
                  return (
                    <div
                      key={b.id}
                      title={`${b.name} · ${b.estHours}h`}
                      className="h-7 rounded text-[10px] px-2 flex items-center text-white font-medium overflow-hidden"
                      style={{ width: `${w}%`, background: stageConfig[b.stage].color }}
                    >
                      <span className="truncate">{b.name}</span>
                    </div>
                  );
                })}
                {mine.length === 0 && (
                  <span className="text-[11px] text-muted-foreground italic px-2">No blocks assigned</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GridLines({ ticks, max }) {
  return (
    <>
      {ticks.map((t, i) => (
        <span key={i} className="absolute top-0 bottom-0 w-px bg-white/[0.05]" style={{ left: `${(t / max) * 100}%` }} />
      ))}
    </>
  );
}

function Th({ children, className }) { return <th className={`text-left font-semibold px-4 py-2.5 ${className || ''}`}>{children}</th>; }
function Td({ children, className, style }) { return <td style={style} className={`px-4 py-3 ${className || ''}`}>{children}</td>; }
function Stat({ label, value, color }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-bold mt-1" style={{ color: color || '#F1F5F9' }}>{value}</div>
    </div>
  );
}
