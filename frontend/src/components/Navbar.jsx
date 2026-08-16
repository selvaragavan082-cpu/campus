import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Sparkles, 
  LogOut, 
  User, 
  Shield, 
  BookOpen, 
  ChevronDown,
  Menu,
  X,
  Bell
} from 'lucide-react';

const Navbar = ({ onOpenAIChat, toggleMobileSidebar }) => {
  const { user, logout, quickLogin, isAdmin, isStaff, isStudent } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleSwitching, setRoleSwitching] = useState(false);

  const handleRoleSwitch = async (role) => {
    setRoleSwitching(true);
    await quickLogin(role);
    setRoleSwitching(false);
    if (role === 'admin') navigate('/admin');
    else if (role === 'staff') navigate('/staff');
    else navigate('/student');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200"><Shield className="w-3 h-3" /> Admin</span>;
      case 'staff':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><BookOpen className="w-3 h-3" /> Faculty</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><GraduationCap className="w-3 h-3" /> Student</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-slate-900 via-brand-800 to-brand-600 bg-clip-text text-transparent">
                  CampusAssist
                </span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-brand-100 text-brand-700">
                  AI RAG
                </span>
              </div>
            </Link>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Demo Role Switcher */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium px-2 py-1">Demo As:</span>
              <button
                onClick={() => handleRoleSwitch('admin')}
                disabled={roleSwitching}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  isAdmin ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => handleRoleSwitch('staff')}
                disabled={roleSwitching}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  isStaff ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                }`}
              >
                Faculty
              </button>
              <button
                onClick={() => handleRoleSwitch('student')}
                disabled={roleSwitching}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  isStudent ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                }`}
              >
                Student
              </button>
            </div>

            {/* Floating Ask AI Button in Navbar */}
            <button
              onClick={onOpenAIChat}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/35 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
              <span className="hidden sm:inline">Ask Campus AI</span>
              <span className="sm:hidden">Ask AI</span>
            </button>

            {/* User Profile & Logout Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-slate-200/80"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:block text-left pr-1">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5">{getRoleBadge(user.role)}</div>
                    </div>

                    <div className="px-2 py-1">
                      <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Quick Switch
                      </div>
                      <button
                        onClick={() => handleRoleSwitch('admin')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                      >
                        <Shield className="w-3.5 h-3.5" /> Admin Dashboard
                      </button>
                      <button
                        onClick={() => handleRoleSwitch('staff')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Faculty Dashboard
                      </button>
                      <button
                        onClick={() => handleRoleSwitch('student')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                      >
                        <GraduationCap className="w-3.5 h-3.5" /> Student Dashboard
                      </button>
                    </div>

                    <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                      <button
                        onClick={logout}
                        className="w-full text-left px-2 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-brand-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
