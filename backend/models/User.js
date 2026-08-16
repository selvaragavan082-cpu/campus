const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'student'],
      default: 'student',
    },
    department: {
      type: String,
      enum: ['Computer Science', 'Information Technology', 'AI & Data Science', 'Electronics & Comm', 'Mechanical', 'Civil', 'Electrical', 'Administration', 'General'],
      default: 'Computer Science',
    },
    // Student-specific fields
    rollNumber: {
      type: String,
      trim: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },
    section: {
      type: String,
      default: 'A',
    },
    // Staff-specific fields
    employeeId: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      default: 'Assistant Professor',
    },
    subjectsAssigned: [
      {
        subjectCode: String,
        subjectName: String,
        semester: Number,
      },
    ],
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
