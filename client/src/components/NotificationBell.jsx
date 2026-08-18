import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCheck, Syringe, Pill, CalendarDays, ChevronRight, PartyPopper } from 'lucide-react';
import reminderService from '../services/reminderService';
import appointmentService from '../services/appointmentService';
import vaccineService from '../services/vaccineService';

/** Persists read IDs in localStorage so they survive page reloads */
const STORAGE_KEY = 'meditrack_read_notification_ids';

const getReadIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const saveReadIds = (ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {}
};

/** Build a notification list from existing data */
const buildNotifications = (reminders = [], appointments = [], vaccines = []) => {
  const now = new Date();
  const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const items = [];

  // Overdue / scheduled vaccines first (highest priority)
  vaccines
    .filter(v => v.status === 'Overdue' || v.status === 'Scheduled')
    .slice(0, 3)
    .forEach(v => {
      const isOverdue = v.status === 'Overdue';
      const dueDate = v.nextDueDate ? new Date(v.nextDueDate) : null;
      const dueDateStr = dueDate
        ? (isOverdue
            ? 'Overdue'
            : `Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`)
        : v.status;

      items.push({
        id: `vac-${v._id}`,
        type: 'vaccine',
        priority: isOverdue ? 'danger' : 'warning',
        icon: Syringe,
        iconBg: isOverdue ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
        title: v.vaccineName || 'Vaccine',
        subtitle: `${v.patientName || 'Family Member'} \u00b7 ${dueDateStr}`,
        route: '/vaccines',
      });
    });

  // Active medication reminders
  const activeReminders = reminders.filter(r => r.active || r.isActive);
  activeReminders.slice(0, 3).forEach(r => {
    const times = r.reminderTimes || r.times || [];
    const isDueNow = times.some(t => t <= nowHHMM);
    const firstTime = times[0] || null;
    const subtitle = [
      r.familyMember?.name || null,
      isDueNow ? `Due today at ${firstTime}` : (firstTime ? `Next dose at ${firstTime}` : 'Active reminder'),
    ].filter(Boolean).join(' \u00b7 ');

    items.push({
      id: `rem-${r._id}`,
      type: 'medication',
      priority: isDueNow ? 'danger' : 'info',
      icon: Pill,
      iconBg: isDueNow
        ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
        : 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      title: r.medicineName || 'Medication',
      subtitle,
      route: '/reminders',
    });
  });

  // Upcoming appointments
  appointments
    .filter(a => a.status === 'Scheduled' || !a.status)
    .slice(0, 2)
    .forEach(a => {
      const date = new Date(a.appointmentDate);
      const isToday = date.toDateString() === now.toDateString();
      const dateStr = isToday
        ? 'Today'
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      items.push({
        id: `app-${a._id}`,
        type: 'appointment',
        priority: isToday ? 'warning' : 'info',
        icon: CalendarDays,
        iconBg: isToday
          ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
          : 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
        title: `Dr. ${a.doctorName || 'Doctor'}`,
        subtitle: `Appointment \u00b7 ${dateStr}`,
        route: '/appointments',
      });
    });

  // Sort by priority: danger > warning > info
  const order = { danger: 0, warning: 1, info: 2 };
  items.sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));

  return items;
};

/**
 * NotificationBell
 * Drop-in replacement for the bare <button> in TopNavbar.jsx.
 * Fetches data from existing services; no new backend endpoints needed.
 */
const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(getReadIds);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  // Fetch & build notifications whenever the dropdown opens
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [reminders, appointments, vaccines] = await Promise.allSettled([
        reminderService.getReminders(),
        appointmentService.getAppointments({ status: 'Scheduled' }),
        vaccineService.getVaccines(),
      ]);

      const r = reminders.status === 'fulfilled' ? (reminders.value || []) : [];
      const a = appointments.status === 'fulfilled' ? (appointments.value || []) : [];
      const v = vaccines.status === 'fulfilled' ? (vaccines.value || []) : [];

      setNotifications(buildNotifications(r, a, v));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (
        open &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const markRead = (id) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  };

  const markAllRead = (e) => {
    e.stopPropagation();
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(allIds);
    saveReadIds(allIds);
  };

  const handleNotificationClick = (notif) => {
    markRead(notif.id);
    setOpen(false);
    navigate(notif.route);
  };

  return (
    <div className="relative" role="region" aria-label="Notifications">
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        className="relative w-9 h-9 rounded-xl border border-gray-200 dark:border-[#2A2C30] bg-white dark:bg-[#17181A] hover:bg-blue-50 dark:hover:bg-[#1D1F22] hover:border-blue-200 dark:hover:border-[#3F4248] flex items-center justify-center text-gray-600 dark:text-[#A1A1AA] hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-[#111214] leading-none"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={dropdownRef}
          role="dialog"
          aria-modal="false"
          aria-label="Notifications panel"
          className="absolute right-0 top-[calc(100%+8px)] w-[340px] sm:w-[380px] bg-white dark:bg-[#17181A] border border-gray-200 dark:border-[#2A2C30] rounded-2xl shadow-xl dark:shadow-black/40 z-50 overflow-hidden animate-scale-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-[#2A2C30]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-[#F5F5F5]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1D1F22] flex items-center justify-center text-gray-400 dark:text-[#71717A] hover:text-gray-700 dark:hover:text-[#F5F5F5] transition-colors"
                aria-label="Close notifications"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[380px] overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3" aria-busy="true" role="status">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#2A2C30] flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 dark:bg-[#2A2C30] rounded-md w-3/4" />
                      <div className="h-2.5 bg-gray-100 dark:bg-[#2A2C30] rounded-md w-1/2" />
                    </div>
                  </div>
                ))}
                <span className="sr-only">Loading notifications\u2026</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-2">
                <PartyPopper size={32} className="text-blue-400" />
                <p className="text-sm font-semibold text-gray-800 dark:text-[#F5F5F5]">You're all caught up!</p>
                <p className="text-xs text-gray-400 dark:text-[#71717A]">No upcoming reminders or appointments right now.</p>
              </div>
            ) : (
              <ul role="list">
                {notifications.map((notif) => {
                  const isUnread = !readIds.has(notif.id);
                  const Icon = notif.icon;
                  return (
                    <li key={notif.id}>
                      <button
                        onClick={() => handleNotificationClick(notif)}
                        className={`
                          w-full flex items-start gap-3 px-4 py-3.5 text-left
                          transition-colors duration-100 relative
                          hover:bg-gray-50 dark:hover:bg-[#1D1F22]
                          ${isUnread ? 'bg-blue-50/40 dark:bg-blue-950/10' : 'bg-transparent'}
                          border-b border-gray-100 dark:border-[#2A2C30] last:border-0
                        `}
                      >
                        {isUnread && (
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                        )}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${notif.iconBg}`}>
                          <Icon size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-semibold leading-tight truncate ${isUnread ? 'text-gray-900 dark:text-[#F5F5F5]' : 'text-gray-700 dark:text-[#A1A1AA]'}`}>
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-[#71717A] mt-0.5 truncate">
                            {notif.subtitle}
                          </p>
                        </div>
                        <ChevronRight size={13} className="text-gray-300 dark:text-[#3F4248] flex-shrink-0 mt-1" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 dark:border-[#2A2C30]">
              <button
                onClick={() => { setOpen(false); navigate('/reminders'); }}
                className="w-full flex items-center justify-center gap-1.5 py-3 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-[#1D1F22] transition-colors rounded-b-2xl"
              >
                View all activity
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
