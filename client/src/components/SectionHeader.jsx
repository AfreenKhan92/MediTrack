import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Reusable SectionHeader Component - White & Blue Healthcare Design System
 */
const SectionHeader = ({
  title,
  subtitle,
  icon: Icon,
  actionText,
  actionLink,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between gap-4 mb-4 ${className}`}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Icon size={16} />
          </div>
        )}
        <div>
          <h3 className="text-subtitle font-bold text-gray-900 leading-tight">{title}</h3>
          {subtitle && <p className="text-caption text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="text-caption font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <span>{actionText}</span>
          <ChevronRight size={14} />
        </Link>
      )}

      {actionText && !actionLink && onAction && (
        <button
          onClick={onAction}
          className="text-caption font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <span>{actionText}</span>
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
