import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  blocks as seedBlocks,
  initialAuditLog,
  engineers,
  stageConfig,
  complexityConfig,
  nextStage,
} from '../data/mockData';

const AppDataContext = createContext(null);

let auditCounter = initialAuditLog.length;
function nextAuditId() {
  auditCounter += 1;
  return 'A' + String(auditCounter).padStart(4, '0');
}

let blockCounter = seedBlocks.length;
function nextBlockId() {
  blockCounter += 1;
  return 'BLK' + String(blockCounter).padStart(3, '0');
}

export function AppDataProvider({ children }) {
  const [blocks, setBlocks] = useState(seedBlocks);
  const [auditLog, setAuditLog] = useState(initialAuditLog);

  const pushAudit = useCallback((entry) => {
    setAuditLog((prev) => [{ ...entry, id: nextAuditId() }, ...prev]);
  }, []);

  const advanceStage = useCallback(
    (blockId, actor) => {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          const ns = nextStage(b.stage);
          if (!ns) return b;
          const ts = new Date().toISOString();
          const entry = { stage: ns, timestamp: ts, actor: actor.name };
          pushAudit({
            timestamp: ts,
            blockId: b.id,
            blockName: b.name,
            action: 'ADVANCE',
            fromStage: b.stage,
            toStage: ns,
            actor: actor.name,
            actorRole: actor.role,
          });
          return { ...b, stage: ns, stageHistory: [...b.stageHistory, entry] };
        })
      );
    },
    [pushAudit]
  );

  const approveBlock = useCallback(
    (blockId, actor) => {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          const ts = new Date().toISOString();
          pushAudit({
            timestamp: ts, blockId: b.id, blockName: b.name,
            action: 'APPROVE', fromStage: b.stage, toStage: 'COMPLETED',
            actor: actor.name, actorRole: actor.role,
          });
          return {
            ...b,
            stage: 'COMPLETED',
            stageHistory: [...b.stageHistory, { stage: 'COMPLETED', timestamp: ts, actor: actor.name }],
          };
        })
      );
    },
    [pushAudit]
  );

  const rejectBlock = useCallback(
    (blockId, comment, actor) => {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          const ts = new Date().toISOString();
          pushAudit({
            timestamp: ts, blockId: b.id, blockName: b.name,
            action: 'REJECT', fromStage: b.stage, toStage: 'REJECTED',
            actor: actor.name, actorRole: actor.role,
          });
          return {
            ...b,
            stage: 'REJECTED',
            rejectionComment: comment,
            rejectedBy: actor.name,
            rejectedAt: ts,
            stageHistory: [...b.stageHistory, { stage: 'REJECTED', timestamp: ts, actor: actor.name }],
          };
        })
      );
    },
    [pushAudit]
  );

  const reopenBlock = useCallback(
    (blockId, actor) => {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          const ts = new Date().toISOString();
          pushAudit({
            timestamp: ts, blockId: b.id, blockName: b.name,
            action: 'REOPEN', fromStage: b.stage, toStage: 'IN PROGRESS',
            actor: actor.name, actorRole: actor.role,
          });
          const { rejectionComment, rejectedBy, rejectedAt, ...rest } = b;
          return {
            ...rest,
            stage: 'IN PROGRESS',
            stageHistory: [...b.stageHistory, { stage: 'IN PROGRESS', timestamp: ts, actor: actor.name }],
          };
        })
      );
    },
    [pushAudit]
  );

  const assignBlock = useCallback(
    (blockId, engineerId, actor) => {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          const ts = new Date().toISOString();
          const target = engineers.find((e) => e.id === engineerId);
          pushAudit({
            timestamp: ts, blockId: b.id, blockName: b.name,
            action: 'ASSIGN', fromStage: b.stage, toStage: b.stage,
            actor: actor.name, actorRole: actor.role,
            note: 'Assigned to ' + (target ? target.name : engineerId),
          });
          return { ...b, assignedTo: engineerId };
        })
      );
    },
    [pushAudit]
  );

  const createBlock = useCallback(
    (input, actor) => {
      const id = nextBlockId();
      const ts = new Date().toISOString();
      const factor = complexityConfig[input.complexity].factor;
      const base = complexityConfig[input.complexity].baseHours;
      const estHours = base * factor;
      const newBlock = {
        id,
        name: input.name,
        type: input.type,
        techNode: input.techNode,
        complexity: input.complexity,
        estHours,
        actualHours: 0,
        area: input.area || '—',
        assignedTo: input.assignedTo || null,
        stage: 'NOT STARTED',
        description: input.description || '',
        createdAt: ts,
        stageHistory: [{ stage: 'NOT STARTED', timestamp: ts, actor: actor.name }],
      };
      setBlocks((prev) => [...prev, newBlock]);
      pushAudit({
        timestamp: ts, blockId: id, blockName: input.name,
        action: 'CREATE', fromStage: null, toStage: 'NOT STARTED',
        actor: actor.name, actorRole: actor.role,
      });
      if (input.assignedTo) {
        const target = engineers.find((e) => e.id === input.assignedTo);
        pushAudit({
          timestamp: ts, blockId: id, blockName: input.name,
          action: 'ASSIGN', fromStage: 'NOT STARTED', toStage: 'NOT STARTED',
          actor: actor.name, actorRole: actor.role,
          note: 'Assigned to ' + (target ? target.name : input.assignedTo),
        });
      }
      return id;
    },
    [pushAudit]
  );

  const overrideEstHours = useCallback(
    (blockId, newHours, actor) => {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          const ts = new Date().toISOString();
          pushAudit({
            timestamp: ts, blockId: b.id, blockName: b.name,
            action: 'OVERRIDE', fromStage: b.stage, toStage: b.stage,
            actor: actor.name, actorRole: actor.role,
            note: 'Est hours: ' + b.estHours + ' → ' + newHours,
          });
          return { ...b, estHours: newHours, originalEstHours: b.originalEstHours ?? b.estHours, overridden: true };
        })
      );
    },
    [pushAudit]
  );

  const value = useMemo(
    () => ({
      blocks, auditLog, engineers, stageConfig, complexityConfig,
      advanceStage, approveBlock, rejectBlock, reopenBlock, assignBlock, createBlock, overrideEstHours,
    }),
    [blocks, auditLog, advanceStage, approveBlock, rejectBlock, reopenBlock, assignBlock, createBlock, overrideEstHours]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
