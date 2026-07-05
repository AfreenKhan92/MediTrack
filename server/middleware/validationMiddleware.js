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
  const { name, relation, age, bloodGroup } = req.body;
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
