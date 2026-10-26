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
import mongoose from 'mongoose';
import { extractTextFromUrl } from './ocrSpace.service.js';
import { extractMedicalInfo, generatePatientSummary } from './openRouterService.js';
import { indexMedicalReport } from './ragIndexing.service.js';

const activeReportJobs = new Set();

/**
 * Update processing status in MongoDB.
 */
const updateStatus = async (reportId, updates) => {
  try {
    await MedicalReport.findByIdAndUpdate(reportId, updates, { new: true });
  } catch {
    console.error(`[ReportProcessor] Failed to update status for ${reportId}: status_update_failed`);
  }
};

const saveFinalResults = async (reportId, updates) =>
  MedicalReport.findByIdAndUpdate(reportId, updates, { new: true });

const isValidOwnerId = (value) =>
  value instanceof mongoose.Types.ObjectId ||
  (typeof value === 'string' && /^[a-f\d]{24}$/i.test(value));

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

    if (
      !forceOcr &&
      report.ocrStatus === 'success' &&
      typeof report.ocrText === 'string' &&
      report.ocrText.trim()
    ) {
      console.log(`[ReportProcessor] Using cached OCR for report ${reportId}`);
      ocrText = report.ocrText;
    } else {
      await updateStatus(reportId, { processingStatus: 'ocr_processing' });

      try {
        ocrText = await extractTextFromUrl(fileUrl);
        if (typeof ocrText !== 'string' || !ocrText.trim()) {
          throw new Error('OCR returned empty text');
        }
        await updateStatus(reportId, {
          ocrText,
          ocrStatus: 'success',
        });
        console.log(`[ReportProcessor] OCR completed for ${reportId}`);
      } catch {
        console.error(`[ReportProcessor] OCR failed for ${reportId}: ocr_failed`);
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
    } catch {
      console.error(`[ReportProcessor] OpenRouter extraction failed for ${reportId}: ai_extraction_failed`);
      await updateStatus(reportId, {
        processingStatus: 'failed',
        processedAt: new Date(),
      });
      return;
    }

    try {
      summary = await generatePatientSummary(ocrText, parsedData);
      console.log(`[ReportProcessor] Summary generated via OpenRouter for ${reportId}`);
    } catch {
      console.warn(`[ReportProcessor] Summary generation failed for ${reportId}: summary_failed`);
      summary = parsedData?.summary || null;
    }

    try {
      const savedReport = await saveFinalResults(reportId, {
        parsedData,
        summary,
        processingStatus: 'completed',
        processedAt: new Date(),
      });
      if (!savedReport) {
        console.error(`[ReportProcessor] Report ${reportId} disappeared before RAG indexing.`);
        return;
      }
      console.log(`[ReportProcessor] Pipeline completed successfully for ${reportId}`);
    } catch {
      console.error(`[ReportProcessor] Failed to save AI results for ${reportId}: final_save_failed`);
      await updateStatus(reportId, { processingStatus: 'failed' });
      return;
    }

    // ── RAG indexing (non-fatal) ───────────────────────────────────────────────
    // Run only when OCR text is valid and the report is fully persisted.
    // Any embedding-service or vector-storage error must never fail the upload.
    try {
      const ownerId = report.user;
      if (!isValidOwnerId(ownerId)) {
        console.warn(`[ReportProcessor] RAG indexing skipped for ${reportId}: invalid_owner`);
        await updateStatus(reportId, {
          ragIndexStatus: 'failed',
          ragIndexError: 'invalid_owner',
        });
        return;
      }
      await indexMedicalReport({ reportId, userId: ownerId, text: ocrText });
      console.log('[ReportProcessor] RAG indexing completed.');
      await updateStatus(reportId, {
        ragIndexStatus: 'indexed',
        ragIndexedAt: new Date(),
        ragIndexError: null,
      });
    } catch {
      console.warn(`[ReportProcessor] RAG indexing did not complete for ${reportId}: indexing_failed`);
      await updateStatus(reportId, {
        ragIndexStatus: 'failed',
        ragIndexError: 'indexing_failed',
      });
    }
  } catch {
    console.error(`[ReportProcessor] Pipeline error for ${reportId}: pipeline_failed`);
    await updateStatus(reportId, { processingStatus: 'failed' });
  } finally {
    activeReportJobs.delete(reportId);
  }
};

export default { processReport };
