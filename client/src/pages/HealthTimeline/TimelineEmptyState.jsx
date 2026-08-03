import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, LayoutDashboard } from 'lucide-react';
import Button from '../../components/Button';

const TimelineEmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-slate-50/60 border border-dashed border-gray-300 rounded-2xl text-center transition-all hover:border-blue-300">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 shadow-xs flex items-center justify-center text-blue-600 mb-4">
        <ClipboardList size={28} strokeWidth={1.5} />
      </div>

      <h3 className="text-subtitle font-bold text-gray-900 mb-1">
        No health history available yet
      </h3>
      <p className="text-body text-gray-500 max-w-sm mb-6 leading-relaxed">
        Start by uploading a report, adding an appointment, or creating a medicine reminder to build your family's health timeline.
      </p>

      <Button
        variant="primary"
        icon={LayoutDashboard}
        onClick={() => navigate('/dashboard')}
      >
        Go to Dashboard
      </Button>
    </div>
  );
};

export default TimelineEmptyState;
