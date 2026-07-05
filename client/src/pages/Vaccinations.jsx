import React, { useState, useEffect } from 'react';
import { 
  Syringe, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Filter,
  Calendar,
  Building
} from 'lucide-react';
import vaccineService from '../services/vaccineService';
import familyService from '../services/familyService';

// Reusable Vaccine Modal Component (Add / Edit)
const VaccineModal = ({ isOpen, onClose, onSubmit, vaccine, familyMembers, loading }) => {
  const [vaccineName, setVaccineName] = useState('');
  const [doseNumber, setDoseNumber] = useState('1');
  const [familyMember, setFamilyMember] = useState('');
  const [status, setStatus] = useState('Administered');
  const [dateAdministered, setDateAdministered] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [administeredBy, setAdministeredBy] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (vaccine) {
      setVaccineName(vaccine.vaccineName || '');
      setDoseNumber(String(vaccine.doseNumber || 1));
      setFamilyMember(vaccine.familyMember?._id || vaccine.familyMember || '');
      setStatus(vaccine.status || 'Administered');
      
      // Format dates (YYYY-MM-DD) for HTML date inputs
      setDateAdministered(vaccine.dateAdministered ? vaccine.dateAdministered.split('T')[0] : '');
      setNextDueDate(vaccine.nextDueDate ? vaccine.nextDueDate.split('T')[0] : '');
      setAdministeredBy(vaccine.administeredBy || '');
      setNotes(vaccine.notes || '');
    } else {
      setVaccineName('');
      setDoseNumber('1');
      setFamilyMember('');
      setStatus('Administered');
      setDateAdministered(new Date().toISOString().split('T')[0]);
      setNextDueDate('');
      setAdministeredBy('');
      setNotes('');
    }
    setValidationError('');
  }, [vaccine, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!vaccineName.trim()) {
      setValidationError('Vaccine name is required');
      return;
    }

    if (!doseNumber || isNaN(Number(doseNumber)) || Number(doseNumber) < 1) {
      setValidationError('Dose number must be a valid positive number');
      return;
    }

    onSubmit({
      vaccineName,
      doseNumber: Number(doseNumber),
      familyMember: familyMember || null,
      status,
      dateAdministered: status === 'Administered' && dateAdministered ? new Date(dateAdministered).toISOString() : null,
      nextDueDate: nextDueDate ? new Date(nextDueDate).toISOString() : null,
      administeredBy,
      notes
    });
  };

  const statuses = ['Administered', 'Scheduled', 'Overdue'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-form p-6 sm:p-8 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-dark-border pb-4 mb-5">
          <h3 className="text-title text-white flex items-center gap-2">
            <Syringe size={20} className="text-primary-400" />
            {vaccine ? 'Edit Vaccine Record' : 'Log Vaccination'}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Validation Warnings */}
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
              <label className="form-label">Vaccine Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. MMR, Hepatitis B"
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Dose Number (e.g. 1, 2, Booster)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="e.g. 1"
                value={doseNumber}
                onChange={(e) => setDoseNumber(e.target.value)}
                disabled={loading}
                min="1"
                required
              />
            </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {status === 'Administered' && (
              <div className="form-group mb-0">
                <label className="form-label">Date Administered</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={dateAdministered}
                  onChange={(e) => setDateAdministered(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div className="form-group mb-0">
              <label className="form-label">Next Due Date (Optional)</label>
              <input 
                type="date" 
                className="form-input"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Administered By / Clinic</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. State Pediatric Center"
              value={administeredBy}
              onChange={(e) => setAdministeredBy(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Notes (Optional)</label>
            <textarea 
              className="form-textarea" 
              placeholder="e.g. Left arm, check for swelling, next dose booster details..."
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
              <span>{vaccine ? 'Save Changes' : 'Record Vaccine'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Vaccinations Tracker Component
const Vaccinations = () => {
  const [vaccines, setVaccines] = useState([]);
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
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  // Fallback Mocks
  const mockFamilyMembers = [
    { _id: 'mock1', name: 'John Doe', relation: 'Self' },
    { _id: 'mock2', name: 'Jane Doe', relation: 'Spouse' },
    { _id: 'mock3', name: 'Leo Doe', relation: 'Child' }
  ];

  const mockVaccines = [
    {
      _id: 'mock1',
      vaccineName: 'Polio Booster (IPV)',
      doseNumber: 3,
      familyMember: { _id: 'mock3', name: 'Leo Doe', relation: 'Child' },
      status: 'Administered',
      dateAdministered: '2026-06-15T00:00:00.000Z',
      nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 12).toISOString(),
      administeredBy: 'State Pediatric Clinic',
      notes: 'No side effects reported. Redness at injection site cleared in 24h.'
    },
    {
      _id: 'mock2',
      vaccineName: 'Hepatitis B',
      doseNumber: 1,
      familyMember: null, // Self
      status: 'Scheduled',
      dateAdministered: null,
      nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 5).toISOString(),
      administeredBy: 'Mercy Center Pharmacy',
      notes: 'Bring vaccination pass.'
    },
    {
      _id: 'mock3',
      vaccineName: 'MMR Dose 2',
      doseNumber: 2,
      familyMember: { _id: 'mock3', name: 'Leo Doe', relation: 'Child' },
      status: 'Overdue',
      dateAdministered: null,
      nextDueDate: new Date(Date.now() - 24 * 60 * 60 * 1000 * 30).toISOString(),
      administeredBy: 'Pediatric Center',
      notes: 'Urgent booster required.'
    }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vaccinesData, membersData] = await Promise.all([
        vaccineService.getVaccines(),
        familyService.getMembers()
      ]);
      setVaccines(vaccinesData);
      setFamilyMembers(membersData);
      setOfflineMode(false);
      setError(null);
    } catch (err) {
      console.warn('Backend server not connected. Operating in offline mock data mode.');
      setVaccines(mockVaccines);
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
    setSelectedVaccine(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vacc) => {
    setSelectedVaccine(vacc);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (selectedVaccine) {
        // Edit flow
        if (selectedVaccine._id.startsWith('mock') || selectedVaccine._id.startsWith('local_')) {
          const matchedMember = familyMembers.find(m => m._id === formData.familyMember) || null;
          setVaccines(vaccines.map(v => v._id === selectedVaccine._id 
            ? { ...v, ...formData, familyMember: matchedMember } 
            : v
          ));
        } else {
          const updated = await vaccineService.updateVaccine(selectedVaccine._id, formData);
          setVaccines(vaccines.map(v => v._id === selectedVaccine._id ? updated : v));
        }
      } else {
        // Add flow
        if (offlineMode) {
          const matchedMember = familyMembers.find(m => m._id === formData.familyMember) || null;
          const mockNewVaccine = {
            _id: 'local_' + Date.now(),
            ...formData,
            familyMember: matchedMember
          };
          setVaccines([...vaccines, mockNewVaccine]);
        } else {
          const created = await vaccineService.createVaccine(formData);
          setVaccines([...vaccines, created]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to submit vaccine tracker form:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVaccine = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this vaccine record?')) {
      return;
    }

    try {
      if (id.startsWith('mock') || id.startsWith('local_')) {
        setVaccines(vaccines.filter(v => v._id !== id));
      } else {
        await vaccineService.deleteVaccine(id);
        setVaccines(vaccines.filter(v => v._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete vaccine record:', err);
    }
  };

  const handleMarkCompleted = async (vacc) => {
    const updatedData = {
      status: 'Administered',
      dateAdministered: new Date().toISOString()
    };

    try {
      if (vacc._id.startsWith('mock') || vacc._id.startsWith('local_')) {
        setVaccines(vaccines.map(v => v._id === vacc._id ? { ...v, ...updatedData } : v));
      } else {
        const updated = await vaccineService.updateVaccine(vacc._id, updatedData);
        setVaccines(vaccines.map(v => v._id === vacc._id ? updated : v));
      }
    } catch (err) {
      console.error('Failed to update vaccine completion status:', err);
    }
  };

  // Filter application
  const filteredVaccines = vaccines.filter(vacc => {
    const matchesStatus = statusFilter === 'All' || vacc.status === statusFilter;
    
    let matchesMember = true;
    if (memberFilter !== 'All') {
      if (memberFilter === 'Self') {
        matchesMember = vacc.familyMember === null || vacc.familyMember === undefined;
      } else {
        const vaccMemberId = vacc.familyMember?._id || vacc.familyMember;
        matchesMember = vaccMemberId === memberFilter;
      }
    }

    return matchesStatus && matchesMember;
  }).sort((a, b) => {
    // Sort timeline: Overdue/Scheduled first by nextDueDate, then Administered by dateAdministered desc
    if (a.status !== 'Administered' && b.status === 'Administered') return -1;
    if (a.status === 'Administered' && b.status !== 'Administered') return 1;
    if (a.status !== 'Administered' && b.status !== 'Administered') {
      return new Date(a.nextDueDate) - new Date(b.nextDueDate);
    }
    return new Date(b.dateAdministered) - new Date(a.dateAdministered);
  });

  const statuses = ['All', 'Administered', 'Scheduled', 'Overdue'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-500 mb-4" />
        <p className="text-gray-400 text-sm">Loading vaccinations history...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h2 className="page-title text-gradient bg-gradient-to-r from-primary-400 to-secondary-400">
            Vaccination Tracker
          </h2>
          <p className="page-subtitle">Log administered vaccines and track upcoming immunization due dates</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="btn btn-primary btn-sm self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={16} />
          Log Vaccine
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

      {/* Vaccine Timeline Layout UI */}
      {filteredVaccines.length === 0 ? (
        <div className="empty-state">
          <Syringe size={48} className="mx-auto mb-4 text-gray-600 animate-pulse" />
          <h3 className="text-title text-gray-300 mb-2">No vaccination records found</h3>
          <p className="text-body text-gray-500 max-w-sm mx-auto">
            Try adjusting your search filters or log a new vaccination card.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
          {filteredVaccines.map(vacc => (
            <div 
              key={vacc._id} 
              className="relative glass-card p-5 sm:p-6 animate-fade-in group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Timeline dot */}
              <span className={`absolute left-[-21px] sm:left-[-25px] top-7 w-3 h-3 rounded-full border-2 border-dark-app z-10
                ${vacc.status === 'Administered' ? 'bg-secondary-500' : ''}
                ${vacc.status === 'Scheduled' ? 'bg-amber-500' : ''}
                ${vacc.status === 'Overdue' ? 'bg-red-500 shadow-glow-danger' : ''}
              `} />

              {/* Left Column: Vaccine Metadata */}
              <div className="space-y-3 flex-1">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
                    ${vacc.status === 'Administered' ? 'bg-secondary-500/10 text-secondary-400' : ''}
                    ${vacc.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-400' : ''}
                    ${vacc.status === 'Overdue' ? 'bg-red-500/10 text-red-400' : ''}
                  `}>
                    <Syringe size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-body font-bold text-white leading-tight">
                        {vacc.vaccineName}
                      </h4>
                      <span className="text-[11px] text-gray-400 font-semibold px-2 py-0.5 bg-white/5 rounded-lg">
                        Dose {vacc.doseNumber}
                      </span>
                      <span className={`badge text-[9px] py-0.5
                        ${vacc.status === 'Administered' ? 'badge-success' : ''}
                        ${vacc.status === 'Scheduled' ? 'badge-warning' : ''}
                        ${vacc.status === 'Overdue' ? 'badge-danger animate-pulse-glow' : ''}
                      `}>
                        {vacc.status}
                      </span>
                    </div>
                    
                    {/* Patient detail */}
                    <p className="text-caption text-primary-400 font-medium mt-1">
                      Patient: {vacc.familyMember ? `${vacc.familyMember.name} (${vacc.familyMember.relation})` : 'Self'}
                    </p>
                  </div>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-caption text-gray-400 pt-2 border-t border-white/5">
                  {vacc.status === 'Administered' ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-secondary-400" />
                      <span>Administered: <strong>{new Date(vacc.dateAdministered).toLocaleDateString()}</strong></span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-amber-400" />
                      <span>Next Due Date: <strong className={vacc.status === 'Overdue' ? 'text-red-400' : 'text-white'}>{new Date(vacc.nextDueDate).toLocaleDateString()}</strong></span>
                    </div>
                  )}
                  {vacc.administeredBy && (
                    <div className="flex items-center gap-2">
                      <Building size={13} className="text-gray-500" />
                      <span className="truncate">Clinic: <strong>{vacc.administeredBy}</strong></span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {vacc.notes && (
                  <p className="text-caption text-gray-500 italic bg-black/25 p-2.5 rounded-lg leading-snug">
                    "{vacc.notes}"
                  </p>
                )}
              </div>

              {/* Right Column: Actions (Edit/Delete/Mark Completed) */}
              <div className="flex items-center justify-between border-t md:border-t-0 border-white/5 pt-3 md:pt-0 gap-3">
                {/* Complete Action Button */}
                {vacc.status !== 'Administered' && (
                  <button
                    onClick={() => handleMarkCompleted(vacc)}
                    className="btn btn-secondary py-2 px-3 text-xs flex items-center gap-1"
                  >
                    <CheckCircle2 size={12} />
                    Mark Completed
                  </button>
                )}

                {/* Edit & Delete Controls */}
                <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200 ml-auto md:ml-0">
                  <button 
                    onClick={() => handleOpenEditModal(vacc)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                    title="Edit Record"
                  >
                    <Pencil size={11} />
                  </button>
                  <button 
                    onClick={() => handleDeleteVaccine(vacc._id)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 flex items-center justify-center text-gray-400 hover:text-red-400 transition-all duration-200"
                    title="Delete Record"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vaccine Form Modal */}
      <VaccineModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        vaccine={selectedVaccine}
        familyMembers={familyMembers}
        loading={submitting}
      />
    </div>
  );
};

export default Vaccinations;
