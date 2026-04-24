// Static seed data + helpers for LayoutIQ. Plain JS only.

export const stageConfig = {
  'NOT STARTED': { color: '#EF4444', label: 'Not Started', order: 0 },
  'FLOORPLAN':   { color: '#F97316', label: 'Floorplan',   order: 1 },
  'IN PROGRESS': { color: '#3B82F6', label: 'In Progress', order: 2 },
  'DRC':         { color: '#A855F7', label: 'DRC',         order: 3 },
  'LVS':         { color: '#06B6D4', label: 'LVS',         order: 4 },
  'REVIEW':      { color: '#EAB308', label: 'Review',      order: 5 },
  'REJECTED':    { color: '#6B7280', label: 'Rejected',    order: 6 },
  'COMPLETED':   { color: '#22C55E', label: 'Completed',   order: 7 },
};

export const STAGE_ORDER = [
  'NOT STARTED', 'FLOORPLAN', 'IN PROGRESS', 'DRC', 'LVS', 'REVIEW', 'COMPLETED',
];

export const complexityConfig = {
  Simple:   { factor: 1.0, baseHours: 20, color: '#6B7280' },
  Medium:   { factor: 1.5, baseHours: 20, color: '#3B82F6' },
  Complex:  { factor: 2.5, baseHours: 20, color: '#F97316' },
  Critical: { factor: 4.0, baseHours: 20, color: '#EF4444' },
};

export const techNodeColors = {
  '28nm':  '#EAB308',
  '40nm':  '#00D4AA',
  '65nm':  '#A855F7',
  '180nm': '#F97316',
};

export const TAPEOUT_DATE = new Date('2026-05-30T00:00:00Z');

export const engineers = [
  { id: 'E001', name: 'Arjun Mehta',   initials: 'AM', role: 'engineer', email: 'arjun@layoutiq.com',   maxHours: 100 },
  { id: 'E002', name: 'Priya Nair',    initials: 'PN', role: 'engineer', email: 'priya@layoutiq.com',   maxHours: 100 },
  { id: 'E003', name: 'Karthik Rajan', initials: 'KR', role: 'engineer', email: 'karthik@layoutiq.com', maxHours: 100 },
  { id: 'E004', name: 'Divya Suresh',  initials: 'DS', role: 'engineer', email: 'divya@layoutiq.com',   maxHours: 100 },
  { id: 'M001', name: 'Vikram Iyer',   initials: 'VI', role: 'manager',  email: 'vikram@layoutiq.com',  maxHours: 0 },
];

export const blocks = [
  { id:'BLK001', name:'Inverter Cell', type:'Inverter', techNode:'28nm', complexity:'Simple',
    estHours:20, actualHours:18, area:'45µm²', assignedTo:'E001', stage:'COMPLETED',
    description:'Standard CMOS inverter cell for digital interface',
    createdAt:'2026-04-01T09:00:00Z',
    stageHistory:[
      {stage:'NOT STARTED',timestamp:'2026-04-01T09:00:00Z',actor:'Vikram Iyer'},
      {stage:'FLOORPLAN',  timestamp:'2026-04-02T10:00:00Z',actor:'Arjun Mehta'},
      {stage:'IN PROGRESS',timestamp:'2026-04-03T11:00:00Z',actor:'Arjun Mehta'},
      {stage:'DRC',        timestamp:'2026-04-05T14:00:00Z',actor:'Arjun Mehta'},
      {stage:'LVS',        timestamp:'2026-04-07T09:00:00Z',actor:'Arjun Mehta'},
      {stage:'REVIEW',     timestamp:'2026-04-08T11:00:00Z',actor:'Arjun Mehta'},
      {stage:'COMPLETED',  timestamp:'2026-04-09T15:00:00Z',actor:'Vikram Iyer'},
    ]},
  { id:'BLK002', name:'Current Mirror', type:'Current Mirror', techNode:'180nm', complexity:'Medium',
    estHours:30, actualHours:35, area:'120µm²', assignedTo:'E002', stage:'LVS',
    description:'High-accuracy current mirror for bias generation',
    createdAt:'2026-04-02T10:00:00Z',
    stageHistory:[
      {stage:'NOT STARTED',timestamp:'2026-04-02T10:00:00Z',actor:'Vikram Iyer'},
      {stage:'FLOORPLAN',  timestamp:'2026-04-03T09:00:00Z',actor:'Priya Nair'},
      {stage:'IN PROGRESS',timestamp:'2026-04-04T10:00:00Z',actor:'Priya Nair'},
      {stage:'DRC',        timestamp:'2026-04-08T11:00:00Z',actor:'Priya Nair'},
      {stage:'LVS',        timestamp:'2026-04-10T09:00:00Z',actor:'Priya Nair'},
    ]},
  { id:'BLK003', name:'Differential Pair', type:'Diff Pair', techNode:'65nm', complexity:'Complex',
    estHours:50, actualHours:48, area:'200µm²', assignedTo:'E003', stage:'DRC',
    description:'Low-noise differential input pair for OTA front-end',
    createdAt:'2026-04-03T09:00:00Z',
    stageHistory:[
      {stage:'NOT STARTED',timestamp:'2026-04-03T09:00:00Z',actor:'Vikram Iyer'},
      {stage:'FLOORPLAN',  timestamp:'2026-04-04T11:00:00Z',actor:'Karthik Rajan'},
      {stage:'IN PROGRESS',timestamp:'2026-04-05T10:00:00Z',actor:'Karthik Rajan'},
      {stage:'DRC',        timestamp:'2026-04-10T14:00:00Z',actor:'Karthik Rajan'},
    ]},
  { id:'BLK004', name:'Bandgap Reference', type:'Bandgap', techNode:'28nm', complexity:'Critical',
    estHours:80, actualHours:85, area:'350µm²', assignedTo:'E001', stage:'REVIEW',
    description:'Temperature-stable bandgap voltage reference 1.2V',
    createdAt:'2026-04-01T11:00:00Z',
    stageHistory:[
      {stage:'NOT STARTED',timestamp:'2026-04-01T11:00:00Z',actor:'Vikram Iyer'},
      {stage:'FLOORPLAN',  timestamp:'2026-04-02T14:00:00Z',actor:'Arjun Mehta'},
      {stage:'IN PROGRESS',timestamp:'2026-04-04T09:00:00Z',actor:'Arjun Mehta'},
      {stage:'DRC',        timestamp:'2026-04-07T10:00:00Z',actor:'Arjun Mehta'},
      {stage:'LVS',        timestamp:'2026-04-09T11:00:00Z',actor:'Arjun Mehta'},
      {stage:'REVIEW',     timestamp:'2026-04-12T09:00:00Z',actor:'Arjun Mehta'},
    ]},
  { id:'BLK005', name:'OTA Folded Cascode', type:'OTA', techNode:'40nm', complexity:'Critical',
    estHours:80, actualHours:60, area:'420µm²', assignedTo:'E004', stage:'IN PROGRESS',
    description:'High-gain folded cascode operational transconductance amp',
    createdAt:'2026-04-05T10:00:00Z',
    stageHistory:[
      {stage:'NOT STARTED',timestamp:'2026-04-05T10:00:00Z',actor:'Vikram Iyer'},
      {stage:'FLOORPLAN',  timestamp:'2026-04-06T09:00:00Z',actor:'Divya Suresh'},
      {stage:'IN PROGRESS',timestamp:'2026-04-08T11:00:00Z',actor:'Divya Suresh'},
    ]},
  { id:'BLK006', name:'LDO Regulator', type:'LDO', techNode:'180nm', complexity:'Critical',
    estHours:80, actualHours:55, area:'380µm²', assignedTo:'E002', stage:'REJECTED',
    description:'Low-dropout linear voltage regulator 1.8V output',
    rejectionComment:'LVS mismatch on pass transistor sizing. Gate width inconsistent with schematic. Please re-check M1 dimensions.',
    rejectedBy:'Vikram Iyer',
    rejectedAt:'2026-04-13T16:00:00Z',
    createdAt:'2026-04-04T09:00:00Z',
    stageHistory:[
      {stage:'NOT STARTED',timestamp:'2026-04-04T09:00:00Z',actor:'Vikram Iyer'},
      {stage:'FLOORPLAN',  timestamp:'2026-04-05T10:00:00Z',actor:'Priya Nair'},
      {stage:'IN PROGRESS',timestamp:'2026-04-06T11:00:00Z',actor:'Priya Nair'},
      {stage:'DRC',        timestamp:'2026-04-09T09:00:00Z',actor:'Priya Nair'},
      {stage:'LVS',        timestamp:'2026-04-11T10:00:00Z',actor:'Priya Nair'},
      {stage:'REVIEW',     timestamp:'2026-04-12T14:00:00Z',actor:'Priya Nair'},
      {stage:'REJECTED',   timestamp:'2026-04-13T16:00:00Z',actor:'Vikram Iyer'},
    ]},
  { id:'BLK007', name:'NMOS Current Source', type:'Current Mirror', techNode:'65nm', complexity:'Simple',
    estHours:20, actualHours:0, area:'60µm²', assignedTo:null, stage:'NOT STARTED',
    description:'Simple NMOS current source for bias network',
    createdAt:'2026-04-10T09:00:00Z',
    stageHistory:[
      {stage:'NOT STARTED',timestamp:'2026-04-10T09:00:00Z',actor:'Vikram Iyer'},
    ]},
  { id:'BLK008', name:'PMOS Load', type:'Inverter', techNode:'28nm', complexity:'Simple',
    estHours:20, actualHours:8, area:'55µm²', assignedTo:'E003', stage:'FLOORPLAN',
    description:'PMOS active load for differential amplifier',
    createdAt:'2026-04-08T11:00:00Z',
    stageHistory:[
      {stage:'NOT STARTED',timestamp:'2026-04-08T11:00:00Z',actor:'Vikram Iyer'},
      {stage:'FLOORPLAN',  timestamp:'2026-04-10T10:00:00Z',actor:'Karthik Rajan'},
    ]},
  { id:'BLK009', name:'Common Gate Amp', type:'OTA', techNode:'40nm', complexity:'Medium',
    estHours:30, actualHours:22, area:'175µm²', assignedTo:'E004', stage:'IN PROGRESS',
    description:'Common gate amplifier stage for wideband signal path',
    createdAt:'2026-04-07T10:00:00Z',
    stageHistory:[
      {stage:'NOT STARTED',timestamp:'2026-04-07T10:00:00Z',actor:'Vikram Iyer'},
      {stage:'FLOORPLAN',  timestamp:'2026-04-08T09:00:00Z',actor:'Divya Suresh'},
      {stage:'IN PROGRESS',timestamp:'2026-04-10T11:00:00Z',actor:'Divya Suresh'},
    ]},
  { id:'BLK010', name:'Cascode Mirror', type:'Current Mirror', techNode:'65nm', complexity:'Complex',
    estHours:50, actualHours:0, area:'210µm²', assignedTo:null, stage:'NOT STARTED',
    description:'High-output-impedance cascode current mirror',
    createdAt:'2026-04-11T09:00:00Z',
    stageHistory:[
      {stage:'NOT STARTED',timestamp:'2026-04-11T09:00:00Z',actor:'Vikram Iyer'},
    ]},
  { id:'BLK011', name:'Ring Oscillator', type:'Inverter', techNode:'180nm', complexity:'Medium',
    estHours:30, actualHours:32, area:'140µm²', assignedTo:'E001', stage:'DRC',
    description:'5-stage ring oscillator for on-chip clock generation',
    createdAt:'2026-04-06T09:00:00Z',
    stageHistory:[
      {stage:'NOT STARTED',timestamp:'2026-04-06T09:00:00Z',actor:'Vikram Iyer'},
      {stage:'FLOORPLAN',  timestamp:'2026-04-07T11:00:00Z',actor:'Arjun Mehta'},
      {stage:'IN PROGRESS',timestamp:'2026-04-08T10:00:00Z',actor:'Arjun Mehta'},
      {stage:'DRC',        timestamp:'2026-04-12T09:00:00Z',actor:'Arjun Mehta'},
    ]},
  { id:'BLK012', name:'Level Shifter', type:'Diff Pair', techNode:'28nm', complexity:'Medium',
    estHours:30, actualHours:28, area:'165µm²', assignedTo:'E002', stage:'COMPLETED',
    description:'Voltage level shifter for cross-domain signal interface',
    createdAt:'2026-04-03T11:00:00Z',
    stageHistory:[
      {stage:'NOT STARTED',timestamp:'2026-04-03T11:00:00Z',actor:'Vikram Iyer'},
      {stage:'FLOORPLAN',  timestamp:'2026-04-04T10:00:00Z',actor:'Priya Nair'},
      {stage:'IN PROGRESS',timestamp:'2026-04-05T09:00:00Z',actor:'Priya Nair'},
      {stage:'DRC',        timestamp:'2026-04-08T14:00:00Z',actor:'Priya Nair'},
      {stage:'LVS',        timestamp:'2026-04-10T10:00:00Z',actor:'Priya Nair'},
      {stage:'REVIEW',     timestamp:'2026-04-11T09:00:00Z',actor:'Priya Nair'},
      {stage:'COMPLETED',  timestamp:'2026-04-12T11:00:00Z',actor:'Vikram Iyer'},
    ]},
];

// Build initial audit log from stage histories. Action types:
// CREATE, ADVANCE, APPROVE, REJECT, ASSIGN, REOPEN, OVERRIDE
function buildInitialAuditLog() {
  const out = [];
  let i = 0;
  for (const b of blocks) {
    const h = b.stageHistory;
    for (let k = 0; k < h.length; k++) {
      const cur = h[k];
      if (k === 0) {
        out.push({
          id: 'A' + String(++i).padStart(4, '0'),
          timestamp: cur.timestamp,
          blockId: b.id,
          blockName: b.name,
          action: 'CREATE',
          fromStage: null,
          toStage: cur.stage,
          actor: cur.actor,
          actorRole: cur.actor === 'Vikram Iyer' ? 'manager' : 'engineer',
        });
      } else {
        const prev = h[k - 1];
        let action = 'ADVANCE';
        if (cur.stage === 'COMPLETED') action = 'APPROVE';
        else if (cur.stage === 'REJECTED') action = 'REJECT';
        out.push({
          id: 'A' + String(++i).padStart(4, '0'),
          timestamp: cur.timestamp,
          blockId: b.id,
          blockName: b.name,
          action,
          fromStage: prev.stage,
          toStage: cur.stage,
          actor: cur.actor,
          actorRole: cur.actor === 'Vikram Iyer' ? 'manager' : 'engineer',
        });
      }
    }
  }
  return out.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export const initialAuditLog = buildInitialAuditLog();

export function nextStage(stage) {
  const idx = STAGE_ORDER.indexOf(stage);
  if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1];
}

export function getEngineerById(id) {
  return engineers.find((e) => e.id === id) || null;
}

export function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export function relativeTime(ts) {
  const d = new Date(ts).getTime();
  const diff = Date.now() - d;
  const h = Math.round(diff / 36e5);
  if (h < 1) return 'just now';
  if (h < 24) return h + 'h ago';
  const days = Math.round(h / 24);
  return days + 'd ago';
}
