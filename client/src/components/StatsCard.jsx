import React from 'react';
import Card from './Card';
import { TrendingUp } from 'lucide-react';

/**
 * Reusable StatsCard Component - White & Blue Healthcare System
 * @param {string} label - Card label (e.g. "Reports")
 * @param {number|string} value - Numerical metric
 * @param {string} subtext - Contextual subtext (e.g. "+3 uploaded this month")
 * @param {React.ElementType} icon - Lucide Icon
 * @param {boolean} showTrend - Whether to display trend indicator icon
 */
const StatsCard = ({ label, value, subtext, icon: Icon, showTrend = true }) => {
  return (
    <Card hoverable className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-caption font-medium text-gray-500">{label}</p>
        <h3 className="text-headline text-gray-900 font-bold leading-none">{value}</h3>
        {subtext && (
          <p className="text-[11px] font-medium text-gray-500 pt-1.5 flex items-center gap-1">
            {showTrend && <TrendingUp size={12} className="text-emerald-600 flex-shrink-0" />}
            <span>{subtext}</span>
          </p>
        )}
      </div>
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-xs">
          <Icon size={18} />
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
