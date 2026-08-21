import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CalendarDays,
  Pill,
  Syringe,
  ChevronRight,
  User,
  Calendar,
} from 'lucide-react';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/dateUtils';

// ─── Type metadata ─────────────────────────────────────────────────────────────

const TYPE_META = {
  report: {
    icon: FileText,
    label: 'Report',
    dotColor: 'bg-blue-600',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    iconBorder: 'border-blue-100',
    badge: 'primary',
    route: '/reports',
  },
  appointment: {
    icon: CalendarDays,
    label: 'Appointment',
    dotColor: 'bg-violet-600',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    iconBorder: 'border-violet-100',
    badge: 'info',
    route: '/appointments',
  },
  medicine: {
    icon: Pill,
    label: 'Medicine',
    dotColor: 'bg-emerald-600',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    iconBorder: 'border-emerald-100',
    badge: 'success',
    route: '/reminders',
  },
  vaccination: {
    icon: Syringe,
    label: 'Vaccination',
    dotColor: 'bg-amber-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconBorder: 'border-amber-100',
    badge: 'warning',
    route: '/vaccines',
  },
};

// ─── Status badge variant mapping ─────────────────────────────────────────────

const statusVariant = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'completed' || s === 'administered' || s === 'active') return 'success';
  if (s === 'scheduled') return 'primary';
  if (s === 'overdue') return 'danger';
  if (s === 'cancelled' || s === 'inactive') return 'secondary';
  return 'secondary';
};

// ─── TimelineCard ─────────────────────────────────────────────────────────────

const TimelineCard = ({ event, isLast }) => {
  const navigate = useNavigate();
  const meta = TYPE_META[event.type] || TYPE_META.report;
  const TypeIcon = meta.icon;

  return (
    <div className="relative flex gap-4 group">
      {/* Left rail: dot + vertical line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-3.5 h-3.5 rounded-full ${meta.dotColor} border-2 border-white shadow-sm ring-2 ring-offset-1 ring-gray-200 mt-1.5 flex-shrink-0 z-10`}
        />
        {!isLast && (
          <div className="w-px flex-1 bg-gradient-to-b from-gray-300 to-gray-100 mt-1" />
        )}
      </div>

      {/* Card body */}
      <div
        className={`
          flex-1 mb-6 bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5
          transition-all duration-200
          group-hover:border-gray-300 group-hover:shadow-md group-hover:-translate-y-0.5
        `}
      >
        {/* Top row: icon + title + type badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl ${meta.iconBg} ${meta.iconColor} border ${meta.iconBorder} flex items-center justify-center flex-shrink-0`}
            >
              <TypeIcon size={16} />
            </div>
            <div>
              <h4 className="text-body font-bold text-gray-900 leading-tight">{event.title}</h4>
              {event.description && (
                <p className="text-caption text-gray-500 mt-0.5 leading-snug">{event.description}</p>
              )}
            </div>
          </div>
          <Badge variant={meta.badge} className="text-[10px] py-0.5 flex-shrink-0 hidden sm:inline-flex">
            {meta.label}
          </Badge>
        </div>

        {/* Meta row: member + date + status */}
        <div className="flex flex-wrap items-center gap-3 text-caption text-gray-500 border-t border-gray-100 pt-3">
          {/* Family member */}
          <span className="flex items-center gap-1.5 font-medium text-gray-700">
            <User size={12} className="text-gray-400" />
            {event.familyMember || 'Self'}
          </span>

          {/* Date */}
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-gray-400" />
            {formatDate(event.date)}
          </span>

          {/* Status badge */}
          <Badge variant={statusVariant(event.status)} className="text-[10px] py-0">
            {event.status}
          </Badge>

          {/* View Details */}
          <button
            onClick={() => navigate(meta.route)}
            className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-caption transition-colors"
            title="View Details"
          >
            View Details
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineCard;
