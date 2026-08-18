import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Filter,
  ToggleLeft,
  ToggleRight,
  CheckCircle2
} from 'lucide-react';
import reminderService from '../services/reminderService';
import familyService from '../services/familyService';
import { showToast } from '../utils/toast';
import { SkeletonLoader } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';

// Reusable Medicine Reminder Modal (Add / Edit)
const ReminderModal = ({ isOpen, onClose, onSubmit, reminder, familyMembers, loading }) => {
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [timesString, setTimesString] = useState('09:00');
  const [familyMember, setFamilyMember] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (reminder) {
      setMedicineName(reminder.medicineName || '');
      setDosage(reminder.dosage || '');
      setFrequency(reminder.frequency || 'Daily');
      setTimesString(reminder.times ? reminder.times.join(', ') : '09:00');
      setFamilyMember(reminder.familyMember?._id || reminder.familyMember || '');
      setIsActive(reminder.isActive !== undefined ? reminder.isActive : true);
      setNotes(reminder.notes || '');
    } else {
      setMedicineName('');
      setDosage('');
      setFrequency('Daily');
      setTimesString('09:00');
      setFamilyMember('');
      setIsActive(true);
      setNotes('');
    }
    setValidationError('');
  }, [reminder, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!medicineName.trim()) {
      setValidationError('Medicine name is required');
      return;
    }

    if (!dosage.trim()) {
      setValidationError('Dosage description is required');
      return;
    }

    if (!timesString.trim()) {
      setValidationError('At least one alert time is required');
      return;
    }

    const times = timesString
      .split(',')
      .map(t => t.trim())
      .filter(t => Boolean(t));

    if (times.length === 0) {
      setValidationError('Please enter times (e.g. 08:00, 20:00)');
      return;
    }

    onSubmit({
      medicineName,
      dosage,
      frequency,
      times,
      familyMember: familyMember || null,
      isActive,
      notes
    });
  };

  const frequencies = ['Daily', 'Twice Daily', 'Three Times Daily', 'Weekly', 'As Needed'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 shadow-xl rounded-xl w-full max-w-form p-6 sm:p-8 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
          <h3 className="text-subtitle font-bold text-gray-900 flex items-center gap-2">
            <Bell size={18} className="text-gray-900" />
            {reminder ? 'Edit Medicine Reminder' : 'Set Medication Reminder'}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-caption font-medium">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="form-group mb-0">
            <label className="form-label">Medicine Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Amoxicillin, Paracetamol"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="form-label">Dosage</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 500mg, 1 Tablet, 5ml"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Frequency</label>
              <select 
                className="form-select"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                disabled={loading}
              >
                {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Alert Times (Comma separated, e.g. 08:00, 20:00)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="08:00, 14:00, 20:00"
              value={timesString}
              onChange={(e) => setTimesString(e.target.value)}
              disabled={loading}
              required
            />
          </div>

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
                {familyMembers.map(m => (
                  <option key={m._id} value={m._id}>{m.name} ({m.relation})</option>
                ))}
              </select>
            </div>

            <div className="form-group mb-0 flex items-center justify-between pt-6 px-3 bg-gray-50 rounded-lg border border-gray-200">
              <label className="form-label cursor-pointer mb-0">Active Schedule</label>
              <button 
                type="button" 
                onClick={() => setIsActive(!isActive)}
                className="text-gray-700 hover:text-black transition-colors"
              >
                {isActive ? (
                  <ToggleRight size={28} className="text-black" />
                ) : (
                  <ToggleLeft size={28} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Special Instructions (Optional)</label>
            <textarea 
              className="form-textarea" 
              placeholder="e.g. Take after meals, dissolve in water..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows="3"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 mt-5">
            <Button 
              variant="secondary"
              onClick={onClose} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              loading={loading}
            >
              {reminder ? 'Save Changes' : 'Add Medication'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Reminders Page Component
const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('All');
  const [memberFilter, setMemberFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  const mockFamilyMembers = [
    { _id: 'mock1', name: 'John Doe', relation: 'Self' },
    { _id: 'mock2', name: 'Jane Doe', relation: 'Spouse' },
    { _id: 'mock3', name: 'Leo Doe', relation: 'Child' }
  ];

  const mockReminders = [
    {
      _id: 'mock1',
      medicineName: 'Amoxicillin',
      dosage: '250mg',
      frequency: 'Three times daily',
      times: ['08:00', '14:00', '20:00'],
      familyMember: { _id: 'mock3', name: 'Leo Doe', relation: 'Child' },
      isActive: true,
      notes: 'Finish the complete 7-day course. Take after food.'
    },
    {
      _id: 'mock2',
      medicineName: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Daily',
      times: ['21:00'],
      familyMember: null,
      isActive: true,
      notes: 'Take before bedtime.'
    },
    {
      _id: 'mock3',
      medicineName: 'Cetirizine',
      dosage: '10mg',
      frequency: 'As Needed',
      times: ['08:00'],
      familyMember: { _id: 'mock2', name: 'Jane Doe', relation: 'Spouse' },
      isActive: false,
      notes: 'For seasonal pollen allergies.'
    }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [remindersData, membersData] = await Promise.all([
        reminderService.getReminders(),
        familyService.getMembers()
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
  };

  useEffect(() => {
    fetchData();
  }, []);

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
          const matchedMember = familyMembers.find(m => m._id === formData.familyMember) || null;
          setReminders(reminders.map(r => r._id === selectedReminder._id 
            ? { ...r, ...formData, familyMember: matchedMember } 
            : r
          ));
        } else {
          const updated = await reminderService.updateReminder(selectedReminder._id, formData);
          setReminders(reminders.map(r => r._id === selectedReminder._id ? updated : r));
        }
        showToast.success(`Reminder for ${formData.medicineName} updated!`);
      } else {
        if (offlineMode) {
          const matchedMember = familyMembers.find(m => m._id === formData.familyMember) || null;
          const mockNewReminder = {
            _id: 'local_' + Date.now(),
            ...formData,
            familyMember: matchedMember
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
    if (!window.confirm('Are you sure you want to permanently delete this medicine reminder?')) {
      return;
    }

    try {
      if (id.startsWith('mock') || id.startsWith('local_')) {
        setReminders(reminders.filter(r => r._id !== id));
      } else {
        await reminderService.deleteReminder(id);
        setReminders(reminders.filter(r => r._id !== id));
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
        setReminders(reminders.map(r => r._id === reminder._id ? { ...r, isActive: updatedStatus } : r));
      } else {
        const updated = await reminderService.updateReminder(reminder._id, { isActive: updatedStatus });
        setReminders(reminders.map(r => r._id === reminder._id ? updated : r));
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

  const filteredReminders = reminders.filter(reminder => {
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
          <h2 className="page-title text-gray-900 font-bold">
            Medicine Reminders
          </h2>
          <p className="page-subtitle text-gray-500">Configure pill trackers and dosage schedules for your family</p>
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

      {/* Offline Alert Warning */}
      {error && (
        <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-700 px-3.5 py-2.5 rounded-lg text-caption font-medium">
          <AlertCircle size={16} className="text-gray-900" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <Card className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3" hoverable={false}>
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={14} className="text-gray-400" />
          {statuses.map(st => (
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

        {/* Family Member Filter */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Patient:</label>
          <select 
            className="form-select py-1.5 px-3 text-caption w-44 bg-gray-50 border-gray-200"
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
          >
            <option value="All">All family members</option>
            <option value="Self">Self</option>
            {familyMembers.map(m => (
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
          {filteredReminders.map(reminder => (
            <Card key={reminder._id} className="flex flex-col justify-between group animate-fade-in space-y-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-body font-bold text-gray-900 leading-tight">
                      {reminder.medicineName}
                    </h4>
                    <p className="text-caption text-gray-500 mt-0.5 font-medium">
                      Dosage: <span className="text-gray-900 font-semibold">{reminder.dosage}</span> • {reminder.frequency}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleToggleStatus(reminder)}
                      className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                      title={reminder.isActive ? 'Pause Reminder' : 'Activate Reminder'}
                    >
                      {reminder.isActive ? <ToggleRight size={18} className="text-black" /> : <ToggleLeft size={18} className="text-gray-400" />}
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

                {/* Patient & Active Indicators */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-gray-200">
                  <Badge variant={reminder.isActive ? 'primary' : 'secondary'} className="text-[9px]">
                    {reminder.isActive ? 'Active' : 'Paused'}
                  </Badge>
                  <Badge variant="secondary" className="text-[9px]">
                    {reminder.familyMember ? `${reminder.familyMember.name}` : 'Self'}
                  </Badge>
                </div>

                {/* Times Badges */}
                <div className="space-y-1 pt-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Clock size={11} />
                    Scheduled Alarm Times
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {reminder.times && reminder.times.map((t, idx) => (
                      <span key={idx} className="bg-gray-100 border border-gray-200 text-gray-900 text-caption font-semibold px-2.5 py-0.5 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Special Instructions Notes */}
                {reminder.notes && (
                  <p className="text-caption text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-snug">
                    "{reminder.notes}"
                  </p>
                )}
              </div>

              {/* Taken Button */}
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

      {/* Form Modal */}
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
