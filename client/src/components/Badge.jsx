import React from 'react';

/**
 * Reusable Badge Component - White & Blue Healthcare Theme
 * @param {'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'primary'} variant
 * @param {string} className
 */
const Badge = ({ children, variant = 'secondary', className = '' }) => {
  const variantStyles = {
    primary: 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold',
    info: 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold',
    danger: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase ${variantStyles[variant] || variantStyles.secondary} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
