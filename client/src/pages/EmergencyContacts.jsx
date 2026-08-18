import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Stethoscope,
  Building2,
  Ambulance,
  Heart,
  Phone,
  MapPin,
  NotebookText,
  ShieldAlert as ErrorIcon,
} from 'lucide-react';
import emergencyContactService from '../services/emergencyContactService';
import { showToast } from '../utils/toast';
import { SkeletonLoader } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTACT_TYPES = ['Doctor', 'Hospital', 'Ambulance', 'Family'];

const TYPE_META = {
  Doctor: {
    icon: Stethoscope,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'primary',
    label: 'Doctors',
  },
  Hospital: {
    icon: Building2,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'info',
    label: 'Hospitals',
  },
  Ambulance: {
    icon: Ambulance,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'danger',
    label: 'Ambulance Services',
  },
  Family: {
    icon: Heart,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'success',
    label: 'Family Contacts',
  },
};

// ─── Mock Data (offline fallback) ─────────────────────────────────────────────

const MOCK_CONTACTS = [
  {
    _id: 'mock1',
    type: 'Doctor',
    name: 'Dr. Priya Sharma',
    phone: '+91 98765 43210',
    specialty: 'Cardiologist',
    hospitalName: 'Apollo Hospital',
    address: '21 Park Street, New Delhi',
    notes: 'Primary cardiologist. Available Mon–Fri.',
  },
  {
    _id: 'mock2',
    type: 'Doctor',
    name: 'Dr. Rahul Mehta',
    phone: '+91 91234 56789',
    specialty: 'General Physician',
    hospitalName: '',
    address: '5th Floor, Health Tower, Mumbai',
    notes: '',
  },
  {
    _id: 'mock3',
    type: 'Hospital',
    name: 'Apollo Hospital',
    phone: '+91 44 2829 0200',
    address: '21 Greams Lane, Chennai',
    hospitalName: '',
    specialty: '',
    notes: '24/7 Emergency ward available.',
  },
  {
    _id: 'mock4',
    type: 'Ambulance',
    name: 'City Ambulance Service',
    phone: '102',
    address: 'Citywide service',
    specialty: '',
    hospitalName: '',
    notes: 'Government ambulance — free of cost.',
  },
  {
    _id: 'mock5',
    type: 'Family',
    name: 'Rohan Khan',
    phone: '+91 99887 76655',
    address: '14 Lake View Road, Bangalore',
    specialty: '',
    hospitalName: '',
    notes: 'Brother — closest point of contact.',
  },
];

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

const ContactModal = ({ isOpen, onClose, onSubmit, contact, loading }) => {
  const [type, setType] = useState('Doctor');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (contact) {
      setType(contact.type || 'Doctor');
      setName(contact.name || '');
      setPhone(contact.phone || '');
      setAddress(contact.address || '');
      setSpecialty(contact.specialty || '');
      setHospitalName(contact.hospitalName || '');
      setNotes(contact.notes || '');
    } else {
      setType('Doctor');
      setName('');
      setPhone('');
      setAddress('');
      setSpecialty('');
      setHospitalName('');
      setNotes('');
    }
    setValidationError('');
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Name is required.');
      return;
    }
    if (!phone.trim()) {
      setValidationError('Phone number is required.');
      return;
    }

    onSubmit({ type, name, phone, address, specialty, hospitalName, notes });
  };

  const isDoctor = type === 'Doctor';
  const showHospital = type === 'Doctor' || type === 'Hospital';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div
        className="bg-white border border-gray-200 shadow-xl rounded-2xl w-full max-w-form p-6 sm:p-8 animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
          <h3 className="text-subtitle font-bold text-gray-900 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <PhoneCall size={15} />
            </div>
            {contact ? 'Edit Contact' : 'Add Emergency Contact'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-caption font-medium">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="form-group mb-0">
            <label className="form-label">Contact Type</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
            >
              {CONTACT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="form-group mb-0">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder={isDoctor ? 'e.g. Dr. Priya Sharma' : 'e.g. Apollo Hospital'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Phone */}
          <div className="form-group mb-0">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Specialty — doctors only */}
          {isDoctor && (
            <div className="form-group mb-0">
              <label className="form-label">Specialty</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Cardiologist"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {/* Hospital name — doctors & hospitals */}
          {showHospital && (
            <div className="form-group mb-0">
              <label className="form-label">
                {type === 'Hospital' ? 'Hospital Name' : 'Associated Hospital (Optional)'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apollo Hospital"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {/* Address */}
          <div className="form-group mb-0">
            <label className="form-label">Address (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 21 Park Street, New Delhi"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div className="form-group mb-0">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 mt-5">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {contact ? 'Save Changes' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Contact Card ─────────────────────────────────────────────────────────────

const ContactCard = ({ contact, onEdit, onDelete }) => {
  const meta = TYPE_META[contact.type] || TYPE_META.Family;
  const TypeIcon = meta.icon;

  const handleCall = () => {
    window.location.href = `tel:${contact.phone}`;
  };

  return (
    <Card className="flex flex-col justify-between group animate-fade-in">
      <div className="space-y-3">
        {/* Card Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl ${meta.bg} ${meta.color} border ${meta.border} flex items-center justify-center flex-shrink-0 shadow-xs`}
            >
              <TypeIcon size={20} />
            </div>
            <div>
              <h4 className="text-body font-bold text-gray-900 leading-tight">{contact.name}</h4>
              {contact.specialty && (
                <p className="text-caption text-gray-500 mt-0.5">{contact.specialty}</p>
              )}
              {!contact.specialty && contact.hospitalName && (
                <p className="text-caption text-gray-500 mt-0.5">{contact.hospitalName}</p>
              )}
            </div>
          </div>

          {/* Edit / Delete */}
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(contact)}
              className="w-7 h-7 rounded-lg hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-400 transition-colors"
              title="Edit Contact"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(contact._id)}
              className="w-7 h-7 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-gray-400 transition-colors"
              title="Delete Contact"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Details */}
        <div className="space-y-2">
          {/* Phone */}
          <div className="flex items-center gap-2 text-caption text-gray-700">
            <Phone size={13} className="flex-shrink-0 text-gray-400" />
            <span className="font-medium">{contact.phone}</span>
          </div>

          {/* Specialty + Hospital (doctor) */}
          {contact.specialty && contact.hospitalName && (
            <div className="flex items-center gap-2 text-caption text-gray-500">
              <Building2 size={13} className="flex-shrink-0 text-gray-400" />
              <span>{contact.hospitalName}</span>
            </div>
          )}

          {/* Address */}
          {contact.address && (
            <div className="flex items-start gap-2 text-caption text-gray-500">
              <MapPin size={13} className="flex-shrink-0 mt-0.5 text-gray-400" />
              <span className="leading-snug">{contact.address}</span>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="flex items-start gap-2 text-caption text-gray-400 italic">
              <NotebookText size={13} className="flex-shrink-0 mt-0.5" />
              <span className="leading-snug">&ldquo;{contact.notes}&rdquo;</span>
            </div>
          )}
        </div>
      </div>

      {/* Call Button */}
      <div className="pt-4 mt-3 border-t border-gray-100">
        <button
          onClick={handleCall}
          className={`
            w-full flex items-center justify-center gap-2
            py-2 rounded-xl text-caption font-semibold
            ${meta.bg} ${meta.color} border ${meta.border}
            hover:opacity-90 active:scale-[0.98]
            transition-all duration-150
          `}
        >
          <Phone size={14} />
          Call Now
        </button>
      </div>
    </Card>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar = ({ contacts }) => {
  const stats = CONTACT_TYPES.map((t) => ({
    type: t,
    count: contacts.filter((c) => c.type === t).length,
    meta: TYPE_META[t],
  }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ type, count, meta }) => {
        const Icon = meta.icon;
        return (
          <div key={type} className="glass-panel p-4 flex items-center gap-3">
            <div className={`p-2 rounded-xl ${meta.bg} ${meta.color} border ${meta.border}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                {meta.label}
              </p>
              <p className="text-subtitle font-bold text-gray-900">{count}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // ── Data Fetching ────────────────────────────────────────────────────────────

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await emergencyContactService.getContacts();
      setContacts(data);
      setOfflineMode(false);
      setError(null);
    } catch (err) {
      console.warn('Backend not reachable — showing offline mock data.');
      setContacts(MOCK_CONTACTS);
      setOfflineMode(true);
      setError('Database server not connected. Operating in offline demonstration mode.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleOpenAddModal = () => {
    setSelectedContact(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (selectedContact) {
        if (offlineMode || selectedContact._id.startsWith('mock')) {
          setContacts(contacts.map((c) =>
            c._id === selectedContact._id ? { ...c, ...formData } : c
          ));
        } else {
          const updated = await emergencyContactService.updateContact(selectedContact._id, formData);
          setContacts(contacts.map((c) => (c._id === selectedContact._id ? updated : c)));
        }
        showToast.success(`"${formData.name}" updated successfully!`);
      } else {
        if (offlineMode) {
          const mock = { _id: 'mock_' + Date.now(), ...formData };
          setContacts([...contacts, mock]);
        } else {
          const created = await emergencyContactService.createContact(formData);
          setContacts([...contacts, created]);
        }
        showToast.success(`"${formData.name}" added to emergency contacts!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save emergency contact:', err);
      showToast.error(err.response?.data?.message || 'Failed to save contact.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this emergency contact?')) return;
    try {
      if (offlineMode || id.startsWith('mock')) {
        setContacts(contacts.filter((c) => c._id !== id));
      } else {
        await emergencyContactService.deleteContact(id);
        setContacts(contacts.filter((c) => c._id !== id));
      }
      showToast.success('Contact removed.');
    } catch (err) {
      console.error('Failed to delete contact:', err);
      showToast.error('Failed to remove contact.');
    }
  };

  // ── Grouped contacts ─────────────────────────────────────────────────────────

  const grouped = CONTACT_TYPES.reduce((acc, type) => {
    const items = contacts.filter((c) => c.type === type);
    if (items.length > 0) acc[type] = items;
    return acc;
  }, {});

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="page-header">
          <div className="w-56 h-7 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-80 h-4 bg-gray-100 rounded animate-pulse" />
        </div>
        <SkeletonLoader type="contact" count={4} />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h2 className="page-title text-gray-900 font-bold flex items-center gap-2">
            <PhoneCall size={22} className="text-blue-600" />
            Emergency Contacts
          </h2>
          <p className="page-subtitle text-gray-500">
            Manage doctors, hospitals, ambulances, and family contacts for quick access in emergencies
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto"
        >
          Add Contact
        </Button>
      </div>

      {/* Offline Alert */}
      {error && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-3.5 py-2.5 rounded-xl text-caption font-medium">
          <ErrorIcon size={16} className="text-blue-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Bar */}
      {contacts.length > 0 && <StatsBar contacts={contacts} />}

      {/* Empty State */}
      {contacts.length === 0 ? (
        <EmptyState
          icon={PhoneCall}
          title="No emergency contacts yet"
          description="Add doctors, hospitals, ambulance numbers, and key family contacts so they're always within reach when you need them most."
          actionText="Add Contact"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="space-y-8">
          {CONTACT_TYPES.map((type) => {
            if (!grouped[type]) return null;
            const meta = TYPE_META[type];
            const TypeIcon = meta.icon;

            return (
              <section key={type}>
                {/* Group Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`w-7 h-7 rounded-lg ${meta.bg} ${meta.color} border ${meta.border} flex items-center justify-center`}
                  >
                    <TypeIcon size={15} />
                  </div>
                  <h3 className="text-body font-bold text-gray-800">{meta.label}</h3>
                  <Badge variant={meta.badge} className="text-[10px] py-0.5">
                    {grouped[type].length}
                  </Badge>
                </div>

                {/* Cards Grid */}
                <div className="grid-cards">
                  {grouped[type].map((contact) => (
                    <ContactCard
                      key={contact._id}
                      contact={contact}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        contact={selectedContact}
        loading={submitting}
      />
    </div>
  );
};

export default EmergencyContacts;
