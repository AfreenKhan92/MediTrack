import React from 'react';
import { Loader2 } from 'lucide-react';

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const LoadingSpinner = ({
  size = 'md',
  label = '',
  fullScreen = false,
  inline = false,
  className = '',
}) => {
  const spinnerElement = (
    <Loader2
      className={`animate-spin text-black ${sizeClasses[size] || sizeClasses.md} ${className}`}
    />
  );

  if (inline) {
    return (
      <span className="inline-flex items-center gap-2">
        {spinnerElement}
        {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
      </span>
    );
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
        <div className="relative flex flex-col items-center p-8 bg-white border border-gray-200 rounded-2xl shadow-lg">
          <div className="relative flex items-center justify-center mb-4">
            {spinnerElement}
          </div>
          {label && (
            <p className="text-sm font-medium text-gray-700 text-center">
              {label}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative flex items-center justify-center mb-3">
        {spinnerElement}
      </div>
      {label && (
        <p className="text-sm font-medium text-gray-600 mt-2">
          {label}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
