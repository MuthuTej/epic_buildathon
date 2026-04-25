import React, { useMemo, useState } from 'react';
import { Search, Plus, Eye, Edit3, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { stageConfig, complexityConfig, getEngineerById, formatTime, techNodeColors } from '../data/mockData';
import { StageBadge, ComplexityPill, Avatar } from '../components/UI/Badge';
import { Drawer } from '../components/UI/Drawer';
import { useToast } from '../components/UI/Toast';

export default function Blocks() {
  const { user } = useAuth();
  const { blocks, engineers, createBlock } = useAppData();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [fStage, setFStage] = useState('');
  const [fCx, setFCx] = useState('');
  const [fNode, setFNode] = useState('');
  const [fEng, setFEng] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [techLens, setTechLens] = useState(false);

  const [openBlock, setOpenBlock] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    return blocks.filter((b) => {
      if (search) {
        const q = search.toLowerCase();
        if (!b.name.toLowerCase().includes(q) && !b.id.toLowerCase().includes(q) && !b.type.toLowerCase().includes(q)) return false;
      }
      if (fStage && b.stage !== fStage) return false;
      if (fCx && b.complexity !== fCx) return false;
      if (fNode && b.techNode !== fNode) return false;
      if (fEng && b.assignedTo !== fEng) return false;
      if (unassignedOnly && b.assignedTo) return false;
      return true;
    });
  }, [blocks, search, fStage, fCx, fNode, fEng, unassignedOnly]);

  const grouped = useMemo(() => {
    if (!techLens) return null;
    const out = {};
    filtered.forEach((b) => {
      if (!out[b.techNode]) out[b.techNode] = [];
      out[b.techNode].push(b);
    });
    return out;
  }, [filtered, techLens]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="liq-card p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or type…"
            className="liq-input pl-9"
          />
        </div>
        <Select value={fStage} onChange={setFStage} placeholder="All stages" options={Object.keys(stageConfig).map(s => ({ value: s, label: stageConfig[s].label }))} />
        <Select value={fCx} onChange={setFCx} placeholder="All complexity" options={Object.keys(complexityConfig).map(c => ({ value: c, label: c }))} />
        <Select value={fNode} onChange={setFNode} placeholder="All nodes" options={['28nm', '40nm', '65nm', '180nm'].map(n => ({ value: n, label: n }))} />
        <Select value={fEng} onChange={setFEng} placeholder="All engineers" options={engineers.filter(e => e.role === 'engineer').map(e => ({ value: e.id, label: e.name }))} />
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={unassignedOnly} onChange={(e) => setUnassignedOnly(e.target.checked)} className="accent-[#0B6E4F]" />
          Unassigned only
        </label>
        <button
          onClick={() => setTechLens(v => !v)}
          className={`liq-btn text-xs py-1.5 ${techLens ? 'liq-btn-primary' : 'liq-btn-ghost'}`}
        >
          <Filter size={12} /> Tech Node View
        </button>
        {user.role === 'manager' && (
          <button onClick={() => setAddOpen(true)} className="liq-btn liq-btn-primary text-xs py-1.5 ml-auto">
            <Plus size={14} /> Add Block
          </button>
        )}
      </div>

      {/* Table */}
      <div className="liq-card overflow-hidden">
        {!techLens && <BlockTable blocks={filtered} onView={setOpenBlock} canEdit={user.role === 'manager'} />}
        {techLens && (
          <div className="space-y-1">
            {Object.entries(grouped).map(([node, bs]) => (
              <div key={node}>
                <div
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider"
                  style={{ background: techNodeColors[node] + '22', color: techNodeColors[node], borderLeft: `3px solid ${techNodeColors[node]}` }}
                >
                  {node} <span className="ml-2 text-muted-foreground">· {bs.length} block{bs.length === 1 ? '' : 's'}</span>
                </div>
                <BlockTable blocks={bs} onView={setOpenBlock} canEdit={user.role === 'manager'} compact />
              </div>
            ))}
          </div>
        )}
        {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No blocks match your filters</div>}
      </div>

      {/* Detail drawer */}
      <BlockDetailDrawer block={openBlock} onClose={() => setOpenBlock(null)} />

      {/* Add block */}
      <AddBlockDrawer open={addOpen} onClose={() => setAddOpen(false)} onCreate={(input) => {
        const id = createBlock(input, user);
        toast.success('Block created', `${id} added to backlog`);
        setAddOpen(false);
      }} engineers={engineers.filter(e => e.role === 'engineer')} blocks={blocks} />
    </div>
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

function BlockTable({ blocks, onView, canEdit, compact }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-gray-50">
          <tr>
            <Th>Block ID</Th><Th>Name</Th><Th>Type</Th><Th>Tech</Th><Th>Complexity</Th>
            <Th className="text-right">Est Hrs</Th><Th>Assigned To</Th><Th>Stage</Th><Th>Last Updated</Th><Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((b) => {
            const eng = getEngineerById(b.assignedTo);
            const last = b.stageHistory[b.stageHistory.length - 1];
            const stageColor = stageConfig[b.stage].color;
            return (
              <tr
                key={b.id}
                onClick={() => onView(b)}
                className="cursor-pointer hover:bg-white/[0.03] border-t border-white/[0.06]"
                style={{ boxShadow: `inset 3px 0 0 0 ${stageColor}` }}
              >
                <Td className="font-mono text-[12px]" style={{ color: '#0B6E4F' }}>{b.id}</Td>
                <Td className="font-medium">{b.name}</Td>
                <Td className="text-muted-foreground">{b.type}</Td>
                <Td>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: techNodeColors[b.techNode] + '22', color: techNodeColors[b.techNode] }}>
                    {b.techNode}
                  </span>
                </Td>
                <Td><ComplexityPill complexity={b.complexity} /></Td>
                <Td className="text-right font-mono">{b.estHours}h</Td>
                <Td>
                  {eng ? (
                    <div className="flex items-center gap-2">
                      <Avatar initials={eng.initials} size={22} />
                      <span className="text-xs">{eng.name}</span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded px-2 py-0.5"
                      style={{ background: 'rgba(239,68,68,0.18)', color: '#EF4444' }}>
                      <span className="h-1.5 w-1.5 rounded-full pulse-dot" style={{ background: '#EF4444' }} />
                      Unassigned
                    </span>
                  )}
                </Td>
                <Td><StageBadge stage={b.stage} /></Td>
                <Td className="text-[11px] font-mono text-muted-foreground">{formatTime(last.timestamp)}</Td>
                <Td>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onView(b); }} className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground">
                      <Eye size={14} />
                    </button>
                    {canEdit && (
                      <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground">
                        <Edit3 size={14} />
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className }) {
  return <th className={`text-left font-semibold px-4 py-2.5 ${className || ''}`}>{children}</th>;
}
function Td({ children, className, style }) {
  return <td style={style} className={`px-4 py-3 ${className || ''}`}>{children}</td>;
}

function BlockDetailDrawer({ block, onClose }) {
  if (!block) return <Drawer open={false} onClose={onClose} />;
  const eng = getEngineerById(block.assignedTo);
  const pct = block.estHours ? Math.min(100, Math.round((block.actualHours / block.estHours) * 100)) : 0;
  const cfg = stageConfig[block.stage];
  return (
    <Drawer
      open={true}
      onClose={onClose}
      title={`${block.id} — ${block.name}`}
      subtitle={<div className="flex items-center gap-2"><StageBadge stage={block.stage} /><ComplexityPill complexity={block.complexity} /></div>}
      footer={<button className="liq-btn liq-btn-ghost" onClick={onClose}>Close</button>}
    >
      <p className="text-sm text-muted-foreground mb-5">{block.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <DetailItem label="Type" value={block.type} />
        <DetailItem label="Tech Node" value={block.techNode} />
        <DetailItem label="Area" value={block.area} />
        <DetailItem label="Complexity" value={block.complexity} />
        <DetailItem label="Created" value={formatTime(block.createdAt)} className="col-span-2" />
      </div>

      <div className="liq-card p-4 mb-5">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Effort</span>
          <span className="font-mono">{block.actualHours}h / {block.estHours}h</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full" style={{ width: `${pct}%`, background: cfg.color }} />
        </div>
      </div>

      {eng && (
        <div className="liq-card p-4 mb-5 flex items-center gap-3">
          <Avatar initials={eng.initials} size={40} />
          <div>
            <div className="text-sm font-semibold">{eng.name}</div>
            <div className="text-xs text-muted-foreground">{eng.email}</div>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Stage History</h4>
        <div className="space-y-3 relative pl-6">
          <span className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
          {block.stageHistory.map((h, i) => {
            const c = stageConfig[h.stage];
            const isCurrent = i === block.stageHistory.length - 1;
            return (
              <div key={i} className="relative">
                <span
                  className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 ${isCurrent ? 'ring-pulse' : ''}`}
                  style={{ background: c.color, borderColor: '#1E2535' }}
                />
                <div className="text-sm font-medium" style={{ color: c.color }}>{c.label}</div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  {h.actor} · {formatTime(h.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {block.stage === 'REJECTED' && block.rejectionComment && (
        <div className="mt-5 liq-card p-4" style={{ background: 'rgba(239,68,68,0.08)', borderLeft: '3px solid #EF4444' }}>
          <div className="text-xs text-[#EF4444] font-semibold mb-1">Rejection comment</div>
          <blockquote className="text-sm italic text-foreground/90">“{block.rejectionComment}”</blockquote>
          <div className="text-[11px] text-muted-foreground mt-2 font-mono">
            by {block.rejectedBy} · {formatTime(block.rejectedAt)}
          </div>
        </div>
      )}
    </Drawer>
  );
}

function DetailItem({ label, value, className }) {
  return (
    <div className={`liq-card p-3 ${className || ''}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-1">{value}</div>
    </div>
  );
}

function AddBlockDrawer({ open, onClose, onCreate, engineers, blocks }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Inverter');
  const [desc, setDesc] = useState('');
  const [node, setNode] = useState('28nm');
  const [area, setArea] = useState('');
  const [cx, setCx] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState('');

  const cfg = complexityConfig[cx];
  const estHours = cfg.baseHours * cfg.factor;

  const reset = () => {
    setName(''); setType('Inverter'); setDesc(''); setNode('28nm'); setArea(''); setCx('Medium'); setAssignedTo('');
  };

  const submit = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), type, description: desc, techNode: node, area: area ? area + 'µm²' : '', complexity: cx, assignedTo: assignedTo || null });
    reset();
  };

  return (
    <Drawer
      open={open}
      onClose={() => { onClose(); }}
      title="Add new block"
      width={520}
      footer={
        <>
          <button className="liq-btn liq-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="liq-btn liq-btn-primary" onClick={submit} disabled={!name.trim()}>Create Block</button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Block Name">
          <input className="liq-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. PMOS Cascode" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Block Type">
            <select className="liq-input" value={type} onChange={(e) => setType(e.target.value)}>
              {['Inverter', 'Current Mirror', 'Diff Pair', 'Bandgap', 'OTA', 'LDO', 'Other'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Tech Node">
            <select className="liq-input" value={node} onChange={(e) => setNode(e.target.value)}>
              {['28nm', '40nm', '65nm', '180nm'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea className="liq-input min-h-[80px]" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What does this block do?" />
        </Field>
        <Field label="Estimated Area (µm²)">
          <input type="number" className="liq-input" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. 120" />
        </Field>
        <Field label="Complexity">
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(complexityConfig).map(([k, c]) => (
              <button
                key={k}
                onClick={() => setCx(k)}
                className="rounded-md px-2 py-2 text-xs font-semibold transition-all"
                style={{
                  background: cx === k ? c.color + '22' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${cx === k ? c.color : 'rgba(255,255,255,0.10)'}`,
                  color: cx === k ? c.color : '#F1F5F9',
                }}
              >
                {k}<div className="text-[10px] text-muted-foreground mt-0.5">{c.factor}×</div>
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Estimated Hours: {cfg.baseHours} × {cfg.factor} = <span className="text-[#0B6E4F] font-semibold">{estHours}h</span>
          </div>
        </Field>
        <Field label="Assign Engineer (optional)">
          <select className="liq-input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            <option value="">— Unassigned —</option>
            {engineers.map((e) => {
              const load = blocks.filter((b) => b.assignedTo === e.id).reduce((s, b) => s + b.estHours, 0);
              return <option key={e.id} value={e.id}>{e.name} — {load}h / {e.maxHours}h</option>;
            })}
          </select>
        </Field>
      </div>
    </Drawer>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}
