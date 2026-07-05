import fs from 'fs';
import cloudinary from '../config/cloudinary.js';
import MedicalReport from '../models/MedicalReport.js';

// @desc    Upload a new medical report / prescription
// @route   POST /api/reports
// @access  Private
export const uploadReport = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file');
    }

    const { title, patientName, doctor, category, notes, date } = req.body;

    let cloudinaryResult;
    try {
      // Upload file to Cloudinary under the 'meditrack' folder
      cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'meditrack',
        resource_type: 'auto', // Auto-detect format (PDF or images)
      });
    } catch (uploadError) {
      // Delete local temporary file even if Cloudinary fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(502);
      throw new Error(`Cloudinary upload failed: ${uploadError.message}`);
    }

    // Delete local temporary file after successful Cloudinary upload
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const newReport = await MedicalReport.create({
      user: req.user._id,
      title: title || req.file.originalname,
      patientName: patientName || 'Self',
      doctor,
      category,
      fileUrl: cloudinaryResult.secure_url,
      cloudinaryId: cloudinaryResult.public_id,
      notes,
      date: date || new Date(),
    });

    res.status(201).json(newReport);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's medical reports
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res, next) => {
  try {
    const reports = await MedicalReport.find({ user: req.user._id }).sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a medical report
// @route   DELETE /api/reports/:id
// @access  Private
export const deleteReport = async (req, res, next) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      res.status(404);
      throw new Error('Report not found');
    }

    // Verify ownership
    if (report.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(report.cloudinaryId);
    } catch (cloudinaryErr) {
      console.warn(`Failed to delete Cloudinary asset ${report.cloudinaryId}:`, cloudinaryErr.message);
    }

    // Delete from MongoDB
    await report.deleteOne();

    res.json({ message: 'Medical report removed successfully' });
  } catch (error) {
    next(error);
  }
};
