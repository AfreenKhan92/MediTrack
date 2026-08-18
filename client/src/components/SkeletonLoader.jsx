import React from 'react';

// Common wrapper props and accessibility attributes
const skeletonContainerAttrs = {
  role: 'status',
  'aria-busy': 'true',
};

const ScreenReaderLabel = () => (
  <span className="sr-only">Loading content, please wait...</span>
);

/**
 * Top Statistics Card Skeleton
 */
export const StatsSkeleton = ({ count = 4 }) => {
  const items = Array.from({ length: count });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" {...skeletonContainerAttrs}>
      <ScreenReaderLabel />
      {items.map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-xl bg-white border border-gray-200 animate-pulse motion-reduce:animate-none flex items-center justify-between gap-4"
        >
          <div className="space-y-2 flex-1">
            <div className="w-20 h-3 bg-gray-200 rounded" />
            <div className="w-16 h-7 bg-gray-300 rounded" />
            <div className="w-28 h-3 bg-gray-100 rounded" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
};

/**
 * Family Member Profile Card Skeleton
 */
export const FamilyMemberSkeleton = ({ count = 3 }) => {
  const items = Array.from({ length: count });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" {...skeletonContainerAttrs}>
      <ScreenReaderLabel />
      {items.map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white border border-gray-200 animate-pulse motion-reduce:animate-none flex flex-col justify-between space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gray-200 flex-shrink-0" />
              <div className="space-y-1.5">
                <div className="w-32 h-4 bg-gray-300 rounded" />
                <div className="w-16 h-4 bg-gray-200 rounded-full" />
              </div>
            </div>
            <div className="flex gap-1">
              <div className="w-7 h-7 rounded-lg bg-gray-100" />
              <div className="w-7 h-7 rounded-lg bg-gray-100" />
            </div>
          </div>

          {/* Health Metrics Grid (2x2) */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
            <div>
              <div className="w-10 h-2.5 bg-gray-200 rounded mb-1" />
              <div className="w-16 h-3.5 bg-gray-300 rounded" />
            </div>
            <div>
              <div className="w-16 h-2.5 bg-gray-200 rounded mb-1" />
              <div className="w-10 h-3.5 bg-gray-300 rounded" />
            </div>
            <div>
              <div className="w-12 h-2.5 bg-gray-200 rounded mb-1" />
              <div className="w-14 h-3.5 bg-gray-300 rounded" />
            </div>
            <div>
              <div className="w-12 h-2.5 bg-gray-200 rounded mb-1" />
              <div className="w-14 h-3.5 bg-gray-300 rounded" />
            </div>
          </div>

          {/* Status Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="w-16 h-3 bg-gray-200 rounded" />
            <div className="w-16 h-4 bg-gray-200 rounded-full" />
          </div>

          {/* Allergies Footer */}
          <div className="space-y-1.5 pt-1 border-t border-gray-100">
            <div className="w-14 h-2.5 bg-gray-200 rounded" />
            <div className="flex gap-1.5 pt-0.5">
              <div className="w-16 h-4 bg-gray-200 rounded-full" />
              <div className="w-20 h-4 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Medical Report / Document Card Skeleton
 */
export const ReportSkeleton = ({ count = 3 }) => {
  const items = Array.from({ length: count });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" {...skeletonContainerAttrs}>
      <ScreenReaderLabel />
      {items.map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white border border-gray-200 animate-pulse motion-reduce:animate-none flex flex-col justify-between space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="w-20 h-4 bg-gray-200 rounded-md" />
                <div className="w-12 h-4 bg-gray-200 rounded-md" />
              </div>
              <div className="w-3/4 h-4 bg-gray-300 rounded" />
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <div className="w-7 h-7 rounded-md bg-gray-100" />
              <div className="w-7 h-7 rounded-md bg-gray-100" />
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-2 pt-3 border-t border-gray-200">
            <div className="flex justify-between">
              <div className="w-12 h-3 bg-gray-200 rounded" />
              <div className="w-24 h-3 bg-gray-300 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="w-14 h-3 bg-gray-200 rounded" />
              <div className="w-28 h-3 bg-gray-300 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="w-10 h-3 bg-gray-200 rounded" />
              <div className="w-20 h-3 bg-gray-300 rounded" />
            </div>
          </div>

          {/* Notes preview box */}
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 h-8 w-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
};

/**
 * Appointment Card / Timeline Skeleton
 */
export const AppointmentSkeleton = ({ count = 3 }) => {
  const items = Array.from({ length: count });
  return (
    <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200" {...skeletonContainerAttrs}>
      <ScreenReaderLabel />
      {items.map((_, i) => (
        <div key={i} className="relative">
          {/* Timeline rail dot */}
          <span className="absolute left-[-21px] sm:left-[-25px] top-6 w-3.5 h-3.5 rounded-full border-2 border-white bg-gray-300" />
          <div className="p-5 rounded-2xl bg-white border border-gray-200 animate-pulse motion-reduce:animate-none space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                <div className="space-y-1.5">
                  <div className="w-36 h-4 bg-gray-300 rounded" />
                  <div className="w-24 h-3 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-7 h-7 rounded-md bg-gray-100" />
                <div className="w-7 h-7 rounded-md bg-gray-100" />
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <div className="w-18 h-4 bg-gray-200 rounded-full" />
              <div className="w-24 h-4 bg-gray-200 rounded-full" />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="w-32 h-3.5 bg-gray-200 rounded" />
              <div className="w-28 h-3.5 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Medication / Pill Reminder Skeleton
 */
export const MedicationSkeleton = ({ count = 3 }) => {
  const items = Array.from({ length: count });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" {...skeletonContainerAttrs}>
      <ScreenReaderLabel />
      {items.map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white border border-gray-200 animate-pulse motion-reduce:animate-none flex flex-col justify-between space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="w-36 h-4 bg-gray-300 rounded" />
              <div className="w-44 h-3 bg-gray-200 rounded" />
            </div>
            <div className="w-10 h-6 bg-gray-200 rounded-full flex-shrink-0" />
          </div>

          {/* Member & Status Badges */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="w-20 h-4 bg-gray-200 rounded-full" />
            <div className="w-14 h-4 bg-gray-200 rounded-full" />
          </div>

          {/* Time chips & Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-gray-200" />
              <div className="w-14 h-5 bg-gray-200 rounded-md" />
              <div className="w-14 h-5 bg-gray-200 rounded-md" />
            </div>
            <div className="w-16 h-7 bg-gray-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Vaccine Card / Record Skeleton
 */
export const VaccineSkeleton = ({ count = 3 }) => {
  const items = Array.from({ length: count });
  return (
    <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200" {...skeletonContainerAttrs}>
      <ScreenReaderLabel />
      {items.map((_, i) => (
        <div key={i} className="relative">
          {/* Timeline rail dot */}
          <span className="absolute left-[-21px] sm:left-[-25px] top-6 w-3.5 h-3.5 rounded-full border-2 border-white bg-gray-300" />
          <div className="p-5 rounded-2xl bg-white border border-gray-200 animate-pulse motion-reduce:animate-none flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-9 h-9 rounded-lg bg-gray-200 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-36 h-4 bg-gray-300 rounded" />
                  <div className="w-14 h-4 bg-gray-200 rounded-full" />
                  <div className="w-16 h-4 bg-gray-200 rounded-full" />
                </div>
                <div className="w-48 h-3.5 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="flex gap-2 self-start md:self-center">
              <div className="w-24 h-8 bg-gray-100 rounded-xl" />
              <div className="w-7 h-7 rounded-md bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Health Timeline Event Skeleton Item
 */
export const TimelineSkeleton = ({ count = 5 }) => {
  const items = Array.from({ length: count });
  return (
    <div className="space-y-2.5" {...skeletonContainerAttrs}>
      <ScreenReaderLabel />
      {items.map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 animate-pulse motion-reduce:animate-none"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-gray-200 flex-shrink-0" />
            <div className="w-2/3 h-4 bg-gray-300 rounded" />
          </div>
          <div className="w-16 h-3 bg-gray-200 rounded flex-shrink-0 ml-3" />
        </div>
      ))}
    </div>
  );
};

/**
 * Emergency Contact Card Skeleton
 */
export const EmergencyContactSkeleton = ({ count = 4 }) => {
  const items = Array.from({ length: count });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5" {...skeletonContainerAttrs}>
      <ScreenReaderLabel />
      {items.map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white border border-gray-200 animate-pulse motion-reduce:animate-none space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
              <div className="space-y-1.5">
                <div className="w-32 h-4 bg-gray-300 rounded" />
                <div className="w-20 h-3 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="w-16 h-4 bg-gray-200 rounded-full" />
          </div>
          <div className="w-full h-9 bg-gray-100 rounded-xl mt-3" />
        </div>
      ))}
    </div>
  );
};

/**
 * Full Dashboard Skeleton (mirrors entire Dashboard structure)
 */
export const DashboardSkeleton = () => {
  return (
    <div className="animate-fade-in space-y-6" {...skeletonContainerAttrs}>
      <ScreenReaderLabel />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="w-64 h-8 bg-gray-200 rounded animate-pulse motion-reduce:animate-none" />
          <div className="w-80 h-4 bg-gray-100 rounded animate-pulse motion-reduce:animate-none" />
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-36 h-9 rounded-xl bg-gray-200 animate-pulse motion-reduce:animate-none flex-shrink-0" />
        ))}
      </div>

      {/* Needs Your Attention Section */}
      <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-4 animate-pulse motion-reduce:animate-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gray-200" />
            <div className="w-40 h-5 bg-gray-300 rounded" />
          </div>
          <div className="w-28 h-4 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-24 h-4 bg-gray-200 rounded-full" />
                <div className="w-6 h-6 rounded-lg bg-gray-200" />
              </div>
              <div className="w-3/4 h-4 bg-gray-300 rounded" />
              <div className="w-1/2 h-3 bg-gray-200 rounded" />
              <div className="w-full h-7 bg-gray-200 rounded-lg mt-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Grid + Health Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <StatsSkeleton count={4} />
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-200 animate-pulse motion-reduce:animate-none space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-200" />
              <div className="space-y-1">
                <div className="w-36 h-4 bg-gray-300 rounded" />
                <div className="w-24 h-3 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="w-12 h-6 bg-gray-300 rounded" />
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full" />
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            <div className="h-6 bg-gray-100 rounded-lg" />
            <div className="h-6 bg-gray-100 rounded-lg" />
            <div className="h-6 bg-gray-100 rounded-lg" />
            <div className="h-6 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-8 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Family Health, Appointments, Medications) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Family Health Section */}
          <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-4 animate-pulse motion-reduce:animate-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200" />
                <div className="w-36 h-5 bg-gray-300 rounded" />
              </div>
              <div className="flex gap-1.5">
                <div className="w-20 h-5 bg-gray-200 rounded-lg" />
                <div className="w-24 h-5 bg-gray-200 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-200" />
                      <div className="space-y-1">
                        <div className="w-24 h-4 bg-gray-300 rounded" />
                        <div className="w-16 h-3 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div className="w-16 h-4 bg-gray-200 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                    <div className="h-10 bg-white rounded-xl border border-gray-100" />
                    <div className="h-10 bg-white rounded-xl border border-gray-100" />
                    <div className="h-10 bg-white rounded-xl border border-gray-100" />
                    <div className="h-10 bg-white rounded-xl border border-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments Section */}
          <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-4 animate-pulse motion-reduce:animate-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200" />
                <div className="w-44 h-5 bg-gray-300 rounded" />
              </div>
              <div className="w-24 h-4 bg-gray-200 rounded" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="w-36 h-4 bg-gray-300 rounded" />
                    <div className="w-20 h-4 bg-gray-200 rounded" />
                  </div>
                  <div className="w-48 h-3 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Medication Schedule Section */}
          <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-4 animate-pulse motion-reduce:animate-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200" />
                <div className="w-40 h-5 bg-gray-300 rounded" />
              </div>
              <div className="w-20 h-4 bg-gray-200 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-14 bg-gray-50 border border-gray-200 rounded-xl" />
              <div className="h-14 bg-gray-50 border border-gray-200 rounded-xl" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="w-32 h-4 bg-gray-300 rounded" />
                    <div className="w-24 h-3 bg-gray-200 rounded" />
                  </div>
                  <div className="w-20 h-7 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Timeline & Vaccine Tracker) */}
        <div className="space-y-6">
          {/* Recent Timeline Section */}
          <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-4 animate-pulse motion-reduce:animate-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200" />
                <div className="w-40 h-5 bg-gray-300 rounded" />
              </div>
            </div>
            <TimelineSkeleton count={5} />
          </div>

          {/* Vaccine Tracker Section */}
          <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-4 animate-pulse motion-reduce:animate-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200" />
                <div className="w-36 h-5 bg-gray-300 rounded" />
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="w-32 h-4 bg-gray-300 rounded" />
                    <div className="w-16 h-4 bg-gray-200 rounded-full" />
                  </div>
                  <div className="w-44 h-3 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main default export allowing type selector for clean backward compatibility
 */
export const SkeletonLoader = ({ type = 'card', count = 3, className = '' }) => {
  switch (type) {
    case 'stat':
      return <StatsSkeleton count={count} />;
    case 'family':
      return <FamilyMemberSkeleton count={count} />;
    case 'report':
      return <ReportSkeleton count={count} />;
    case 'appointment':
      return <AppointmentSkeleton count={count} />;
    case 'medication':
      return <MedicationSkeleton count={count} />;
    case 'vaccine':
      return <VaccineSkeleton count={count} />;
    case 'timeline':
    case 'list':
      return <TimelineSkeleton count={count} />;
    case 'contact':
      return <EmergencyContactSkeleton count={count} />;
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'table': {
      const items = Array.from({ length: count });
      return (
        <div className={`space-y-3 w-full animate-pulse motion-reduce:animate-none ${className}`} {...skeletonContainerAttrs}>
          <ScreenReaderLabel />
          {items.map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="space-y-2 flex-1 max-w-xs">
                  <div className="w-3/4 h-4 bg-gray-300 rounded" />
                  <div className="w-1/2 h-3 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="hidden sm:block w-24 h-4 bg-gray-200 rounded" />
              <div className="w-20 h-6 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      );
    }
    case 'card':
    default:
      return <FamilyMemberSkeleton count={count} />;
  }
};

export default SkeletonLoader;
