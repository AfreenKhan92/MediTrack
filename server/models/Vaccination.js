import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema(
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
    vaccineName: {
      type: String,
      required: [true, 'Vaccine name is required'],
      trim: true,
    },
    dose: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Dose is required'],
    },
    dueDate: {
      type: Date,
    },
    administeredDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ['Scheduled', 'Administered', 'Overdue'],
        message: '{VALUE} is not a valid vaccination status',
      },
      default: 'Scheduled',
    },
    notes: {
      type: String,
      trim: true,
    },
    administeredBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

vaccinationSchema.virtual('familyMember')
  .get(function getFamilyMember() {
    return this.patient;
  })
  .set(function setFamilyMember(value) {
    this.patient = value;
  });

vaccinationSchema.virtual('doseNumber')
  .get(function getDoseNumber() {
    return this.dose;
  })
  .set(function setDoseNumber(value) {
    this.dose = value;
  });

vaccinationSchema.virtual('nextDueDate')
  .get(function getNextDueDate() {
    return this.dueDate;
  })
  .set(function setNextDueDate(value) {
    this.dueDate = value;
  });

vaccinationSchema.virtual('dateAdministered')
  .get(function getDateAdministered() {
    return this.administeredDate;
  })
  .set(function setDateAdministered(value) {
    this.administeredDate = value;
  });

const Vaccination = mongoose.model('Vaccination', vaccinationSchema);

export default Vaccination;