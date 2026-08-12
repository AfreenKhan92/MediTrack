import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  User, Mail, Shield, Calendar, Phone, Activity, Settings, Bell, Lock,
  CheckCircle2, AlertTriangle, Eye, RefreshCw, Key, Users, CalendarDays,
  Syringe, Heart, Database, Image, Scan, Brain, Compass, Server, Check,
  ArrowRight, HelpCircle, Ban, Download, FileJson, Trash2, Edit3, UserCheck,
  Plus, Globe, Clock, ShieldAlert, CheckSquare, Sparkles, X, FileText
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { showToast } from '../utils/toast';

// Services
import familyService from '../services/familyService';
import reportService from '../services/reportService';
import appointmentService from '../services/appointmentService';
import reminderService from '../services/reminderService';
import vaccineService from '../services/vaccineService';
import timelineService from '../services/timelineService';
import emergencyContactService from '../services/emergencyContactService';

const Profile = () => {
  const { user, logout } = useAuth();

  // Simulated Local State to allow visual updates without database mutation
  const [personalInfo, setPersonalInfo] = useState({
    phone: '',
    gender: 'Prefer not to say',
    dateOfBirth: '',
    address: '',
    bloodGroup: 'Unknown',
    emergencyNotes: ''
  });

  const [emergencyContact, setEmergencyContact] = useState(null);

  // Statistics State
  const [stats, setStats] = useState({
    reports: 0,
    family: 0,
    appointments: 0,
    reminders: 0,
    vaccinations: 0,
    timeline: 0
  });

  const [loadingStats, setLoadingStats] = useState(true);

  // Modal States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form States
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: '',
    gender: 'Prefer not to say',
    dateOfBirth: '',
    address: '',
    bloodGroup: 'Unknown',
    emergencyNotes: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Extract Creation Date from MongoDB ObjectId
  const getRegistrationDate = () => {
    const id = user?._id || user?.id;
    if (!id || id.length !== 24) return new Date();
    try {
      const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
      return new Date(timestamp);
    } catch {
      return new Date();
    }
  };

  const registrationDate = getRegistrationDate();

  // Load profile data and statistics
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoadingStats(true);

        // Fetch counts & related data
        const [
          members,
          reports,
          appointments,
          reminders,
          vaccines,
          timeline,
          contacts
        ] = await Promise.all([
          familyService.getMembers().catch(() => []),
          reportService.getReports().catch(() => []),
          appointmentService.getAppointments().catch(() => []),
          reminderService.getReminders().catch(() => []),
          vaccineService.getVaccines().catch(() => []),
          timelineService.getTimeline().catch(() => []),
          emergencyContactService.getContacts().catch(() => [])
        ]);

        // Find "Self" family profile to sync personal details
        const selfMember = members.find(m => m.relation === 'Self' || m.name?.toLowerCase() === user?.name?.toLowerCase());
        if (selfMember) {
          const formattedDob = selfMember.dateOfBirth
            ? new Date(selfMember.dateOfBirth).toISOString().substring(0, 10)
            : '';

          setPersonalInfo({
            phone: selfMember.phone || '',
            gender: selfMember.gender || 'Prefer not to say',
            dateOfBirth: formattedDob,
            address: selfMember.address || '',
            bloodGroup: selfMember.bloodGroup || 'Unknown',
            emergencyNotes: selfMember.notes || ''
          });

          setEditForm(prev => ({
            ...prev,
            gender: selfMember.gender || 'Prefer not to say',
            dateOfBirth: formattedDob,
            bloodGroup: selfMember.bloodGroup || 'Unknown',
            emergencyNotes: selfMember.notes || ''
          }));
        }

        // Set emergency contact
        if (contacts && contacts.length > 0) {
          const emergency = contacts.find(c => c.type === 'Hospital' || c.type === 'Family') || contacts[0];
          setEmergencyContact(emergency);
        }

        setStats({
          reports: reports.length,
          family: members.length,
          appointments: appointments.length,
          reminders: reminders.length,
          vaccinations: vaccines.length,
          timeline: timeline.length
        });

      } catch (err) {
        console.error('Error fetching profile dashboard statistics', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // Handle Edit Profile Submission
  const handleEditProfileSubmit = (e) => {
    e.preventDefault();
    setPersonalInfo({
      phone: editForm.phone,
      gender: editForm.gender,
      dateOfBirth: editForm.dateOfBirth,
      address: editForm.address,
      bloodGroup: editForm.bloodGroup,
      emergencyNotes: editForm.emergencyNotes
    });
    setShowEditProfileModal(false);
    showToast.success('Profile details updated simulated successfully (Demo Mode)!');
  };

  // Handle Change Password Submission
  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast.error('New passwords do not match');
      return;
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowChangePasswordModal(false);
    showToast.success('Password changed simulated successfully (Demo Mode)!');
  };

  // Handle Account Deletion
  const handleDeleteAccount = (e) => {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE') {
      showToast.error('Please enter "DELETE" to confirm.');
      return;
    }
    setShowDeleteModal(false);
    showToast.success('Deactivation request registered.');
    setTimeout(() => {
      logout();
    }, 1500);
  };

  // Export JSON Data
  const handleExportData = () => {
    const backupData = {
      user: {
        id: user?._id || user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        registeredAt: registrationDate
      },
      personal: personalInfo,
      emergency: emergencyContact,
      stats: stats,
      exportedAt: new Date().toISOString(),
      app: 'MediTrack - Family Health Record Manager'
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.name?.replace(/\s+/g, '_')}_meditrack_data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast.success('Medical data backup file downloaded successfully!');
  };

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 18 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6 pb-12"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Account Profile</h1>
          <p className="text-[14px] text-gray-500 mt-1.5">
            Manage your personal profile, credentials, preferences, and emergency settings.
          </p>
        </div>
      </div>

      {/* SECTION 1: Large Profile Header Card */}
      <motion.div variants={cardVariants}>
        <div className="relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar with scale-up hover animation */}
            <div className="relative group/avatar cursor-pointer flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-display shadow-md hover:scale-105 transition-transform duration-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <span className="text-white text-[10px] font-bold">Edit Avatar</span>
              </div>
            </div>

            <div className="text-center sm:text-left min-w-0">
              <h2 className="text-[22px] font-bold text-gray-900 leading-tight">
                {user?.name || 'User Name'}
              </h2>
              <p className="text-[14px] text-gray-500 mt-1 font-medium">{user?.email}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-3.5">
                <Badge variant="primary" className="text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider">
                  {user?.role || 'User'}
                </Badge>
                <Badge variant="success" className="text-[10px] px-2.5 py-0.5 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Active
                </Badge>
              </div>

              <div className="text-[14px] text-gray-400 mt-3 flex items-center justify-center sm:justify-start gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                <span>Member since {registrationDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              icon={Edit3}
              className="w-full sm:w-auto justify-center"
              onClick={() => {
                setEditForm({
                  name: user?.name || '',
                  phone: personalInfo.phone,
                  gender: personalInfo.gender,
                  dateOfBirth: personalInfo.dateOfBirth,
                  address: personalInfo.address,
                  bloodGroup: personalInfo.bloodGroup,
                  emergencyNotes: personalInfo.emergencyNotes
                });
                setShowEditProfileModal(true);
              }}
            >
              Edit Profile
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Key}
              className="w-full sm:w-auto justify-center"
              onClick={() => setShowChangePasswordModal(true)}
            >
              Change Password
            </Button>
          </div>
        </div>
      </motion.div>

      {/* STATISTICS: Horizontal Strip */}
      <motion.div variants={cardVariants}>
        <div className="h-[80px] px-8 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-row items-center justify-between gap-4 overflow-x-auto hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 flex-shrink-0">
            <FileText size={18} className="text-gray-400" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-[16px] font-bold text-gray-900">{stats.reports}</span>
              <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Reports</span>
            </div>
          </div>
          <div className="h-4 w-px bg-gray-100 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <Users size={18} className="text-gray-400" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-[16px] font-bold text-gray-900">{stats.family}</span>
              <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Family</span>
            </div>
          </div>
          <div className="h-4 w-px bg-gray-100 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <CalendarDays size={18} className="text-gray-400" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-[16px] font-bold text-gray-900">{stats.appointments}</span>
              <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Appointments</span>
            </div>
          </div>
          <div className="h-4 w-px bg-gray-100 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <Syringe size={18} className="text-gray-400" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-[16px] font-bold text-gray-900">{stats.vaccinations}</span>
              <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Vaccines</span>
            </div>
          </div>
          <div className="h-4 w-px bg-gray-100 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <Activity size={18} className="text-gray-400" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-[16px] font-bold text-gray-900">{stats.timeline}</span>
              <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Events</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Col Span 7): SECTION 2 - Personal Information */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div variants={cardVariants}>
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
              <div>
                <h2 className="text-[22px] font-bold text-gray-900">Personal Information</h2>
                <p className="text-[14px] text-gray-500 mt-1">Demographic and emergency medical details.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex items-start gap-3">
                  <User size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider block">Full Name</span>
                    <span className="text-[16px] font-medium text-gray-900 block mt-1">{user?.name || '—'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider block">Email Address</span>
                    <span className="text-[16px] font-medium text-gray-900 block mt-1">{user?.email || '—'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider block">Phone Number</span>
                    <span className={`text-[16px] font-medium block mt-1 ${personalInfo.phone ? 'text-gray-900' : 'text-gray-400'}`}>
                      {personalInfo.phone || 'Not Added'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider block">Gender</span>
                    <span className={`text-[16px] font-medium block mt-1 ${personalInfo.gender ? 'text-gray-900' : 'text-gray-400'}`}>
                      {personalInfo.gender || 'Not Added'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider block">Date of Birth</span>
                    <span className={`text-[16px] font-medium block mt-1 ${personalInfo.dateOfBirth ? 'text-gray-900' : 'text-gray-400'}`}>
                      {personalInfo.dateOfBirth
                        ? new Date(personalInfo.dateOfBirth).toLocaleDateString('en-US', { dateStyle: 'long' })
                        : 'Not Added'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Heart size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider block">Blood Group</span>
                    <span className={`text-[16px] font-medium block mt-1 ${personalInfo.bloodGroup && personalInfo.bloodGroup !== 'Unknown' ? 'text-gray-900' : 'text-gray-400'}`}>
                      {personalInfo.bloodGroup && personalInfo.bloodGroup !== 'Unknown' ? personalInfo.bloodGroup : 'Not Added'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <Compass size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider block">Address</span>
                    <span className={`text-[16px] font-medium block mt-1 ${personalInfo.address ? 'text-gray-900' : 'text-gray-400'}`}>
                      {personalInfo.address || 'Not Added'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2 border-t border-gray-100 pt-4">
                  <ShieldAlert size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider block">Primary Emergency Contact</span>
                    <span className={`text-[16px] font-medium block mt-1 ${emergencyContact ? 'text-gray-900' : 'text-gray-400'}`}>
                      {emergencyContact
                        ? `${emergencyContact.name} (${emergencyContact.phone}) [${emergencyContact.type}]`
                        : 'Not Added'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2 border-t border-gray-100 pt-4">
                  <CheckSquare size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider block">Medical ID</span>
                    <span className="text-[16px] font-medium text-gray-400 block mt-1">Not Added</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2 border-t border-gray-100 pt-4">
                  <Settings size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider block">Emergency Medical Notes</span>
                    <p className={`text-[16px] font-medium mt-1 leading-relaxed ${personalInfo.emergencyNotes ? 'text-gray-900' : 'text-gray-400'}`}>
                      {personalInfo.emergencyNotes || 'Not Added'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column (Col Span 5): SECTION 3 - Account Information & Preferences */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SECTION 3: Account Information */}
          <motion.div variants={cardVariants}>
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
              <div>
                <h2 className="text-[22px] font-bold text-gray-900">Account Information</h2>
                <p className="text-[14px] text-gray-500 mt-1">Security metadata and session audits.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">User ID</span>
                  <span className="font-mono text-[14px] text-gray-900 font-semibold">{user?._id || user?.id}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Registration Date</span>
                  <span className="text-[16px] font-medium text-gray-900">
                    {registrationDate.toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Last Login</span>
                  <span className="text-[16px] font-medium text-gray-900">
                    {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Email Verified</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
                    Verified
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Role</span>
                  <span className="text-[16px] font-medium text-gray-900 capitalize">{user?.role || 'user'}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Session Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preferences Card */}
          <motion.div variants={cardVariants}>
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[22px] font-bold text-gray-900">Preferences</h2>
                  <p className="text-[14px] text-gray-500 mt-1">Application localization and themes.</p>
                </div>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>

              <div className="space-y-4 opacity-60">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Theme</span>
                  <span className="text-[14px] font-medium text-gray-900">Light Theme</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Language</span>
                  <span className="text-[14px] font-medium text-gray-900">English (US)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Notification Settings</span>
                  <span className="text-[14px] font-medium text-gray-900">All Notifications Enabled</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Timezone</span>
                  <span className="text-[14px] font-medium text-gray-900">UTC +05:30 (IST)</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>

      {/* DANGER ZONE: Bottom Warning Card */}
      <motion.div variants={cardVariants}>
        <div className="p-8 bg-white rounded-2xl shadow-sm border border-red-200 flex flex-col md:flex-row items-center justify-between gap-6 mt-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-red-900">Danger Zone</h3>
              <p className="text-[14px] text-gray-500 mt-1">Export your data or permanently deactivate or delete your account records.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              className="w-full sm:w-auto justify-center border-gray-200 text-gray-700 font-bold"
              onClick={handleExportData}
            >
              Export Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Ban}
              className="w-full sm:w-auto justify-center border-red-200 hover:bg-red-50 text-red-600 font-bold"
              onClick={() => {
                setDeleteConfirmText('');
                setShowDeleteModal(true);
              }}
            >
              Deactivate Account
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              className="w-full sm:w-auto justify-center font-bold"
              onClick={() => {
                setDeleteConfirmText('');
                setShowDeleteModal(true);
              }}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── MODALS SECTION ── */}
      <AnimatePresence>
        
        {/* Edit Profile Modal */}
        {showEditProfileModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 shadow-xl rounded-2xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  <h3 className="text-subtitle font-bold text-gray-900">Edit Profile Information</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleEditProfileSubmit} className="space-y-4">
                <div className="form-group mb-0">
                  <label className="form-label text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    className="form-input text-xs"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="e.g. +1 555-0199"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group mb-0">
                    <label className="form-label text-[10px]">Gender</label>
                    <select
                      className="form-select text-xs"
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label text-[10px]">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input text-xs"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group mb-0">
                    <label className="form-label text-[10px]">Blood Group</label>
                    <select
                      className="form-select text-xs"
                      value={editForm.bloodGroup}
                      onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label text-[10px]">Address</label>
                    <input
                      type="text"
                      className="form-input text-xs"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      placeholder="e.g. 123 Main St"
                    />
                  </div>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label text-[10px]">Emergency Medical Notes</label>
                  <textarea
                    className="form-textarea text-xs min-h-[70px]"
                    value={editForm.emergencyNotes}
                    onChange={(e) => setEditForm({ ...editForm, emergencyNotes: e.target.value })}
                    placeholder="Allergies, chronic conditions, etc..."
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditProfileModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 shadow-xl rounded-2xl w-full max-w-sm p-6"
            >
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-blue-600" />
                  <h3 className="text-subtitle font-bold text-gray-900">Change Password</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div className="form-group mb-0">
                  <label className="form-label text-[10px]">Current Password</label>
                  <input
                    type="password"
                    required
                    className="form-input text-xs"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label text-[10px]">New Password</label>
                  <input
                    type="password"
                    required
                    className="form-input text-xs"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label text-[10px]">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    className="form-input text-xs"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChangePasswordModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 shadow-xl rounded-2xl w-full max-w-sm p-6"
            >
              <div className="flex items-center gap-2 mb-3 text-red-600">
                <AlertTriangle size={20} />
                <h3 className="text-subtitle font-bold">Are you absolutely sure?</h3>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                This action is irreversible. All of your uploaded medical documents, family records, appointments, reminders, and historical data will be permanently wiped.
              </p>

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div className="form-group mb-0">
                  <label className="form-label text-[10px] text-red-800">
                    Type <strong className="font-extrabold">DELETE</strong> to confirm
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DELETE"
                    className="form-input text-xs border-red-200 focus:border-red-600 focus:ring-red-600/20"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    size="sm"
                  >
                    Permanently Delete Profile
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
