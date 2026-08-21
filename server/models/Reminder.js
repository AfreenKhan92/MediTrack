import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true,
    },
    reminderTimes: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    purpose: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reminderSchema.virtual('familyMember')
  .get(function getFamilyMember() {
    return this.patient;
  })
  .set(function setFamilyMember(value) {
    this.patient = value;
  });

reminderSchema.virtual('times')
  .get(function getTimes() {
    return this.reminderTimes;
  })
  .set(function setTimes(value) {
    this.reminderTimes = value;
  });

reminderSchema.virtual('isActive')
  .get(function getIsActive() {
    return this.active;
  })
  .set(function setIsActive(value) {
    this.active = value;
  });

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;