import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Clock, 
  Check, 
  AlertCircle, 
  Loader2, 
  Filter,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import reminderService from '../services/reminderService';
import familyService from '../services/familyService';

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

    // Process times: comma-separated HH:MM strings to array
    const times = timesString
      .split(',')
      .map(t => t.trim())
      .filter(t => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(t)); // Basic HH:MM regex check

    if (times.length === 0) {
      setValidationError('Please enter times in YYYY-MM-DD or 24-hour format (e.g. 08:00, 20:00)');
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-form p-6 sm:p-8 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-dark-border pb-4 mb-5">
          <h3 className="text-title text-white flex items-center gap-2">
            <Bell size={20} className="text-primary-400" />
            {reminder ? 'Edit Medicine Reminder' : 'Set Medication Reminder'}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="form-label">Dosage</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 500mg, 1 tablet"
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
            <label className="form-label">Alert Times (24h, Comma separated)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. 08:00, 14:00, 20:00"
              value={timesString}
              onChange={(e) => setTimesString(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="form-label">For Family Member</label>
              <select 
                className="form-select"
                value={familyMember}
                onChange={(e) => setFamilyMember(e.target.value)}
                disabled={loading}
              >
                <option value="">Self</option>
                {familyMembers.map(m => (
                  <option key={m._id} value={m._id}>{m.name} ({m.relation})</option>
                ))}
              </select>
            </div>

            {/* Active Status Checkbox */}
            <div className="form-group mb-0 flex items-center justify-between mt-6 px-1">
              <span className="text-overline text-gray-400 uppercase tracking-wider">Active Reminder</span>
              <button 
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
                disabled={loading}
              >
                {isActive ? (
                  <ToggleRight size={32} className="text-secondary-500" />
                ) : (
                  <ToggleLeft size={32} />
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
          <div className="flex gap-3 justify-end pt-4 border-t border-dark-border mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-outline py-2.5 px-4 text-xs"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary py-2.5 px-5 text-xs flex items-center gap-1.5"
              disabled={loading}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>{reminder ? 'Save Changes' : 'Add Medication'}</span>
            </button>
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

  // Fallback Mocks
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
      familyMember: null, // Self
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
        // Edit flow
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
      } else {
        // Add flow
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
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to submit medicine reminder form:', err);
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
    } catch (err) {
      console.error('Failed to delete reminder:', err);
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
    } catch (err) {
      console.error('Failed to toggle reminder status:', err);
    }
  };

  // Filter application
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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-500 mb-4" />
        <p className="text-gray-400 text-sm">Loading medication list...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h2 className="page-title text-gradient bg-gradient-to-r from-primary-400 to-secondary-400">
            Medicine Reminders
          </h2>
          <p className="page-subtitle">Configure pill trackers and dosage schedules for your family</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="btn btn-primary btn-sm self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={16} />
          Add Reminder
        </button>
      </div>

      {/* Offline Alert Warning */}
      {error && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2.5 rounded-xl text-sm animate-scale-in">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-gray-500" />
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all duration-200
                ${statusFilter === st 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              {st === 'All' ? 'All status' : st}
            </button>
          ))}
        </div>

        {/* Family Member Filter */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Patient:</label>
          <select 
            className="form-select py-1.5 px-3 text-xs w-44 bg-white/5 border-white/10"
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
      </div>

      {/* Reminders Cards Grid */}
      {filteredReminders.length === 0 ? (
        <div className="empty-state">
          <Bell size={48} className="mx-auto mb-4 text-gray-600 animate-pulse" />
          <h3 className="text-title text-gray-300 mb-2">No active reminders found</h3>
          <p className="text-body text-gray-500 max-w-sm mx-auto">
            Try adjusting your search filters or add a new medicine reminder.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReminders.map(reminder => (
            <div 
              key={reminder._id} 
              className={`glass-card flex flex-col justify-between group animate-fade-in border
                ${reminder.isActive ? 'border-white/5' : 'border-white/5 opacity-60'}`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
                      ${reminder.isActive 
                        ? 'bg-primary-500/10 text-primary-400' 
                        : 'bg-white/5 text-gray-500'}`}
                    >
                      <Bell size={18} />
                    </div>
                    <div>
                      <h4 className="text-body font-bold text-white leading-tight">
                        {reminder.medicineName}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        {reminder.dosage} • {reminder.frequency}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={() => handleOpenEditModal(reminder)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                      title="Edit Reminder"
                    >
                      <Pencil size={11} />
                    </button>
                    <button 
                      onClick={() => handleDeleteReminder(reminder._id)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 flex items-center justify-center text-gray-400 hover:text-red-400 transition-all duration-200"
                      title="Delete Reminder"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Patient Tag & Toggle Switch */}
                <div className="flex items-center justify-between pt-2.5 border-t border-dark-border">
                  <span className="badge badge-info text-[9px] py-0.5">
                    {reminder.familyMember ? `${reminder.familyMember.name} (${reminder.familyMember.relation})` : 'Self'}
                  </span>
                  
                  {/* Status Toggle Switch */}
                  <button 
                    onClick={() => handleToggleStatus(reminder)}
                    className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-white transition-colors duration-200"
                    title={reminder.isActive ? 'Deactivate reminder' : 'Activate reminder'}
                  >
                    <span>{reminder.isActive ? 'Active' : 'Paused'}</span>
                    {reminder.isActive ? (
                      <ToggleRight size={24} className="text-secondary-500" />
                    ) : (
                      <ToggleLeft size={24} />
                    )}
                  </button>
                </div>

                {/* Alarm Timings */}
                <div className="space-y-1.5 pt-1.5 text-caption text-gray-400">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Alert Times</p>
                  <div className="flex flex-wrap gap-1.5">
                    {reminder.times.map((time, idx) => (
                      <span key={idx} className="flex items-center gap-1 px-2.5 py-1 bg-black/30 border border-white/5 rounded-lg text-xs text-white">
                        <Clock size={10} className="text-gray-500" />
                        {time}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Instructions / Notes */}
                {reminder.notes && (
                  <p className="text-caption text-gray-500 italic bg-black/25 p-2.5 rounded-lg leading-snug">
                    "{reminder.notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reminder Form Modal */}
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
