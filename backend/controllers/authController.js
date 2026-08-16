const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'campusassist_super_secret_jwt_key_2025_secure_token', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      password,
      role,
      department,
      semester,
      rollNumber,
      rollNo,
      employeeId,
      designation,
      phone,
      section,
    } = req.body;

    const resolvedName = (name || fullName || '').trim();
    const resolvedEmail = (email || '').trim().toLowerCase();
    const resolvedPassword = password || '';
    const resolvedRoll = (rollNumber || rollNo || '').trim();

    // Field validation
    if (!resolvedName) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    if (!resolvedEmail) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(resolvedEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (!resolvedPassword || resolvedPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Check existing email
    const userExists = await User.findOne({ email: resolvedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
      });
    }

    // Create user record
    const user = await User.create({
      name: resolvedName,
      email: resolvedEmail,
      password: resolvedPassword,
      role: role || 'student',
      department: department || 'Computer Science',
      semester: Number(semester) || 1,
      section: (section || 'A').toUpperCase(),
      rollNumber: resolvedRoll,
      employeeId: (employeeId || '').trim(),
      designation: (designation || 'Assistant Professor').trim(),
      phone: (phone || '').trim(),
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to CampusAssist AI.',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          semester: user.semester,
          section: user.section,
          rollNumber: user.rollNumber,
          employeeId: user.employeeId,
          designation: user.designation,
          phone: user.phone,
          avatar: user.avatar,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user registration data received' });
    }
  } catch (error) {
    console.error('Register Controller Error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
    }

    // Handle Mongoose schema validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ') || 'Validation error during registration',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error during user registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          semester: user.semester,
          section: user.section,
          rollNumber: user.rollNumber,
          employeeId: user.employeeId,
          designation: user.designation,
          phone: user.phone,
          avatar: user.avatar,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password. Please try again.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { role, department, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name ? req.body.name.trim() : user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone.trim() : user.phone;
    user.department = req.body.department || user.department;

    if (user.role === 'student') {
      user.semester = req.body.semester ? Number(req.body.semester) : user.semester;
      user.rollNumber = req.body.rollNumber ? req.body.rollNumber.trim() : user.rollNumber;
      user.section = req.body.section ? req.body.section.trim().toUpperCase() : user.section;
    } else if (user.role === 'staff') {
      user.employeeId = req.body.employeeId ? req.body.employeeId.trim() : user.employeeId;
      user.designation = req.body.designation ? req.body.designation.trim() : user.designation;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        semester: updatedUser.semester,
        section: updatedUser.section,
        rollNumber: updatedUser.rollNumber,
        employeeId: updatedUser.employeeId,
        designation: updatedUser.designation,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        token: generateToken(updatedUser._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  updateProfile,
};
