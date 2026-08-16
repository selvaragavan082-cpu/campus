import React, { useState, useEffect } from 'react';
import { statsService, resourceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  Clock,
  Megaphone,
  Calendar,
  FolderDown,
  Download,
  BookOpen,
  ArrowRight,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

const StudentDashboard = ({ onOpenAIChat }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const res = await statsService.getStudentStats();
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Student dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleDownload = async (id, fileUrl) => {
    try {
      await resourceService.trackDownload(id);
      window.open(fileUrl, '_blank');
    } catch (e) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-brand-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> Student Portal • Semester {user?.semester || 4}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {user?.name || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Department of {user?.department || 'Computer Science'} • Roll: {user?.rollNumber || 'CS2023-048'} • Section {user?.section || 'A'}
            </p>
          </div>

          <div>
            <button
              onClick={onOpenAIChat}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/25 flex items-center gap-2 transition hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-900 animate-spin-slow" />
              <span>Ask Campus AI Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Timetable & Recommended Notes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Schedule Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Today's Class Timetable</h3>
                  <p className="text-xs text-slate-500">
                    Schedule for {stats?.currentDay || 'Monday'} (Sem {user?.semester || 4})
                  </p>
                </div>
              </div>
              <Link to="/timetable" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                Full Week <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {stats?.todaySchedule?.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">No classes scheduled for today.</p>
              ) : (
                stats?.todaySchedule?.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                      slot.type === 'Break'
                        ? 'bg-amber-50/60 border-amber-200/80 text-amber-900'
                        : slot.type === 'Lab'
                        ? 'bg-purple-50/60 border-purple-200/80 text-purple-900'
                        : 'bg-slate-50 border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-xs font-extrabold flex items-center justify-center text-slate-700 shadow-2xs">
                        P{slot.periodNumber}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold">{slot.subjectName}</h4>
                        <p className="text-[11px] opacity-75">
                          {slot.teacherName && slot.teacherName !== '-' ? `${slot.teacherName} • ` : ''}
                          Room: {slot.roomNo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold block">{slot.startTime}</span>
                      <span className="text-[10px] opacity-70 block">{slot.endTime}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Academic Notes & Syllabus for this Semester */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <FolderDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Semester {user?.semester || 4} Resources</h3>
                  <p className="text-xs text-slate-500">Lecture notes, syllabus & solved papers</p>
                </div>
              </div>
              <Link to="/resources" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats?.recentResources?.length === 0 ? (
                <p className="col-span-2 text-center py-6 text-xs text-slate-400">
                  No resources uploaded yet for your semester.
                </p>
              ) : (
                stats?.recentResources?.map((item) => (
                  <div
                    key={item._id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition flex flex-col justify-between"
                  >
                    <div className="space-y-1 mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                        {item.type}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.subjectName} ({item.subjectCode})
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(item._id, item.fileUrl)}
                      className="w-full py-1.5 rounded-xl bg-white hover:bg-teal-600 hover:text-white border border-slate-200 hover:border-teal-600 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Announcements & Upcoming Campus Events */}
        <div className="lg:col-span-5 space-y-6">
          {/* Announcements Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Campus Circulars</h3>
                  <p className="text-xs text-slate-500">Official notices & updates</p>
                </div>
              </div>
              <Link to="/announcements" className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1">
                All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {stats?.recentAnnouncements?.length === 0 ? (
                <p className="text-center py-4 text-xs text-slate-400">No active circulars</p>
              ) : (
                stats?.recentAnnouncements?.map((item) => (
                  <div
                    key={item._id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        item.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                        item.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.category} • {item.priority}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upcoming Events</h3>
                  <p className="text-xs text-slate-500">Hackathons & workshops</p>
                </div>
              </div>
              <Link to="/events" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {stats?.upcomingEvents?.length === 0 ? (
                <p className="text-center py-4 text-xs text-slate-400">No events upcoming</p>
              ) : (
                stats?.upcomingEvents?.map((ev) => (
                  <div
                    key={ev._id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {ev.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{ev.title}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {ev.venue} • {ev.date}
                      </p>
                    </div>
                    {ev.registrationLink && (
                      <a
                        href={ev.registrationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shrink-0 transition"
                      >
                        Register
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
