import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { ToastProvider } from './components/UI/Toast';
import { AppShell } from './components/Layout/AppShell';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Blocks from './pages/Blocks.jsx';
import Kanban from './pages/Kanban.jsx';
import Effort from './pages/Effort.jsx';
import Resources from './pages/Resources.jsx';
import Approvals from './pages/Approvals.jsx';
import AuditLog from './pages/AuditLog.jsx';

function ProtectedShell({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedShell><Dashboard /></ProtectedShell>} />
              <Route path="/blocks"    element={<ProtectedShell><Blocks /></ProtectedShell>} />
              <Route path="/kanban"    element={<ProtectedShell><Kanban /></ProtectedShell>} />
              <Route path="/effort"    element={<ProtectedShell><Effort /></ProtectedShell>} />
              <Route path="/resources" element={<ProtectedShell><Resources /></ProtectedShell>} />
              <Route path="/approvals" element={<ProtectedShell><Approvals /></ProtectedShell>} />
              <Route path="/audit"     element={<ProtectedShell><AuditLog /></ProtectedShell>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AppDataProvider>
    </AuthProvider>
  );
}
