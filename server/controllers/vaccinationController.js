import Vaccination from '../models/Vaccination.js';

const normalizeVaccinationPayload = (body) => {
  const patient = body.patient ?? body.familyMember;
  const dose = body.dose ?? body.doseNumber;
  const dueDate = body.dueDate ?? body.nextDueDate;
  const administeredDate = body.administeredDate ?? body.dateAdministered;

  return {
    patient,
    vaccineName: body.vaccineName,
    dose,
    dueDate,
    administeredDate,
    status: body.status,
    notes: body.notes,
    administeredBy: body.administeredBy,
  };
};

const resolveStatus = (status, administeredDate) => {
  if (status) {
    return status;
  }

  if (administeredDate) {
    return 'Administered';
  }

  return 'Scheduled';
};

// @desc    Get all vaccinations for logged-in user
// @route   GET /api/vaccinations
// @access  Private
export const getVaccinations = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const vaccinations = await Vaccination.find(filter)
      .populate('patient', 'name relation')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json(vaccinations);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single vaccination by ID
// @route   GET /api/vaccinations/:id
// @access  Private
export const getVaccinationById = async (req, res, next) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id).populate('patient', 'name relation');

    if (!vaccination) {
      res.status(404);
      throw new Error('Vaccination record not found');
    }

    if (vaccination.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this vaccination record');
    }

    res.json(vaccination);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new vaccination record
// @route   POST /api/vaccinations
// @access  Private
export const createVaccination = async (req, res, next) => {
  try {
    const payload = normalizeVaccinationPayload(req.body);

    const vaccination = await Vaccination.create({
      user: req.user._id,
      patient: payload.patient,
      vaccineName: payload.vaccineName,
      dose: payload.dose,
      dueDate: payload.dueDate,
      administeredDate: payload.administeredDate,
      status: resolveStatus(payload.status, payload.administeredDate),
      notes: payload.notes,
      administeredBy: payload.administeredBy,
    });

    const createdVaccination = await Vaccination.findById(vaccination._id).populate('patient', 'name relation');
    res.status(201).json(createdVaccination);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a vaccination record
// @route   PUT /api/vaccinations/:id
// @access  Private
export const updateVaccination = async (req, res, next) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);

    if (!vaccination) {
      res.status(404);
      throw new Error('Vaccination record not found');
    }

    if (vaccination.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this vaccination record');
    }

    const payload = normalizeVaccinationPayload(req.body);

    if (payload.patient !== undefined) vaccination.patient = payload.patient;
    if (payload.vaccineName !== undefined) vaccination.vaccineName = payload.vaccineName;
    if (payload.dose !== undefined) vaccination.dose = payload.dose;
    if (payload.dueDate !== undefined) vaccination.dueDate = payload.dueDate;
    if (payload.administeredDate !== undefined) vaccination.administeredDate = payload.administeredDate;
    if (payload.status !== undefined || payload.administeredDate !== undefined) {
      vaccination.status = resolveStatus(payload.status ?? vaccination.status, payload.administeredDate ?? vaccination.administeredDate);
    }
    if (payload.notes !== undefined) vaccination.notes = payload.notes;
    if (payload.administeredBy !== undefined) vaccination.administeredBy = payload.administeredBy;

    const updatedVaccination = await vaccination.save();
    await updatedVaccination.populate('patient', 'name relation');

    res.json(updatedVaccination);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a vaccination record
// @route   DELETE /api/vaccinations/:id
// @access  Private
export const deleteVaccination = async (req, res, next) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);

    if (!vaccination) {
      res.status(404);
      throw new Error('Vaccination record not found');
    }

    if (vaccination.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this vaccination record');
    }

    await vaccination.deleteOne();
    res.json({ message: 'Vaccination record deleted successfully' });
  } catch (error) {
    next(error);
  }
};