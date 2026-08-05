import api from './api';

export const reportService = {
  // ── Existing methods (unchanged) ────────────────────────────────────────────

  getReports: async () => {
    const { data } = await api.get('/reports');
    return data;
  },

  uploadReport: async (formData) => {
    const { data } = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  deleteReport: async (id) => {
    const { data } = await api.delete(`/reports/${id}`);
    return data;
  },

  // ── New AI pipeline methods ─────────────────────────────────────────────────

  /**
   * Fetch a single report by ID — includes ocrText, parsedData, summary, statuses.
   */
  getReportById: async (id) => {
    const { data } = await api.get(`/reports/${id}`, { skipToast: true });
    return data;
  },

  /**
   * Trigger a retry of the OCR + AI processing pipeline for a report.
   */
  retryProcessing: async (id) => {
    const { data } = await api.post(`/reports/${id}/retry`);
    return data;
  },

  /**
   * Poll a report's processingStatus until it reaches 'completed' or 'failed'.
   * Calls onUpdate each time with the latest report data.
   *
   * @param {string} id - Report MongoDB ID
   * @param {(report: object) => void} onUpdate - Callback with latest report data
   * @param {number} intervalMs - Polling interval in milliseconds (default: 3000)
   * @returns {() => void} - Cleanup function to stop polling
   */
  pollReport: (id, onUpdate, intervalMs = 3000) => {
    const terminalStatuses = ['completed', 'failed'];
    let timerId = null;
    let stopped = false;

    const poll = async () => {
      if (stopped) return;
      try {
        const report = await reportService.getReportById(id);
        onUpdate(report);
        if (terminalStatuses.includes(report.processingStatus)) {
          stopped = true;
        } else {
          if (!stopped) {
            timerId = setTimeout(poll, intervalMs);
          }
        }
      } catch (err) {
        console.warn('[pollReport] Error polling report:', err.message);
        // Retry polling even on error (transient network issue)
        if (!stopped) {
          timerId = setTimeout(poll, intervalMs * 2);
        }
      }
    };

    // Start polling after first interval
    timerId = setTimeout(poll, intervalMs);

    // Return cleanup function
    return () => {
      stopped = true;
      if (timerId) clearTimeout(timerId);
    };
  },
};

export default reportService;
