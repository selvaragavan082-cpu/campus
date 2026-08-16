import React, { useState, useEffect } from 'react';
import { timetableService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TimetableEditorModal from '../components/TimetableEditorModal';
import {
  Clock,
  Printer,
  Edit2,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  BookOpen,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEPARTMENTS = ['Computer Science', 'Information Technology', 'AI & Data Science', 'Electronics & Comm', 'Mechanical', 'Civil', 'Electrical'];

const TimetablePage = () => {
  const { user, isAdmin, isStaff } = useAuth();
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [semester, setSemester] = useState(user?.semester || 4);
  const [section, setSection] = useState(user?.section || 'A');
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Monday');
  const [editorOpen, setEditorOpen] = useState(false);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await timetableService.get({ department, semester, section });
      if (res.data?.success) {
        setTimetableData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [department, semester, section]);

  const handlePrint = () => {
    window.print();
  };

  const currentDaySchedule = timetableData?.schedule?.find((d) => d.day === activeDay) || { slots: [] };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-brand-600" /> Weekly Class Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View daily schedule, period timings, designated classrooms, and subject faculty
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Printer className="w-4 h-4" /> Print Timetable
          </button>

          {(isAdmin || isStaff) && (
            <button
              onClick={() => setEditorOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition"
            >
              <Edit2 className="w-4 h-4" /> Edit Timetable
            </button>
          )}
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Semester</label>
          <select
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {['A', 'B', 'C'].map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition shadow-2xs ${
              activeDay === day
                ? 'bg-gradient-to-r from-brand-600 to-blue-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule Slots Timeline */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            <span>Schedule for {activeDay}</span>
            <span className="text-xs font-normal text-slate-500">
              ({department} • Sem {semester} - Sec {section})
            </span>
          </h3>
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            {currentDaySchedule.slots?.length || 0} Periods
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading schedule...</div>
        ) : currentDaySchedule.slots?.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No class slots scheduled for {activeDay}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentDaySchedule.slots?.map((slot, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                  slot.type === 'Break'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : slot.type === 'Lab'
                    ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-white/80 border border-slate-200 shadow-2xs">
                      Period {slot.periodNumber} • {slot.type}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold leading-tight">{slot.subjectName}</h4>
                    {slot.subjectCode && (
                      <span className="text-[11px] font-semibold opacity-75">{slot.subjectCode}</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs opacity-80">
                  <span>👨‍🏫 {slot.teacherName || 'Faculty'}</span>
                  <span>📍 {slot.roomNo}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TimetableEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSuccess={fetchTimetable}
        initialTimetable={timetableData}
      />
    </div>
  );
};

export default TimetablePage;
