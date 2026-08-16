import React, { useState, useEffect } from 'react';
import { statsService, announcementService, eventService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AnnouncementModal from '../components/AnnouncementModal';
import EventModal from '../components/EventModal';
import {
  Users,
  GraduationCap,
  Megaphone,
  Calendar,
  FolderDown,
  Plus,
  Sparkles,
  Shield,
  Trash2,
  Edit2,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

const AdminDashboard = ({ onOpenAIChat }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await statsService.getAdminStats();
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Admin stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      await announcementService.delete(id);
      fetchDashboardData();
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await eventService.delete(id);
      fetchDashboardData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" /> College Administrator Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name || 'Administrator'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Control campus-wide announcements, orchestrate student events, inspect academic repositories, and query RAG AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingAnnouncement(null);
                setAnnouncementModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> New Announcement
            </button>
            <button
              onClick={() => {
                setEditingEvent(null);
                setEventModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 flex items-center gap-2 transition"
            >
              <Calendar className="w-4 h-4 text-cyan-300" /> New Event
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
          { label: 'Faculty Members', value: stats?.totalFaculty ?? 0, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Announcements', value: stats?.totalAnnouncements ?? 0, icon: Megaphone, color: 'text-purple-600 bg-purple-50' },
          { label: 'Campus Events', value: stats?.totalEvents ?? 0, icon: Calendar, color: 'text-amber-600 bg-amber-50' },
          { label: 'Academic Files', value: stats?.totalResources ?? 0, icon: FolderDown, color: 'text-teal-600 bg-teal-50' },
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {metric.label}
                </span>
                <div className={`p-2 rounded-xl ${metric.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid: Announcements & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Announcements */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Campus Announcements</h3>
                <p className="text-xs text-slate-500">Official circulars & student notices</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingAnnouncement(null);
                setAnnouncementModalOpen(true);
              }}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="space-y-3">
            {stats?.recentAnnouncements?.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">No active announcements</p>
            ) : (
              stats?.recentAnnouncements?.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-purple-300 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          item.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                          item.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.priority}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Target: {item.targetAudience}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingAnnouncement(item);
                          setAnnouncementModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(item._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{item.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Campus Events & Department Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Events Manager */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upcoming Events</h3>
                  <p className="text-xs text-slate-500">Hackathons & workshops</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setEventModalOpen(true);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="space-y-3">
              {stats?.upcomingEvents?.length === 0 ? (
                <p className="text-center py-4 text-xs text-slate-400">No events scheduled</p>
              ) : (
                stats?.upcomingEvents?.map((ev) => (
                  <div
                    key={ev._id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {ev.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{ev.title}</h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {ev.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {ev.venue}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingEvent(ev);
                          setEventModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev._id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" /> Department Student Breakdown
            </h4>
            <div className="space-y-2">
              {stats?.deptDistribution?.map((dept, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                  <span className="font-semibold text-slate-700">{dept._id || 'Computer Science'}</span>
                  <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                    {dept.count} students
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnnouncementModal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        onSuccess={fetchDashboardData}
        initialData={editingAnnouncement}
      />

      <EventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSuccess={fetchDashboardData}
        initialData={editingEvent}
      />
    </div>
  );
};

export default AdminDashboard;
