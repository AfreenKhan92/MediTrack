import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a report title'],
      trim: true,
    },
    patientName: {
      type: String,
      required: [true, 'Please add the patient name'],
      trim: true,
    },
    doctor: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Prescription', 'Lab Test', 'Vaccine Certificate', 'Other'],
      default: 'Other',
    },
    fileUrl: {
      type: String,
      required: [true, 'File upload URL is required'],
    },
    cloudinaryId: {
      type: String,
      required: [true, 'Cloudinary file public ID is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },

    // ── AI Pipeline Fields (all optional) ───────────────────────────────────
    /** Raw text extracted by OCR.Space */
    ocrText: {
      type: String,
      default: null,
    },
    /** Structured medical data extracted by Gemini AI */
    parsedData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    /** Patient-friendly AI-generated summary */
    summary: {
      type: String,
      default: null,
    },
    /** OCR extraction status */
    ocrStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    /** Overall AI processing pipeline status */
    processingStatus: {
      type: String,
      enum: ['pending', 'ocr_processing', 'ai_processing', 'completed', 'failed'],
      default: 'pending',
    },
    /** Timestamp when AI processing completed */
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
export default MedicalReport;

