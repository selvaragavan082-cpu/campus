import React, { useState } from 'react';
import { timetableService } from '../services/api';
import { X, Clock, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableEditorModal = ({ isOpen, onClose, onSuccess, initialTimetable }) => {
  const [department, setDepartment] = useState(initialTimetable?.department || 'Computer Science');
  const [semester, setSemester] = useState(initialTimetable?.semester || 4);
  const [section, setSection] = useState(initialTimetable?.section || 'A');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [schedule, setSchedule] = useState(() => {
    if (initialTimetable?.schedule && initialTimetable.schedule.length > 0) {
      return JSON.parse(JSON.stringify(initialTimetable.schedule));
    }
    return DAYS.map((day) => ({
      day,
      slots: [
        { periodNumber: 1, startTime: '09:00 AM', endTime: '09:50 AM', subjectCode: 'CS301', subjectName: 'Data Structures & Algorithms', teacherName: 'Dr. Ramesh Kumar', roomNo: 'LH-101', type: 'Lecture' },
        { periodNumber: 2, startTime: '10:00 AM', endTime: '10:50 AM', subjectCode: 'CS302', subjectName: 'Database Management Systems', teacherName: 'Prof. Ananya Sen', roomNo: 'LH-101', type: 'Lecture' },
        { periodNumber: 3, startTime: '11:00 AM', endTime: '11:50 AM', subjectCode: 'CS303', subjectName: 'Operating Systems', teacherName: 'Dr. Suresh V', roomNo: 'LH-102', type: 'Lecture' },
        { periodNumber: 4, startTime: '12:00 PM', endTime: '12:50 PM', subjectCode: 'BREAK', subjectName: 'Lunch Break', teacherName: '-', roomNo: 'Cafeteria', type: 'Break' },
        { periodNumber: 5, startTime: '01:30 PM', endTime: '03:10 PM', subjectCode: 'CS308L', subjectName: 'DBMS / OS Laboratory', teacherName: 'Prof. Ananya Sen', roomNo: 'CS Lab 3', type: 'Lab' },
        { periodNumber: 6, startTime: '03:20 PM', endTime: '04:10 PM', subjectCode: 'CS304', subjectName: 'Computer Networks', teacherName: 'Prof. Priya Rao', roomNo: 'LH-101', type: 'Lecture' },
      ],
    }));
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentDayData = schedule.find((d) => d.day === selectedDay) || { day: selectedDay, slots: [] };

  const handleSlotChange = (slotIndex, field, value) => {
    setSchedule((prev) =>
      prev.map((dayItem) => {
        if (dayItem.day !== selectedDay) return dayItem;
        const newSlots = [...dayItem.slots];
        newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
        return { ...dayItem, slots: newSlots };
      })
    );
  };

  const handleAddSlot = () => {
    const nextPeriod = (currentDayData.slots?.length || 0) + 1;
    const newSlot = {
      periodNumber: nextPeriod,
      startTime: '04:20 PM',
      endTime: '05:10 PM',
      subjectCode: 'CS305',
      subjectName: 'Elective / Seminar',
      teacherName: 'Faculty',
      roomNo: 'LH-101',
      type: 'Lecture',
    };

    setSchedule((prev) =>
      prev.map((dayItem) => {
        if (dayItem.day !== selectedDay) return dayItem;
        return { ...dayItem, slots: [...(dayItem.slots || []), newSlot] };
      })
    );
  };

  const handleDeleteSlot = (slotIndex) => {
    setSchedule((prev) =>
      prev.map((dayItem) => {
        if (dayItem.day !== selectedDay) return dayItem;
        const newSlots = dayItem.slots.filter((_, idx) => idx !== slotIndex);
        return { ...dayItem, slots: newSlots };
      })
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      await timetableService.save({
        department,
        semester: Number(semester),
        section,
        academicYear: '2024-2025',
        schedule,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save timetable');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-cyan-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Class Timetable Schedule Editor</h3>
              <p className="text-xs text-slate-300">Define daily periods, room allocations, subject codes and faculty</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="AI & Data Science">AI & Data Science</option>
              <option value="Electronics & Comm">Electronics & Comm</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Electrical">Electrical</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Section</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value.toUpperCase())}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 overflow-x-auto">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                selectedDay === day
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Slots Editor List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/50">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {currentDayData.slots?.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No class periods configured for {selectedDay}. Click below to add.
            </div>
          ) : (
            currentDayData.slots?.map((slot, idx) => (
              <div
                key={idx}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
              >
                <div className="sm:col-span-1 text-center font-bold text-xs text-slate-400">
                  #{slot.periodNumber || idx + 1}
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={slot.startTime}
                    onChange={(e) => handleSlotChange(idx, 'startTime', e.target.value)}
                    placeholder="Start"
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center"
                  />
                  <input
                    type="text"
                    value={slot.endTime}
                    onChange={(e) => handleSlotChange(idx, 'endTime', e.target.value)}
                    placeholder="End"
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center mt-1"
                  />
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={slot.subjectName}
                    onChange={(e) => handleSlotChange(idx, 'subjectName', e.target.value)}
                    placeholder="Subject Name"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
                  />
                  <input
                    type="text"
                    value={slot.subjectCode}
                    onChange={(e) => handleSlotChange(idx, 'subjectCode', e.target.value)}
                    placeholder="Code (e.g. CS301)"
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-500 mt-1"
                  />
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={slot.teacherName}
                    onChange={(e) => handleSlotChange(idx, 'teacherName', e.target.value)}
                    placeholder="Teacher / Professor"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700"
                  />
                  <input
                    type="text"
                    value={slot.roomNo}
                    onChange={(e) => handleSlotChange(idx, 'roomNo', e.target.value)}
                    placeholder="Room No (e.g. LH-101)"
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-500 mt-1"
                  />
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={slot.type}
                    onChange={(e) => handleSlotChange(idx, 'type', e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Break">Break</option>
                    <option value="Library">Library</option>
                  </select>
                </div>

                <div className="sm:col-span-1 text-right">
                  <button
                    onClick={() => handleDeleteSlot(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          <button
            onClick={handleAddSlot}
            className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl text-slate-600 hover:text-brand-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> Add Period Slot to {selectedDay}
          </button>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">Changes will be visible to all students of this semester & department</p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Timetable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableEditorModal;
