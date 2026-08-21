import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  X,
  Clock,
  AlertCircle,
  Filter,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  CalendarDays,
  Stethoscope,
} from 'lucide-react';
import reminderService from '../services/reminderService';
import familyService from '../services/familyService';
import { showToast } from '../utils/toast';
import { SkeletonLoader } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';

// â”€â”€â”€ Time conversion helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Converts a structured time object { hour, minute, period } to a 24-hour "HH:MM" string.
 */
const toReminderTime = ({ hour, minute, period }) => {
  let h = parseInt(hour, 10);
  if (period === 'AM') {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${String(h).padStart(2, '0')}:${minute}`;
};

/**
 * Parses a 24-hour "HH:MM" string into { hour, minute, period }.
 */
const fromReminderTime = (timeStr) => {
  if (!timeStr || !timeStr.includes(':')) {
    return { hour: '09', minute: '00', period: 'AM' };
  }
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const period = h < 12 ? 'AM' : 'PM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return { hour: String(h).padStart(2, '0'), minute: mStr || '00', period };
};

/** Sensible defaults for each frequency. */
const defaultTimesForFrequency = (freq) => {
  switch (freq) {
    case 'Twice Daily':
      return [fromReminderTime('09:00'), fromReminderTime('21:00')];
    case 'Thrice Daily':
    case 'Three Times Daily':
      return [fromReminderTime('08:00'), fromReminderTime('14:00'), fromReminderTime('21:00')];
    default:
      return [fromReminderTime('09:00')];
  }
};

const HOURS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const MINUTES = ['00','05','10','15','20','25','30','35','40','45','50','55'];
const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const FREQUENCIES = ['Daily', 'Twice Daily', 'Thrice Daily', 'Weekly', 'As Needed'];

// â”€â”€â”€ TimePicker sub-component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TimePicker = ({ value, onChange, label, disabled }) => {
  const update = (key, val) => onChange({ ...value, [key]: val });

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      )}
      <div className="flex items-center gap-1.5">
        {/* Hour */}
        <select
          value={value.hour}
          onChange={(e) => update('hour', e.target.value)}
          disabled={disabled}
          className="flex-1 min-w-0 py-2 px-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors appearance-none text-center"
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <span className="text-gray-400 font-bold text-sm select-none">:</span>

        {/* Minute */}
        <select
          value={value.minute}
          onChange={(e) => update('minute', e.target.value)}
          disabled={disabled}
          className="flex-1 min-w-0 py-2 px-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors appearance-none text-center"
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* AM/PM */}
        <select
          value={value.period}
          onChange={(e) => update('period', e.target.value)}
          disabled={disabled}
          className="py-2 px-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors appearance-none"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
};

// â”€â”€â”€ Schedule Section sub-component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ScheduleSection = ({ frequency, scheduleTimes, onTimesChange, weeklyDay, onWeeklyDayChange, disabled }) => {
  const isFixed2 = frequency === 'Twice Daily';
  const isFixed3 = frequency === 'Thrice Daily' || frequency === 'Three Times Daily';
  const isWeekly = frequency === 'Weekly';
  const isFixed = isFixed2 || isFixed3;

  const updateTime = (index, newVal) => {
    const updated = [...scheduleTimes];
    updated[index] = newVal;
    onTimesChange(updated);
  };

  const addTime = () => {
    onTimesChange([...scheduleTimes, fromReminderTime('12:00')]);
  };

  const removeTime = (index) => {
    if (scheduleTimes.length <= 1) return;
    onTimesChange(scheduleTimes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock size={13} className="text-blue-600 flex-shrink-0" />
        <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
          {isWeekly ? 'Weekly Schedule' : 'Medication Times'}
        </p>
      </div>

      {isWeekly && (
        <div className="form-group mb-0">
          <label className="form-label">Day of Week</label>
          <select
            className="form-select"
            value={weeklyDay}
            onChange={(e) => onWeeklyDayChange(e.target.value)}
            disabled={disabled}
          >
            {WEEKDAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2.5">
        {scheduleTimes.map((t, idx) => (
          <div
            key={idx}
            className="flex items-end gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl"
          >
            <TimePicker
              label={scheduleTimes.length > 1 ? `Time ${idx + 1}` : (isWeekly ? 'Time' : undefined)}
              value={t}
              onChange={(val) => updateTime(idx, val)}
              disabled={disabled}
            />
            {!isFixed && scheduleTimes.length > 1 && (
              <button
                type="button"
                onClick={() => removeTime(idx)}
                disabled={disabled}
                className="mb-0.5 w-7 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                title="Remove this time"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {frequency === 'Daily' && (
        <button
          type="button"
          onClick={addTime}
          disabled={disabled}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-40"
        >
          <Plus size={13} />
          Add Another Time
        </button>
      )}
    </div>
  );
};

// â”€â”€â”€ ReminderModal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ReminderModal = ({ isOpen, onClose, onSubmit, reminder, familyMembers, loading }) => {
  const [medicineName, setMedicineName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [scheduleTimes, setScheduleTimes] = useState([fromReminderTime('09:00')]);
  const [weeklyDay, setWeeklyDay] = useState('Monday');
  const [familyMember, setFamilyMember] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  // Initialise form when modal opens or reminder changes
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});

    if (reminder) {
      setMedicineName(reminder.medicineName || '');
      setPurpose(reminder.purpose || '');
      setDosage(reminder.dosage || '');
      const freq = reminder.frequency || 'Daily';
      setFrequency(freq);

      const existingTimes = reminder.reminderTimes || reminder.times || [];
      if (existingTimes.length > 0) {
        setScheduleTimes(existingTimes.map(fromReminderTime));
      } else {
        setScheduleTimes(defaultTimesForFrequency(freq));
      }

      setWeeklyDay(reminder.weeklyDay || 'Monday');
      setFamilyMember(reminder.familyMember?._id || reminder.familyMember || '');
      setIsActive(reminder.active ?? reminder.isActive ?? true);
      setNotes(reminder.notes || '');
    } else {
      setMedicineName('');
      setPurpose('');
      setDosage('');
      setFrequency('Daily');
      setScheduleTimes([fromReminderTime('09:00')]);
      setWeeklyDay('Monday');
      setFamilyMember('');
      setIsActive(true);
      setNotes('');
    }
  }, [reminder, isOpen]);

  // When frequency changes, reset scheduleTimes to sensible defaults
  const handleFrequencyChange = (newFreq) => {
    setFrequency(newFreq);
    setScheduleTimes(defaultTimesForFrequency(newFreq));
    setErrors({});
  };

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!medicineName.trim()) errs.medicineName = 'Medicine name is required.';
    if (!dosage.trim()) errs.dosage = 'Dosage is required.';
    if (!frequency) errs.frequency = 'Frequency is required.';

    const times = scheduleTimes.map(toReminderTime);
    if (times.length === 0) errs.times = 'At least one time is required.';
    const uniqueTimes = [...new Set(times)];
    if (uniqueTimes.length !== times.length) errs.times = 'Duplicate times detected. Each slot must be unique.';

    if (frequency === 'Weekly' && !weeklyDay) errs.weeklyDay = 'Please select a day of the week.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const times = [...new Set(scheduleTimes.map(toReminderTime))];

    onSubmit({
      medicineName: medicineName.trim(),
      purpose: purpose.trim() || undefined,
      dosage: dosage.trim(),
      frequency,
      times,
      weeklyDay: frequency === 'Weekly' ? weeklyDay : undefined,
      familyMember: familyMember || null,
      isActive,
      notes: notes.trim() || undefined,
    });
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div
        className="bg-white border border-gray-200 shadow-xl rounded-2xl w-full max-w-lg p-6 sm:p-8 animate-scale-in max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="text-subtitle font-bold text-gray-900 leading-tight">
                {reminder ? 'Edit Medicine Reminder' : 'Set Medication Reminder'}
              </h3>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {reminder ? 'Update the schedule and dosage details.' : 'Configure a new dosage alert.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* â”€â”€ Validation summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {hasErrors && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-5 text-caption font-medium">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <ul className="space-y-0.5">
              {Object.values(errors).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* â”€â”€ Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <form onSubmit={handleFormSubmit} className="space-y-5">

          {/* 1. Medicine Name */}
          <div className="form-group mb-0">
            <label className="form-label">
              Medicine Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.medicineName ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="e.g. Amoxicillin, Metformin, Aspirin"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              disabled={loading}
              autoFocus
            />
            {errors.medicineName && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.medicineName}</p>
            )}
          </div>

          {/* 2. Purpose of Medication */}
          <div className="form-group mb-0">
            <label className="form-label flex items-center gap-1.5">
              <Stethoscope size={12} className="text-gray-400" />
              Purpose of Medication
              <span className="text-[10px] font-normal text-gray-400 ml-1">(Optional)</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Blood pressure, diabetes, pain relief, thyroid..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* 3. Dosage */}
          <div className="form-group mb-0">
            <label className="form-label">
              Dosage <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.dosage ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="e.g. 500mg, 1 Tablet, 5ml, 10mg"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              disabled={loading}
            />
            {errors.dosage && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.dosage}</p>
            )}
          </div>

          {/* â”€â”€ Schedule Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 space-y-4">
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarDays size={12} />
              Schedule
            </p>

            {/* 4. Frequency */}
            <div className="form-group mb-0">
              <label className="form-label">
                Frequency <span className="text-red-500">*</span>
              </label>
              <select
                className={`form-select ${errors.frequency ? 'border-red-400' : ''}`}
                value={frequency}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                disabled={loading}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* 5. Dynamic Schedule / Alert Times */}
            <div>
              {errors.times && (
                <p className="text-[11px] text-red-500 mb-2 font-medium flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.times}
                </p>
              )}
              <ScheduleSection
                frequency={frequency}
                scheduleTimes={scheduleTimes}
                onTimesChange={setScheduleTimes}
                weeklyDay={weeklyDay}
                onWeeklyDayChange={setWeeklyDay}
                disabled={loading}
              />
            </div>
          </div>

          {/* 6. Patient + Active */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="form-label">Patient Profile</label>
              <select
                className="form-select"
                value={familyMember}
                onChange={(e) => setFamilyMember(e.target.value)}
                disabled={loading}
              >
                <option value="">Self (Main User)</option>
                {familyMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.relation})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-0 flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <label className="form-label cursor-pointer mb-0 text-gray-800">Active Schedule</label>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {isActive ? 'Reminder is active' : 'Reminder is paused'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="text-gray-700 hover:text-black transition-colors flex-shrink-0"
              >
                {isActive ? (
                  <ToggleRight size={30} className="text-blue-600" />
                ) : (
                  <ToggleLeft size={30} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* 7. Special Instructions */}
          <div className="form-group mb-0">
            <label className="form-label">
              Special Instructions
              <span className="text-[10px] font-normal text-gray-400 ml-1">(Optional)</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Take after meals, dissolve in water, avoid dairy..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows="2"
            />
          </div>

          {/* â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {reminder ? 'Save Changes' : 'Add Medication'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


// â”€â”€â”€ Main Reminders Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

  const [statusFilter, setStatusFilter] = useState('All');
  const [memberFilter, setMemberFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  const mockFamilyMembers = [
    { _id: 'mock1', name: 'John Doe', relation: 'Self' },
    { _id: 'mock2', name: 'Jane Doe', relation: 'Spouse' },
    { _id: 'mock3', name: 'Leo Doe', relation: 'Child' },
  ];

  const mockReminders = [
    {
      _id: 'mock1',
      medicineName: 'Amoxicillin',
      purpose: 'Bacterial infection',
      dosage: '250mg',
      frequency: 'Thrice Daily',
      times: ['08:00', '14:00', '20:00'],
      familyMember: { _id: 'mock3', name: 'Leo Doe', relation: 'Child' },
      isActive: true,
      notes: 'Finish the complete 7-day course. Take after food.',
    },
    {
      _id: 'mock2',
      medicineName: 'Atorvastatin',
      purpose: 'High cholesterol',
      dosage: '20mg',
      frequency: 'Daily',
      times: ['21:00'],
      familyMember: null,
      isActive: true,
      notes: 'Take before bedtime.',
    },
    {
      _id: 'mock3',
      medicineName: 'Cetirizine',
      purpose: 'Seasonal allergies',
      dosage: '10mg',
      frequency: 'As Needed',
      times: ['08:00'],
      familyMember: { _id: 'mock2', name: 'Jane Doe', relation: 'Spouse' },
      isActive: false,
      notes: 'For seasonal pollen allergies.',
    },
  ];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [remindersData, membersData] = await Promise.all([
        reminderService.getReminders(),
        familyService.getMembers(),
      ]);
      setReminders(remindersData);
      setFamilyMembers(membersData);
      setOfflineMode(false);
      setError(null);
    } catch (err) {
      console.warn('Backend server not connected. Operating in offline mock data mode.');
      setReminders(mockReminders);
      setFamilyMembers(mockFamilyMembers);
      setOfflineMode(true);
      setError('Database server not connected. Operating in offline demonstration mode.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAddModal = () => {
    setSelectedReminder(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (reminder) => {
    setSelectedReminder(reminder);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (selectedReminder) {
        if (selectedReminder._id.startsWith('mock') || selectedReminder._id.startsWith('local_')) {
          const matchedMember = familyMembers.find((m) => m._id === formData.familyMember) || null;
          setReminders(
            reminders.map((r) =>
              r._id === selectedReminder._id ? { ...r, ...formData, familyMember: matchedMember } : r
            )
          );
        } else {
          const updated = await reminderService.updateReminder(selectedReminder._id, formData);
          setReminders(reminders.map((r) => (r._id === selectedReminder._id ? updated : r)));
        }
        showToast.success(`Reminder for ${formData.medicineName} updated!`);
      } else {
        if (offlineMode) {
          const matchedMember = familyMembers.find((m) => m._id === formData.familyMember) || null;
          const mockNewReminder = {
            _id: 'local_' + Date.now(),
            ...formData,
            familyMember: matchedMember,
          };
          setReminders([...reminders, mockNewReminder]);
        } else {
          const created = await reminderService.createReminder(formData);
          setReminders([...reminders, created]);
        }
        showToast.success(`Reminder for ${formData.medicineName} created!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to submit medicine reminder form:', err);
      showToast.error(err.response?.data?.message || 'Failed to save reminder.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this medicine reminder?')) return;
    try {
      if (id.startsWith('mock') || id.startsWith('local_')) {
        setReminders(reminders.filter((r) => r._id !== id));
      } else {
        await reminderService.deleteReminder(id);
        setReminders(reminders.filter((r) => r._id !== id));
      }
      showToast.success('Medicine reminder deleted.');
    } catch (err) {
      console.error('Failed to delete reminder:', err);
      showToast.error('Failed to delete reminder.');
    }
  };

  const handleToggleStatus = async (reminder) => {
    const updatedStatus = !reminder.isActive;
    try {
      if (reminder._id.startsWith('mock') || reminder._id.startsWith('local_')) {
        setReminders(
          reminders.map((r) => (r._id === reminder._id ? { ...r, isActive: updatedStatus } : r))
        );
      } else {
        const updated = await reminderService.updateReminder(reminder._id, { isActive: updatedStatus });
        setReminders(reminders.map((r) => (r._id === reminder._id ? updated : r)));
      }
      showToast.info(`${reminder.medicineName} reminder is now ${updatedStatus ? 'active' : 'paused'}.`);
    } catch (err) {
      console.error('Failed to toggle reminder status:', err);
      showToast.error('Failed to update status.');
    }
  };

  const handleMarkDoseTaken = (medicineName) => {
    showToast.success(`Marked ${medicineName} dose as taken!`);
  };

  const filteredReminders = reminders.filter((reminder) => {
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      matchesStatus = statusFilter === 'Active' ? reminder.isActive : !reminder.isActive;
    }

    let matchesMember = true;
    if (memberFilter !== 'All') {
      if (memberFilter === 'Self') {
        matchesMember = reminder.familyMember === null || reminder.familyMember === undefined;
      } else {
        const reminderMemberId = reminder.familyMember?._id || reminder.familyMember;
        matchesMember = reminderMemberId === memberFilter;
      }
    }

    return matchesStatus && matchesMember;
  });

  const statuses = ['All', 'Active', 'Inactive'];

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="page-header">
          <div className="w-48 h-7 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-72 h-4 bg-gray-100 rounded animate-pulse" />
        </div>
        <SkeletonLoader type="medication" count={6} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h2 className="page-title text-gray-900 font-bold">Medicine Reminders</h2>
          <p className="page-subtitle text-gray-500">
            Configure pill trackers and dosage schedules for your family
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto"
        >
          Add Medication
        </Button>
      </div>

      {/* Offline Alert */}
      {error && (
        <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-700 px-3.5 py-2.5 rounded-lg text-caption font-medium">
          <AlertCircle size={16} className="text-gray-900" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <Card className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3" hoverable={false}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={14} className="text-gray-400" />
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all
                ${statusFilter === st
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
            >
              {st === 'All' ? 'All status' : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Patient:</label>
          <select
            className="form-select py-1.5 px-3 text-caption w-44 bg-gray-50 border-gray-200"
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
          >
            <option value="All">All family members</option>
            <option value="Self">Self</option>
            {familyMembers.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Reminders Grid */}
      {filteredReminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No medicine reminders set"
          description="Stay consistent with prescription schedules by creating automated dosage alerts."
          actionText="Add Medication"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReminders.map((reminder) => (
            <Card
              key={reminder._id}
              className="flex flex-col justify-between group animate-fade-in space-y-4"
            >
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-body font-bold text-gray-900 leading-tight truncate">
                      {reminder.medicineName}
                    </h4>
                    {/* Purpose tag */}
                    {reminder.purpose && (
                      <p className="text-[11px] text-blue-600 font-semibold mt-0.5 flex items-center gap-1">
                        <Stethoscope size={10} />
                        {reminder.purpose}
                      </p>
                    )}
                    <p className="text-caption text-gray-500 mt-0.5 font-medium">
                      Dosage:{' '}
                      <span className="text-gray-900 font-semibold">{reminder.dosage}</span>
                      {' '}â€¢{' '}{reminder.frequency}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleStatus(reminder)}
                      className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors"
                      title={reminder.isActive ? 'Pause Reminder' : 'Activate Reminder'}
                    >
                      {reminder.isActive ? (
                        <ToggleRight size={18} className="text-blue-600" />
                      ) : (
                        <ToggleLeft size={18} className="text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(reminder)}
                      className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                      title="Edit Reminder"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder._id)}
                      className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Reminder"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                  <Badge variant={reminder.isActive ? 'primary' : 'secondary'} className="text-[9px]">
                    {reminder.isActive ? 'Active' : 'Paused'}
                  </Badge>
                  <Badge variant="secondary" className="text-[9px]">
                    {reminder.familyMember ? `${reminder.familyMember.name}` : 'Self'}
                  </Badge>
                </div>

                {/* Scheduled times â€” displayed in 12h format */}
                <div className="space-y-1 pt-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Clock size={11} />
                    Scheduled Times
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(reminder.reminderTimes || reminder.times || []).map((t, idx) => {
                      const parsed = fromReminderTime(t);
                      const display = `${parsed.hour}:${parsed.minute} ${parsed.period}`;
                      return (
                        <span
                          key={idx}
                          className="bg-blue-50 border border-blue-100 text-blue-700 text-caption font-semibold px-2.5 py-0.5 rounded-md"
                        >
                          {display}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                {reminder.notes && (
                  <p className="text-caption text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-snug">
                    "{reminder.notes}"
                  </p>
                )}
              </div>

              {/* Mark Taken */}
              <Button
                variant="secondary"
                size="sm"
                icon={CheckCircle2}
                className="w-full justify-center mt-2"
                onClick={() => handleMarkDoseTaken(reminder.medicineName)}
              >
                Mark Taken
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <ReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        reminder={selectedReminder}
        familyMembers={familyMembers}
        loading={submitting}
      />
    </div>
  );
};

export default Reminders;
