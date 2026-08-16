const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    date: {
      type: String,
      required: [true, 'Event date is required (YYYY-MM-DD)'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required (e.g. 10:00 AM - 01:00 PM)'],
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Hackathon', 'Seminar', 'Conference'],
      default: 'Technical',
    },
    organizedBy: {
      type: String,
      default: 'College Event Committee',
    },
    registrationLink: {
      type: String,
      default: '',
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    targetAudience: {
      type: String,
      enum: ['all', 'student', 'staff'],
      default: 'all',
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);
