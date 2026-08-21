/**
 * Centralized Date & Timestamp Utility Functions for MediTrack
 */

/**
 * Safely parses any date input (ISO string, timestamp number, Date object) into a valid JS Date.
 * Returns null if missing or invalid.
 */
export const parseDate = (dateInput) => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  const parsed = new Date(dateInput);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Formats a date into a clean absolute string (e.g., "Aug 6, 2026").
 */
export const formatDate = (dateInput, options = {}) => {
  const d = parseDate(dateInput);
  if (!d) {
    return typeof dateInput === 'string' && dateInput.trim() ? dateInput : '—';
  }

  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  };

  return d.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Formats a date into a clean time string (e.g., "02:30 PM").
 */
export const formatTime = (dateInput, options = {}) => {
  const d = parseDate(dateInput);
  if (!d) return '—';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
};

/**
 * Formats a date into a clean relative time string.
 *
 * Past examples:
 *  - < 1 min       → "Just now"
 *  - < 60 min      → "12m ago"
 *  - < 24 hrs      → "3h ago"
 *  - Yesterday     → "Yesterday"
 *  - < 7 days      → "4d ago"
 *  - Older         → "Aug 6, 2026"
 *
 * Future examples:
 *  - Today         → "Today"
 *  - Tomorrow      → "Tomorrow"
 *  - < 7 days      → "In 3 days"
 *  - Older         → "Aug 25, 2026"
 */
export const formatRelativeTime = (dateInput, fallback = 'Recently') => {
  const target = parseDate(dateInput);
  if (!target) return fallback;

  const now = new Date();
  const diffMs = now.getTime() - target.getTime();

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Same Calendar Day
  if (isSameDay(target, now)) {
    if (diffMs >= 0) {
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours}h ago`;
    } else {
      return 'Today';
    }
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(target, yesterday)) {
    return 'Yesterday';
  }

  // Tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(target, tomorrow)) {
    return 'Tomorrow';
  }

  if (diffMs > 0) {
    // Past dates (> 1 day ago)
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    return formatDate(target, { month: 'short', day: 'numeric', year: 'numeric' });
  } else {
    // Future dates (> 1 day in future)
    const futureMs = Math.abs(diffMs);
    const futureDays = Math.floor(futureMs / (24 * 60 * 60 * 1000));
    if (futureDays < 7) {
      return `In ${futureDays} ${futureDays === 1 ? 'day' : 'days'}`;
    }
    return formatDate(target, { month: 'short', day: 'numeric', year: 'numeric' });
  }
};
