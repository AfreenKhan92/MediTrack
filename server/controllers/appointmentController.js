import Appointment from '../models/Appointment.js';

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res, next) => {
  try {
    const {
      doctorName,
      specialty,
      hospital,
      appointmentDate,
      status,
      notes,
      familyMember,
    } = req.body;

    const appointment = await Appointment.create({
      user: req.user._id,
      familyMember: familyMember || null,
      doctorName,
      specialty,
      hospital,
      appointmentDate,
      status: status || 'Scheduled',
      notes,
    });

    // Populate family member details in response
    await appointment.populate('familyMember', 'name relation');

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments for logged-in user
// @route   GET /api/appointments
// @access  Private
// @query   status=Scheduled|Completed|Cancelled  (optional filter)
// @query   familyMember=<id>                     (optional filter)
export const getAppointments = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.familyMember) {
      filter.familyMember = req.query.familyMember;
    }

    const appointments = await Appointment.find(filter)
      .populate('familyMember', 'name relation')
      .sort({ appointmentDate: 1 }); // Soonest first

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      'familyMember',
      'name relation age bloodGroup'
    );

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    if (appointment.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this appointment');
    }

    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    if (appointment.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this appointment');
    }

    const {
      doctorName,
      specialty,
      hospital,
      appointmentDate,
      status,
      notes,
      familyMember,
    } = req.body;

    appointment.doctorName = doctorName ?? appointment.doctorName;
    appointment.specialty = specialty ?? appointment.specialty;
    appointment.hospital = hospital ?? appointment.hospital;
    appointment.appointmentDate = appointmentDate ?? appointment.appointmentDate;
    appointment.status = status ?? appointment.status;
    appointment.notes = notes ?? appointment.notes;
    appointment.familyMember = familyMember !== undefined ? familyMember : appointment.familyMember;

    const updated = await appointment.save();
    await updated.populate('familyMember', 'name relation');

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }

    if (appointment.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this appointment');
    }

    await appointment.deleteOne();
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
