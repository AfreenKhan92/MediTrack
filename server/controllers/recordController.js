import Record from '../models/Record.js';

// @desc    Get user's health records
// @route   GET /api/records
// @access  Private
export const getRecords = async (req, res, next) => {
  try {
    const records = await Record.find({ user: req.user._id }).sort({ dateOfRecord: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new health record
// @route   POST /api/records
// @access  Private
export const createRecord = async (req, res, next) => {
  const { title, patientName, recordType, doctor, dateOfRecord, notes, fileUrl } = req.body;

  try {
    const record = new Record({
      user: req.user._id,
      title,
      patientName,
      recordType,
      doctor,
      dateOfRecord,
      notes,
      fileUrl,
    });

    const createdRecord = await record.save();
    res.status(201).json(createdRecord);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a health record
// @route   DELETE /api/records/:id
// @access  Private
export const deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id);

    if (record) {
      if (record.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized');
      }
      await Record.deleteOne({ _id: req.params.id });
      res.json({ message: 'Record removed successfully' });
    } else {
      res.status(404);
      throw new Error('Record not found');
    }
  } catch (error) {
    next(error);
  }
};
