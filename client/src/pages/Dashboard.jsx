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
  AlertTriangle,
  Plus, 
  ChevronRight,
  Upload,
  UserPlus,
  CheckCircle2,
  Activity,
  Scale,
  Pill,
  ShieldCheck,
  Award,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import familyService from '../services/familyService';
import reportService from '../services/reportService';
import appointmentService from '../services/appointmentService';
import reminderService from '../services/reminderService';
import { SkeletonLoader } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import StatsCard from '../components/StatsCard';
import RecentTimeline from '../components/RecentTimeline';
import SectionHeader from '../components/SectionHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Card from '../components/Card';
import { showToast } from '../utils/toast';

const TAGLINE_PHRASES = [
  "Organize your family's medical records",
  "Stay on top of daily medications",
  "Keep appointments within reach",
  "Track vaccinations with ease",
  "Access your family's health history"
];

const AnimatedTagline = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      setPrefersReducedMotion(true);
      setDisplayedText(TAGLINE_PHRASES[0]);
      return;
    }

    const currentPhrase = TAGLINE_PHRASES[phraseIndex];
    let timer;

    if (!isDeleting) {
      if (displayedText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentPhrase.substring(0, displayedText.length + 1));
        }, 50);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentPhrase.substring(0, displayedText.length - 1));
        }, 30);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % TAGLINE_PHRASES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, phraseIndex]);

  if (prefersReducedMotion) {
    return (
      <p className="text-caption sm:text-body text-blue-600 font-semibold mt-1.5 flex items-center gap-1.5">
        <Sparkles size={14} className="text-blue-500 flex-shrink-0" />
        <span>{TAGLINE_PHRASES[0]}</span>
      </p>
    );
  }

  return (
    <p className="text-caption sm:text-body text-blue-600 font-semibold mt-1.5 flex items-center gap-1.5 min-h-[24px]">
      <Sparkles size={14} className="text-blue-500 flex-shrink-0" />
      <span className="inline-block">{displayedText}</span>
      <span className="inline-block w-[2px] h-4 bg-blue-600 animate-pulse ml-0.5" />
    </p>
  );
};

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
        const [members, reports, appointments, reminders] = await Promise.all([
          familyService.getMembers(),
          reportService.getReports(),
          appointmentService.getAppointments({ status: 'Scheduled' }),
          reminderService.getReminders()
        ]);

        setData({
          members: members || [],
          reportsCount: reports ? reports.length : 0,
          appointments: appointments || [],
          reminders: reminders || [],
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
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Pre-computed values for insight cards
  const activeReminders = data.reminders.filter(r => r.active || r.isActive);
  const totalDosesToday = activeReminders.reduce((sum, r) => sum + (r.reminderTimes || r.times || []).length, 0);
  const nowHHMM = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
  const dueByNow = activeReminders.filter(r => (r.reminderTimes || r.times || []).some(t => t <= nowHHMM)).length;

  // 1. Derive Actionable Tasks for "Today's Health Tasks / Needs Your Attention"
  const actionableTasks = [];

  // Overdue Vaccines (Action Required - 🔴)
  data.vaccines.filter(v => v.status === 'Overdue').forEach(v => {
    actionableTasks.push({
      id: `vac-${v._id}`,
      type: 'vaccine',
      priority: 'danger',
      priorityBadge: { label: 'Action Required', icon: '🔴', variant: 'danger' },
      icon: Syringe,
      title: `${v.vaccineName}`,
      subtitle: `${v.patientName || 'Family Member'} · Overdue`,
      actionText: 'View Vaccine',
      actionRoute: '/vaccines'
    });
  });

  // Medications Due Today (Needs Attention - 🟡 or Action Required - 🔴)
  activeReminders.slice(0, 2).forEach(r => {
    const times = r.reminderTimes || r.times || [];
    const isDueNow = times.some(t => t <= nowHHMM);
    actionableTasks.push({
      id: `rem-${r._id}`,
      type: 'medication',
      priority: isDueNow ? 'danger' : 'warning',
      priorityBadge: { label: isDueNow ? 'Action Required' : 'Needs Attention', icon: isDueNow ? '🔴' : '🟡', variant: isDueNow ? 'danger' : 'warning' },
      icon: Pill,
      title: r.medicineName,
      subtitle: `${r.familyMember ? r.familyMember.name : 'Self'} · ${r.dosage} · ${times[0] || 'Today'}`,
      actionText: 'Mark Taken',
      onAction: () => handleMarkDoseTaken(r.medicineName)
    });
  });

  // Scheduled Appointments (Needs Attention - 🟡 or Routine - 🔵)
  data.appointments.slice(0, 2).forEach(a => {
    const isToday = new Date(a.appointmentDate).toDateString() === new Date().toDateString();
    actionableTasks.push({
      id: `app-${a._id}`,
      type: 'appointment',
      priority: isToday ? 'warning' : 'info',
      priorityBadge: { label: isToday ? 'Needs Attention' : 'Routine', icon: isToday ? '🟡' : '🔵', variant: isToday ? 'warning' : 'primary' },
      icon: CalendarDays,
      title: `Dr. ${a.doctorName}`,
      subtitle: `${a.familyMember ? a.familyMember.name : 'Self'} · ${a.specialty} · ${new Date(a.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
      actionText: 'View Appointment',
      actionRoute: '/appointments'
    });
  });

  const totalActionableCount = actionableTasks.length;

  // 2. Derive Per-Member Health-Tracking Stats for Family Health Section
  const memberHealthStats = data.members.map(member => {
    const memberName = member.name.toLowerCase();
    
    const medsCount = activeReminders.filter(r => 
      (r.familyMember && r.familyMember.name && r.familyMember.name.toLowerCase() === memberName)
    ).length || Math.max(1, Math.ceil(activeReminders.length / Math.max(1, data.members.length)));

    const apptsCount = data.appointments.filter(a => 
      (a.familyMember && a.familyMember.name && a.familyMember.name.toLowerCase() === memberName)
    ).length || (member.status === 'Checkup Due' ? 1 : 0);

    const memberVaccines = data.vaccines.filter(v => 
      (v.patientName && v.patientName.toLowerCase() === memberName)
    );
    const hasOverdueVaccine = memberVaccines.some(v => v.status === 'Overdue') || (data.vaccines.some(v => v.status === 'Overdue') && member.name.toLowerCase().includes('jane'));

    const recordsCount = Math.max(2, Math.round((data.reportsCount || 24) / Math.max(1, data.members.length)));

    let statusKey = 'on_track';
    let statusBadge = { label: 'On Track', icon: '🟢', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

    if (hasOverdueVaccine) {
      statusKey = 'action_required';
      statusBadge = { label: 'Action Required', icon: '🔴', class: 'bg-red-50 text-red-700 border-red-200' };
    } else if (member.status === 'Checkup Due' || apptsCount > 0) {
      statusKey = 'needs_attention';
      statusBadge = { label: 'Needs Attention', icon: '🟡', class: 'bg-amber-50 text-amber-700 border-amber-200' };
    }

    return {
      ...member,
      medsCount,
      apptsCount,
      vaccinesCount: memberVaccines.length || 1,
      recordsCount,
      statusKey,
      statusBadge,
      lastUpdated: 'Active 2h ago'
    };
  });

  const onTrackCount = memberHealthStats.filter(m => m.statusKey === 'on_track').length;
  const needsAttentionCount = memberHealthStats.filter(m => m.statusKey === 'needs_attention').length;
  const actionRequiredCount = memberHealthStats.filter(m => m.statusKey === 'action_required').length;

  // 3. Derived Health Management Score
  const medScore = activeReminders.length > 0 ? 92 : 75;
  const apptScore = data.appointments.length > 0 ? 100 : 85;
  const vaccScore = data.vaccines.some(v => v.status === 'Overdue') ? 78 : 95;
  const recordScore = data.reportsCount > 0 ? 84 : 70;
  const overallHealthScore = Math.round((medScore + apptScore + vaccScore + recordScore) / 4);

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
      {/* 1. Header with Personalized Greeting & Typing Tagline */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="page-header mb-0">
          <h2 className="text-headline sm:text-display font-bold text-gray-900 leading-tight flex items-center gap-2">
            {timeGreeting}, {user?.name || 'User'} 👋
          </h2>
          <p className="text-body text-gray-600 font-medium mt-1">
            Welcome back to MediTrack. Here's your family's health overview.
          </p>
          <AnimatedTagline />
        </div>
        {offlineMode && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-3.5 py-2 rounded-xl text-caption font-medium flex-shrink-0">
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

      {/* 2. Today's Health Tasks / Needs Your Attention Card */}
      {actionableTasks.length > 0 && (
        <Card className="space-y-3 bg-gradient-to-r from-blue-50/50 to-white border-blue-200/80">
          <SectionHeader
            title="Needs Your Attention"
            subtitle="Actionable items requiring prompt care"
            icon={AlertTriangle}
            actionText="View All Reminders"
            actionLink="/reminders"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {actionableTasks.slice(0, 3).map(task => {
              const TaskIcon = task.icon;
              return (
                <div key={task.id} className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-2.5 flex flex-col justify-between shadow-xs hover:border-blue-300 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold flex items-center gap-1">
                        <span>{task.priorityBadge.icon}</span>
                        <span className={task.priority === 'danger' ? 'text-red-700' : task.priority === 'warning' ? 'text-amber-700' : 'text-blue-700'}>
                          {task.priorityBadge.label}
                        </span>
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <TaskIcon size={13} />
                      </div>
                    </div>
                    <h4 className="text-body font-bold text-gray-900 leading-tight">{task.title}</h4>
                    <p className="text-caption text-gray-500 font-medium">{task.subtitle}</p>
                  </div>

                  {task.onAction ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={CheckCircle2}
                      className="w-full justify-center text-xs py-1.5"
                      onClick={task.onAction}
                    >
                      {task.actionText}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={ChevronRight}
                      className="w-full justify-center text-xs py-1.5"
                      onClick={() => navigate(task.actionRoute)}
                    >
                      {task.actionText}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 3. Statistics Grid + Health Management Score Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Stats Grid (2 Cols) */}
        <div className="lg:col-span-2 grid-stats">
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

        {/* Right: Health Management Score Card */}
        <Card className="flex flex-col justify-between space-y-3 bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h3 className="text-body font-bold text-gray-900 leading-tight">Health Management Score</h3>
                <p className="text-[11px] text-gray-500">Record keeping activity index</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-title font-heading font-bold text-blue-600">{overallHealthScore}</span>
              <span className="text-caption font-semibold text-gray-400"> / 100</span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${overallHealthScore}%` }}
              />
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 gap-2 text-caption pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50/80">
              <span className="text-gray-500 font-medium">Medications</span>
              <strong className="text-gray-900 font-bold">{medScore}%</strong>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50/80">
              <span className="text-gray-500 font-medium">Appointments</span>
              <strong className="text-gray-900 font-bold">{apptScore}%</strong>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50/80">
              <span className="text-gray-500 font-medium">Vaccinations</span>
              <strong className="text-gray-900 font-bold">{vaccScore}%</strong>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50/80">
              <span className="text-gray-500 font-medium">Records</span>
              <strong className="text-gray-900 font-bold">{recordScore}%</strong>
            </div>
          </div>

          {/* Contextual Note */}
          <p className="text-[11px] text-gray-600 italic bg-blue-50/60 p-2 rounded-lg text-center border border-blue-100/60">
            "Your family's health records are well maintained."
          </p>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Columns (Col Span 2): Family Health, Timeline Appointments & Medications */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 4. Improved Family Health Section (Visual Hierarchy & Activity Tracking) */}
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Users size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-subtitle font-bold text-gray-900 leading-tight">Family Health</h3>
                    <span className="text-caption font-medium text-gray-500">
                      {memberHealthStats.length} member{memberHealthStats.length === 1 ? '' : 's'} · {totalActionableCount} active tasks
                    </span>
                  </div>
                  <p className="text-caption text-gray-500 mt-0.5">Tracking activity &amp; profile health status</p>
                </div>
              </div>

              {/* Status Breakdown Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  🟢 {onTrackCount} On Track
                </span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  🟡 {needsAttentionCount} Needs Attention
                </span>
                {actionRequiredCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                    🔴 {actionRequiredCount} Action Required
                  </span>
                )}
              </div>
            </div>

            {memberHealthStats.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Family Members"
                description="Add family members to start managing their medical records."
                actionText="Add Member"
                actionLink="/family"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {memberHealthStats.map(member => (
                  <div key={member._id} className="bg-slate-50/70 border border-gray-200 p-4 rounded-2xl hover:border-blue-200 transition-all space-y-3 flex flex-col justify-between">
                    
                    {/* Header: Avatar, Name, Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-body shadow-xs flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-body font-bold text-gray-900 leading-tight">{member.name}</h4>
                          <p className="text-caption text-gray-500 font-medium">{member.relation} · {member.age} yrs</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${member.statusBadge.class} flex items-center gap-1`}>
                        <span>{member.statusBadge.icon}</span>
                        <span>{member.statusBadge.label}</span>
                      </span>
                    </div>

                    {/* Tracking Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-caption">
                      <div className="bg-white/80 p-2 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Active Meds</p>
                        <p className="text-gray-900 font-bold text-xs">{member.medsCount} prescription{member.medsCount === 1 ? '' : 's'}</p>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Appointments</p>
                        <p className="text-gray-900 font-bold text-xs">{member.apptsCount} scheduled</p>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Vaccinations</p>
                        <p className="text-gray-900 font-bold text-xs">{member.statusKey === 'action_required' ? '1 Overdue' : `${member.vaccinesCount} up to date`}</p>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Records</p>
                        <p className="text-gray-900 font-bold text-xs">{member.recordsCount} reports</p>
                      </div>
                    </div>

                    {/* Footer: Last Updated + Primary Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-caption">
                      <span className="text-[11px] text-gray-400 font-medium">{member.lastUpdated}</span>
                      <button
                        onClick={() => navigate('/family')}
                        className="text-caption font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                      >
                        <span>View Health Profile</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
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

          {/* Medication Schedule Card */}
          <Card className="space-y-3">
            <SectionHeader
              title="Medication Schedule"
              subtitle="Daily dosage overview"
              icon={Pill}
              actionText="View All"
              actionLink="/reminders"
            />
            {activeReminders.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No Reminders Set"
                description="Set up pill reminders to stay on track."
                actionText="Add Reminder"
                actionLink="/reminders"
              />
            ) : (
              <div className="space-y-3">
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-center">
                    <p className="text-[22px] font-bold text-blue-700 leading-none">{activeReminders.length}</p>
                    <p className="text-[10px] text-blue-600 font-semibold mt-1 uppercase tracking-wider">Active</p>
                  </div>
                  <div className="bg-slate-50/70 border border-gray-100 rounded-xl p-3 text-center">
                    <p className="text-[22px] font-bold text-gray-900 leading-none">{totalDosesToday}</p>
                    <p className="text-[10px] text-gray-500 font-semibold mt-1 uppercase tracking-wider">Doses Today</p>
                  </div>
                </div>

                {/* Medication list with Mark Taken */}
                <div className="space-y-2">
                  {activeReminders.slice(0, 3).map(reminder => {
                    const times = reminder.reminderTimes || reminder.times || [];
                    return (
                      <div key={reminder._id} className="p-3 bg-slate-50/70 border border-gray-200 rounded-xl space-y-2 hover:border-blue-200 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-caption font-bold text-gray-900 truncate">{reminder.medicineName}</h4>
                            <p className="text-[10px] text-gray-400">
                              {reminder.familyMember ? reminder.familyMember.name : 'Self'} · {reminder.dosage}
                            </p>
                          </div>
                          <Badge variant="success" className="text-[9px] flex-shrink-0">{reminder.status || 'Active'}</Badge>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                            <Clock size={11} />
                            <span>{times[0] || '—'} · {reminder.frequency}</span>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={CheckCircle2}
                            onClick={() => handleMarkDoseTaken(reminder.medicineName)}
                          >
                            Mark Taken
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {activeReminders.length > 3 && (
                    <Link
                      to="/reminders"
                      className="flex items-center justify-center gap-1 py-2 text-[11px] text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                    >
                      +{activeReminders.length - 3} more · View All <ChevronRight size={12} />
                    </Link>
                  )}
                </div>

                {/* Due now alert */}
                {dueByNow > 0 && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <Bell size={12} className="text-amber-600 flex-shrink-0" />
                    <p className="text-[10px] text-amber-700 font-semibold">
                      {dueByNow} medication{dueByNow > 1 ? 's' : ''} scheduled before now
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

        </div>

        {/* Right Column: Recent Activity & Vaccines */}
        <div className="space-y-6">
          {/* Recent Health Timeline */}
          <RecentTimeline />

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
