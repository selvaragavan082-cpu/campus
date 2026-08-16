const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  periodNumber: {
    type: Number,
    required: true,
  },
  startTime: {
    type: String,
    required: true, // e.g. "09:00 AM"
  },
  endTime: {
    type: String,
    required: true, // e.g. "09:50 AM"
  },
  subjectCode: {
    type: String,
    default: '',
  },
  subjectName: {
    type: String,
    required: true,
  },
  teacherName: {
    type: String,
    default: '',
  },
  roomNo: {
    type: String,
    default: 'Room 101',
  },
  type: {
    type: String,
    enum: ['Lecture', 'Lab', 'Tutorial', 'Break', 'Library', 'Sports'],
    default: 'Lecture',
  },
});

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true,
  },
  slots: [slotSchema],
});

const timetableSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      enum: ['Computer Science', 'Information Technology', 'AI & Data Science', 'Electronics & Comm', 'Mechanical', 'Civil', 'Electrical'],
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      default: 'A',
    },
    academicYear: {
      type: String,
      default: '2024-2025',
    },
    schedule: [dayScheduleSchema],
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Timetable', timetableSchema);
