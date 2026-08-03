import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionText = '',
  onAction,
  actionLink = '',
  actionIcon: ActionIcon = Plus,
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center p-8 sm:p-12
        bg-slate-50/60
        border border-dashed border-gray-300 rounded-2xl
        text-center
        transition-all duration-200 hover:border-blue-300
        ${className}
      `}
    >
      {/* Blue Icon Container */}
      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 shadow-xs flex items-center justify-center text-blue-600 mb-4">
        <Icon size={24} strokeWidth={1.75} />
      </div>

      {/* Title & Description */}
      <h3 className="text-subtitle font-bold text-gray-900 mb-1">
        {title}
      </h3>
      <p className="text-body text-gray-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      {actionText && actionLink && (
        <Link to={actionLink}>
          <Button variant="primary" icon={ActionIcon}>
            {actionText}
          </Button>
        </Link>
      )}

      {actionText && !actionLink && onAction && (
        <Button variant="primary" icon={ActionIcon} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
