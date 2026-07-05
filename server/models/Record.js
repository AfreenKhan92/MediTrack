import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a record title'],
      trim: true,
    },
    patientName: {
      type: String,
      required: [true, 'Please add the patient\'s name'],
    },
    recordType: {
      type: String,
      required: true,
      enum: ['Prescription', 'Lab Report', 'Vaccine Certificate', 'Other'],
      default: 'Other',
    },
    doctor: {
      type: String,
      trim: true,
    },
    dateOfRecord: {
      type: Date,
      default: Date.now,
    },
    fileUrl: {
      type: String, // Store URL/path of the uploaded document
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Record = mongoose.model('Record', recordSchema);
export default Record;
