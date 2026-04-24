import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { SkeletonGrid } from '../UI/SkeletonCard';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../UI/Toast';
import { nextStage } from '../../data/mockData';

export function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [tooNarrow, setTooNarrow] = useState(window.innerWidth < 1280);

  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    setLoadingRoute(true);
    const t = setTimeout(() => setLoadingRoute(false), 400);
    return () => clearTimeout(t);
  }, [loc.pathname]);

  useEffect(() => {
    const onResize = () => setTooNarrow(window.innerWidth < 1280);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Live updates only on Dashboard / Kanban
  const { blocks, advanceStage } = useAppData();
  const toast = useToast();
  useEffect(() => {
    const liveOn = loc.pathname === '/dashboard' || loc.pathname === '/kanban';
    if (!liveOn) return;
    const id = setInterval(() => {
      const candidates = blocks.filter((b) => b.stage === 'IN PROGRESS');
      if (!candidates.length) return;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      const target = pick.assignedTo
        ? { name: ['Arjun Mehta','Priya Nair','Karthik Rajan','Divya Suresh'].find(n => n) || 'System', role: 'engineer' }
        : { name: 'System', role: 'engineer' };
      const ns = nextStage(pick.stage);
      if (!ns) return;
      advanceStage(pick.id, target);
      toast.info('🔄 Live Update', `${pick.id} advanced to ${ns}`);
    }, 30000);
    return () => clearInterval(id);
  }, [loc.pathname, blocks, advanceStage, toast]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 fade-in" key={loc.pathname}>
          {loadingRoute ? <SkeletonGrid /> : children}
        </main>
      </div>
      {tooNarrow && (
        <div className="fixed inset-0 z-[200] bg-[#0B0F1A]/95 backdrop-blur flex items-center justify-center p-8">
          <div className="liq-card-elevated max-w-md text-center p-8">
            <div className="text-2xl font-bold mb-2">Best viewed on desktop</div>
            <p className="text-sm text-muted-foreground">
              LayoutIQ is optimized for screens 1280px and wider. Please resize your window
              or open on a larger display.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
