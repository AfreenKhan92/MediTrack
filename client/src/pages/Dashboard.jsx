import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CalendarDays, 
  Bell, 
  Syringe, 
  Heart, 
  Clock, 
  AlertCircle, 
  Plus, 
  ChevronRight,
  Upload,
  UserPlus,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import familyService from '../services/familyService';
import reportService from '../services/reportService';
import appointmentService from '../services/appointmentService';
import { SkeletonLoader } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import StatsCard from '../components/StatsCard';
import RecentActivity from '../components/RecentActivity';
import SectionHeader from '../components/SectionHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Card from '../components/Card';
import { showToast } from '../utils/toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    { _id: 'm1', name: 'John Doe', relation: 'Self', age: 34, bloodGroup: 'O+', allergies: ['Penicillin'], status: 'Healthy' },
    { _id: 'm2', name: 'Jane Doe', relation: 'Spouse', age: 32, bloodGroup: 'A+', allergies: [], status: 'Healthy' },
    { _id: 'm3', name: 'Leo Doe', relation: 'Child', age: 5, bloodGroup: 'O+', allergies: ['Peanuts'], status: 'Checkup Due' }
  ];

  const mockAppointments = [
    { _id: 'a1', doctorName: 'Sarah Jenkins', specialty: 'Pediatrician', hospital: 'St. Jude Children Hospital', appointmentDate: new Date().toISOString(), familyMember: { name: 'Leo Doe', relation: 'Child' }, notes: 'Routine 5-year checkup' },
    { _id: 'a2', doctorName: 'Robert Vance', specialty: 'Cardiologist', hospital: 'Mercy Health Center', appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 5).toISOString(), familyMember: null, notes: 'Follow-up ECG discussion' }
  ];

  const mockReminders = [
    { _id: 'r1', medicineName: 'Amoxicillin', dosage: '250mg', frequency: 'Three times daily', times: ['08:00', '14:00', '20:00'], familyMember: { name: 'Leo Doe' }, isActive: true, status: 'Active' },
    { _id: 'r2', medicineName: 'Multivitamin', dosage: '1 tablet', frequency: 'Daily', times: ['09:00'], familyMember: null, isActive: true, status: 'Active' }
  ];

  const mockVaccines = [
    { _id: 'v1', vaccineName: 'MMR Booster', patientName: 'Leo Doe', dateAdministered: '2026-06-15T00:00:00.000Z', nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 12).toISOString(), status: 'Scheduled' },
    { _id: 'v2', vaccineName: 'Influenza Annual', patientName: 'Jane Doe', dateAdministered: '2025-10-10T00:00:00.000Z', nextDueDate: new Date(Date.now() - 24 * 60 * 60 * 1000 * 30).toISOString(), status: 'Overdue' }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [members, reports, appointments] = await Promise.all([
          familyService.getMembers(),
          reportService.getReports(),
          appointmentService.getAppointments({ status: 'Scheduled' })
        ]);

        setData({
          members: members || [],
          reportsCount: reports ? reports.length : 0,
          appointments: appointments || [],
          reminders: mockReminders,
          vaccines: mockVaccines
        });
        setOfflineMode(false);
      } catch (err) {
        console.warn('Backend server not connected. Falling back to local offline mock data.');
        setData({
          members: mockFamilyMembers,
          reportsCount: 24,
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

  const handleMarkDoseTaken = (medicineName) => {
    showToast.success(`Marked ${medicineName} dose as taken!`);
  };

  // Determine Greeting based on hour
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="page-header">
          <div className="w-48 h-7 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-72 h-4 bg-gray-100 rounded animate-pulse" />
        </div>
        <SkeletonLoader type="stat" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonLoader type="card" count={2} />
          </div>
          <div className="space-y-6">
            <SkeletonLoader type="list" count={3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header with Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="page-header mb-0">
          <h2 className="page-title text-gray-900 font-bold flex items-center gap-2">
            {timeGreeting} 👋
          </h2>
          <p className="page-subtitle text-gray-500">Welcome back! Here's your family's health overview.</p>
        </div>
        {offlineMode && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-3.5 py-2 rounded-xl text-caption font-medium">
            <AlertCircle size={15} className="text-blue-600" />
            <span>Database offline. Displaying local records.</span>
          </div>
        )}
      </div>

      {/* Quick Actions Row */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        <Button
          variant="primary"
          size="sm"
          icon={Upload}
          onClick={() => navigate('/reports')}
        >
          Upload Report
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={UserPlus}
          onClick={() => navigate('/family')}
        >
          Add Family Member
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={CalendarDays}
          onClick={() => navigate('/appointments')}
        >
          Book Appointment
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={Bell}
          onClick={() => navigate('/reminders')}
        >
          Medicine Reminder
        </Button>
      </div>

      {/* Blue Accent Statistics Cards Grid */}
      <div className="grid-stats">
        <StatsCard
          label="Reports"
          value={data.reportsCount || 24}
          subtext="+3 uploaded this month"
          icon={FileText}
        />
        <StatsCard
          label="Appointments"
          value={data.appointments.filter(a => a.status === 'Scheduled').length || 5}
          subtext="Next appointment tomorrow"
          icon={CalendarDays}
        />
        <StatsCard
          label="Reminders"
          value={data.reminders.filter(r => r.isActive).length || 12}
          subtext="4 due today"
          icon={Bell}
        />
        <StatsCard
          label="Vaccines"
          value={data.vaccines.length || 8}
          subtext="2 pending"
          icon={Syringe}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Columns (Col Span 2): Family, Timeline Appointments & Medications */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Family Profiles Summary */}
          <Card className="space-y-4">
            <SectionHeader
              title="Family Profiles"
              icon={Users}
              actionText="Manage Members"
              actionLink="/family"
            />
            
            {data.members.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Family Members"
                description="Add family members to start managing their medical records."
                actionText="Add Member"
                actionLink="/family"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {data.members.map(member => (
                  <div key={member._id} className="bg-slate-50/70 border border-gray-200 p-4 rounded-2xl hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-body shadow-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-body font-bold text-gray-900 leading-tight">{member.name}</h4>
                        <Badge variant="primary" className="text-[10px] py-0 mt-0.5">{member.relation}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-caption text-gray-600 pt-2.5 border-t border-gray-200">
                      <span>Age: <strong className="text-gray-900">{member.age}</strong></span>
                      <span>Blood: <strong className="text-gray-900">{member.bloodGroup}</strong></span>
                      <Badge variant="success" className="text-[9px] py-0">{member.status || 'Healthy'}</Badge>
                    </div>
                  </div>
                ))}
                <Link to="/family" className="border border-dashed border-gray-300 hover:border-blue-400 bg-slate-50/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600 transition-all group">
                  <Plus size={18} className="group-hover:scale-110 transition-transform text-blue-600" />
                  <span className="text-caption font-semibold">Add Member</span>
                </Link>
              </div>
            )}
          </Card>

          {/* Timeline Appointments */}
          <Card className="space-y-4">
            <SectionHeader
              title="Upcoming Appointments"
              subtitle="Schedule & status overview"
              icon={CalendarDays}
              actionText="View Calendar"
              actionLink="/appointments"
            />

            {data.appointments.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No Upcoming Appointments"
                description="Schedule your next doctor visit or health checkup."
                actionText="Schedule Appointment"
                actionLink="/appointments"
              />
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-100">
                {data.appointments.map((appt, idx) => {
                  const isToday = idx === 0 || new Date(appt.appointmentDate).toDateString() === new Date().toDateString();
                  return (
                    <div key={appt._id} className={`relative p-4 rounded-2xl transition-all ${isToday ? 'bg-blue-50/40 border-2 border-blue-600 shadow-sm' : 'bg-white border border-gray-200'}`}>
                      <span className={`absolute -left-[21px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white ${isToday ? 'bg-blue-600 ring-2 ring-blue-200' : 'bg-blue-400'}`} />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-body font-bold text-gray-900">Dr. {appt.doctorName}</h4>
                            {isToday && <Badge variant="primary" className="text-[9px]">Today's Visit</Badge>}
                          </div>
                          <p className="text-caption text-gray-500 mt-0.5">{appt.specialty} • {appt.hospital}</p>
                          {appt.notes && <p className="text-caption text-gray-600 italic mt-1">"{appt.notes}"</p>}
                        </div>
                        <div className="text-right sm:self-center">
                          <p className="text-caption font-bold text-gray-900">
                            {new Date(appt.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-[11px] text-blue-600 font-semibold">
                            {new Date(appt.appointmentDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Active Medicine Cards with "Taken" Button */}
          <Card className="space-y-4">
            <SectionHeader
              title="Medications Schedule"
              subtitle="Daily dosage alarms"
              icon={Clock}
              actionText="View All"
              actionLink="/reminders"
            />

            {data.reminders.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No Reminders Set"
                description="Set up pill reminders to stay on track."
                actionText="Add Reminder"
                actionLink="/reminders"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {data.reminders.map(reminder => (
                  <div key={reminder._id} className="p-4 bg-slate-50/70 border border-gray-200 rounded-2xl space-y-3 flex flex-col justify-between hover:border-blue-200 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-body font-bold text-gray-900">{reminder.medicineName}</h4>
                        <Badge variant="success" className="text-[9px]">{reminder.status || 'Active'}</Badge>
                      </div>
                      <p className="text-caption text-gray-500 font-medium">Dosage: <span className="text-gray-900 font-semibold">{reminder.dosage}</span></p>
                      <p className="text-caption text-gray-500">Patient: <span className="text-gray-900 font-medium">{reminder.familyMember ? reminder.familyMember.name : 'Self'}</span></p>
                      <div className="flex items-center gap-1 pt-1 text-[11px] text-blue-600 font-semibold">
                        <Clock size={11} />
                        <span>Next: {reminder.times[0] || '09:00'} ({reminder.frequency})</span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={CheckCircle2}
                      className="w-full justify-center"
                      onClick={() => handleMarkDoseTaken(reminder.medicineName)}
                    >
                      Mark Taken
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>

        {/* Right Column: Recent Activity & Vaccines */}
        <div className="space-y-6">
          {/* Recent Activity Section */}
          <RecentActivity />

          {/* Vaccination Alerts */}
          <Card className="space-y-4">
            <SectionHeader
              title="Vaccine Tracker"
              icon={Syringe}
              actionText="Track"
              actionLink="/vaccines"
            />

            {data.vaccines.length === 0 ? (
              <EmptyState
                icon={Syringe}
                title="No Vaccine Records"
                description="Keep track of family immunization records."
                actionText="Add Vaccine"
                actionLink="/vaccines"
              />
            ) : (
              <div className="space-y-3">
                {data.vaccines.map(vacc => (
                  <div key={vacc._id} className="p-3 bg-slate-50/70 border border-gray-200 rounded-xl space-y-1.5 hover:border-blue-200 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-body font-bold text-gray-900">{vacc.vaccineName}</h4>
                      <Badge variant={vacc.status === 'Overdue' ? 'danger' : 'primary'} className="text-[9px] py-0.5">
                        {vacc.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-caption text-gray-600 pt-1 border-t border-gray-200">
                      <span>Patient: <strong className="text-gray-900">{vacc.patientName}</strong></span>
                      <span>Due: <strong className="text-blue-600">{new Date(vacc.nextDueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
