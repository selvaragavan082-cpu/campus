const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const Resource = require('../models/Resource');
const Timetable = require('../models/Timetable');

// @desc    Get Admin dashboard analytics
// @route   GET /api/stats/admin
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const [totalStudents, totalFaculty, totalAnnouncements, totalEvents, totalResources] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'staff' }),
      Announcement.countDocuments(),
      Event.countDocuments(),
      Resource.countDocuments(),
    ]);

    // Student distribution by department
    const deptDistribution = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    // Recent 5 announcements
    const recentAnnouncements = await Announcement.find().sort({ createdAt: -1 }).limit(5);

    // Upcoming 5 events
    const upcomingEvents = await Event.find().sort({ date: 1 }).limit(5);

    // Resource breakdown by type
    const resourceTypes = await Resource.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        totalAnnouncements,
        totalEvents,
        totalResources,
        deptDistribution,
        resourceTypes,
        recentAnnouncements,
        upcomingEvents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Staff dashboard stats
// @route   GET /api/stats/staff
// @access  Private (Staff)
const getStaffStats = async (req, res) => {
  try {
    const staffId = req.user._id;
    const staffName = req.user.name;

    const [myResourcesCount, totalResources, totalAnnouncements, totalEvents] = await Promise.all([
      Resource.countDocuments({ uploadedBy: staffId }),
      Resource.countDocuments(),
      Announcement.countDocuments({ targetAudience: { $in: ['all', 'staff'] } }),
      Event.countDocuments(),
    ]);

    const recentUploads = await Resource.find({ uploadedBy: staffId }).sort({ createdAt: -1 }).limit(5);

    // Today's classes for staff
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];
    
    const timetables = await Timetable.find();
    let todayClasses = [];

    timetables.forEach((tt) => {
      const dayData = tt.schedule.find((d) => d.day === (currentDay === 'Sunday' ? 'Monday' : currentDay));
      if (dayData) {
        dayData.slots.forEach((slot) => {
          if (slot.teacherName && slot.teacherName.toLowerCase().includes(staffName.toLowerCase())) {
            todayClasses.push({
              ...slot.toObject(),
              department: tt.department,
              semester: tt.semester,
              section: tt.section,
            });
          }
        });
      }
    });

    res.json({
      success: true,
      data: {
        myResourcesCount,
        totalResources,
        totalAnnouncements,
        totalEvents,
        recentUploads,
        todayClasses,
        currentDay: currentDay === 'Sunday' ? 'Monday (Preview)' : currentDay,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Student dashboard stats
// @route   GET /api/stats/student
// @access  Private (Student)
const getStudentStats = async (req, res) => {
  try {
    const dept = req.user.department || 'Computer Science';
    const sem = req.user.semester || 1;

    const [deptResourcesCount, announcementsCount, eventsCount] = await Promise.all([
      Resource.countDocuments({ department: dept, semester: sem }),
      Announcement.countDocuments({ targetAudience: { $in: ['all', 'student'] } }),
      Event.countDocuments({ targetAudience: { $in: ['all', 'student'] } }),
    ]);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];
    const queryDay = currentDay === 'Sunday' ? 'Monday' : currentDay;

    const timetable = await Timetable.findOne({ department: dept, semester: sem, section: req.user.section || 'A' });
    let todaySchedule = [];

    if (timetable) {
      const dayData = timetable.schedule.find((d) => d.day === queryDay);
      if (dayData) {
        todaySchedule = dayData.slots;
      }
    }

    const recentAnnouncements = await Announcement.find({ targetAudience: { $in: ['all', 'student'] } })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(4);

    const upcomingEvents = await Event.find({ targetAudience: { $in: ['all', 'student'] } })
      .sort({ date: 1 })
      .limit(4);

    const recentResources = await Resource.find({ department: dept, semester: sem })
      .sort({ createdAt: -1 })
      .limit(4);

    res.json({
      success: true,
      data: {
        deptResourcesCount,
        announcementsCount,
        eventsCount,
        todaySchedule,
        currentDay: queryDay,
        recentAnnouncements,
        upcomingEvents,
        recentResources,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getStaffStats,
  getStudentStats,
};
