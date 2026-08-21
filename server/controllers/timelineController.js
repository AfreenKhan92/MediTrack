import MedicalReport from '../models/MedicalReport.js';
import Appointment from '../models/Appointment.js';
import Reminder from '../models/Reminder.js';
import Vaccination from '../models/Vaccination.js';

// ─── Normalizers ──────────────────────────────────────────────────────────────

const normalizeReport = (r) => ({
  id: r._id.toString(),
  type: 'report',
  title: r.title,
  description: r.category ? `${r.category} record uploaded.` : 'Medical report uploaded.',
  date: r.date || r.createdAt,
  familyMember: r.patientName || 'Self',
  status: 'Completed',
  relatedRecordId: r._id.toString(),
});

const normalizeAppointment = (a) => ({
  id: a._id.toString(),
  type: 'appointment',
  title: `Appointment – Dr. ${a.doctorName}`,
  description: [a.specialty, a.hospital].filter(Boolean).join(' · '),
  date: a.appointmentDate || a.createdAt,
  familyMember: a.familyMember?.name || 'Self',
  status: a.status || 'Scheduled',
  relatedRecordId: a._id.toString(),
});

const normalizeMedicine = (m) => ({
  id: m._id.toString(),
  type: 'medicine',
  title: `Medicine – ${m.medicineName}`,
  description: `${m.dosage} · ${m.frequency}`,
  date: m.startDate || m.createdAt,
  familyMember: m.patient?.name || 'Self',
  status: m.active ? 'Active' : 'Inactive',
  relatedRecordId: m._id.toString(),
});

const formatDoseLabel = (dose) => {
  if (dose === null || dose === undefined || dose === '') return '';
  const str = String(dose).trim();
  if (/^\d+$/.test(str) || /^\d+\s*[-–—]\s*\d+$/.test(str)) {
    return `Dose #${str}`;
  }
  if (str.toLowerCase().startsWith('dose')) {
    return str;
  }
  return str;
};

const normalizeVaccination = (v) => ({
  id: v._id.toString(),
  type: 'vaccination',
  title: `${v.vaccineName} (${formatDoseLabel(v.dose)})`,
  description: v.administeredBy
    ? `Administered by ${v.administeredBy}`
    : v.notes || 'Vaccination record.',
  date: v.administeredDate || v.dueDate || v.createdAt,
  familyMember: v.patient?.name || 'Self',
  status: v.status || 'Scheduled',
  relatedRecordId: v._id.toString(),
});

// ─── Controller ───────────────────────────────────────────────────────────────

// @desc    Get merged health timeline for the logged-in user
// @route   GET /api/timeline
// @access  Private
export const getTimeline = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all 4 collections in parallel — no new data stored
    const [reports, appointments, reminders, vaccinations] = await Promise.all([
      MedicalReport.find({ user: userId }).sort({ date: -1 }).lean(),
      Appointment.find({ user: userId })
        .populate('familyMember', 'name relation')
        .sort({ appointmentDate: -1 })
        .lean(),
      Reminder.find({ user: userId })
        .populate('patient', 'name relation')
        .sort({ startDate: -1, createdAt: -1 })
        .lean(),
      Vaccination.find({ user: userId })
        .populate('patient', 'name relation')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Normalize every record into a unified timeline event shape
    const events = [
      ...reports.map(normalizeReport),
      ...appointments.map(normalizeAppointment),
      ...reminders.map(normalizeMedicine),
      ...vaccinations.map(normalizeVaccination),
    ];

    // Sort by date — newest first
    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(events);
  } catch (error) {
    next(error);
  }
};
