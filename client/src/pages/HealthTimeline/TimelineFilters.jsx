import React from 'react';
import { Search, X } from 'lucide-react';

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'report', label: 'Reports' },
  { value: 'appointment', label: 'Appointments' },
  { value: 'medicine', label: 'Medicines' },
  { value: 'vaccination', label: 'Vaccinations' },
];

const TimelineFilters = ({
  activeType,
  onTypeChange,
  search,
  onSearchChange,
  members,
  activeMember,
  onMemberChange,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3">
      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            id={`timeline-filter-${value}`}
            onClick={() => onTypeChange(value)}
            className={`
              px-3.5 py-1.5 rounded-xl text-caption font-semibold
              border transition-all duration-150
              ${activeType === value
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + Member filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            id="timeline-search"
            type="text"
            placeholder="Search by title, description, or member..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="form-input pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Family member dropdown */}
        {members.length > 0 && (
          <select
            id="timeline-member-filter"
            value={activeMember}
            onChange={(e) => onMemberChange(e.target.value)}
            className="form-select sm:w-52"
          >
            <option value="all">All Members</option>
            {members.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default TimelineFilters;
