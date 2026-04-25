import React, { useMemo, useState } from 'react';
import { ArrowRight, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { stageConfig, getEngineerById, nextStage } from '../data/mockData';
import { StageBadge, ComplexityPill, Avatar } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { useToast } from '../components/UI/Toast';

const STAGE_LIST = ['NOT STARTED','FLOORPLAN','IN PROGRESS','DRC','LVS','REVIEW','REJECTED','COMPLETED'];

export default function Kanban() {
  const { user } = useAuth();
  const { blocks, advanceStage } = useAppData();
  const toast = useToast();
  const [confirm, setConfirm] = useState(null);

  const grouped = useMemo(() => {
    const out = {};
    STAGE_LIST.forEach((s) => (out[s] = []));
    blocks.forEach((b) => out[b.stage].push(b));
    return out;
  }, [blocks]);

  const handleAdvance = (b) => setConfirm({ block: b, target: nextStage(b.stage) });
  const doAdvance = () => {
    advanceStage(confirm.block.id, user);
    toast.success('Advanced', `${confirm.block.id} → ${confirm.target}`);
    setConfirm(null);
  };

  return (
    <div className="space-y-3">
      {STAGE_LIST.map((stage) => {
        const cfg = stageConfig[stage];
        const items = grouped[stage];
        return (
          <section key={stage} className="liq-card overflow-hidden" style={{ borderLeft: `4px solid ${cfg.color}` }}>
            <header
              className="flex items-center gap-3 px-4 py-2.5"
              style={{ background: '#252D3D' }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: cfg.color }} />
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</h3>
              <span
                className="text-[11px] font-bold rounded-full px-2 py-0.5"
                style={{ background: cfg.color + '22', color: cfg.color }}
              >{items.length}</span>
            </header>
            <div className="p-4 flex flex-wrap gap-3">
              {items.length === 0 && <div className="text-xs text-muted-foreground italic py-2">No blocks in this stage</div>}
              {items.map((b) => (
                <KanbanCard key={b.id} block={b} user={user} onAdvance={handleAdvance} />
              ))}
            </div>
          </section>
        );
      })}

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

function KanbanCard({ block, user, onAdvance }) {
  const cfg = stageConfig[block.stage];
  const eng = getEngineerById(block.assignedTo);
  const isMine = user.role === 'engineer' && block.assignedTo === user.id;
  const canAdvance = isMine && !['REVIEW','COMPLETED','REJECTED'].includes(block.stage);
  const showSubmit = isMine && block.stage === 'LVS';

  return (
    <div
      className="liq-card p-3 flex flex-col"
      style={{ width: 280, borderLeft: `3px solid ${cfg.color}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-mono" style={{ color: '#0B6E4F' }}>{block.id}</div>
        <ComplexityPill complexity={block.complexity} />
      </div>
      <div className="mt-1 text-sm font-semibold leading-snug">{block.name}</div>

      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        <Chip>{block.type}</Chip>
        <Chip>{block.techNode}</Chip>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {eng ? (
          <>
            <Avatar initials={eng.initials} size={22} />
            <span className="text-xs text-muted-foreground truncate">{eng.name}</span>
          </>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ background: 'rgba(239,68,68,0.18)', color: '#EF4444' }}>Unassigned</span>
        )}
        <span className="ml-auto text-[10px] font-mono text-muted-foreground">{block.estHours}h</span>
      </div>

      {block.stage === 'REJECTED' && block.rejectionComment && (
        <div className="mt-3 p-2 rounded text-[11px] italic" style={{ background: 'rgba(239,68,68,0.10)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.30)' }}>
          “{block.rejectionComment}”
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-white/5">
        {user.role === 'manager' && (
          <button className="liq-btn liq-btn-ghost w-full text-xs py-1.5"><Eye size={12}/> View Details</button>
        )}
        {showSubmit && (
          <button onClick={() => onAdvance(block)} className="liq-btn w-full text-xs py-1.5" style={{ background: '#EAB308', color: '#0B0F1A' }}>
            Submit for Review
          </button>
        )}
        {canAdvance && !showSubmit && (
          <button onClick={() => onAdvance(block)} className="liq-btn w-full text-xs py-1.5"
            style={{ border: '1px solid #0B6E4F', color: '#0B6E4F', background: 'transparent' }}>
            Advance Stage <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] text-muted-foreground"
      style={{ background: 'rgba(255,255,255,0.05)' }}>{children}</span>
  );
}
