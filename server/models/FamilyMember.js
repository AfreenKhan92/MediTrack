import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    relation: {
      type: String,
      required: [true, 'Relation is required'],
      enum: {
        values: ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Other'],
        message: '{VALUE} is not a valid relation type',
      },
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age must be a positive number'],
      max: [150, 'Age must be a valid number'],
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
        message: '{VALUE} is not a valid blood group',
      },
      default: 'Unknown',
    },
    allergies: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say',
    },
    dateOfBirth: {
      type: Date,
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

const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);
export default FamilyMember;
