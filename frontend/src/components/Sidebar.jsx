import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Megaphone,
  Calendar,
  FolderDown,
  Clock,
  Sparkles,
  ShieldAlert,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, closeMobileSidebar, onOpenAIChat }) => {
  const { user, isAdmin, isStaff, isStudent } = useAuth();

  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isStaff) return '/staff';
    return '/student';
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: getDashboardPath(),
      icon: LayoutDashboard,
    },
    {
      name: 'Announcements',
      path: '/announcements',
      icon: Megaphone,
    },
    {
      name: 'Campus Events',
      path: '/events',
      icon: Calendar,
    },
    {
      name: 'Academic Resources',
      path: '/resources',
      icon: FolderDown,
    },
    {
      name: 'Class Timetable',
      path: '/timetable',
      icon: Clock,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 z-40 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* User Mini Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{user?.name}</h4>
                <p className="text-[11px] text-slate-500 truncate">{user?.department || 'General'}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    {user?.role} {user?.semester ? `• Sem ${user.semester}` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Main Menu
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* AI Assistant Callout Box */}
        <div className="pt-4 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-900 to-indigo-950 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute -right-3 -bottom-3 opacity-10 group-hover:opacity-20 transition">
              <Sparkles className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-lg bg-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              </span>
              <span className="text-xs font-bold text-white tracking-wide">CampusAssist AI</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug mb-3">
              Ask about timetables, circulars, exam dates & notes.
            </p>
            <button
              onClick={() => {
                closeMobileSidebar();
                onOpenAIChat();
              }}
              className="w-full py-2 px-3 rounded-xl bg-white text-brand-900 text-xs font-bold hover:bg-brand-50 transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Launch Assistant
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
