const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['Notes', 'Syllabus', 'Question Paper', 'Lab Manual', 'Assignment', 'Reference Book'],
      required: true,
    },
    department: {
      type: String,
      enum: ['Computer Science', 'Information Technology', 'AI & Data Science', 'Electronics & Comm', 'Mechanical', 'Civil', 'Electrical', 'General'],
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'Resource file is required'],
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: String,
      default: 'Unknown',
    },
    fileType: {
      type: String,
      default: 'application/pdf',
    },
    academicYear: {
      type: String,
      default: '2024-2025',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploaderName: {
      type: String,
      default: 'Faculty Member',
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resource', resourceSchema);
