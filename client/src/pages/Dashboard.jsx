import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CalendarDays, 
  Bell, 
  Syringe, 
  Activity, 
  Heart, 
  Clock, 
  ShieldAlert, 
  Plus, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import familyService from '../services/familyService';
import reportService from '../services/reportService';
import appointmentService from '../services/appointmentService';

const Dashboard = () => {
  const [data, setData] = useState({
    members: [],
    reportsCount: 0,
    appointments: [],
    reminders: [],
    vaccines: []
  });
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // Reusable Mock Fallbacks for Offline Mode / Demonstration
  const mockFamilyMembers = [
    { _id: 'm1', name: 'John Doe', relation: 'Self', age: 34, bloodGroup: 'O+', allergies: ['Penicillin'] },
    { _id: 'm2', name: 'Jane Doe', relation: 'Spouse', age: 32, bloodGroup: 'A+', allergies: [] },
    { _id: 'm3', name: 'Leo Doe', relation: 'Child', age: 5, bloodGroup: 'O+', allergies: ['Peanuts'] }
  ];

  const mockAppointments = [
    { _id: 'a1', doctorName: 'Sarah Jenkins', specialty: 'Pediatrician', hospital: 'St. Jude Children Hospital', appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 2).toISOString(), familyMember: { name: 'Leo Doe', relation: 'Child' }, notes: 'Routine 5-year checkup' },
    { _id: 'a2', doctorName: 'Robert Vance', specialty: 'Cardiologist', hospital: 'Mercy Health Center', appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 5).toISOString(), familyMember: null, notes: 'Follow-up ECG discussion' }
  ];

  const mockReminders = [
    { _id: 'r1', medicineName: 'Amoxicillin', dosage: '250mg', frequency: 'Three times daily', times: ['08:00', '14:00', '20:00'], familyMember: { name: 'Leo Doe' }, isActive: true },
    { _id: 'r2', medicineName: 'Multivitamin', dosage: '1 tablet', frequency: 'Daily', times: ['09:00'], familyMember: null, isActive: true }
  ];

  const mockVaccines = [
    { _id: 'v1', vaccineName: 'MMR Booster', patientName: 'Leo Doe', dateAdministered: '2026-06-15T00:00:00.000Z', nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 12).toISOString(), status: 'Scheduled' },
    { _id: 'v2', vaccineName: 'Influenza Annual', patientName: 'Jane Doe', dateAdministered: '2025-10-10T00:00:00.000Z', nextDueDate: new Date(Date.now() - 24 * 60 * 60 * 1000 * 30).toISOString(), status: 'Overdue' }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Call backend API services in parallel
        const [members, reports, appointments] = await Promise.all([
          familyService.getMembers(),
          reportService.getReports(),
          appointmentService.getAppointments({ status: 'Scheduled' })
        ]);

        setData({
          members: members || [],
          reportsCount: reports ? reports.length : 0,
          appointments: appointments || [],
          // Mocking dynamic entries not yet binded to controllers
          reminders: mockReminders,
          vaccines: mockVaccines
        });
        setOfflineMode(false);
      } catch (err) {
        console.warn('Backend server not connected. Falling back to local offline mock data.');
        setData({
          members: mockFamilyMembers,
          reportsCount: 3,
          appointments: mockAppointments,
          reminders: mockReminders,
          vaccines: mockVaccines
        });
        setOfflineMode(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="skeleton w-16 h-16 rounded-2xl mb-4" />
        <p className="text-gray-400 text-sm">Gathering medical updates...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h2 className="page-title text-gradient bg-gradient-to-r from-primary-400 to-secondary-400">
            Family Health Hub
          </h2>
          <p className="page-subtitle">Centralized medical records and schedule tracking</p>
        </div>
        {offlineMode && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2.5 rounded-xl text-sm animate-scale-in">
            <ShieldAlert size={16} />
            <span>Database offline. Displaying local records.</span>
          </div>
        )}
      </div>

      {/* Metrics Stats Grid */}
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-icon bg-primary-500/10 text-primary-400">
            <FileText size={22} />
          </div>
          <div>
            <p className="stat-label">Total Reports</p>
            <h3 className="stat-value">{data.reportsCount}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-emerald-500/10 text-emerald-400">
            <CalendarDays size={22} />
          </div>
          <div>
            <p className="stat-label">Appointments</p>
            <h3 className="stat-value">
              {data.appointments.filter(a => a.status === 'Scheduled').length}
            </h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-blue-500/10 text-blue-400">
            <Bell size={22} />
          </div>
          <div>
            <p className="stat-label">Active Reminders</p>
            <h3 className="stat-value">
              {data.reminders.filter(r => r.isActive).length}
            </h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-red-500/10 text-red-400">
            <Syringe size={22} />
          </div>
          <div>
            <p className="stat-label">Vaccines Alert</p>
            <h3 className="stat-value">
              {data.vaccines.filter(v => v.status === 'Overdue').length}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns (Col Span 2): Family & Appointments */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Family Profiles Summary */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-title text-white flex items-center gap-2">
                <Users className="text-primary-400" size={20} />
                Family Profiles
              </h3>
              <Link to="/family" className="text-caption text-primary-400 hover:text-primary-300 flex items-center gap-1">
                Manage Members
                <ChevronRight size={14} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.members.map(member => (
                <div key={member._id} className="bg-black/20 border border-white/5 p-4 rounded-xl hover:border-white/10 transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 font-heading font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-body font-semibold text-white leading-tight">{member.name}</h4>
                      <span className="badge badge-primary text-[10px] py-0.5 mt-1">{member.relation}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-caption text-gray-400 pt-2.5 border-t border-white/5">
                    <span>Age: <strong>{member.age}</strong></span>
                    <span>Blood: <strong className="text-red-400">{member.bloodGroup}</strong></span>
                  </div>
                </div>
              ))}
              <Link to="/family" className="border border-dashed border-white/10 hover:border-white/20 p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white transition-all duration-200 group">
                <Plus size={20} className="group-hover:scale-110 transition-transform duration-200" />
                <span className="text-caption">Add Family Member</span>
              </Link>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-title text-white flex items-center gap-2">
                <CalendarDays className="text-emerald-400" size={20} />
                Upcoming Appointments
              </h3>
              <Link to="/appointments" className="text-caption text-primary-400 hover:text-primary-300 flex items-center gap-1">
                View Calendar
                <ChevronRight size={14} />
              </Link>
            </div>

            {data.appointments.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No upcoming appointments.
              </div>
            ) : (
              <div className="space-y-4">
                {data.appointments.map(appt => (
                  <div key={appt._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-black/20 border border-white/5 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mt-0.5 flex-shrink-0">
                        <Heart size={18} />
                      </div>
                      <div>
                        <h4 className="text-body font-semibold text-white">Dr. {appt.doctorName}</h4>
                        <p className="text-caption text-gray-400 mt-0.5">{appt.specialty} • {appt.hospital}</p>
                        {appt.notes && <p className="text-caption text-gray-500 italic mt-1">"{appt.notes}"</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 gap-2">
                      <div className="text-right">
                        <p className="text-caption text-white font-medium">
                          {new Date(appt.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {new Date(appt.appointmentDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="badge badge-success text-[10px]">
                        {appt.familyMember ? appt.familyMember.name : 'Self'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Reminders & Vaccines */}
        <div className="space-y-8">
          
          {/* Active Medicine Reminders */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-title text-white flex items-center gap-2">
                <Clock className="text-blue-400" size={20} />
                Medications
              </h3>
              <Link to="/reminders" className="text-caption text-primary-400 hover:text-primary-300 flex items-center gap-1">
                View All
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3.5">
              {data.reminders.map(reminder => (
                <div key={reminder._id} className="p-3.5 bg-black/20 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-body font-semibold text-white leading-tight">{reminder.medicineName}</h4>
                    <p className="text-caption text-gray-400">{reminder.dosage} • {reminder.frequency}</p>
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-gray-500">
                      <Clock size={10} />
                      <span>{reminder.times.join(', ')}</span>
                      {reminder.familyMember && (
                        <span className="text-primary-400">• {reminder.familyMember.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vaccination Alerts */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-title text-white flex items-center gap-2">
                <Syringe className="text-red-400" size={20} />
                Vaccine Tracker
              </h3>
              <Link to="/vaccines" className="text-caption text-primary-400 hover:text-primary-300 flex items-center gap-1">
                Track
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3.5">
              {data.vaccines.map(vacc => (
                <div key={vacc._id} className="p-3.5 bg-black/20 border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-body font-semibold text-white">{vacc.vaccineName}</h4>
                    <span className={`badge text-[9px] py-0.5 ${vacc.status === 'Overdue' ? 'badge-danger animate-pulse-glow' : 'badge-warning'}`}>
                      {vacc.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-caption text-gray-400 pt-1.5 border-t border-white/5">
                    <span>Patient: <strong>{vacc.patientName}</strong></span>
                    <span>Due: <strong>{new Date(vacc.nextDueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
