import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    familyMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      default: null,
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    specialty: {
      type: String,
      trim: true,
    },
    hospital: {
      type: String,
      required: [true, 'Hospital or clinic name is required'],
      trim: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date and time is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Scheduled', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid appointment status',
      },
      default: 'Scheduled',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient sorted queries by upcoming date
appointmentSchema.index({ user: 1, appointmentDate: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
