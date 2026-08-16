import React, { useState, useEffect } from 'react';
import { statsService, resourceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ResourceUploadModal from '../components/ResourceUploadModal';
import TimetableEditorModal from '../components/TimetableEditorModal';
import AnnouncementModal from '../components/AnnouncementModal';
import {
  BookOpen,
  FolderDown,
  UploadCloud,
  Clock,
  Calendar,
  Sparkles,
  Download,
  Trash2,
  CheckCircle,
  Plus,
} from 'lucide-react';

const StaffDashboard = ({ onOpenAIChat }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [timetableModalOpen, setTimetableModalOpen] = useState(false);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const res = await statsService.getStaffStats();
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Staff stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleDeleteResource = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      await resourceService.delete(id);
      fetchStaffData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Faculty Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Faculty & Staff Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hello, {user?.name || 'Professor'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {user?.designation || 'Faculty Member'} • Department of {user?.department || 'Computer Science'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2 transition"
            >
              <UploadCloud className="w-4 h-4" /> Upload Notes / PYQ
            </button>
            <button
              onClick={() => setTimetableModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 flex items-center gap-2 transition"
            >
              <Clock className="w-4 h-4 text-emerald-300" /> Update Timetable
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">My Uploaded Notes</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.myResourcesCount ?? 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Today's Schedule Day</span>
          <p className="text-base font-bold text-slate-800 mt-1">{stats?.currentDay || 'Monday'}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Campus Notes</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{stats?.totalResources ?? 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Campus Circulars</span>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">{stats?.totalAnnouncements ?? 0}</p>
        </div>
      </div>

      {/* Schedule & My Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's Assigned Classes */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Class Schedule</h3>
                <p className="text-xs text-slate-500">Timetable slots assigned to you</p>
              </div>
            </div>
            <button
              onClick={() => setTimetableModalOpen(true)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Edit Grid
            </button>
          </div>

          <div className="space-y-3">
            {stats?.todayClasses?.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No active lecture slots recorded for today.
              </div>
            ) : (
              stats?.todayClasses?.map((slot, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {slot.type} • {slot.startTime} - {slot.endTime}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1.5">{slot.subjectName}</h4>
                    <p className="text-[11px] text-slate-500">
                      {slot.department} (Sem {slot.semester} - Sec {slot.section}) • Room {slot.roomNo}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Uploaded Notes & Resource Management */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <FolderDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">My Uploaded Resources</h3>
                <p className="text-xs text-slate-500">Notes, Syllabus, and Question Papers</p>
              </div>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Upload
            </button>
          </div>

          <div className="space-y-3">
            {stats?.recentUploads?.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                You haven't uploaded any academic resources yet.
              </div>
            ) : (
              stats?.recentUploads?.map((res) => (
                <div
                  key={res._id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                        {res.type}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Sem {res.semester} • {res.subjectCode}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{res.title}</h4>
                    <p className="text-[10px] text-slate-400">
                      {res.fileName} • {res.fileSize} • 📥 {res.downloadCount} downloads
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={res.fileUrl}
                      download
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteResource(res._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ResourceUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={fetchStaffData}
      />

      <TimetableEditorModal
        isOpen={timetableModalOpen}
        onClose={() => setTimetableModalOpen(false)}
        onSuccess={fetchStaffData}
      />

      <AnnouncementModal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        onSuccess={fetchStaffData}
      />
    </div>
  );
};

export default StaffDashboard;
