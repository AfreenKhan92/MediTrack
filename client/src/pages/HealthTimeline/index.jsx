import React, { useState, useEffect, useMemo } from 'react';
import { Activity, ShieldAlert as OfflineIcon } from 'lucide-react';
import timelineService from '../../services/timelineService';
import TimelineStats from './TimelineStats';
import TimelineFilters from './TimelineFilters';
import TimelineCard from './TimelineCard';
import TimelineSkeleton from './TimelineSkeleton';
import TimelineEmptyState from './TimelineEmptyState';

// ─── Offline mock data ────────────────────────────────────────────────────────

const MOCK_EVENTS = [
  {
    id: 'mock1',
    type: 'report',
    title: 'CBC Blood Test Report',
    description: 'Lab Test record uploaded.',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    familyMember: 'Papa',
    status: 'Completed',
    relatedRecordId: 'mock1',
  },
  {
    id: 'mock2',
    type: 'appointment',
    title: 'Appointment – Dr. Priya Sharma',
    description: 'Cardiologist · Apollo Hospital',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    familyMember: 'Self',
    status: 'Completed',
    relatedRecordId: 'mock2',
  },
  {
    id: 'mock3',
    type: 'medicine',
    title: 'Medicine – Thyronorm 50mcg',
    description: '1 tablet · Once daily',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    familyMember: 'Mummy',
    status: 'Active',
    relatedRecordId: 'mock3',
  },
  {
    id: 'mock4',
    type: 'vaccination',
    title: 'COVID-19 Booster (Dose 3)',
    description: 'Administered by Dr. Kapoor',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    familyMember: 'Self',
    status: 'Administered',
    relatedRecordId: 'mock4',
  },
  {
    id: 'mock5',
    type: 'appointment',
    title: 'Appointment – Dr. Rahul Mehta',
    description: 'General Physician · City Clinic',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    familyMember: 'Leo',
    status: 'Scheduled',
    relatedRecordId: 'mock5',
  },
  {
    id: 'mock6',
    type: 'report',
    title: 'Chest X-Ray',
    description: 'Lab Test record uploaded.',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    familyMember: 'Papa',
    status: 'Completed',
    relatedRecordId: 'mock6',
  },
  {
    id: 'mock7',
    type: 'vaccination',
    title: 'MMR Booster (Dose 1)',
    description: 'Vaccination record.',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    familyMember: 'Leo',
    status: 'Administered',
    relatedRecordId: 'mock7',
  },
  {
    id: 'mock8',
    type: 'medicine',
    title: 'Medicine – Amoxicillin 500mg',
    description: '1 capsule · Three times daily',
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    familyMember: 'Leo',
    status: 'Inactive',
    relatedRecordId: 'mock8',
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────

const HealthTimeline = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [error, setError] = useState(null);

  // Filter state
  const [activeType, setActiveType] = useState('all');
  const [search, setSearch] = useState('');
  const [activeMember, setActiveMember] = useState('all');

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const data = await timelineService.getTimeline();
        setAllEvents(data);
        setOfflineMode(false);
        setError(null);
      } catch (err) {
        console.warn('Backend not reachable — showing offline mock data.');
        setAllEvents(MOCK_EVENTS);
        setOfflineMode(true);
        setError('Database server not connected. Displaying offline demonstration data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  // ── Derived: unique family member names ────────────────────────────────────

  const members = useMemo(() => {
    const names = [...new Set(allEvents.map(e => e.familyMember).filter(Boolean))];
    return names.sort();
  }, [allEvents]);

  // ── Filtered events ────────────────────────────────────────────────────────

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      if (activeType !== 'all' && event.type !== activeType) return false;
      if (activeMember !== 'all' && event.familyMember !== activeMember) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          event.title?.toLowerCase().includes(q) ||
          event.description?.toLowerCase().includes(q) ||
          event.familyMember?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allEvents, activeType, activeMember, search]);

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="page-header">
          <div className="w-56 h-7 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-80 h-4 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-gray-50 border border-gray-200 animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-16 h-3 bg-gray-200 rounded" />
                <div className="w-10 h-6 bg-gray-300 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse h-20" />
        <TimelineSkeleton count={5} />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div className="page-header mb-0">
        <h2 className="page-title text-gray-900 font-bold flex items-center gap-2">
          <Activity size={22} className="text-blue-600" />
          Health Timeline
        </h2>
        <p className="page-subtitle text-gray-500">
          View your family's complete medical journey in one place.
        </p>
      </div>

      {/* Offline alert */}
      {error && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-3.5 py-2.5 rounded-xl text-caption font-medium">
          <OfflineIcon size={16} className="text-blue-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats bar */}
      <TimelineStats events={allEvents} />

      {/* Filter bar */}
      <TimelineFilters
        activeType={activeType}
        onTypeChange={setActiveType}
        search={search}
        onSearchChange={setSearch}
        members={members}
        activeMember={activeMember}
        onMemberChange={setActiveMember}
      />

      {/* Result count */}
      {!loading && (
        <p className="text-caption text-gray-400 font-medium">
          Showing{' '}
          <span className="text-gray-700 font-semibold">{filteredEvents.length}</span> of{' '}
          <span className="text-gray-700 font-semibold">{allEvents.length}</span> events
        </p>
      )}

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <TimelineEmptyState />
      ) : (
        <div>
          {filteredEvents.map((event, idx) => (
            <TimelineCard
              key={event.id}
              event={event}
              isLast={idx === filteredEvents.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthTimeline;
