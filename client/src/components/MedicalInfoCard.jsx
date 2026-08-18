import React, { useState } from 'react';
import {
  User, Stethoscope, Building2, Calendar, Activity, FlaskConical,
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, FileText
} from 'lucide-react';
import Badge from './Badge';
import MedicineCard from './MedicineCard';

/**
 * Formats a date string nicely.
 */
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; // Return raw if not parseable
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

/**
 * Section wrapper with consistent styling.
 */
const Section = ({ icon: Icon, title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-[#2A2C30] rounded-xl overflow-hidden bg-white dark:bg-[#17181A] transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-[#111214] dark:hover:bg-[#1D1F22] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={15} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-800 dark:text-[#F5F5F5]">{title}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-gray-400 dark:text-[#71717A]" /> : <ChevronDown size={14} className="text-gray-400 dark:text-[#71717A]" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
};

/**
 * MedicalInfoCard Component
 * Renders structured medical data extracted by Gemini AI.
 *
 * @param {Object} parsedData - The structured JSON from Gemini's extractMedicalInfo
 */
const MedicalInfoCard = ({ parsedData }) => {
  if (!parsedData) return null;

  const {
    doctorName, hospitalName, patientName, reportDate, age, gender,
    documentType, medicalConditions = [], medicines = [],
    testResults = [], observations, diagnosis, recommendations, followUpDate,
  } = parsedData;

  const hasMeta = doctorName || hospitalName || patientName || reportDate || age || gender;
  const hasConditions = medicalConditions.length > 0;
  const hasMedicines = medicines.length > 0;
  const hasTestResults = testResults.length > 0;
  const hasObservations = observations || diagnosis || recommendations;

  const abnormalResults = testResults.filter(t => t.isAbnormal);

  return (
    <div className="space-y-3">

      {/* Document Type Badge */}
      {documentType && (
        <div className="flex items-center gap-2">
          <Badge variant="primary">{documentType}</Badge>
          {abnormalResults.length > 0 && (
            <Badge variant="warning">
              <AlertTriangle size={10} className="mr-1 inline" />
              {abnormalResults.length} Abnormal Value{abnormalResults.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      )}

      {/* Meta Information Grid */}
      {hasMeta && (
        <Section icon={User} title="Patient & Doctor Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patientName && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-[#1D1F22] border border-blue-100 dark:border-[#2A2C30] flex items-center justify-center flex-shrink-0">
                  <User size={13} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-[#71717A] uppercase tracking-wider font-semibold">Patient</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">{patientName}</p>
                  {(age || gender) && (
                    <p className="text-[11px] text-gray-500 dark:text-[#A1A1AA]">{[age, gender].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </div>
            )}
            {doctorName && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-[#1D1F22] border border-blue-100 dark:border-[#2A2C30] flex items-center justify-center flex-shrink-0">
                  <Stethoscope size={13} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-[#71717A] uppercase tracking-wider font-semibold">Physician</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">{doctorName}</p>
                </div>
              </div>
            )}
            {hospitalName && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-[#1D1F22] border border-blue-100 dark:border-[#2A2C30] flex items-center justify-center flex-shrink-0">
                  <Building2 size={13} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-[#71717A] uppercase tracking-wider font-semibold">Hospital / Clinic</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">{hospitalName}</p>
                </div>
              </div>
            )}
            {reportDate && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-[#1D1F22] border border-blue-100 dark:border-[#2A2C30] flex items-center justify-center flex-shrink-0">
                  <Calendar size={13} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-[#71717A] uppercase tracking-wider font-semibold">Report Date</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">{formatDate(reportDate)}</p>
                </div>
              </div>
            )}
            {followUpDate && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/50 flex items-center justify-center flex-shrink-0">
                  <Calendar size={13} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-[#71717A] uppercase tracking-wider font-semibold">Follow-Up</p>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{formatDate(followUpDate)}</p>
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Medical Conditions */}
      {hasConditions && (
        <Section icon={Activity} title="Diagnosis / Medical Conditions">
          <div className="flex flex-wrap gap-2">
            {medicalConditions.map((condition, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs font-semibold rounded-lg"
              >
                {condition}
              </span>
            ))}
          </div>
          {diagnosis && !medicalConditions.length && (
            <p className="text-sm text-gray-700 dark:text-[#F5F5F5]">{diagnosis}</p>
          )}
        </Section>
      )}

      {/* Medicines */}
      {hasMedicines && (
        <Section icon={FileText} title={`Prescribed Medicines (${medicines.length})`}>
          <div className="space-y-2.5">
            {medicines.map((med, i) => (
              <MedicineCard key={i} medicine={med} />
            ))}
          </div>
        </Section>
      )}

      {/* Test Results */}
      {hasTestResults && (
        <Section icon={FlaskConical} title={`Test Results (${testResults.length})`}>
          <div className="space-y-2">
            {testResults.map((test, i) => (
              <div
                key={i}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-sm transition-colors
                  ${test.isAbnormal
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
                    : 'bg-gray-50 dark:bg-[#111214] border-gray-200 dark:border-[#2A2C30]'
                  }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {test.isAbnormal ? (
                    <AlertTriangle size={13} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                  )}
                  <span className={`font-semibold truncate ${test.isAbnormal ? 'text-amber-800 dark:text-amber-300' : 'text-gray-800 dark:text-[#F5F5F5]'}`}>
                    {test.testName}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`font-bold text-sm ${test.isAbnormal ? 'text-amber-700 dark:text-amber-400' : 'text-gray-900 dark:text-[#F5F5F5]'}`}>
                    {test.value}{test.unit ? ` ${test.unit}` : ''}
                  </span>
                  {test.referenceRange && (
                    <span className="text-[10px] text-gray-400 dark:text-[#71717A] hidden sm:inline">
                      Ref: {test.referenceRange}
                    </span>
                  )}
                  {test.isAbnormal && (
                    <Badge variant="warning" className="text-[9px] py-0 hidden sm:inline-flex">Abnormal</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Observations & Recommendations */}
      {hasObservations && (
        <Section icon={Stethoscope} title="Clinical Notes & Recommendations">
          <div className="space-y-3">
            {observations && (
              <div>
                <p className="text-[10px] text-gray-400 dark:text-[#71717A] uppercase tracking-wider font-semibold mb-1">Observations</p>
                <p className="text-sm text-gray-700 dark:text-[#F5F5F5] leading-relaxed">{observations}</p>
              </div>
            )}
            {recommendations && (
              <div>
                <p className="text-[10px] text-gray-400 dark:text-[#71717A] uppercase tracking-wider font-semibold mb-1">Recommendations</p>
                <p className="text-sm text-gray-700 dark:text-[#F5F5F5] leading-relaxed">{recommendations}</p>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
};

export default MedicalInfoCard;
