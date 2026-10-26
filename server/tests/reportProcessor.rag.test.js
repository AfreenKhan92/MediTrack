import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

let indexCalls = [];
let ocrCalls = 0;
let aiCalls = 0;
let indexShouldThrow = false;
let ocrValue = 'Patient: synthetic glucose result.';
let reportUser = '64f1a2b3c4d5e6f7a8b9c0d2';
let finalSaveThrows = false;
let finalSaveReturnsNull = false;
let reportState;
let updateEvents = [];

const REPORT_ID = '64f1a2b3c4d5e6f7a8b9c0d1';
const USER_ID = '64f1a2b3c4d5e6f7a8b9c0d2';
const OTHER_VALID_OBJECT_ID = '64f1a2b3c4d5e6f7a8b9c0d3';
const FILE_URL = 'https://example.com/report.pdf';
const OCR_TEXT = 'Patient: synthetic glucose result.';

await mock.module('../models/MedicalReport.js', {
  namedExports: {},
  defaultExport: {
    findById: async () => reportState,
    findByIdAndUpdate: async (reportId, updates) => {
      updateEvents.push({ reportId, updates: { ...updates } });
      if (updates.processingStatus === 'completed' && finalSaveThrows) {
        throw new Error('Final persistence failed');
      }
      if (updates.processingStatus === 'completed' && finalSaveReturnsNull) {
        return null;
      }
      Object.assign(reportState, updates);
      return reportState;
    },
  },
});

await mock.module('../services/ocrSpace.service.js', {
  namedExports: {
    extractTextFromUrl: async () => {
      ocrCalls += 1;
      if (ocrValue instanceof Error) throw ocrValue;
      return ocrValue;
    },
  },
});

await mock.module('../services/openRouterService.js', {
  namedExports: {
    extractMedicalInfo: async () => {
      aiCalls += 1;
      return { diagnoses: [], medications: [] };
    },
    generatePatientSummary: async () => 'Synthetic summary.',
  },
});

await mock.module('../services/ragIndexing.service.js', {
  namedExports: {
    indexMedicalReport: async (args) => {
      if (indexShouldThrow) throw new Error('Embedding service unavailable');
    updateEvents.push({ type: 'index', args: { ...args } });
      indexCalls.push({ ...args });
      return { indexedChunks: 1, indexVersion: 'v1', staleChunksRemain: false };
    },
  },
});

const { processReport } = await import('../services/reportProcessor.service.js');

function resetState() {
  indexCalls = [];
  ocrCalls = 0;
  aiCalls = 0;
  indexShouldThrow = false;
  ocrValue = OCR_TEXT;
  reportUser = USER_ID;
  finalSaveThrows = false;
  finalSaveReturnsNull = false;
  updateEvents = [];
  reportState = {
    _id: { toString: () => REPORT_ID },
    get user() {
      return reportUser;
    },
    processingStatus: 'pending',
    ocrStatus: 'pending',
    ocrText: null,
  };
}

beforeEach(resetState);

describe('RAG indexing integration — reportProcessor.service.js', () => {
  it('calls indexing once after completed persistence', async () => {
    await processReport(REPORT_ID, FILE_URL);

    assert.equal(indexCalls.length, 1);
    const completedEventIndex = updateEvents.findIndex(
      (event) => event.updates?.processingStatus === 'completed'
    );
    const indexEventIndex = updateEvents.findIndex((event) => event.type === 'index');
    assert.ok(completedEventIndex >= 0);
    assert.ok(indexEventIndex > completedEventIndex);
    assert.equal(reportState.processingStatus, 'completed');
    // This would fail if indexing moved before the final completed-status save.
  });

  it('passes the persisted report owner, report ID, and OCR text', async () => {
    await processReport(REPORT_ID, FILE_URL, false, OTHER_VALID_OBJECT_ID);

    assert.deepEqual(indexCalls[0], {
      reportId: REPORT_ID,
      userId: USER_ID,
      text: OCR_TEXT,
    });
    // This would fail if the removed fourth-argument owner override were used.
  });

  it('keeps processing completed and records failed RAG status when indexing throws', async () => {
    indexShouldThrow = true;

    await processReport(REPORT_ID, FILE_URL);

    assert.equal(
      updateEvents.some((event) => event.updates.processingStatus === 'failed'),
      false
    );
    assert.equal(reportState.processingStatus, 'completed');
    assert.equal(reportState.ragIndexStatus, 'failed');
    assert.equal(reportState.ragIndexError, 'indexing_failed');
    // This would fail if indexing errors changed processingStatus or were not recorded.
  });

  it('does not index when OCR rejects', async () => {
    ocrValue = new Error('OCR failure');

    await processReport(REPORT_ID, FILE_URL);

    assert.equal(indexCalls.length, 0);
    assert.equal(aiCalls, 0);
    assert.equal(reportState.ocrStatus, 'failed');
    assert.equal(reportState.processingStatus, 'failed');
    // This would fail if OCR rejection continued into AI or indexing.
  });

  for (const emptyText of ['', '   \n']) {
    it(`does not index when OCR returns ${JSON.stringify(emptyText)}`, async () => {
      ocrValue = emptyText;

      await processReport(REPORT_ID, FILE_URL);

      assert.equal(indexCalls.length, 0);
      assert.equal(aiCalls, 0);
      assert.equal(reportState.ocrStatus, 'failed');
      assert.equal(reportState.processingStatus, 'failed');
      // This would fail if empty OCR text were treated as successful OCR.
    });
  }

  it('does not index when final persistence throws', async () => {
    finalSaveThrows = true;

    await processReport(REPORT_ID, FILE_URL);

    assert.equal(indexCalls.length, 0);
    assert.equal(reportState.processingStatus, 'failed');
    // This would fail if indexing ran after a failed final result save.
  });

  it('does not index when final persistence returns null', async () => {
    finalSaveReturnsNull = true;

    await processReport(REPORT_ID, FILE_URL);

    assert.equal(indexCalls.length, 0);
    assert.equal(reportState.processingStatus, 'ai_processing');
    // This would fail if indexing ran after the report disappeared.
  });

  for (const invalidOwner of [null, 'not-an-object-id']) {
    it(`does not index when report.user is ${String(invalidOwner)}`, async () => {
      reportUser = invalidOwner;

      await processReport(REPORT_ID, FILE_URL);

      assert.equal(indexCalls.length, 0);
      assert.equal(reportState.processingStatus, 'completed');
      assert.equal(reportState.ragIndexStatus, 'failed');
      assert.equal(reportState.ragIndexError, 'invalid_owner');
      // This would fail if invalid owners were indexed or failed processing.
    });
  }

  it('records indexed RAG status on success', async () => {
    await processReport(REPORT_ID, FILE_URL);

    assert.equal(reportState.ragIndexStatus, 'indexed');
    assert.equal(reportState.ragIndexError, null);
    assert.ok(reportState.ragIndexedAt instanceof Date);
    // This would fail if successful indexing did not persist its status.
  });

  it('reprocesses a completed pipeline through the indexer', async () => {
    const alternateReportId = '64f1a2b3c4d5e6f7a8b9c0d4';

    await processReport(alternateReportId, FILE_URL, true);

    assert.equal(indexCalls.length, 1);
    // This would fail if the reprocessing path stopped invoking versioned indexing.
  });
});
