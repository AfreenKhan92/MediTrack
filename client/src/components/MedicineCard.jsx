import React from 'react';
import { Pill } from 'lucide-react';

/**
 * MedicineCard Component
 * Displays a single medicine with name, dosage, frequency, duration, and instructions.
 * Highlighted in blue as a distinct medical pill item.
 *
 * @param {{ name, dosage, frequency, duration, instructions }} medicine
 */
const MedicineCard = ({ medicine }) => {
  const { name, dosage, frequency, duration, instructions } = medicine;

  return (
    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5 group hover:border-blue-300 hover:shadow-sm transition-all duration-150">
      {/* Icon */}
      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mt-0.5">
        <Pill size={14} className="text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Medicine name */}
        <p className="text-sm font-bold text-blue-900 leading-tight truncate">{name}</p>

        {/* Dosage & frequency row */}
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {dosage && (
            <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-md border border-blue-200">
              💊 {dosage}
            </span>
          )}
          {frequency && (
            <span className="inline-flex items-center px-2 py-0.5 bg-white text-blue-600 text-[10px] font-semibold rounded-md border border-blue-200">
              🕐 {frequency}
            </span>
          )}
          {duration && (
            <span className="inline-flex items-center px-2 py-0.5 bg-white text-blue-600 text-[10px] font-semibold rounded-md border border-blue-200">
              📅 {duration}
            </span>
          )}
        </div>

        {/* Instructions (optional) */}
        {instructions && (
          <p className="text-[11px] text-blue-700 mt-1.5 leading-snug italic opacity-90">
            {instructions}
          </p>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;
