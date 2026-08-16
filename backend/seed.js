const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Announcement = require('./models/Announcement');
const Event = require('./models/Event');
const Resource = require('./models/Resource');
const Timetable = require('./models/Timetable');

dotenv.config();

// Ensure uploads folder and sample files exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create a mock sample text/pdf file for seeded resources
const sampleFilePath = path.join(uploadsDir, 'sample_campus_doc.pdf');
if (!fs.existsSync(sampleFilePath)) {
  fs.writeFileSync(sampleFilePath, '%PDF-1.4 CampusAssist AI Sample Academic Resource Document - Notes and Curriculum Material.');
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusassist');
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Announcement.deleteMany();
    await Event.deleteMany();
    await Resource.deleteMany();
    await Timetable.deleteMany();
    console.log('🧹 Cleaned existing database collections.');

    // 1. Create Users
    console.log('👤 Creating demo users...');
    const admin = await User.create({
      name: 'Dr. Arthur Mitchell',
      email: 'admin@campus.edu',
      password: 'Admin@123',
      role: 'admin',
      department: 'Administration',
      phone: '+1 (555) 019-2834',
    });

    const staff1 = await User.create({
      name: 'Dr. Ramesh Kumar',
      email: 'staff@campus.edu',
      password: 'Staff@123',
      role: 'staff',
      department: 'Computer Science',
      employeeId: 'EMP-CS-402',
      designation: 'Professor & HOD',
      phone: '+1 (555) 012-9874',
      subjectsAssigned: [
        { subjectCode: 'CS301', subjectName: 'Data Structures & Algorithms', semester: 4 },
        { subjectCode: 'CS401', subjectName: 'Distributed Systems', semester: 6 },
      ],
    });

    const staff2 = await User.create({
      name: 'Prof. Ananya Sen',
      email: 'ananya.sen@campus.edu',
      password: 'Staff@123',
      role: 'staff',
      department: 'Computer Science',
      employeeId: 'EMP-CS-415',
      designation: 'Assistant Professor',
      phone: '+1 (555) 014-5566',
      subjectsAssigned: [
        { subjectCode: 'CS302', subjectName: 'Database Management Systems', semester: 4 },
      ],
    });

    const student = await User.create({
      name: 'Rahul Sharma',
      email: 'student@campus.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science',
      semester: 4,
      section: 'A',
      rollNumber: 'CS2023-048',
      phone: '+1 (555) 017-7721',
    });

    const student2 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@campus.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science',
      semester: 4,
      section: 'A',
      rollNumber: 'CS2023-052',
      phone: '+1 (555) 018-8833',
    });

    // 2. Create Announcements
    console.log('📢 Creating demo announcements...');
    await Announcement.create([
      {
        title: 'Mid-Semester Examination Schedule Declared',
        description: 'The Spring 2025 Mid-Semester Examinations for all Engineering & Technology branches will commence from March 10, 2025. Detailed time tables and seating plans have been published on the student portal.',
        targetAudience: 'all',
        category: 'Exam',
        priority: 'urgent',
        isPinned: true,
        department: 'All Departments',
        author: admin._id,
        authorName: admin.name,
      },
      {
        title: 'Google & Microsoft Campus Placement Drive Registration',
        description: 'Final & Pre-final year students (Sem 6 & 8) with CGPA >= 7.5 are invited to submit their resumes for the upcoming campus recruitment drive starting next Monday. Mandatory briefing in Central Auditorium.',
        targetAudience: 'student',
        category: 'Placement',
        priority: 'high',
        isPinned: true,
        department: 'Computer Science',
        author: admin._id,
        authorName: admin.name,
      },
      {
        title: 'Faculty Research Grant Proposals Submission Deadline',
        description: 'All faculty members are reminded that applications for the Annual AI & Deep Learning Research Grant 2025 must be submitted to the Dean’s office by February 28th.',
        targetAudience: 'staff',
        category: 'Academic',
        priority: 'medium',
        isPinned: false,
        department: 'Administration',
        author: admin._id,
        authorName: admin.name,
      },
      {
        title: 'Campus Library Extended Timings during Exam Month',
        description: 'The Central Library and Digital Reading Rooms will remain open 24/7 during the exam preparation weeks starting from March 1st. RFID access is mandatory after 8:00 PM.',
        targetAudience: 'all',
        category: 'General',
        priority: 'low',
        isPinned: false,
        department: 'All Departments',
        author: admin._id,
        authorName: admin.name,
      },
    ]);

    // 3. Create Events
    console.log('🎉 Creating demo events...');
    await Event.create([
      {
        title: 'HackCampus 2025: 36-Hour National Hackathon',
        description: 'Build cutting-edge AI and Web3 applications. Prizes worth $10,000 + Internship offers from top tech giants. Food and mentorship provided throughout the event.',
        date: '2025-04-12',
        time: '09:00 AM - Next Day 09:00 PM',
        venue: 'Campus Innovation Hub, Block C',
        category: 'Hackathon',
        organizedBy: 'Department of Computer Science & Coding Club',
        registrationLink: 'https://hackcampus2025.dev',
        targetAudience: 'all',
        status: 'Upcoming',
        createdBy: admin._id,
      },
      {
        title: 'Hands-on Workshop: Generative AI with Google Gemini',
        description: 'Interactive session exploring Multi-modal LLMs, Function Calling, and RAG architectures using the new Google GenAI SDK. Laptops required.',
        date: '2025-03-22',
        time: '02:00 PM - 05:30 PM',
        venue: 'Advanced AI Research Lab (Room 304)',
        category: 'Workshop',
        organizedBy: 'Prof. Ramesh Kumar & Google Developer Student Club',
        registrationLink: 'https://gdsc-campus.org/gemini-ai',
        targetAudience: 'student',
        status: 'Upcoming',
        createdBy: admin._id,
      },
      {
        title: 'Vibrance 2025: Annual Cultural Fest',
        description: 'Three days of music, dance, theater, celebrity night, food stalls, and battle of bands.',
        date: '2025-04-25',
        time: '05:00 PM - 10:00 PM',
        venue: 'Main University Amphitheater',
        category: 'Cultural',
        organizedBy: 'Student Cultural Council',
        registrationLink: 'https://vibrance2025.edu',
        targetAudience: 'all',
        status: 'Upcoming',
        createdBy: admin._id,
      },
      {
        title: 'Annual Inter-Collegiate Athletics Championship',
        description: 'Track and field events including 100m sprint, relay, long jump, football tournament, and basketball finals.',
        date: '2025-03-29',
        time: '08:00 AM - 06:00 PM',
        venue: 'University Sports Complex',
        category: 'Sports',
        organizedBy: 'Department of Physical Education',
        registrationLink: '',
        targetAudience: 'all',
        status: 'Upcoming',
        createdBy: admin._id,
      },
    ]);

    // 4. Create Academic Resources
    console.log('📚 Creating demo academic resources...');
    await Resource.create([
      {
        title: 'Data Structures & Algorithms - Complete Lecture Notes',
        description: 'Comprehensive chapter-wise handwritten and typed notes covering Trees, Graphs, Dynamic Programming, and Greedy Algorithms.',
        type: 'Notes',
        department: 'Computer Science',
        semester: 4,
        subjectCode: 'CS301',
        subjectName: 'Data Structures & Algorithms',
        fileUrl: '/uploads/sample_campus_doc.pdf',
        fileName: 'DSA_Unit_1_to_5_Complete_Notes.pdf',
        fileSize: '4.2 MB',
        fileType: 'application/pdf',
        academicYear: '2024-2025',
        uploadedBy: staff1._id,
        uploaderName: staff1.name,
        downloadCount: 142,
        tags: ['DSA', 'Algorithms', 'Trees', 'Graphs', 'Exam Prep'],
      },
      {
        title: 'Database Management Systems - Official Course Syllabus & Lab Manual',
        description: 'Official university syllabus, ER modeling guide, Normalization cheat sheet, and 12 SQL/PLSQL lab experiments with solutions.',
        type: 'Syllabus',
        department: 'Computer Science',
        semester: 4,
        subjectCode: 'CS302',
        subjectName: 'Database Management Systems',
        fileUrl: '/uploads/sample_campus_doc.pdf',
        fileName: 'DBMS_Syllabus_and_Lab_Manual_2025.pdf',
        fileSize: '2.8 MB',
        fileType: 'application/pdf',
        academicYear: '2024-2025',
        uploadedBy: staff2._id,
        uploaderName: staff2.name,
        downloadCount: 98,
        tags: ['DBMS', 'SQL', 'Normalization', 'ER Diagram', 'Lab'],
      },
      {
        title: 'Operating Systems - Previous 5 Years Solved Question Papers',
        description: 'Past university exam question papers (2020-2024) with detailed solutions on Process Scheduling, Semaphores, Deadlocks, and Paging.',
        type: 'Question Paper',
        department: 'Computer Science',
        semester: 4,
        subjectCode: 'CS303',
        subjectName: 'Operating Systems',
        fileUrl: '/uploads/sample_campus_doc.pdf',
        fileName: 'OS_Solved_PYQ_2020_2024.pdf',
        fileSize: '6.1 MB',
        fileType: 'application/pdf',
        academicYear: '2024-2025',
        uploadedBy: staff1._id,
        uploaderName: staff1.name,
        downloadCount: 230,
        tags: ['Operating Systems', 'PYQ', 'Deadlocks', 'Scheduling', 'Solved'],
      },
      {
        title: 'Computer Networks - Socket Programming & Protocol Notes',
        description: 'Detailed analysis of OSI 7-layer model, TCP/IP, Subnetting, Routing algorithms, and Python socket programming examples.',
        type: 'Notes',
        department: 'Computer Science',
        semester: 4,
        subjectCode: 'CS304',
        subjectName: 'Computer Networks',
        fileUrl: '/uploads/sample_campus_doc.pdf',
        fileName: 'Computer_Networks_Protocols_Notes.pdf',
        fileSize: '3.5 MB',
        fileType: 'application/pdf',
        academicYear: '2024-2025',
        uploadedBy: staff2._id,
        uploaderName: staff2.name,
        downloadCount: 77,
        tags: ['Networking', 'TCP/IP', 'Subnetting', 'Sockets'],
      },
    ]);

    // 5. Create Timetable
    console.log('🗓️ Creating demo timetables...');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const standardSchedule = [
      { periodNumber: 1, startTime: '09:00 AM', endTime: '09:50 AM', subjectCode: 'CS301', subjectName: 'Data Structures & Algorithms', teacherName: 'Dr. Ramesh Kumar', roomNo: 'LH-101', type: 'Lecture' },
      { periodNumber: 2, startTime: '10:00 AM', endTime: '10:50 AM', subjectCode: 'CS302', subjectName: 'Database Management Systems', teacherName: 'Prof. Ananya Sen', roomNo: 'LH-101', type: 'Lecture' },
      { periodNumber: 3, startTime: '11:00 AM', endTime: '11:50 AM', subjectCode: 'CS303', subjectName: 'Operating Systems', teacherName: 'Dr. Suresh V', roomNo: 'LH-102', type: 'Lecture' },
      { periodNumber: 4, startTime: '12:00 PM', endTime: '12:50 PM', subjectCode: 'BREAK', subjectName: 'Lunch & Campus Break', teacherName: '-', roomNo: 'Cafeteria', type: 'Break' },
      { periodNumber: 5, startTime: '01:30 PM', endTime: '03:10 PM', subjectCode: 'CS308L', subjectName: 'DBMS & Algorithms Practical Lab', teacherName: 'Prof. Ananya Sen / Dr. Ramesh', roomNo: 'CS Lab 3', type: 'Lab' },
      { periodNumber: 6, startTime: '03:20 PM', endTime: '04:10 PM', subjectCode: 'CS304', subjectName: 'Computer Networks', teacherName: 'Prof. Priya Rao', roomNo: 'LH-101', type: 'Lecture' },
    ];

    await Timetable.create({
      department: 'Computer Science',
      semester: 4,
      section: 'A',
      academicYear: '2024-2025',
      updatedBy: staff1._id,
      schedule: days.map(day => ({
        day,
        slots: standardSchedule,
      })),
    });

    console.log('✅ Database seeded successfully with production-ready mock data!');
    console.log('--------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('1. Admin:   admin@campus.edu   | Password: Admin@123');
    console.log('2. Staff:   staff@campus.edu   | Password: Staff@123');
    console.log('3. Student: student@campus.edu | Password: Student@123');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
