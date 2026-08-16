import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  AlertCircle,
  ShieldAlert as ErrorIcon,
  Heart
} from 'lucide-react';
import familyService from '../services/familyService';
import { showToast } from '../utils/toast';
import { SkeletonLoader } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';

// Reusable Modal Component for Add / Edit
const FamilyMemberModal = ({ isOpen, onClose, onSubmit, member, loading }) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Child');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('Unknown');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setRelation(member.relation || 'Other');
      setAge(member.age || '');
      setBloodGroup(member.bloodGroup || 'Unknown');
      setAllergies(member.allergies ? member.allergies.join(', ') : '');
      setNotes(member.notes || '');
      setHeightCm(member.heightCm || '');
      setWeightKg(member.weightKg || '');
    } else {
      setName('');
      setRelation('Child');
      setAge('');
      setBloodGroup('Unknown');
      setAllergies('');
      setNotes('');
      setHeightCm('');
      setWeightKg('');
    }
    setValidationError('');
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Name is required');
      return;
    }

    if (age === '' || isNaN(Number(age)) || Number(age) < 0 || Number(age) > 150) {
      setValidationError('Age must be a valid number between 0 and 150');
      return;
    }

    const allergyList = allergies
      ? allergies.split(',').map(a => a.trim()).filter(a => a !== '')
      : [];

    // Optional height/weight validation on the client side
    if (heightCm !== '' && (isNaN(Number(heightCm)) || Number(heightCm) < 50 || Number(heightCm) > 300)) {
      setValidationError('Height must be a number between 50 and 300 cm');
      return;
    }
    if (weightKg !== '' && (isNaN(Number(weightKg)) || Number(weightKg) < 1 || Number(weightKg) > 700)) {
      setValidationError('Weight must be a number between 1 and 700 kg');
      return;
    }

    onSubmit({
      name,
      relation,
      age: Number(age),
      bloodGroup,
      allergies: allergyList,
      notes,
      heightCm: heightCm !== '' ? Number(heightCm) : null,
      weightKg: weightKg !== '' ? Number(weightKg) : null,
    });
  };

  const relations = ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Other'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl w-full max-w-form p-6 sm:p-8 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
          <h3 className="text-subtitle font-bold text-gray-900 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users size={16} />
            </div>
            {member ? 'Edit Member Profile' : 'Add Family Member'}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Validation Warning Alert */}
        {validationError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-caption font-medium">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="form-group mb-0">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="form-label">Relation</label>
              <select 
                className="form-select"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                disabled={loading}
              >
                {relations.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Age</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="e.g. 28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Blood Group</label>
            <select 
              className="form-select"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              disabled={loading}
            >
              {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="form-label">Height (cm) <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="e.g. 170"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                disabled={loading}
                min="50"
                max="300"
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Weight (kg) <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="e.g. 68"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                disabled={loading}
                min="1"
                max="700"
              />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Allergies (Comma separated)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Pollen, Penicillin, Nuts"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Notes (Optional)</label>
            <textarea 
              className="form-textarea" 
              placeholder="Important health details, blood pressure, medicine records..."
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
              {member ? 'Save Changes' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Family Members Component
const FamilyMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const mockFamilyMembers = [
    { _id: 'mock1', name: 'John Doe', relation: 'Self', age: 34, bloodGroup: 'O+', allergies: ['Penicillin'], notes: 'Main account holder.', status: 'Healthy' },
    { _id: 'mock2', name: 'Jane Doe', relation: 'Spouse', age: 32, bloodGroup: 'A+', allergies: ['Pollen'], notes: 'Migraine history.', status: 'Healthy' },
    { _id: 'mock3', name: 'Leo Doe', relation: 'Child', age: 5, bloodGroup: 'O+', allergies: ['Peanuts', 'Dust'], notes: 'Asthma history.', status: 'Checkup Due' }
  ];

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await familyService.getMembers();
      setMembers(data);
      setOfflineMode(false);
      setError(null);
    } catch (err) {
      console.warn('Backend server not connected. Falling back to local offline mock data.');
      setMembers(mockFamilyMembers);
      setOfflineMode(true);
      setError('Database server not connected. Operating in offline demonstration mode.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (selectedMember) {
        if (selectedMember._id.startsWith('mock')) {
          setMembers(members.map(m => m._id === selectedMember._id ? { ...m, ...formData } : m));
        } else {
          const updated = await familyService.updateMember(selectedMember._id, formData);
          setMembers(members.map(m => m._id === selectedMember._id ? updated : m));
        }
        showToast.success(`Profile for ${formData.name} updated successfully!`);
      } else {
        if (offlineMode) {
          const mockNewMember = {
            _id: 'mock_' + Date.now(),
            ...formData,
            status: 'Healthy'
          };
          setMembers([...members, mockNewMember]);
        } else {
          const created = await familyService.createMember(formData);
          setMembers([...members, created]);
        }
        showToast.success(`Family member ${formData.name} added!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to submit family member form data:', err);
      showToast.error(err.response?.data?.message || 'Failed to save family member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to remove this family member?')) {
      return;
    }

    try {
      if (id.startsWith('mock')) {
        setMembers(members.filter(m => m._id !== id));
      } else {
        await familyService.deleteMember(id);
        setMembers(members.filter(m => m._id !== id));
      }
      showToast.success('Family member profile removed.');
    } catch (err) {
      console.error('Failed to delete family member profile:', err);
      showToast.error('Failed to remove family member.');
    }
  };

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
            Family Profiles
          </h2>
          <p className="page-subtitle text-gray-500">Track and manage clinical records for your family members</p>
        </div>
        <Button 
          variant="primary"
          icon={Plus}
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto"
        >
          Add Member
        </Button>
      </div>

      {/* Offline Mode Alert */}
      {error && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-3.5 py-2.5 rounded-xl text-caption font-medium">
          <ErrorIcon size={16} className="text-blue-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Cards Grid */}
      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No family members found"
          description="Get started by adding profiles for children, spouses, or parents to organize health details in one place."
          actionText="Add Family Member"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid-cards">
          {members.map(member => (
            <Card key={member._id} className="flex flex-col justify-between group animate-fade-in">
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Blue Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-subtitle shadow-xs">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-body font-bold text-gray-900 leading-tight">{member.name}</h4>
                      <Badge variant="primary" className="text-[10px] py-0.5 mt-1">{member.relation}</Badge>
                    </div>
                  </div>
                  
                  {/* Actions (Edit/Delete) */}
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenEditModal(member)}
                      className="w-7 h-7 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-400 transition-colors"
                      title="Edit Profile"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteMember(member._id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-gray-400 transition-colors"
                      title="Delete Profile"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Health Metrics & Status Badge */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 text-caption text-gray-600">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Age</p>
                    <p className="text-gray-900 font-semibold">{member.age} years</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Blood Group</p>
                    <p className="text-gray-900 font-semibold">{member.bloodGroup}</p>
                  </div>
                  {(member.heightCm || member.weightKg) && (
                    <>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Height</p>
                        <p className="text-gray-900 font-semibold">{member.heightCm ? `${member.heightCm} cm` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Weight</p>
                        <p className="text-gray-900 font-semibold">{member.weightKg ? `${member.weightKg} kg` : '—'}</p>
                      </div>
                    </>
                  )}
                  {member.bmi && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">BMI</p>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 font-semibold">{member.bmi}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          member.bmiCategory === 'Normal weight' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          member.bmiCategory === 'Overweight'   ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          member.bmiCategory === 'Obese'        ? 'bg-red-50 text-red-700 border border-red-100' :
                          member.bmiCategory === 'Underweight'  ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-gray-50 text-gray-600 border border-gray-100'
                        }`}>{member.bmiCategory}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Health Status */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Heart size={11} className="text-blue-600" />
                    Status
                  </span>
                  <Badge variant={member.status === 'Checkup Due' ? 'warning' : 'success'} className="text-[10px]">
                    {member.status || 'Healthy'}
                  </Badge>
                </div>

                {/* Allergies */}
                <div className="space-y-1 pt-1 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Allergies</p>
                  {member.allergies && member.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {member.allergies.map((allergy, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[10px] lowercase font-normal px-2">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-caption text-gray-400 italic">None reported</p>
                  )}
                </div>

                {/* Notes */}
                {member.notes && (
                  <div className="space-y-1 pt-1 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Clinical Notes</p>
                    <p className="text-caption text-gray-600 italic leading-snug">
                      "{member.notes}"
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <FamilyMemberModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        member={selectedMember}
        loading={submitting}
      />
    </div>
  );
};

export default FamilyMembers;
