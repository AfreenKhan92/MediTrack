import React from 'react';

/**
 * Reusable Card Component - White & Blue Healthcare Design System
 * @param {string} className
 * @param {boolean} hoverable
 */
const Card = ({ children, className = '', hoverable = true, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6
        transition-all duration-200 ease-out
        ${hoverable ? 'hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
