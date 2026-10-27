import React, { useState, useRef, useMemo } from 'react';
import { MessageSquare, Loader2, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

/**
 * RagAssistantCard
 * Inline AI Health Record Assistant card for the Reports page.
 * Allows users to ask questions grounded in their uploaded medical reports.
 *
 * @param {Array} reports - List of report objects currently available on the page.
 */
const RagAssistantCard = ({ reports = [] }) => {
  const [selectedReportId, setSelectedReportId] = useState('');
  const [question, setQuestion] = useState('');
  const [hasAsked, setHasAsked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');
  const [lastScopeId, setLastScopeId] = useState('');

  const abortControllerRef = useRef(null);
  const requestCounterRef = useRef(0);

  // Filter only fully processed reports (processingStatus === 'completed')
  const processedReports = useMemo(() => {
    if (!Array.isArray(reports)) return [];
    return reports.filter((r) => r && r.processingStatus === 'completed');
  }, [reports]);

  const trimmedQuestion = question.trim();
  const isSubmitDisabled = loading || trimmedQuestion.length < 3 || trimmedQuestion.length > 1000;

  const executeAsk = async (questionText, scopeId) => {
    const trimmed = questionText.trim();
    if (trimmed.length < 3 || trimmed.length > 1000) return;

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    requestCounterRef.current += 1;
    const currentRequestId = requestCounterRef.current;

    setHasAsked(true);
    setLoading(true);
    setErrorState(null);
    setResult(null);
    setSourcesExpanded(false);
    setLastQuestion(trimmed);
    setLastScopeId(scopeId);

    const payload = { question: trimmed };
    if (scopeId) {
      payload.reportIds = [scopeId];
    }

    try {
      const response = await api.post('/rag/ask', payload, {
        signal: controller.signal,
        skipToast: true,
      });

      // Ignore if superseded by another request, scope change, or clear action
      if (currentRequestId !== requestCounterRef.current) return;

      setResult(response.data);
      setErrorState(null);
    } catch (err) {
      // Ignore canceled/aborted requests
      if (
        controller.signal.aborted ||
        err.name === 'CanceledError' ||
        err.name === 'AbortError' ||
        err.code === 'ERR_CANCELED'
      ) {
        return;
      }

      if (currentRequestId !== requestCounterRef.current) return;

      const status = err.status || err.response?.status;
      let message = 'Something went wrong. Please try again.';
      let canRetry = false;

      if (status === 429 || status === 502 || status === 503) {
        message = 'The assistant is busy right now. Please try again in a moment.';
        canRetry = true;
      } else if (status === 404) {
        message = 'That report could not be found.';
      } else if (status === 401) {
        message = 'Your session has expired. Please log in again.';
      } else {
        message = 'Something went wrong. Please try again.';
      }

      setErrorState({ message, canRetry, status });
      setResult(null);
    } finally {
      if (currentRequestId === requestCounterRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitDisabled) return;
    executeAsk(question, selectedReportId);
  };

  const handleScopeChange = (e) => {
    const newScope = e.target.value;
    setSelectedReportId(newScope);

    // Cancel in-flight request and ignore its response when scope changes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    requestCounterRef.current += 1;
    if (loading) {
      setLoading(false);
    }
  };

  const handleClear = () => {
    // Cancel in-flight request and ignore its response
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    requestCounterRef.current += 1;
    setHasAsked(false);
    setLoading(false);
    setResult(null);
    setErrorState(null);
    setSourcesExpanded(false);
    setLastQuestion('');
    setLastScopeId('');
  };

  const handleRetry = () => {
    if (lastQuestion) {
      executeAsk(lastQuestion, lastScopeId);
    }
  };

  /**
   * Turns citation markers like [1], [2] into small blue badges showing just the number,
   * while rendering the remaining content as safe plain text.
   */
  const renderAnswerWithCitations = (answerText) => {
    if (!answerText) return null;
    const parts = answerText.split(/(\[\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        const num = match[1];
        return (
          <span
            key={index}
            className="inline-flex items-center justify-center px-1.5 py-0.5 mx-0.5 text-[11px] font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 align-baseline"
            aria-label={`Source citation ${num}`}
          >
            {num}
          </span>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  return (
    <section
      aria-label="AI Health Record Assistant"
      className="bg-white dark:bg-[#17181A] border border-blue-200 dark:border-blue-900/40 rounded-2xl p-6 shadow-sm space-y-5 transition-colors"
    >
      {/* 1. Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* 44px solid blue square with white chat icon */}
          <div className="w-11 h-11 min-w-[44px] rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <MessageSquare size={22} className="text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[18px] font-bold text-gray-900 dark:text-gray-100 leading-snug">
                AI Health Record Assistant
              </h3>
              <span className="px-2 py-0.5 text-xs font-bold uppercase rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                RAG
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your health records, decoded. Ask questions and get clear, document-based answers in seconds.
            </p>
          </div>
        </div>

        {/* Gray info pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            Grounded in your reports
          </span>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            Source citations
          </span>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            Not medical advice
          </span>
        </div>
      </div>

      {/* 2. Input row */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Scope select */}
        <select
          aria-label="Report scope"
          value={selectedReportId}
          onChange={handleScopeChange}
          className="form-select w-full sm:w-[220px] flex-shrink-0 text-sm"
        >
          <option value="">All my reports</option>
          {processedReports.map((report) => (
            <option key={report._id} value={report._id}>
              {report.title}{report.patientName ? ` (${report.patientName})` : ''}
            </option>
          ))}
        </select>

        {/* Question input + character counter */}
        <div className="relative flex-1">
          <input
            type="text"
            aria-label="Your question"
            placeholder="Ask about a diagnosis, medication, test result or treatment..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            className={`form-input text-sm ${question.length > 900 ? 'pr-20' : 'pr-4'}`}
          />
          {question.length > 900 && (
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium ${
                question.length > 1000 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-400'
              }`}
            >
              {question.length}/1000
            </span>
          )}
        </div>

        {/* Ask button */}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="btn btn-primary sm:w-auto px-5 py-2.5 text-sm font-medium rounded-xl flex items-center justify-center gap-2 flex-shrink-0"
        >
          {loading && <Loader2 size={16} className="animate-spin flex-shrink-0" />}
          <span>Ask</span>
        </button>
      </form>

      {/* 3. Answer area (rendered only after first question) */}
      {hasAsked && (
        <div
          aria-live="polite"
          className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3"
        >
          {/* Answer header with last question and Clear button */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5 min-w-0 pr-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                Latest question:
              </span>
              <span className="italic truncate text-gray-600 dark:text-gray-400">
                "{lastQuestion}"
              </span>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 underline underline-offset-2 ml-auto flex-shrink-0 cursor-pointer"
              aria-label="Clear answer"
            >
              Clear
            </button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-2.5 py-3 text-blue-600 dark:text-blue-400 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span className="text-sm font-medium">Reading your reports...</span>
            </div>
          )}

          {/* Error state */}
          {!loading && errorState && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-sm space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{errorState.message}</span>
              </div>
              {errorState.canRetry && (
                <div className="pt-1 pl-7">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 hover:bg-red-100/50 dark:hover:bg-gray-700 transition-colors shadow-sm cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Retry</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Success state - grounded */}
          {!loading && result && result.grounded && (
            <div className="space-y-3">
              <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed break-words">
                {renderAnswerWithCitations(result.answer)}
              </div>

              {Array.isArray(result.sources) && result.sources.length > 0 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setSourcesExpanded((prev) => !prev)}
                    aria-expanded={sourcesExpanded}
                    aria-controls="rag-sources-list"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-1 cursor-pointer focus:outline-none focus:underline"
                  >
                    <span>Sources ({result.sources.length})</span>
                    {sourcesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {sourcesExpanded && (
                    <div id="rag-sources-list" className="mt-2.5 space-y-2">
                      {result.sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#111214] text-xs space-y-1.5"
                        >
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            Source {src.index} - {src.label || 'Medical report'}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 font-mono text-[11px] whitespace-pre-wrap break-words leading-relaxed">
                            {src.excerpt}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Success state - not grounded */}
          {!loading && result && !result.grounded && (
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
              <p className="leading-relaxed">{result.answer}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                Try asking about something stated in one of your reports.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default RagAssistantCard;
