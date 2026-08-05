import fs from 'fs';
import cloudinary from '../config/cloudinary.js';
import MedicalReport from '../models/MedicalReport.js';
import { processReport } from '../services/reportProcessor.service.js';

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
      processingStatus: 'pending',
      ocrStatus: 'pending',
    });

    // ── Fire-and-forget AI processing pipeline ────────────────────────────────
    // Non-blocking: respond immediately, process in background
    setImmediate(() => {
      processReport(newReport._id.toString(), newReport.fileUrl).catch((err) => {
        console.error(`[UploadReport] Background pipeline error for ${newReport._id}:`, err.message);
      });
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

// @desc    Get a single report by ID (with AI data)
// @route   GET /api/reports/:id
// @access  Private
export const getReportById = async (req, res, next) => {
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

    res.json(report);
  } catch (error) {
    next(error);
  }
};

// @desc    Retry AI processing for an existing report
// @route   POST /api/reports/:id/retry
// @access  Private
export const retryProcessing = async (req, res, next) => {
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

    // Only allow retry if currently failed or pending
    if (!['failed', 'pending'].includes(report.processingStatus)) {
      res.status(400);
      throw new Error(`Cannot retry — current status is "${report.processingStatus}". Wait for processing to complete first.`);
    }

    // Reset status to pending
    await MedicalReport.findByIdAndUpdate(report._id, {
      processingStatus: 'pending',
    });

    // Determine if we need to force re-run OCR (only if OCR previously failed)
    const forceOcr = report.ocrStatus !== 'success';

    // Fire-and-forget retry
    setImmediate(() => {
      processReport(report._id.toString(), report.fileUrl, forceOcr).catch((err) => {
        console.error(`[RetryProcessing] Background pipeline error for ${report._id}:`, err.message);
      });
    });

    res.json({
      message: 'Processing retry initiated.',
      reportId: report._id,
      forceOcr,
    });
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
