import React from 'react';
import { FileText, CalendarDays, Bell, Syringe, Activity } from 'lucide-react';
import StatsCard from '../../components/StatsCard';

const TimelineStats = ({ events }) => {
  const total = events.length;
  const reports = events.filter(e => e.type === 'report').length;
  const appointments = events.filter(e => e.type === 'appointment').length;
  const medicines = events.filter(e => e.type === 'medicine').length;
  const vaccinations = events.filter(e => e.type === 'vaccination').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatsCard
        label="Total Events"
        value={total}
        subtext="All health records"
        icon={Activity}
        showTrend={false}
      />
      <StatsCard
        label="Reports"
        value={reports}
        subtext="Medical reports"
        icon={FileText}
        showTrend={false}
      />
      <StatsCard
        label="Appointments"
        value={appointments}
        subtext="Doctor visits"
        icon={CalendarDays}
        showTrend={false}
      />
      <StatsCard
        label="Medicines"
        value={medicines}
        subtext="Active reminders"
        icon={Bell}
        showTrend={false}
      />
      <StatsCard
        label="Vaccinations"
        value={vaccinations}
        subtext="Vaccine records"
        icon={Syringe}
        showTrend={false}
      />
    </div>
  );
};

export default TimelineStats;
