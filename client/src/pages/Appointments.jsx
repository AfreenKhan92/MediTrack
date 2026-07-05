import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Heart, 
  Clock, 
  MapPin, 
  User, 
  ShieldAlert, 
  AlertCircle,
  Loader2,
  Filter
} from 'lucide-react';
import appointmentService from '../services/appointmentService';
import familyService from '../services/familyService';

// Reusable Appointment Modal Component (Add / Edit)
const AppointmentModal = ({ isOpen, onClose, onSubmit, appointment, familyMembers, loading }) => {
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hospital, setHospital] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [familyMember, setFamilyMember] = useState('');
  const [status, setStatus] = useState('Scheduled');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (appointment) {
      setDoctorName(appointment.doctorName || '');
      setSpecialty(appointment.specialty || '');
      setHospital(appointment.hospital || '');
      
      // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
      if (appointment.appointmentDate) {
        const d = new Date(appointment.appointmentDate);
        const pad = (num) => String(num).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setAppointmentDate(formatted);
      } else {
        setAppointmentDate('');
      }
      
      setFamilyMember(appointment.familyMember?._id || appointment.familyMember || '');
      setStatus(appointment.status || 'Scheduled');
      setNotes(appointment.notes || '');
    } else {
      setDoctorName('');
      setSpecialty('');
      setHospital('');
      setAppointmentDate('');
      setFamilyMember('');
      setStatus('Scheduled');
      setNotes('');
    }
    setValidationError('');
  }, [appointment, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!doctorName.trim()) {
      setValidationError('Doctor name is required');
      return;
    }

    if (!hospital.trim()) {
      setValidationError('Hospital or clinic name is required');
      return;
    }

    if (!appointmentDate) {
      setValidationError('Appointment date and time is required');
      return;
    }

    onSubmit({
      doctorName,
      specialty,
      hospital,
      appointmentDate: new Date(appointmentDate).toISOString(),
      familyMember: familyMember || null,
      status,
      notes
    });
  };

  const statuses = ['Scheduled', 'Completed', 'Cancelled'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-form p-6 sm:p-8 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-dark-border pb-4 mb-5">
          <h3 className="text-title text-white flex items-center gap-2">
            <CalendarDays size={20} className="text-primary-400" />
            {appointment ? 'Edit Appointment Details' : 'Schedule Appointment'}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Verification Warning */}
        {validationError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="form-label">Doctor Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Dr. Robert Vance"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Specialty (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Cardiologist"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Hospital / Clinic</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Mercy Health Center"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Date & Time</label>
            <input 
              type="datetime-local" 
              className="form-input"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="form-group mb-0">
              <label className="form-label">Status</label>
              <select 
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                {statuses.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Notes (Optional)</label>
            <textarea 
              className="form-textarea" 
              placeholder="Reason for visit, symptoms, fasting instructions..."
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
              <span>{appointment ? 'Save Changes' : 'Book Visit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Appointments Page Component
const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
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
  const [selectedAppt, setSelectedAppt] = useState(null);

  // Fallback Mocks
  const mockFamilyMembers = [
    { _id: 'mock1', name: 'John Doe', relation: 'Self' },
    { _id: 'mock2', name: 'Jane Doe', relation: 'Spouse' },
    { _id: 'mock3', name: 'Leo Doe', relation: 'Child' }
  ];

  const mockAppointments = [
    {
      _id: 'mock1',
      doctorName: 'Sarah Jenkins',
      specialty: 'Pediatrician',
      hospital: 'St. Jude Hospital',
      appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 2).toISOString(),
      familyMember: { _id: 'mock3', name: 'Leo Doe', relation: 'Child' },
      status: 'Scheduled',
      notes: 'Routine 5-year checkup.'
    },
    {
      _id: 'mock2',
      doctorName: 'Robert Vance',
      specialty: 'Cardiologist',
      hospital: 'Mercy Center',
      appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 5).toISOString(),
      familyMember: null, // Self
      status: 'Scheduled',
      notes: 'Fasting required for blood tests prior to ECG.'
    },
    {
      _id: 'mock3',
      doctorName: 'Alan Grant',
      specialty: 'Dentist',
      hospital: 'Smile Dental Clinic',
      appointmentDate: new Date(Date.now() - 24 * 60 * 60 * 1000 * 4).toISOString(),
      familyMember: { _id: 'mock2', name: 'Jane Doe', relation: 'Spouse' },
      status: 'Completed',
      notes: 'Routine teeth cleaning.'
    }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptsData, membersData] = await Promise.all([
        appointmentService.getAppointments(),
        familyService.getMembers()
      ]);
      setAppointments(apptsData);
      setFamilyMembers(membersData);
      setOfflineMode(false);
      setError(null);
    } catch (err) {
      console.warn('Backend server not connected. Operating in offline mock data mode.');
      setAppointments(mockAppointments);
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
    setSelectedAppt(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (appt) => {
    setSelectedAppt(appt);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (selectedAppt) {
        // Edit flow
        if (selectedAppt._id.startsWith('mock') || selectedAppt._id.startsWith('local_')) {
          const matchedMember = familyMembers.find(m => m._id === formData.familyMember) || null;
          setAppointments(appointments.map(a => a._id === selectedAppt._id 
            ? { ...a, ...formData, familyMember: matchedMember } 
            : a
          ));
        } else {
          const updated = await appointmentService.updateAppointment(selectedAppt._id, formData);
          setAppointments(appointments.map(a => a._id === selectedAppt._id ? updated : a));
        }
      } else {
        // Add flow
        if (offlineMode) {
          const matchedMember = familyMembers.find(m => m._id === formData.familyMember) || null;
          const mockNewAppt = {
            _id: 'local_' + Date.now(),
            ...formData,
            familyMember: matchedMember
          };
          setAppointments([...appointments, mockNewAppt]);
        } else {
          const created = await appointmentService.createAppointment(formData);
          setAppointments([...appointments, created]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to submit appointment form:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAppt = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this appointment?')) {
      return;
    }

    try {
      if (id.startsWith('mock') || id.startsWith('local_')) {
        setAppointments(appointments.filter(a => a._id !== id));
      } else {
        await appointmentService.deleteAppointment(id);
        setAppointments(appointments.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete appointment:', err);
    }
  };

  // Filter application
  const filteredAppts = appointments.filter(appt => {
    const matchesStatus = statusFilter === 'All' || appt.status === statusFilter;
    
    // Evaluate family member matching
    let matchesMember = true;
    if (memberFilter !== 'All') {
      if (memberFilter === 'Self') {
        matchesMember = appt.familyMember === null || appt.familyMember === undefined;
      } else {
        const apptMemberId = appt.familyMember?._id || appt.familyMember;
        matchesMember = apptMemberId === memberFilter;
      }
    }

    return matchesStatus && matchesMember;
  }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)); // Sorted by upcoming time

  const statuses = ['All', 'Scheduled', 'Completed', 'Cancelled'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-500 mb-4" />
        <p className="text-gray-400 text-sm">Loading appointments list...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h2 className="page-title text-gradient bg-gradient-to-r from-primary-400 to-secondary-400">
            Doctor Appointments
          </h2>
          <p className="page-subtitle">Schedule, trace, and manage family medical consultations</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="btn btn-primary btn-sm self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={16} />
          New Appointment
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

      {/* Appointments Grid */}
      {filteredAppts.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={48} className="mx-auto mb-4 text-gray-600 animate-pulse" />
          <h3 className="text-title text-gray-300 mb-2">No appointments scheduled</h3>
          <p className="text-body text-gray-500 max-w-sm mx-auto">
            Try adjusting your search filters or schedule a new doctor consultation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppts.map(appt => (
            <div key={appt._id} className="glass-card flex flex-col justify-between group animate-fade-in">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                      <Heart size={18} />
                    </div>
                    <div>
                      <h4 className="text-body font-bold text-white leading-tight">
                        Dr. {appt.doctorName}
                      </h4>
                      {appt.specialty && (
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{appt.specialty}</p>
                      )}
                    </div>
                  </div>

                  {/* Hover Actions */}
                  <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={() => handleOpenEditModal(appt)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                      title="Edit Appointment"
                    >
                      <Pencil size={11} />
                    </button>
                    <button 
                      onClick={() => handleDeleteAppt(appt._id)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 flex items-center justify-center text-gray-400 hover:text-red-400 transition-all duration-200"
                      title="Cancel Appointment"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Patient / Status indicators */}
                <div className="flex items-center gap-2 pt-2 border-t border-dark-border">
                  <span className={`badge text-[9px] py-0.5
                    ${appt.status === 'Scheduled' ? 'badge-primary' : ''}
                    ${appt.status === 'Completed' ? 'badge-success' : ''}
                    ${appt.status === 'Cancelled' ? 'badge-danger' : ''}
                  `}>
                    {appt.status}
                  </span>
                  <span className="badge badge-info text-[9px] py-0.5">
                    {appt.familyMember ? `${appt.familyMember.name} (${appt.familyMember.relation})` : 'Self'}
                  </span>
                </div>

                {/* Schedule details */}
                <div className="space-y-2 text-caption text-gray-400 pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-gray-500 flex-shrink-0" />
                    <span className="truncate">{appt.hospital}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-gray-500 flex-shrink-0" />
                    <span>
                      {new Date(appt.appointmentDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                      {new Date(appt.appointmentDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {appt.notes && (
                  <p className="text-caption text-gray-500 italic bg-black/25 p-2.5 rounded-lg leading-snug">
                    "{appt.notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Form Modal */}
      <AppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        appointment={selectedAppt}
        familyMembers={familyMembers}
        loading={submitting}
      />
    </div>
  );
};

export default Appointments;
