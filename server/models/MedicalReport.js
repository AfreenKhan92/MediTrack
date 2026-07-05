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
  },
  {
    timestamps: true,
  }
);

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
export default MedicalReport;
