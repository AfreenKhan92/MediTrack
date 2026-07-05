import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Activity, 
  ShieldAlert, 
  AlertCircle,
  ShieldAlert as ErrorIcon,
  Loader2
} from 'lucide-react';
import familyService from '../services/familyService';

// Reusable Modal Component for Add / Edit
const FamilyMemberModal = ({ isOpen, onClose, onSubmit, member, loading }) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Child');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('Unknown');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setRelation(member.relation || 'Other');
      setAge(member.age || '');
      setBloodGroup(member.bloodGroup || 'Unknown');
      setAllergies(member.allergies ? member.allergies.join(', ') : '');
      setNotes(member.notes || '');
    } else {
      setName('');
      setRelation('Child');
      setAge('');
      setBloodGroup('Unknown');
      setAllergies('');
      setNotes('');
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

    // Process allergies: comma-separated string to array of trimmed strings
    const allergyList = allergies
      ? allergies.split(',').map(a => a.trim()).filter(a => a !== '')
      : [];

    onSubmit({
      name,
      relation,
      age: Number(age),
      bloodGroup,
      allergies: allergyList,
      notes
    });
  };

  const relations = ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Other'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-form p-6 sm:p-8 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-dark-border pb-4 mb-5">
          <h3 className="text-title text-white flex items-center gap-2">
            <Users size={20} className="text-primary-400" />
            {member ? 'Edit Member Profile' : 'Add Family Member'}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Validation Warning Alert */}
        {validationError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs">
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

          <div className="grid grid-cols-2 gap-4">
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
              <span>{member ? 'Save Changes' : 'Create Profile'}</span>
            </button>
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

  // Mock data fallbacks for demonstration when database is not connected
  const mockFamilyMembers = [
    { _id: 'mock1', name: 'John Doe', relation: 'Self', age: 34, bloodGroup: 'O+', allergies: ['Penicillin'], notes: 'Main account holder.' },
    { _id: 'mock2', name: 'Jane Doe', relation: 'Spouse', age: 32, bloodGroup: 'A+', allergies: ['Pollen'], notes: 'Migraine history.' },
    { _id: 'mock3', name: 'Leo Doe', relation: 'Child', age: 5, bloodGroup: 'O+', allergies: ['Peanuts', 'Dust'], notes: 'Asthma history.' }
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
        // Edit flow
        if (selectedMember._id.startsWith('mock')) {
          // Edit Mock Local item
          setMembers(members.map(m => m._id === selectedMember._id ? { ...m, ...formData } : m));
        } else {
          const updated = await familyService.updateMember(selectedMember._id, formData);
          setMembers(members.map(m => m._id === selectedMember._id ? updated : m));
        }
      } else {
        // Add flow
        if (offlineMode) {
          const mockNewMember = {
            _id: 'mock_' + Date.now(),
            ...formData
          };
          setMembers([...members, mockNewMember]);
        } else {
          const created = await familyService.createMember(formData);
          setMembers([...members, created]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to submit family member form data:', err);
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
    } catch (err) {
      console.error('Failed to delete family member profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-500 mb-4" />
        <p className="text-gray-400 text-sm">Loading family registry...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h2 className="page-title text-gradient bg-gradient-to-r from-primary-400 to-secondary-400">
            Family Members
          </h2>
          <p className="page-subtitle">Track and configure health settings for your family profiles</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="btn btn-primary btn-sm self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {/* Offline Mode Alert */}
      {error && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2.5 rounded-xl text-sm animate-scale-in">
          <ErrorIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Cards Grid */}
      {members.length === 0 ? (
        <div className="empty-state">
          <Users size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-title text-gray-300 mb-2">No family members found</h3>
          <p className="text-body text-gray-500 max-w-md mx-auto">
            Get started by adding profiles for children, spouses, or parents to organize health details in one place.
          </p>
        </div>
      ) : (
        <div className="grid-cards">
          {members.map(member => (
            <div key={member._id} className="glass-card flex flex-col justify-between group animate-fade-in">
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-heading font-bold text-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-body font-bold text-white leading-tight">{member.name}</h4>
                      <span className="badge badge-primary text-[10px] py-0.5 mt-1">{member.relation}</span>
                    </div>
                  </div>
                  
                  {/* Actions (Edit/Delete) */}
                  <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={() => handleOpenEditModal(member)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                      title="Edit Profile"
                    >
                      <Pencil size={12} />
                    </button>
                    <button 
                      onClick={() => handleDeleteMember(member._id)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 flex items-center justify-center text-gray-400 hover:text-red-400 transition-all duration-200"
                      title="Delete Profile"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Health Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-dark-border text-caption text-gray-400">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Age</p>
                    <p className="text-white font-medium">{member.age} years</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Blood Type</p>
                    <p className="text-red-400 font-medium">{member.bloodGroup}</p>
                  </div>
                </div>

                {/* Allergies */}
                <div className="space-y-1 pt-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Allergies</p>
                  {member.allergies && member.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {member.allergies.map((allergy, idx) => (
                        <span key={idx} className="badge badge-danger text-[9px] lowercase font-normal px-2">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-caption text-gray-600 italic">None reported</p>
                  )}
                </div>

                {/* Notes */}
                {member.notes && (
                  <div className="space-y-1 pt-1.5 border-t border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Clinical Notes</p>
                    <p className="text-caption text-gray-400 italic leading-snug">
                      "{member.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reusable Form Modal */}
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
