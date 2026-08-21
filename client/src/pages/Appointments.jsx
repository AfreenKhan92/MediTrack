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
  AlertCircle,
  Loader2,
  Filter
} from 'lucide-react';
import { formatDate, formatTime } from '../utils/dateUtils';
import appointmentService from '../services/appointmentService';
import familyService from '../services/familyService';
import { showToast } from '../utils/toast';
import { SkeletonLoader } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 shadow-xl rounded-xl w-full max-w-form p-6 sm:p-8 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
          <h3 className="text-subtitle font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays size={18} className="text-gray-900" />
            {appointment ? 'Edit Appointment' : 'Book New Appointment'}
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
            <label className="form-label">Doctor Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Dr. Sarah Jenkins"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="form-label">Specialty (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Cardiologist, General"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Hospital / Clinic</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. City Health Center"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Appointment Date & Time</label>
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

            <div className="form-group mb-0">
              <label className="form-label">Status</label>
              <select 
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
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
              {appointment ? 'Save Changes' : 'Book Visit'}
            </Button>
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
      familyMember: null,
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
        showToast.success(`Appointment with Dr. ${formData.doctorName} updated!`);
      } else {
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
        showToast.success(`Appointment with Dr. ${formData.doctorName} scheduled!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to submit appointment form:', err);
      showToast.error(err.response?.data?.message || 'Failed to save appointment.');
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
      showToast.success('Appointment cancelled and deleted.');
    } catch (err) {
      console.error('Failed to delete appointment:', err);
      showToast.error('Failed to cancel appointment.');
    }
  };

  const filteredAppts = appointments.filter(appt => {
    const matchesStatus = statusFilter === 'All' || appt.status === statusFilter;
    
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
  }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  const statuses = ['All', 'Scheduled', 'Completed', 'Cancelled'];

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="page-header">
          <div className="w-48 h-7 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-72 h-4 bg-gray-100 rounded animate-pulse" />
        </div>
        <SkeletonLoader type="appointment" count={3} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h2 className="page-title text-gray-900 font-bold">
            Doctor Appointments Timeline
          </h2>
          <p className="page-subtitle text-gray-500">Schedule, trace, and manage family medical consultations in a timeline view</p>
        </div>
        <Button 
          variant="primary"
          icon={Plus}
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto"
        >
          New Appointment
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

      {/* Appointments Timeline View */}
      {filteredAppts.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No appointments scheduled"
          description="Try adjusting your search filters or schedule a new doctor consultation."
          actionText="Book New Appointment"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
          {filteredAppts.map(appt => {
            const isToday = new Date(appt.appointmentDate).toDateString() === new Date().toDateString();

            return (
              <Card key={appt._id} className="relative flex flex-col justify-between group animate-fade-in">
                <span className={`absolute left-[-21px] sm:left-[-25px] top-6 w-3.5 h-3.5 rounded-full border-2 border-white ${isToday ? 'bg-black ring-2 ring-gray-300' : 'bg-gray-400'}`} />

                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5 border border-gray-200">
                        <Heart size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-body font-bold text-gray-900 leading-tight">
                            Dr. {appt.doctorName}
                          </h4>
                          {isToday && <Badge variant="primary" className="text-[9px]">Today</Badge>}
                        </div>
                        {appt.specialty && (
                          <p className="text-[11px] text-gray-500 font-medium mt-0.5">{appt.specialty}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleOpenEditModal(appt)}
                        className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                        title="Edit Appointment"
                      >
                        <Pencil size={13} />
                      </button>
                      <button 
                        onClick={() => handleDeleteAppt(appt._id)}
                        className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                        title="Cancel Appointment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Patient / Status indicators */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <Badge variant={appt.status === 'Scheduled' ? 'warning' : appt.status === 'Completed' ? 'success' : 'danger'} className="text-[9px]">
                      {appt.status}
                    </Badge>
                    <Badge variant="secondary" className="text-[9px]">
                      {appt.familyMember ? `${appt.familyMember.name} (${appt.familyMember.relation})` : 'Self'}
                    </Badge>
                  </div>

                  {/* Schedule details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-caption text-gray-600 pt-1">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{appt.hospital}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400 flex-shrink-0" />
                      <span>
                        {formatDate(appt.appointmentDate, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                        {formatTime(appt.appointmentDate)}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {appt.notes && (
                    <p className="text-caption text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-snug">
                      "{appt.notes}"
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
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
