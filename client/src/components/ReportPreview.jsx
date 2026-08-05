import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Eye, FileText, RefreshCw, Brain, AlignLeft, Loader2
} from 'lucide-react';
import reportService from '../services/reportService';
import OCRStatus from './OCRStatus';
import MedicalInfoCard from './MedicalInfoCard';
import AISummary from './AISummary';
import Button from './Button';
import Badge from './Badge';

/**
 * ReportPreview Component
 * Full-screen modal showing:
 *   - Original document preview (image / PDF link)
 *   - OCR + AI status indicator with live polling
 *   - Tabbed view: AI Analysis | Raw OCR Text
 *   - MedicalInfoCard (structured extracted data)
 *   - AISummary (patient-friendly summary)
 *   - Retry button on failure
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {Object} report - Initial report object (may not have AI data yet)
 * @param {(updated: Object) => void} onReportUpdate - Callback to sync updated report to parent
 */
const ReportPreview = ({ isOpen, onClose, report: initialReport, onReportUpdate }) => {
  const [report, setReport] = useState(initialReport);
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' | 'ocr'
  const [retrying, setRetrying] = useState(false);

  // Sync with parent when a new report opens
  useEffect(() => {
    setReport(initialReport);
    setActiveTab('ai');
  }, [initialReport?._id]);

  // ── Live Polling ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !report?._id) return;

    const terminalStatuses = ['completed', 'failed'];
    if (terminalStatuses.includes(report.processingStatus)) return;

    // Start polling
    const stopPolling = reportService.pollReport(
      report._id,
      (updatedReport) => {
        setReport(updatedReport);
        if (onReportUpdate) onReportUpdate(updatedReport);
      },
      3000
    );

    return stopPolling; // Cleanup on unmount or when modal closes
  }, [isOpen, report?._id, report?.processingStatus]);

  // ── Retry Handler ───────────────────────────────────────────────────────────
  const handleRetry = useCallback(async () => {
    if (!report?._id) return;
    setRetrying(true);
    try {
      await reportService.retryProcessing(report._id);
      // After triggering retry, update local status to pending to restart polling
      const updatedReport = { ...report, processingStatus: 'pending' };
      setReport(updatedReport);
      if (onReportUpdate) onReportUpdate(updatedReport);
    } catch (err) {
      console.error('[ReportPreview] Retry failed:', err);
    } finally {
      setRetrying(false);
    }
  }, [report, onReportUpdate]);

  if (!isOpen || !report) return null;

  const isPDF = report.fileUrl?.toLowerCase().includes('.pdf') ||
    report.fileUrl?.toLowerCase().includes('/pdf') ||
    report.title?.toLowerCase().endsWith('.pdf');

  const isCompleted = report.processingStatus === 'completed';
  const isFailed = report.processingStatus === 'failed';
  const isProcessing = ['pending', 'ocr_processing', 'ai_processing'].includes(report.processingStatus);

  const hasParsedData = isCompleted && report.parsedData;
  const hasSummary = isCompleted && report.summary;
  const hasOcrText = report.ocrText && report.ocrStatus === 'success';

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-200 shadow-2xl rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 flex-shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 truncate leading-tight">{report.title}</h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <Badge variant="secondary" className="text-[9px] py-0">{report.category}</Badge>
                <span className="text-[11px] text-gray-400">
                  {report.patientName} · {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0 ml-3"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Modal Body: Two-column layout on md+ ─────────────────────────── */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">

          {/* Left: Document Preview */}
          <div className="w-full md:w-[45%] border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 flex items-center justify-center p-4 flex-shrink-0 min-h-[200px] md:min-h-0">
            {isPDF ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto">
                  <FileText size={28} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-700 font-semibold text-sm">PDF Document</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                    Click below to open the document in a new tab
                  </p>
                </div>
                <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" icon={Eye}>
                    Open PDF
                  </Button>
                </a>
              </div>
            ) : (
              <img
                src={report.fileUrl}
                alt={report.title}
                className="max-w-full max-h-[350px] md:max-h-[70vh] object-contain rounded-xl border border-gray-200 shadow-sm"
              />
            )}
          </div>

          {/* Right: AI Analysis Panel */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">

            {/* OCR Status Banner */}
            <div className="px-4 pt-4 pb-0 flex-shrink-0">
              <OCRStatus
                processingStatus={report.processingStatus}
                ocrStatus={report.ocrStatus}
              />
            </div>

            {/* Retry button on failure */}
            {isFailed && (
              <div className="px-4 pt-3 flex-shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={retrying ? Loader2 : RefreshCw}
                  onClick={handleRetry}
                  loading={retrying}
                  disabled={retrying}
                  className="w-full"
                >
                  Retry AI Processing
                </Button>
              </div>
            )}

            {/* Tabs */}
            {(isCompleted || hasOcrText) && (
              <div className="flex border-b border-gray-200 mx-4 mt-4 flex-shrink-0">
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors -mb-px
                    ${activeTab === 'ai'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <Brain size={13} />
                  AI Analysis
                </button>
                {hasOcrText && (
                  <button
                    onClick={() => setActiveTab('ocr')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors -mb-px
                      ${activeTab === 'ocr'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    <AlignLeft size={13} />
                    Raw OCR Text
                  </button>
                )}
              </div>
            )}

            {/* Tab Content — Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* Processing in progress placeholder */}
              {isProcessing && !hasOcrText && (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Loader2 size={22} className="text-blue-400 animate-spin" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">AI is reading your document…</p>
                  <p className="text-xs text-gray-400 max-w-xs">
                    This usually takes 15–30 seconds. The results will appear automatically.
                  </p>
                </div>
              )}

              {/* AI Analysis tab */}
              {activeTab === 'ai' && (
                <>
                  {hasParsedData && <MedicalInfoCard parsedData={report.parsedData} />}
                  {hasSummary && (
                    <AISummary summary={report.summary} reportTitle={report.title} />
                  )}
                  {isCompleted && !hasParsedData && !hasSummary && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      AI analysis completed but no structured data was extracted.
                    </div>
                  )}
                </>
              )}

              {/* Raw OCR Text tab */}
              {activeTab === 'ocr' && hasOcrText && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Raw Extracted Text
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(report.ocrText);
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">
                    {report.ocrText}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
