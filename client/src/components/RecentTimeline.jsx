import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, FileText, CalendarDays, Pill, Syringe, ChevronRight } from 'lucide-react';
import Card from './Card';
import SectionHeader from './SectionHeader';
import { SkeletonLoader } from './SkeletonLoader';
import timelineService from '../services/timelineService';

// ─── Type icon map ────────────────────────────────────────────────────────────

const TYPE_ICON = {
  report: FileText,
  appointment: CalendarDays,
  medicine: Pill,
  vaccination: Syringe,
};

const TYPE_COLOR = {
  report: 'text-blue-600 bg-blue-50 border-blue-100',
  appointment: 'text-violet-600 bg-violet-50 border-violet-100',
  medicine: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  vaccination: 'text-amber-600 bg-amber-50 border-amber-100',
};

// ─── Static fallback (shown if fetch fails) ───────────────────────────────────

const FALLBACK = [
  { id: 'f1', type: 'report', title: 'Blood Cholesterol Profile uploaded', date: null },
  { id: 'f2', type: 'medicine', title: 'Amoxicillin dose reminder set', date: null },
  { id: 'f3', type: 'appointment', title: 'Consultation with Dr. Sarah Jenkins', date: null },
  { id: 'f4', type: 'vaccination', title: 'MMR Booster vaccination recorded', date: null },
  { id: 'f5', type: 'report', title: 'Chest X-Ray uploaded', date: null },
];

// ─── Helper: relative time ────────────────────────────────────────────────────

const relativeTime = (date) => {
  if (!date) return 'Recently';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

// ─── Component ────────────────────────────────────────────────────────────────

const RecentTimeline = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    timelineService
      .getTimeline()
      .then((data) => setEvents(data.slice(0, 5)))
      .catch(() => setEvents(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const displayEvents = events.length > 0 ? events : FALLBACK;

  return (
    <Card className="space-y-4">
      <SectionHeader
        title="Recent Health Timeline"
        icon={Activity}
        actionText="View Full Timeline"
        actionLink="/timeline"
      />

      {loading ? (
        <SkeletonLoader type="timeline" count={5} />
      ) : (
        <div className="space-y-2.5">
        {displayEvents.map((item) => {
          const Icon = TYPE_ICON[item.type] || FileText;
          const colorClass = TYPE_COLOR[item.type] || TYPE_COLOR.report;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${colorClass}`}
                >
                  <Icon size={14} />
                </div>
                <p className="text-body font-medium text-gray-900 text-sm leading-snug truncate">
                  {item.title}
                </p>
              </div>
              <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap pl-2 flex-shrink-0">
                {relativeTime(item.date)}
              </span>
            </div>
          );
        })}
      </div>
      )}

      <Link
        to="/timeline"
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-dashed border-blue-200 text-caption font-semibold text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all"
      >
        View Full Timeline
        <ChevronRight size={13} />
      </Link>
    </Card>
  );
};

export default RecentTimeline;
