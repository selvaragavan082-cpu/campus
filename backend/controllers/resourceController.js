const Resource = require('../models/Resource');
const fs = require('fs');
const path = require('path');

// @desc    Upload new academic resource
// @route   POST /api/resources
// @access  Private (Staff, Admin)
const uploadResource = async (req, res) => {
  try {
    const { title, description, type, department, semester, subjectCode, subjectName, academicYear, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a document or file' });
    }

    if (!title || !type || !department || !semester || !subjectCode || !subjectName) {
      return res.status(400).json({ success: false, message: 'Title, type, department, semester, and subject details are required' });
    }

    const fileSizeFormatted = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const fileUrl = `/uploads/${req.file.filename}`;

    const parsedTags = tags ? (typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags) : [];

    const resource = await Resource.create({
      title,
      description: description || '',
      type,
      department,
      semester: Number(semester),
      subjectCode: subjectCode.toUpperCase(),
      subjectName,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: fileSizeFormatted,
      fileType: req.file.mimetype,
      academicYear: academicYear || '2024-2025',
      uploadedBy: req.user._id,
      uploaderName: req.user.name,
      tags: parsedTags,
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    console.error('Resource upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all resources with filters
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
  try {
    const { department, semester, type, subjectCode, search } = req.query;
    let query = {};

    if (department && department !== 'All') query.department = department;
    if (semester && semester !== 'All') query.semester = Number(semester);
    if (type && type !== 'All') query.type = type;
    if (subjectCode) query.subjectCode = { $regex: subjectCode, $options: 'i' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subjectName: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name email role designation department')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('uploadedBy', 'name email designation department');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Uploader Staff or Admin)
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource' });
    }

    // Try deleting physical file from disk
    if (resource.fileUrl) {
      const filename = path.basename(resource.fileUrl);
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete physical file:', e.message);
        }
      }
    }

    await resource.deleteOne();

    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track download count
// @route   POST /api/resources/:id/download
// @access  Private
const trackDownload = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } }, { new: true });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, downloadCount: resource.downloadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadResource,
  getResources,
  getResourceById,
  deleteResource,
  trackDownload,
};
