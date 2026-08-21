import Profile from '../models/Profile.js';

// @desc    Get authenticated user's profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    // Find existing profile or create a default one
    let profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await Profile.create({ userId: req.user._id });
    }

    res.json({
      _id: profile._id,
      userId: profile.userId,
      name: req.user.name,
      email: req.user.email,
      phone: profile.phone,
      gender: profile.gender,
      dateOfBirth: profile.dateOfBirth,
      bloodGroup: profile.bloodGroup,
      address: profile.address,
      emergencyNotes: profile.emergencyNotes,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update authenticated user's profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { phone, gender, dateOfBirth, bloodGroup, address, emergencyNotes } = req.body;

    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth || null;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (address !== undefined) updateData.address = address;
    if (emergencyNotes !== undefined) updateData.emergencyNotes = emergencyNotes;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({
      _id: profile._id,
      userId: profile.userId,
      name: req.user.name,
      email: req.user.email,
      phone: profile.phone,
      gender: profile.gender,
      dateOfBirth: profile.dateOfBirth,
      bloodGroup: profile.bloodGroup,
      address: profile.address,
      emergencyNotes: profile.emergencyNotes,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};
