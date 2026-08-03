import Reminder from '../models/Reminder.js';

const normalizeReminderPayload = (body) => {
  const reminderTimes = body.reminderTimes ?? body.times;
  const patient = body.patient ?? body.familyMember;
  const active = body.active ?? body.isActive;

  return {
    patient,
    medicineName: body.medicineName,
    dosage: body.dosage,
    frequency: body.frequency,
    reminderTimes,
    startDate: body.startDate,
    endDate: body.endDate,
    notes: body.notes,
    active,
  };
};

const parseBoolean = (value) => {
  if (value === true || value === false) {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
};

// @desc    Get all reminders for logged-in user
// @route   GET /api/reminders
// @access  Private
export const getReminders = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };

    if (req.query.active !== undefined) {
      filter.active = parseBoolean(req.query.active);
    }

    const reminders = await Reminder.find(filter)
      .populate('patient', 'name relation')
      .sort({ active: -1, startDate: 1, createdAt: -1 });

    res.json(reminders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single reminder by ID
// @route   GET /api/reminders/:id
// @access  Private
export const getReminderById = async (req, res, next) => {
  try {
    const reminder = await Reminder.findById(req.params.id).populate('patient', 'name relation');

    if (!reminder) {
      res.status(404);
      throw new Error('Reminder not found');
    }

    if (reminder.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this reminder');
    }

    res.json(reminder);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new reminder
// @route   POST /api/reminders
// @access  Private
export const createReminder = async (req, res, next) => {
  try {
    const payload = normalizeReminderPayload(req.body);

    const reminder = await Reminder.create({
      user: req.user._id,
      patient: payload.patient,
      medicineName: payload.medicineName,
      dosage: payload.dosage,
      frequency: payload.frequency,
      reminderTimes: payload.reminderTimes,
      startDate: payload.startDate ?? new Date(),
      endDate: payload.endDate,
      notes: payload.notes,
      active: parseBoolean(payload.active ?? true),
    });

    const createdReminder = await Reminder.findById(reminder._id).populate('patient', 'name relation');
    res.status(201).json(createdReminder);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a reminder
// @route   PUT /api/reminders/:id
// @access  Private
export const updateReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      res.status(404);
      throw new Error('Reminder not found');
    }

    if (reminder.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this reminder');
    }

    const payload = normalizeReminderPayload(req.body);

    if (payload.patient !== undefined) reminder.patient = payload.patient;
    if (payload.medicineName !== undefined) reminder.medicineName = payload.medicineName;
    if (payload.dosage !== undefined) reminder.dosage = payload.dosage;
    if (payload.frequency !== undefined) reminder.frequency = payload.frequency;
    if (payload.reminderTimes !== undefined) reminder.reminderTimes = payload.reminderTimes;
    if (payload.startDate !== undefined) reminder.startDate = payload.startDate;
    if (payload.endDate !== undefined) reminder.endDate = payload.endDate;
    if (payload.notes !== undefined) reminder.notes = payload.notes;
    if (payload.active !== undefined) reminder.active = parseBoolean(payload.active);

    const updatedReminder = await reminder.save();
    await updatedReminder.populate('patient', 'name relation');

    res.json(updatedReminder);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
export const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      res.status(404);
      throw new Error('Reminder not found');
    }

    if (reminder.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this reminder');
    }

    await reminder.deleteOne();
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    next(error);
  }
};