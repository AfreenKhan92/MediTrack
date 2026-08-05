import React from 'react';
import { CheckCircle2, Loader2, Clock, AlertTriangle, Scan, Brain } from 'lucide-react';

/**
 * OCRStatus Component
 * Displays the current AI processing pipeline stage with animated indicators.
 *
 * @param {'pending'|'ocr_processing'|'ai_processing'|'completed'|'failed'} processingStatus
 * @param {'pending'|'success'|'failed'} ocrStatus
 * @param {string} className
 */
const OCRStatus = ({ processingStatus, ocrStatus, className = '' }) => {
  const stages = {
    pending: {
      icon: Clock,
      label: 'Queued for Processing',
      sublabel: 'AI analysis will begin shortly…',
      color: 'text-gray-500',
      bg: 'bg-gray-50 border-gray-200',
      iconColor: 'text-gray-400',
      pulse: false,
      spinner: false,
    },
    ocr_processing: {
      icon: Scan,
      label: 'Extracting Text',
      sublabel: 'Reading document with OCR…',
      color: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-500',
      pulse: true,
      spinner: true,
    },
    ai_processing: {
      icon: Brain,
      label: 'Analyzing with AI',
      sublabel: 'Gemini is interpreting your report…',
      color: 'text-violet-700',
      bg: 'bg-violet-50 border-violet-200',
      iconColor: 'text-violet-500',
      pulse: true,
      spinner: true,
    },
    completed: {
      icon: CheckCircle2,
      label: 'Analysis Complete',
      sublabel: 'Your report has been fully processed',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-500',
      pulse: false,
      spinner: false,
    },
    failed: {
      icon: AlertTriangle,
      label: 'Processing Failed',
      sublabel: ocrStatus === 'failed'
        ? 'Could not extract text from the document'
        : 'AI analysis encountered an error',
      color: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
      iconColor: 'text-red-500',
      pulse: false,
      spinner: false,
    },
  };

  const status = stages[processingStatus] || stages.pending;
  const StatusIcon = status.icon;

  // Progress steps for the multi-stage indicator
  const steps = [
    { key: 'ocr', label: 'OCR', statuses: ['ocr_processing'] },
    { key: 'ai', label: 'AI', statuses: ['ai_processing'] },
    { key: 'done', label: 'Done', statuses: ['completed'] },
  ];

  const getStepState = (step) => {
    if (processingStatus === 'completed') return 'done';
    if (processingStatus === 'failed') {
      if (ocrStatus === 'failed' && step.key === 'ocr') return 'error';
      if (ocrStatus === 'success' && step.key === 'ocr') return 'done';
      if (ocrStatus === 'success' && step.key === 'ai') return 'error';
      return 'upcoming';
    }
    if (step.statuses.includes(processingStatus)) return 'active';
    const order = ['pending', 'ocr_processing', 'ai_processing', 'completed'];
    const currentIdx = order.indexOf(processingStatus);
    const stepIdx = order.indexOf(step.statuses[0]);
    return stepIdx < currentIdx ? 'done' : 'upcoming';
  };

  return (
    <div className={`rounded-2xl border p-4 ${status.bg} ${className}`}>
      {/* Main status row */}
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 ${status.iconColor}`}>
          {status.spinner ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <StatusIcon size={20} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{status.sublabel}</p>
        </div>
      </div>

      {/* Progress steps (show while in-progress or completed) */}
      {processingStatus !== 'pending' && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-current border-opacity-10">
          {steps.map((step, idx) => {
            const state = getStepState(step);
            return (
              <React.Fragment key={step.key}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-all
                    ${state === 'done' ? 'bg-emerald-500 text-white' : ''}
                    ${state === 'active' ? 'bg-blue-500 text-white animate-pulse' : ''}
                    ${state === 'error' ? 'bg-red-500 text-white' : ''}
                    ${state === 'upcoming' ? 'bg-gray-200 text-gray-500' : ''}
                  `}>
                    {state === 'done' ? '✓' : state === 'error' ? '✕' : idx + 1}
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider
                    ${state === 'done' ? 'text-emerald-600' : ''}
                    ${state === 'active' ? 'text-blue-600' : ''}
                    ${state === 'error' ? 'text-red-600' : ''}
                    ${state === 'upcoming' ? 'text-gray-400' : ''}
                  `}>{step.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-px ${state === 'done' ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OCRStatus;
