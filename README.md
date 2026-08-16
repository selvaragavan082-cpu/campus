# CampusAssist AI - Smart MERN College Portal & RAG Assistant

A full-stack, role-based College Management and Academic Hub powered by the **MERN Stack** (MongoDB, Express.js, React, Node.js), **Tailwind CSS**, **Vite**, and **Google Gemini AI (`@google/genai`)** with Retrieval-Augmented Generation (RAG) context injection.

---

## 🏛️ Key Features & User Roles

### 1. 🛡️ College Administrator
- **Analytics Dashboard:** Live stats on total students, faculty, announcements, events, and academic resources.
- **Announcement Management:** Create, pin, update, and delete campus circulars (filter by target audience: All, Students, Staff; priority: Urgent, High, Medium, Low).
- **Campus Events & Hackathons:** Publish technical workshops, hackathons, cultural fests, and sports meets with dates, timings, venues, and registration links.
- **Department Oversight:** Department-wise student breakdown.

### 2. 👨‍🏫 Staff / Faculty
- **Academic Resource Manager:** Upload lecture notes, course syllabi, lab manuals, and previous year question papers (PYQs) categorized by Department and Semester with Multer file storage in `/uploads`.
- **Lecture Schedule & Timetable:** View today's classes and edit weekly class timetables across days and semesters.
- **Campus Bulletin:** Broadcast notifications and view official circulars.

### 3. 🎓 Students
- **Personalized Dashboard:** Student-specific details (Semester, Roll No, Section) with today's class schedule timeline.
- **Academic Repository:** Browse and download notes, syllabus, and PYQs with multi-level filtering (by Semester 1-8, Department, Subject, and Type).
- **Live Circulars & Event Registration:** Real-time updates on examinations, placements, and campus fests.
- **🤖 Floating "Ask AI" Assistant:** Powered by **Google Gemini 2.5 Flash (`@google/genai`)** with RAG context injection (scans live database for announcements, event dates, timetable periods, and uploaded notes to answer student queries).

---

## 📁 Directory Layout

```
clgmanagement/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Connection
│   ├── controllers/
│   │   ├── aiController.js       # Gemini 2.5 Flash RAG Chatbot
│   │   ├── announcementController.js
│   │   ├── authController.js     # JWT Registration & Login
│   │   ├── eventController.js
│   │   ├── resourceController.js # Academic Notes & PYQs
│   │   ├── statsController.js    # Role-based Analytics
│   │   └── timetableController.js# Weekly Schedule Grid
│   ├── middleware/
│   │   ├── auth.js               # JWT Verification & RBAC Guards
│   │   └── upload.js             # Multer File Storage (/uploads)
│   ├── models/
│   │   ├── Announcement.js
│   │   ├── Event.js
│   │   ├── Resource.js
│   │   ├── Timetable.js
│   │   └── User.js
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── announcementRoutes.js
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── resourceRoutes.js
│   │   ├── statsRoutes.js
│   │   └── timetableRoutes.js
│   ├── uploads/                  # Uploaded documents & PDFs
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── seed.js                   # Mock data seeder
│   └── server.js                 # Express Application Entry
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── AIChatModal.jsx   # Interactive RAG Gemini Chat Drawer
    │   │   ├── AnnouncementModal.jsx
    │   │   ├── EventModal.jsx
    │   │   ├── Navbar.jsx        # Top Nav with One-Click Demo Role Switcher
    │   │   ├── ProtectedRoute.jsx# Role-Based Route Guards
    │   │   ├── ResourceUploadModal.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── TimetableEditorModal.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global Auth & Demo Switcher
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AnnouncementsPage.jsx
    │   │   ├── EventsPage.jsx
    │   │   ├── Login.jsx         # Sign In with 1-Click Demo Buttons
    │   │   ├── Register.jsx
    │   │   ├── ResourcesPage.jsx
    │   │   ├── StaffDashboard.jsx
    │   │   ├── StudentDashboard.jsx
    │   │   └── TimetablePage.jsx
    │   ├── services/
    │   │   └── api.js            # Axios Interceptors & Service Endpoints
    │   ├── App.jsx
    │   ├── index.css             # Tailwind Directives & Custom Scrollbars
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚡ Quick Start & Run Instructions

### 1. Backend Setup
```bash
cd backend
npm install
# Seed initial demo accounts, timetables, events, and notes:
npm run seed
# Start backend server:
npm start
```
*Backend runs on `http://localhost:5000` (API: `http://localhost:5000/api`)*

### 2. Frontend Setup
```bash
cd frontend
npm install
# Start Vite development server:
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔑 Demo Account Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **🛡️ Admin** | `admin@campus.edu` | `Admin@123` |
| **👨‍🏫 Faculty / Staff** | `staff@campus.edu` | `Staff@123` |
| **🎓 Student** | `student@campus.edu` | `Student@123` |

*(You can also use the **One-Click Demo Switcher** directly from the Login page or Navbar).*
