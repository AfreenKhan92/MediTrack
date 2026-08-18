import React from 'react';

const TimelineSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-0" role="status" aria-busy="true">
      <span className="sr-only">Loading health timeline...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative flex gap-4 animate-pulse motion-reduce:animate-none">
          {/* Left rail dot */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-3.5 h-3.5 rounded-full bg-gray-300 border-2 border-white mt-1.5 flex-shrink-0" />
            {i < count - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
          </div>

          {/* Skeleton card */}
          <div className="flex-1 mb-6 bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-200 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-300 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="h-5 bg-gray-200 rounded-md w-20 hidden sm:block" />
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-center gap-4">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-5 bg-gray-200 rounded-md w-16" />
              <div className="h-3 bg-gray-200 rounded w-20 ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineSkeleton;
