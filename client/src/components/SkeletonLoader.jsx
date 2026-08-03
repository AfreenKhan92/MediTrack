import React from 'react';

export const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  const items = Array.from({ length: count });

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-gray-50 border border-gray-200 animate-pulse flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-20 h-3 bg-gray-200 rounded" />
              <div className="w-12 h-6 bg-gray-300 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-3 w-full animate-pulse">
        {items.map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4"
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

  if (type === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        {items.map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-4"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-1/3 h-4 bg-gray-300 rounded" />
              <div className="w-2/3 h-3 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: 'card'
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-xl bg-gray-50 border border-gray-200 animate-pulse space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="w-28 h-4 bg-gray-300 rounded" />
                <div className="w-16 h-3 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="w-16 h-6 bg-gray-200 rounded-full" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="w-full h-3 bg-gray-200 rounded" />
            <div className="w-4/5 h-3 bg-gray-200 rounded" />
          </div>
          <div className="pt-4 border-t border-gray-200 flex justify-between">
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="w-16 h-4 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
