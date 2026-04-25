import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Cpu, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/UI/Modal';
import { Avatar } from '../components/UI/Badge';

export default function Login() {
  const { engineers, login } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pickedEngineer, setPickedEngineer] = useState('E001');

  const engineerList = engineers.filter((e) => e.role === 'engineer');
  const manager = engineers.find((e) => e.role === 'manager');

  const handleManager = () => {
    login(manager.id);
    navigate('/dashboard');
  };
  const handleEngineer = () => {
    login(pickedEngineer);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6">
      {/* bg accents */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(0,212,170,0.12), transparent 40%), radial-gradient(circle at 80% 80%, rgba(168,85,247,0.10), transparent 40%)',
        }}
      />
      <CircuitGrid />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0B6E4F, #0E7490)' }}
          >
            <Cpu size={24} color="#0B0F1A" strokeWidth={2.5} />
          </div>
          <div className="text-3xl font-bold tracking-tight">
            Layout<span style={{ color: '#0B6E4F' }}>IQ</span>
          </div>
        </div>
        <p className="text-muted-foreground mb-10">Workflow Intelligence for Analog IC Teams</p>

        <button
          onClick={() => setOpen(true)}
          className="w-full inline-flex items-center justify-center gap-3 rounded-md bg-white text-[#1f1f1f] font-semibold py-3 hover:bg-gray-50 transition-colors shadow-lg"
        >
          <GoogleG />
          Sign in with Google
        </button>

        <div className="mt-8 text-xs text-muted-foreground/80">
          Demo prototype · No real authentication · Pick a role to explore
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Select your role to continue"
        width="max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Manager card */}
          <div className="liq-card p-5 flex flex-col items-center text-center hover:border-[#0B6E4F]/50 transition-colors">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center mb-3"
              style={{ background: 'rgba(0,212,170,0.15)' }}>
              <Briefcase size={22} style={{ color: '#0B6E4F' }} />
            </div>
            <div className="font-semibold">Vikram Iyer</div>
            <div className="text-xs text-muted-foreground mt-1">Project Manager</div>
            <div className="text-[11px] text-muted-foreground/80 mt-1">Full system access</div>
            <button
              onClick={handleManager}
              className="liq-btn liq-btn-primary mt-5 w-full"
            >
              Continue as Manager
            </button>
          </div>

          {/* Engineer card */}
          <div className="liq-card p-5 flex flex-col items-center text-center hover:border-[#A855F7]/50 transition-colors">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center mb-3"
              style={{ background: 'rgba(168,85,247,0.15)' }}>
              <Cpu size={22} style={{ color: '#A855F7' }} />
            </div>
            <div className="font-semibold">Layout Engineer</div>
            <div className="text-xs text-muted-foreground mt-1">Block-level access</div>
            <div className="relative mt-4 w-full">
              <select
                value={pickedEngineer}
                onChange={(e) => setPickedEngineer(e.target.value)}
                className="liq-input appearance-none pr-9 cursor-pointer"
              >
                {engineerList.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <button
              onClick={handleEngineer}
              className="liq-btn mt-3 w-full"
              style={{ background: '#A855F7', color: '#0B0F1A' }}
            >
              Continue as Engineer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.62Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.34A9 9 0 0 0 9 18Z"/>
      <path fill="#FBBC05" d="M3.95 10.7A5.41 5.41 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.96H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.04l3.01-2.34Z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.43 1.35l2.57-2.57C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.96L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58Z"/>
    </svg>
  );
}

function CircuitGrid() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#F1F5F9" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}
