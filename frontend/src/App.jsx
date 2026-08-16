import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AIChatModal from './components/AIChatModal';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AnnouncementsPage from './pages/AnnouncementsPage';
import EventsPage from './pages/EventsPage';
import ResourcesPage from './pages/ResourcesPage';
import TimetablePage from './pages/TimetablePage';

import { Sparkles } from 'lucide-react';

const AppLayout = ({ children, onOpenAIChat }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans">
      <Navbar
        onOpenAIChat={onOpenAIChat}
        toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar
          isMobileOpen={mobileSidebarOpen}
          closeMobileSidebar={() => setMobileSidebarOpen(false)}
          onOpenAIChat={onOpenAIChat}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden">
          {children}
        </main>
      </div>

      {/* Floating Action Button for AI Chatbot */}
      <button
        onClick={onOpenAIChat}
        className="fixed bottom-6 right-6 z-40 p-3.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-xl shadow-brand-500/35 hover:shadow-2xl hover:scale-105 active:scale-95 transition flex items-center gap-2.5 group"
        aria-label="Ask Campus AI"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow group-hover:scale-110 transition" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-ping"></span>
        </div>
        <span className="hidden sm:inline text-xs font-extrabold tracking-wide">Ask Campus AI</span>
      </button>
    </div>
  );
};

const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'staff') return <Navigate to="/staff" replace />;
  return <Navigate to="/student" replace />;
};

function AppContent() {
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <Router>
      <AppLayout onOpenAIChat={() => setAiChatOpen(true)}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard onOpenAIChat={() => setAiChatOpen(true)} />} />
          </Route>

          {/* Staff / Faculty Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
            <Route path="/staff" element={<StaffDashboard onOpenAIChat={() => setAiChatOpen(true)} />} />
          </Route>

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentDashboard onOpenAIChat={() => setAiChatOpen(true)} />} />
          </Route>

          {/* Shared Authenticated Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'staff', 'student']} />}>
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/timetable" element={<TimetablePage />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>

      {/* Global AI Chat Drawer Modal */}
      <AIChatModal isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
