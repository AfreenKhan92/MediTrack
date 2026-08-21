import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { formatDate } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Users, Pill, Syringe, CalendarDays, FileText, Activity, Clock,
} from 'lucide-react';
import familyService from '../services/familyService';
import reminderService from '../services/reminderService';
import appointmentService from '../services/appointmentService';
import vaccineService from '../services/vaccineService';
import reportService from '../services/reportService';
import timelineService from '../services/timelineService';

// ── Type metadata ─────────────────────────────────────────────────────────────
const TYPE_META = {
  family:      { label: 'Family Member',    Icon: Users,        route: '/family',       color: 'text-blue-500' },
  medication:  { label: 'Medication',       Icon: Pill,         route: '/reminders',    color: 'text-violet-500' },
  vaccine:     { label: 'Vaccine',          Icon: Syringe,      route: '/vaccines',     color: 'text-amber-500' },
  appointment: { label: 'Appointment',      Icon: CalendarDays, route: '/appointments', color: 'text-emerald-500' },
  report:      { label: 'Report',           Icon: FileText,     route: '/reports',      color: 'text-rose-500' },
  timeline:    { label: 'Health Timeline',  Icon: Activity,     route: '/timeline',     color: 'text-indigo-500' },
};

// Order the groups appear in
const GROUP_ORDER = ['family', 'medication', 'vaccine', 'appointment', 'report', 'timeline'];

// ── Scoring / fuzzy-ish match ─────────────────────────────────────────────────
// Returns true if every space-split token appears (as a substring) in any of the haystack strings
const matches = (query, ...haystacks) => {
  const q = query.toLowerCase().trim();
  if (!q) return false;
  const tokens = q.split(/\s+/);
  const combined = haystacks.map(h => (h || '').toLowerCase()).join(' ');
  return tokens.every(token => combined.includes(token));
};

// ── Build a flat searchable index from raw API responses ──────────────────────
const buildIndex = ({ members, reminders, appointments, vaccines, reports, timeline }) => {
  const index = [];

  // Family members
  (members || []).forEach(m => {
    index.push({
      id: `family-${m._id}`,
      type: 'family',
      title: m.name,
      subtitle: [m.relation, m.age ? `${m.age} yrs` : null, m.bloodGroup !== 'Unknown' ? m.bloodGroup : null].filter(Boolean).join(' · '),
      keywords: [m.name, m.relation, m.bloodGroup, ...(m.allergies || [])],
    });
  });

  // Medications / reminders
  (reminders || []).forEach(r => {
    index.push({
      id: `med-${r._id}`,
      type: 'medication',
      title: r.medicineName,
      subtitle: [r.familyMember?.name || null, r.dosage, r.frequency].filter(Boolean).join(' · '),
      keywords: [r.medicineName, r.dosage, r.frequency, r.familyMember?.name, r.notes],
    });
  });

  // Appointments
  (appointments || []).forEach(a => {
    const date = a.appointmentDate
      ? formatDate(a.appointmentDate, { month: 'short', day: 'numeric' })
      : null;
    index.push({
      id: `appt-${a._id}`,
      type: 'appointment',
      title: `Dr. ${a.doctorName}`,
      subtitle: [a.specialty, a.hospital, date].filter(Boolean).join(' · '),
      keywords: [a.doctorName, a.specialty, a.hospital, a.familyMember?.name, a.notes],
    });
  });

  // Vaccines
  (vaccines || []).forEach(v => {
    index.push({
      id: `vac-${v._id}`,
      type: 'vaccine',
      title: v.vaccineName,
      subtitle: [v.patientName, v.status, v.administeredBy].filter(Boolean).join(' · '),
      keywords: [v.vaccineName, v.patientName, v.status, v.administeredBy, v.notes],
    });
  });

  // Reports
  (reports || []).forEach(r => {
    index.push({
      id: `rep-${r._id}`,
      type: 'report',
      title: r.title,
      subtitle: [r.category, r.patientName].filter(Boolean).join(' · '),
      keywords: [r.title, r.category, r.patientName],
    });
  });

  // Health timeline
  (timeline || []).forEach(t => {
    index.push({
      id: `tl-${t._id || t.id}`,
      type: 'timeline',
      title: t.title,
      subtitle: [t.familyMember, t.description, t.status].filter(Boolean).join(' · '),
      keywords: [t.title, t.description, t.familyMember, t.type],
    });
  });

  return index;
};

// ── Main component ────────────────────────────────────────────────────────────
const GlobalSearch = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(null); // null = not loaded yet
  const [loading, setLoading] = useState(false);

  // ── Load data lazily on first focus ────────────────────────────────────────
  const loadIndex = useCallback(async () => {
    if (index !== null) return; // already loaded
    setLoading(true);
    try {
      const [members, reminders, appointments, vaccines, reports, timeline] = await Promise.allSettled([
        familyService.getMembers(),
        reminderService.getReminders(),
        appointmentService.getAppointments(),
        vaccineService.getVaccines(),
        reportService.getReports(),
        timelineService.getTimeline(),
      ]);

      setIndex(buildIndex({
        members:      members.status      === 'fulfilled' ? (members.value      || []) : [],
        reminders:    reminders.status    === 'fulfilled' ? (reminders.value    || []) : [],
        appointments: appointments.status === 'fulfilled' ? (appointments.value || []) : [],
        vaccines:     vaccines.status     === 'fulfilled' ? (vaccines.value     || []) : [],
        reports:      reports.status      === 'fulfilled' ? (reports.value      || []) : [],
        timeline:     timeline.status     === 'fulfilled' ? (timeline.value     || []) : [],
      }));
    } catch {
      setIndex([]);
    } finally {
      setLoading(false);
    }
  }, [index]);

  // ── Filter index against current query ─────────────────────────────────────
  const results = useMemo(() => {
    if (!query.trim() || !index) return {};
    const matched = index.filter(item => matches(query, ...item.keywords));
    // Group by type, cap each group at 4 results
    return GROUP_ORDER.reduce((acc, type) => {
      const group = matched.filter(r => r.type === type).slice(0, 4);
      if (group.length) acc[type] = group;
      return acc;
    }, {});
  }, [query, index]);

  const hasResults = Object.keys(results).length > 0;
  const showDropdown = open && query.trim().length >= 1;

  // ── Keyboard shortcut Ctrl+K ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
        loadIndex();
      }
      if (e.key === 'Escape') {
        setQuery('');
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [loadIndex]);

  // ── Close on outside click ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleFocus = () => {
    setOpen(true);
    loadIndex();
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
    setOpen(false);
  };

  const handleSelect = (item) => {
    setQuery('');
    setOpen(false);
    navigate(TYPE_META[item.type].route);
  };

  return (
    <div ref={wrapperRef} className="relative hidden sm:flex items-center w-full">
      {/* Search input container — preserves existing design exactly */}
      <div
        className={`
          flex items-center gap-2 w-full transition-all duration-150 shadow-xs
          bg-slate-50/80 dark:bg-[#111214] border rounded-xl px-3.5 py-2
          ${open
            ? 'border-blue-600 ring-2 ring-blue-600/20 bg-white dark:bg-[#111214]'
            : 'border-gray-200 dark:border-[#2A2C30]'
          }
        `}
      >
        {loading
          ? <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          : <Search size={15} className="text-gray-400 dark:text-[#71717A] flex-shrink-0" />
        }

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder="Search reports, medicines, appointments..."
          className="bg-transparent border-none outline-none text-body text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#71717A] w-full"
          autoComplete="off"
          aria-label="Global search"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />

        {query ? (
          <button
            onClick={handleClear}
            className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-200 dark:bg-[#2A2C30] flex items-center justify-center text-gray-500 dark:text-[#A1A1AA] hover:bg-gray-300 dark:hover:bg-[#3F4248] transition-colors"
            aria-label="Clear search"
          >
            <X size={10} />
          </button>
        ) : (
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-gray-400 dark:text-[#71717A] bg-white dark:bg-[#1D1F22] border border-gray-200 dark:border-[#2A2C30] rounded flex-shrink-0">
            Ctrl + K
          </kbd>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          role="listbox"
          aria-label="Search results"
          className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white dark:bg-[#17181A] border border-gray-200 dark:border-[#2A2C30] rounded-2xl shadow-xl dark:shadow-black/40 overflow-hidden max-h-[480px] overflow-y-auto"
        >
          {/* Still loading the index */}
          {loading && !index && (
            <div className="px-4 py-5 flex items-center gap-3 text-gray-400 dark:text-[#71717A]">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading search data…</span>
            </div>
          )}

          {/* No results */}
          {!loading && !hasResults && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-[#F5F5F5]">No results found</p>
              <p className="text-xs text-gray-400 dark:text-[#71717A] mt-1">
                Try searching for a family member, medicine, vaccine, doctor, or report.
              </p>
            </div>
          )}

          {/* Grouped results */}
          {hasResults && GROUP_ORDER.filter(type => results[type]).map((type, gi) => {
            const meta = TYPE_META[type];
            const Icon = meta.Icon;
            return (
              <div key={type}>
                {/* Group header */}
                <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                  <Icon size={12} className={`${meta.color} flex-shrink-0`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#71717A]">
                    {meta.label}{results[type].length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Items */}
                {results[type].map((item, ii) => (
                  <button
                    key={item.id}
                    role="option"
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#1D1F22] transition-colors text-left border-b border-transparent last:border-transparent"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                      ${type === 'family'      ? 'bg-blue-50 dark:bg-blue-950/40' : ''}
                      ${type === 'medication'  ? 'bg-violet-50 dark:bg-violet-950/40' : ''}
                      ${type === 'vaccine'     ? 'bg-amber-50 dark:bg-amber-950/40' : ''}
                      ${type === 'appointment' ? 'bg-emerald-50 dark:bg-emerald-950/40' : ''}
                      ${type === 'report'      ? 'bg-rose-50 dark:bg-rose-950/40' : ''}
                      ${type === 'timeline'    ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''}
                    `}>
                      <Icon size={14} className={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900 dark:text-[#F5F5F5] truncate leading-tight">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-[11px] text-gray-400 dark:text-[#71717A] truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-300 dark:text-[#3F4248] flex-shrink-0 font-medium">
                      {meta.label}
                    </span>
                  </button>
                ))}

                {/* Group divider — not after the last group */}
                {gi < GROUP_ORDER.filter(t => results[t]).length - 1 && (
                  <div className="mx-4 border-t border-gray-100 dark:border-[#2A2C30] mt-1" />
                )}
              </div>
            );
          })}

          {/* Footer hint */}
          {hasResults && (
            <div className="border-t border-gray-100 dark:border-[#2A2C30] px-4 py-2 flex items-center gap-2">
              <Clock size={11} className="text-gray-300 dark:text-[#3F4248]" />
              <span className="text-[10px] text-gray-400 dark:text-[#71717A]">Click a result to navigate · Esc to close</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
