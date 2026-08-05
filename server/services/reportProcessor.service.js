/**
 * Report Processor Service
 * Orchestrates the full AI pipeline:
 *   MongoDB (status: pending)
 *   → OCR.Space (status: ocr_processing → ocrStatus: success/failed)
 *   → Gemini extract (status: ai_processing)
 *   → Gemini summary
 *   → MongoDB (status: completed, stores ocrText, parsedData, summary)
 *
 * Includes caching: will not re-run OCR if already succeeded.
 */

import MedicalReport from '../models/MedicalReport.js';
import { extractTextFromUrl } from './ocrSpace.service.js';
import { extractMedicalInfo, generatePatientSummary } from './openRouterService.js';

const activeReportJobs = new Set();

/**
 * Update processing status in MongoDB.
 */
const updateStatus = async (reportId, updates) => {
  try {
    await MedicalReport.findByIdAndUpdate(reportId, updates, { new: true });
  } catch (err) {
    console.error(`[ReportProcessor] Failed to update status for ${reportId}:`, err.message);
  }
};

/**
 * Run the full OCR → OpenRouter AI pipeline for a given report.
 * This function is designed to be called without await (fire and forget).
 *
 * @param {string} reportId - MongoDB ObjectId string
 * @param {string} fileUrl   - Cloudinary file URL
 * @param {boolean} forceOcr - If true, re-run OCR even if cached
 */
export const processReport = async (reportId, fileUrl, forceOcr = false) => {
  if (activeReportJobs.has(reportId)) {
    console.log(`[ReportProcessor] Skipping duplicate pipeline request for ${reportId}`);
    return;
  }

  activeReportJobs.add(reportId);
  console.log(`[ReportProcessor] Starting pipeline for report: ${reportId}`);

  try {
    const report = await MedicalReport.findById(reportId);
    if (!report) {
      console.error(`[ReportProcessor] Report ${reportId} not found.`);
      return;
    }

    if (['ocr_processing', 'ai_processing', 'completed'].includes(report.processingStatus)) {
      console.log(`[ReportProcessor] Report ${reportId} is already ${report.processingStatus}; skipping.`);
      return;
    }

    let ocrText = null;

    if (!forceOcr && report.ocrStatus === 'success' && report.ocrText) {
      console.log(`[ReportProcessor] Using cached OCR for report ${reportId}`);
      ocrText = report.ocrText;
    } else {
      await updateStatus(reportId, { processingStatus: 'ocr_processing' });

      try {
        ocrText = await extractTextFromUrl(fileUrl);
        await updateStatus(reportId, {
          ocrText,
          ocrStatus: 'success',
        });
        console.log(`[ReportProcessor] OCR completed for ${reportId}`);
      } catch (ocrError) {
        console.error(`[ReportProcessor] OCR failed for ${reportId}:`, ocrError.message);
        await updateStatus(reportId, {
          ocrStatus: 'failed',
          processingStatus: 'failed',
          ocrText: null,
        });
        return;
      }
    }

    await updateStatus(reportId, { processingStatus: 'ai_processing' });

    let parsedData = null;
    let summary = null;

    try {
      parsedData = await extractMedicalInfo(ocrText);
      console.log(`[ReportProcessor] Medical info extracted via OpenRouter for ${reportId}`);
    } catch (aiExtractError) {
      console.error(`[ReportProcessor] OpenRouter extraction failed for ${reportId}:`, aiExtractError.message);
      await updateStatus(reportId, {
        processingStatus: 'failed',
        processedAt: new Date(),
      });
      return;
    }

    try {
      summary = await generatePatientSummary(ocrText, parsedData);
      console.log(`[ReportProcessor] Summary generated via OpenRouter for ${reportId}`);
    } catch (summaryError) {
      console.warn(`[ReportProcessor] Summary generation failed for ${reportId}:`, summaryError.message);
      summary = parsedData?.summary || null;
    }

    try {
      await updateStatus(reportId, {
        parsedData,
        summary,
        processingStatus: 'completed',
        processedAt: new Date(),
      });
      console.log(`[ReportProcessor] Pipeline completed successfully for ${reportId}`);
    } catch (saveError) {
      console.error(`[ReportProcessor] Failed to save AI results for ${reportId}:`, saveError.message);
      await updateStatus(reportId, { processingStatus: 'failed' });
    }
  } catch (error) {
    console.error(`[ReportProcessor] Pipeline error for ${reportId}:`, error.message);
    await updateStatus(reportId, { processingStatus: 'failed' });
  } finally {
    activeReportJobs.delete(reportId);
  }
};

export default { processReport };
