import React from 'react';
import { Calendar, User, FileText, Trash2, Heart } from 'lucide-react';

const RecordCard = ({ record, onDelete }) => {
  return (
    <div className="glass-panel p-5 flex flex-col justify-between space-y-4 animate-fade-in">
      <div className="flex justify-between items-start">
        <span className="badge badge-secondary">
          {record.recordType}
        </span>
        
        {onDelete && (
          <button 
            onClick={() => onDelete(record._id)} 
            className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
            title="Delete Record"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div>
        <h4 className="text-body font-bold text-gray-900 mb-1">{record.title}</h4>
        {record.doctor && (
          <p className="text-caption text-gray-500 flex items-center gap-1">
            <Heart size={12} className="text-gray-700" />
            Dr. {record.doctor}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 text-caption text-gray-600 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1.5">
          <User size={13} className="text-gray-400" />
          <span>Patient: <strong className="text-gray-900">{record.patientName}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-gray-400" />
          <span>Date: {new Date(record.dateOfRecord).toLocaleDateString()}</span>
        </div>
      </div>

      {record.notes && (
        <p className="text-caption text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          "{record.notes}"
        </p>
      )}
    </div>
  );
};

export default RecordCard;
