import React from 'react';
import { FileText, CalendarDays, Bell, Syringe, Clock } from 'lucide-react';
import Card from './Card';

const mockActivities = [
  { id: 1, type: 'report', title: 'Blood Cholesterol Profile uploaded', time: '2 hours ago', icon: FileText },
  { id: 2, type: 'reminder', title: 'Amoxicillin dose marked as Completed', time: '4 hours ago', icon: Bell },
  { id: 3, type: 'appointment', title: 'Consultation scheduled with Dr. Sarah Jenkins', time: 'Yesterday', icon: CalendarDays },
  { id: 4, type: 'vaccine', title: 'MMR Booster vaccination recorded', time: '3 days ago', icon: Syringe },
];

const RecentActivity = () => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-subtitle font-bold text-gray-900 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Clock size={15} />
          </div>
          Recent Activity
        </h3>
        <span className="text-caption text-gray-400 font-medium">Live feed</span>
      </div>

      <div className="space-y-3">
        {mockActivities.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Icon size={14} />
                </div>
                <p className="text-body font-medium text-gray-900 text-sm leading-snug">{item.title}</p>
              </div>
              <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap pl-2">{item.time}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RecentActivity;
