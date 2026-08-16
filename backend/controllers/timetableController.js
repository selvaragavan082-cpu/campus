const Timetable = require('../models/Timetable');

// @desc    Get timetable by department and semester
// @route   GET /api/timetable
// @access  Private
const getTimetable = async (req, res) => {
  try {
    let { department, semester, section } = req.query;

    // Default to user's department/semester if not provided
    if (!department && req.user) department = req.user.department;
    if (!semester && req.user && req.user.semester) semester = req.user.semester;
    if (!semester) semester = 1;
    if (!section) section = 'A';

    let timetable = await Timetable.findOne({
      department: department || 'Computer Science',
      semester: Number(semester),
      section: section,
    }).populate('updatedBy', 'name designation');

    if (!timetable) {
      // Return a structured empty schedule so frontend can render directly
      const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const defaultSlots = [
        { periodNumber: 1, startTime: '09:00 AM', endTime: '09:50 AM', subjectName: 'Data Structures & Algorithms', subjectCode: 'CS301', teacherName: 'Dr. Ramesh Kumar', roomNo: 'LH-101', type: 'Lecture' },
        { periodNumber: 2, startTime: '10:00 AM', endTime: '10:50 AM', subjectName: 'Database Management Systems', subjectCode: 'CS302', teacherName: 'Prof. Ananya Sen', roomNo: 'LH-101', type: 'Lecture' },
        { periodNumber: 3, startTime: '11:00 AM', endTime: '11:50 AM', subjectName: 'Operating Systems', subjectCode: 'CS303', teacherName: 'Dr. Suresh V', roomNo: 'LH-102', type: 'Lecture' },
        { periodNumber: 4, startTime: '12:00 PM', endTime: '12:50 PM', subjectName: 'Lunch Break', subjectCode: 'BREAK', teacherName: '-', roomNo: 'Cafeteria', type: 'Break' },
        { periodNumber: 5, startTime: '01:30 PM', endTime: '03:10 PM', subjectName: 'DBMS / OS Laboratory', subjectCode: 'CS308L', teacherName: 'Prof. Ananya Sen / Dr. Suresh', roomNo: 'CS Lab 3', type: 'Lab' },
        { periodNumber: 6, startTime: '03:20 PM', endTime: '04:10 PM', subjectName: 'Computer Networks', subjectCode: 'CS304', teacherName: 'Prof. Priya Rao', roomNo: 'LH-101', type: 'Lecture' },
      ];

      return res.json({
        success: true,
        isDefault: true,
        data: {
          department: department || 'Computer Science',
          semester: Number(semester),
          section: section,
          academicYear: '2024-2025',
          schedule: defaultDays.map((day) => ({
            day,
            slots: defaultSlots,
          })),
        },
      });
    }

    res.json({ success: true, isDefault: false, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update timetable
// @route   POST /api/timetable
// @access  Private (Staff, Admin)
const createOrUpdateTimetable = async (req, res) => {
  try {
    const { department, semester, section, academicYear, schedule } = req.body;

    if (!department || !semester || !schedule) {
      return res.status(400).json({ success: false, message: 'Department, semester, and schedule are required' });
    }

    let timetable = await Timetable.findOne({
      department,
      semester: Number(semester),
      section: section || 'A',
    });

    if (timetable) {
      timetable.academicYear = academicYear || timetable.academicYear;
      timetable.schedule = schedule;
      timetable.updatedBy = req.user._id;
      await timetable.save();
    } else {
      timetable = await Timetable.create({
        department,
        semester: Number(semester),
        section: section || 'A',
        academicYear: academicYear || '2024-2025',
        schedule,
        updatedBy: req.user._id,
      });
    }

    const populated = await Timetable.findById(timetable._id).populate('updatedBy', 'name designation');

    res.status(200).json({ success: true, data: populated, message: 'Timetable saved successfully' });
  } catch (error) {
    console.error('Timetable save error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get schedule for logged in faculty
// @route   GET /api/timetable/faculty-schedule
// @access  Private (Staff)
const getFacultySchedule = async (req, res) => {
  try {
    const facultyName = req.user.name;
    const timetables = await Timetable.find();

    const mySchedule = [];

    timetables.forEach((tt) => {
      tt.schedule.forEach((daySchedule) => {
        daySchedule.slots.forEach((slot) => {
          if (slot.teacherName && slot.teacherName.toLowerCase().includes(facultyName.toLowerCase())) {
            mySchedule.push({
              department: tt.department,
              semester: tt.semester,
              section: tt.section,
              day: daySchedule.day,
              periodNumber: slot.periodNumber,
              startTime: slot.startTime,
              endTime: slot.endTime,
              subjectName: slot.subjectName,
              subjectCode: slot.subjectCode,
              roomNo: slot.roomNo,
              type: slot.type,
            });
          }
        });
      });
    });

    res.json({ success: true, count: mySchedule.length, data: mySchedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTimetable,
  createOrUpdateTimetable,
  getFacultySchedule,
};
