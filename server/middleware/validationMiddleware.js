export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = {};

  if (!name || name.trim() === '') {
    errors.name = 'Name is required';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Please add a valid email';
    }
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (Object.keys(errors).length > 0) {
    res.status(400);
    return next(new Error(JSON.stringify(errors)));
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Please add a valid email';
    }
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    res.status(400);
    return next(new Error(JSON.stringify(errors)));
  }

  next();
};

// -------------------------------------------------------------------
// Family Member Validation
// -------------------------------------------------------------------
const VALID_RELATIONS = ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Other'];
const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export const validateFamilyMember = (req, res, next) => {
  const { name, relation, age, bloodGroup, heightCm, weightKg } = req.body;
  const errors = {};

  if (!name || name.trim() === '') {
    errors.name = 'Name is required';
  }

  if (!relation) {
    errors.relation = 'Relation is required';
  } else if (!VALID_RELATIONS.includes(relation)) {
    errors.relation = `Relation must be one of: ${VALID_RELATIONS.join(', ')}`;
  }

  if (age === undefined || age === null || age === '') {
    errors.age = 'Age is required';
  } else if (isNaN(Number(age)) || Number(age) < 0 || Number(age) > 150) {
    errors.age = 'Age must be a valid number between 0 and 150';
  }

  if (bloodGroup && !VALID_BLOOD_GROUPS.includes(bloodGroup)) {
    errors.bloodGroup = `Blood group must be one of: ${VALID_BLOOD_GROUPS.join(', ')}`;
  }

  if (heightCm !== undefined && heightCm !== null && heightCm !== '') {
    const h = Number(heightCm);
    if (isNaN(h) || h < 50 || h > 300) {
      errors.heightCm = 'Height must be a number between 50 and 300 cm';
    }
  }

  if (weightKg !== undefined && weightKg !== null && weightKg !== '') {
    const w = Number(weightKg);
    if (isNaN(w) || w < 1 || w > 700) {
      errors.weightKg = 'Weight must be a number between 1 and 700 kg';
    }
  }

  if (Object.keys(errors).length > 0) {
    res.status(400);
    return next(new Error(JSON.stringify(errors)));
  }

  next();
};

// -------------------------------------------------------------------
// Appointment Validation
// -------------------------------------------------------------------
const VALID_STATUSES = ['Scheduled', 'Completed', 'Cancelled'];

export const validateAppointment = (req, res, next) => {
  const { doctorName, hospital, appointmentDate, status } = req.body;
  const errors = {};

  if (!doctorName || doctorName.trim() === '') {
    errors.doctorName = 'Doctor name is required';
  }

  if (!hospital || hospital.trim() === '') {
    errors.hospital = 'Hospital or clinic name is required';
  }

  if (!appointmentDate) {
    errors.appointmentDate = 'Appointment date is required';
  } else if (isNaN(new Date(appointmentDate).getTime())) {
    errors.appointmentDate = 'Appointment date must be a valid date';
  }

  if (status && !VALID_STATUSES.includes(status)) {
    errors.status = `Status must be one of: ${VALID_STATUSES.join(', ')}`;
  }

  if (Object.keys(errors).length > 0) {
    res.status(400);
    return next(new Error(JSON.stringify(errors)));
  }

  next();
};

// -------------------------------------------------------------------
// Reminder Validation
// -------------------------------------------------------------------
const isValidDateValue = (value) => value !== undefined && value !== null && value !== '' && !Number.isNaN(new Date(value).getTime());

const isBooleanLike = (value) => typeof value === 'boolean' || value === 'true' || value === 'false';

export const validateReminder = (req, res, next) => {
  const { patient, familyMember, medicineName, dosage, frequency, reminderTimes, times, startDate, endDate, active, isActive } = req.body;
  const errors = {};
  const isCreate = req.method === 'POST';
  const resolvedTimes = reminderTimes ?? times;
  const resolvedPatient = patient ?? familyMember;
  const resolvedActive = active ?? isActive;

  if (isCreate || resolvedPatient !== undefined) {
    if (!resolvedPatient) {
      errors.patient = 'Patient is required';
    }
  }

  if (isCreate || medicineName !== undefined) {
    if (!medicineName || medicineName.trim() === '') {
      errors.medicineName = 'Medicine name is required';
    }
  }

  if (isCreate || dosage !== undefined) {
    if (!dosage || dosage.trim() === '') {
      errors.dosage = 'Dosage is required';
    }
  }

  if (isCreate || frequency !== undefined) {
    if (!frequency || frequency.trim() === '') {
      errors.frequency = 'Frequency is required';
    }
  }

  if (isCreate || resolvedTimes !== undefined) {
    if (!Array.isArray(resolvedTimes) || resolvedTimes.length === 0) {
      errors.reminderTimes = 'Reminder times must be a non-empty array';
    } else if (resolvedTimes.some((time) => typeof time !== 'string' || time.trim() === '')) {
      errors.reminderTimes = 'Reminder times must contain only non-empty strings';
    }
  }

  if (startDate !== undefined && startDate !== null && startDate !== '' && !isValidDateValue(startDate)) {
    errors.startDate = 'Start date must be a valid date';
  }

  if (endDate !== undefined && endDate !== null && endDate !== '' && !isValidDateValue(endDate)) {
    errors.endDate = 'End date must be a valid date';
  }

  if (startDate && endDate && isValidDateValue(startDate) && isValidDateValue(endDate)) {
    if (new Date(endDate) < new Date(startDate)) {
      errors.endDate = 'End date cannot be earlier than start date';
    }
  }

  if (resolvedActive !== undefined && !isBooleanLike(resolvedActive)) {
    errors.active = 'Active must be a boolean value';
  }

  if (Object.keys(errors).length > 0) {
    res.status(400);
    return next(new Error(JSON.stringify(errors)));
  }

  next();
};

// -------------------------------------------------------------------
// Vaccination Validation
// -------------------------------------------------------------------
export const validateVaccination = (req, res, next) => {
  const { patient, familyMember, vaccineName, dose, doseNumber, dueDate, nextDueDate, administeredDate, dateAdministered, status, notes } = req.body;
  const errors = {};
  const isCreate = req.method === 'POST';
  const resolvedPatient = patient ?? familyMember;
  const resolvedDose = dose ?? doseNumber;
  const resolvedDueDate = dueDate ?? nextDueDate;
  const resolvedAdministeredDate = administeredDate ?? dateAdministered;

  if (isCreate || resolvedPatient !== undefined) {
    if (!resolvedPatient) {
      errors.patient = 'Patient is required';
    }
  }

  if (isCreate || vaccineName !== undefined) {
    if (!vaccineName || vaccineName.trim() === '') {
      errors.vaccineName = 'Vaccine name is required';
    }
  }

  if (isCreate || resolvedDose !== undefined) {
    const doseNumberValue = Number(resolvedDose);
    if (resolvedDose === '' || resolvedDose === null || resolvedDose === undefined || Number.isNaN(doseNumberValue) || doseNumberValue < 1) {
      errors.dose = 'Dose must be a valid positive number';
    }
  }

  if (resolvedDueDate !== undefined && resolvedDueDate !== null && resolvedDueDate !== '' && !isValidDateValue(resolvedDueDate)) {
    errors.dueDate = 'Due date must be a valid date';
  }

  if (resolvedAdministeredDate !== undefined && resolvedAdministeredDate !== null && resolvedAdministeredDate !== '' && !isValidDateValue(resolvedAdministeredDate)) {
    errors.administeredDate = 'Administered date must be a valid date';
  }

  if (status !== undefined) {
    const validStatuses = ['Scheduled', 'Administered', 'Overdue'];
    if (!validStatuses.includes(status)) {
      errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
    }
  }

  if (status === 'Administered' && !resolvedAdministeredDate && isCreate) {
    errors.administeredDate = 'Administered date is required when status is Administered';
  }

  if (notes !== undefined && typeof notes !== 'string') {
    errors.notes = 'Notes must be a string';
  }

  if (Object.keys(errors).length > 0) {
    res.status(400);
    return next(new Error(JSON.stringify(errors)));
  }

  next();
};
