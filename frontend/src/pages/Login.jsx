import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Shield,
  BookOpen,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const Login = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'admin') navigate('/admin');
      else if (res.user.role === 'staff') navigate('/staff');
      else navigate('/student');
    } else {
      setError(res.message);
    }
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    const res = await quickLogin(role);
    setLoading(false);

    if (res.success) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'staff') navigate('/staff');
      else navigate('/student');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-brand-950 to-indigo-950">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800/50">
        {/* Left Branding Column */}
        <div className="lg:col-span-5 p-8 sm:p-12 bg-gradient-to-br from-brand-900 via-blue-900 to-indigo-950 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                <GraduationCap className="w-7 h-7 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">CampusAssist AI</h1>
                <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
                  Smart College Portal & RAG Engine
                </span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">
              Intelligent Campus Operations & Academic Hub
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Unified portal for college circulars, syllabus repository, interactive schedules, and Gemini-powered RAG assistance.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-role access: Admin, Faculty & Students</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>RAG context injection with Google Gemini 2.5 Flash</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant notes download & weekly timetable manager</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-slate-400 relative z-10 flex items-center justify-between">
            <span>v1.0 • Production Ready</span>
            <span className="flex items-center gap-1 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" /> Google GenAI
            </span>
          </div>
        </div>

        {/* Right Form & Quick Switcher Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Welcome Back</h3>
              <p className="text-sm text-slate-500 mt-1">Sign in with your credentials or try a demo account</p>
            </div>

            {/* Quick Demo Login Cards */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> One-Click Demo Access
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('student')}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-center transition group shadow-2xs"
                >
                  <GraduationCap className="w-5 h-5 mx-auto text-blue-600 mb-1 group-hover:scale-110 transition" />
                  <span className="block text-xs font-bold text-slate-800">Student</span>
                  <span className="block text-[10px] text-slate-400">Sem 4 CS</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('staff')}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-center transition group shadow-2xs"
                >
                  <BookOpen className="w-5 h-5 mx-auto text-emerald-600 mb-1 group-hover:scale-110 transition" />
                  <span className="block text-xs font-bold text-slate-800">Faculty</span>
                  <span className="block text-[10px] text-slate-400">Professor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-center transition group shadow-2xs"
                >
                  <Shield className="w-5 h-5 mx-auto text-purple-600 mb-1 group-hover:scale-110 transition" />
                  <span className="block text-xs font-bold text-slate-800">Admin</span>
                  <span className="block text-[10px] text-slate-400">Executive</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@campus.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
