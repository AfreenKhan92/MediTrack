import React, { useState, useEffect } from 'react';
import { 
  Syringe, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Filter,
  Calendar,
  Building
} from 'lucide-react';
import vaccineService from '../services/vaccineService';
import familyService from '../services/familyService';
import { showToast } from '../utils/toast';
import { SkeletonLoader } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 shadow-xl rounded-xl w-full max-w-form p-6 sm:p-8 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
          <h3 className="text-subtitle font-bold text-gray-900 flex items-center gap-2">
            <Syringe size={18} className="text-gray-900" />
            {vaccine ? 'Edit Vaccine Record' : 'Log Vaccination'}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Validation Warnings */}
        {validationError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-caption font-medium">
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
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="form-label">Date Administered</label>
              <input 
                type="date" 
                className="form-input" 
                value={dateAdministered}
                onChange={(e) => setDateAdministered(e.target.value)}
                disabled={loading || status !== 'Administered'}
              />
            </div>

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
            <label className="form-label">Clinic / Provider (Optional)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. St. Jude Children Hospital"
              value={administeredBy}
              onChange={(e) => setAdministeredBy(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Notes (Optional)</label>
            <textarea 
              className="form-textarea" 
              placeholder="e.g. Side effects, batch number..."
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
              {vaccine ? 'Save Changes' : 'Record Vaccination'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Vaccinations Page Component
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

  const mockFamilyMembers = [
    { _id: 'mock1', name: 'John Doe', relation: 'Self' },
    { _id: 'mock2', name: 'Jane Doe', relation: 'Spouse' },
    { _id: 'mock3', name: 'Leo Doe', relation: 'Child' }
  ];

  const mockVaccines = [
    {
      _id: 'mock1',
      vaccineName: 'MMR Booster',
      doseNumber: 2,
      familyMember: { _id: 'mock3', name: 'Leo Doe', relation: 'Child' },
      status: 'Administered',
      dateAdministered: '2026-06-15T00:00:00.000Z',
      nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 365).toISOString(),
      administeredBy: 'St. Jude Hospital',
      notes: 'No adverse reactions noted.'
    },
    {
      _id: 'mock2',
      vaccineName: 'Influenza Annual',
      doseNumber: 1,
      familyMember: { _id: 'mock2', name: 'Jane Doe', relation: 'Spouse' },
      status: 'Overdue',
      dateAdministered: null,
      nextDueDate: new Date(Date.now() - 24 * 60 * 60 * 1000 * 30).toISOString(),
      administeredBy: 'Mercy Center',
      notes: 'Annual flu shot overdue.'
    },
    {
      _id: 'mock3',
      vaccineName: 'Tetanus Shot',
      doseNumber: 1,
      familyMember: null,
      status: 'Scheduled',
      dateAdministered: null,
      nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 10).toISOString(),
      administeredBy: 'City Clinic',
      notes: 'Decennial booster appointment.'
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

  const handleOpenEditModal = (vaccine) => {
    setSelectedVaccine(vaccine);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (selectedVaccine) {
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
        showToast.success(`Vaccine ${formData.vaccineName} record updated!`);
      } else {
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
        showToast.success(`Vaccine ${formData.vaccineName} logged!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to submit vaccine tracker form:', err);
      showToast.error(err.response?.data?.message || 'Failed to save vaccine record.');
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
      showToast.success('Vaccine record removed.');
    } catch (err) {
      console.error('Failed to delete vaccine record:', err);
      showToast.error('Failed to remove record.');
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
      showToast.success(`${vacc.vaccineName} marked as administered!`);
    } catch (err) {
      console.error('Failed to update vaccine completion status:', err);
      showToast.error('Failed to update completion status.');
    }
  };

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
      <div className="animate-fade-in space-y-6">
        <div className="page-header">
          <div className="w-48 h-7 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-72 h-4 bg-gray-100 rounded animate-pulse" />
        </div>
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h2 className="page-title text-gray-900 font-bold">
            Vaccination Tracker
          </h2>
          <p className="page-subtitle text-gray-500">Log administered vaccines and track upcoming immunization due dates</p>
        </div>
        <Button 
          variant="primary"
          icon={Plus}
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto"
        >
          Log Vaccine
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

      {/* Vaccine Timeline Layout UI */}
      {filteredVaccines.length === 0 ? (
        <EmptyState
          icon={Syringe}
          title="No vaccination records found"
          description="Try adjusting your search filters or log a new vaccination card."
          actionText="Log Vaccine"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
          {filteredVaccines.map(vacc => (
            <Card 
              key={vacc._id} 
              className="relative p-5 animate-fade-in group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Timeline dot */}
              <span className="absolute left-[-21px] sm:left-[-25px] top-6 w-3.5 h-3.5 rounded-full border-2 border-white bg-black z-10" />

              {/* Left Column: Vaccine Metadata */}
              <div className="space-y-2.5 flex-1">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5 border border-gray-200">
                    <Syringe size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-body font-bold text-gray-900 leading-tight">
                        {vacc.vaccineName}
                      </h4>
                      <Badge variant="secondary" className="text-[9px]">Dose #{vacc.doseNumber}</Badge>
                      <Badge variant={vacc.status === 'Administered' ? 'success' : vacc.status === 'Overdue' ? 'danger' : 'warning'} className="text-[9px]">
                        {vacc.status}
                      </Badge>
                    </div>
                    <p className="text-caption text-gray-500 mt-0.5 font-medium">
                      Patient: <span className="text-gray-900 font-semibold">{vacc.familyMember ? vacc.familyMember.name : 'Self'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-caption text-gray-600 pt-0.5">
                  {vacc.dateAdministered && (
                    <span className="flex items-center gap-1 text-gray-900 font-semibold">
                      <CheckCircle2 size={13} />
                      Administered: {new Date(vacc.dateAdministered).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                  {vacc.nextDueDate && (
                    <span className="flex items-center gap-1 text-gray-600">
                      <Calendar size={13} />
                      Next Due: {new Date(vacc.nextDueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                  {vacc.administeredBy && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <Building size={13} />
                      {vacc.administeredBy}
                    </span>
                  )}
                </div>

                {vacc.notes && (
                  <p className="text-caption text-gray-600 italic bg-gray-50 p-2 rounded-lg border border-gray-100 leading-snug">
                    "{vacc.notes}"
                  </p>
                )}
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2 self-end md:self-center border-t md:border-t-0 border-gray-200 pt-2.5 md:pt-0 w-full md:w-auto justify-end">
                {vacc.status !== 'Administered' && (
                  <Button 
                    variant="secondary"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => handleMarkCompleted(vacc)}
                  >
                    Mark Given
                  </Button>
                )}
                <button 
                  onClick={() => handleOpenEditModal(vacc)}
                  className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                  title="Edit Record"
                >
                  <Pencil size={13} />
                </button>
                <button 
                  onClick={() => handleDeleteVaccine(vacc._id)}
                  className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Record"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Vaccine Modal */}
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
