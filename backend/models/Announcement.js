const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Announcement description is required'],
    },
    targetAudience: {
      type: String,
      enum: ['all', 'student', 'staff'],
      default: 'all',
    },
    category: {
      type: String,
      enum: ['General', 'Academic', 'Exam', 'Placement', 'Sports', 'Event', 'Urgent', 'Holiday'],
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      default: 'Admin Office',
    },
    department: {
      type: String,
      default: 'All Departments',
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Announcement', announcementSchema);
