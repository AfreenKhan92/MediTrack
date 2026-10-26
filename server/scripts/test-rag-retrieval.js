import dotenv from 'dotenv';
import mongoose from 'mongoose';
import MedicalChunk from '../models/MedicalChunk.js';
import MedicalReport from '../models/MedicalReport.js';
import User from '../models/User.js';
import { indexMedicalReport } from '../services/ragIndexing.service.js';
import { retrieveRelevantChunks } from '../services/ragRetrieval.service.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const TEST_DATABASE_NAME = 'meditrack_rag_test';
const DEFAULT_EMBEDDING_URL = 'http://127.0.0.1:8001';
const REQUIRED_VECTOR_INDEX_NAME = 'medical_chunks_vector_index_test';
const GLUCOSE_QUESTION = 'What fictional glucose results are described?';
const ANKLE_QUESTION = 'What fictional ankle plan is described?';
const TEST_TEXT = [
  'Fictional synthetic glucose report: fasting glucose was recorded at 94 mg/dL and fictional HbA1c was 5.4 percent. The glucose observation is for testing only and does not describe a real patient. '.repeat(
    8
  ).slice(0, 1200),
  'Fictional synthetic ankle report: a mild sprained ankle was assigned a fictional physiotherapy plan with mobility exercises, balance work, and gradual strengthening. The ankle information is for testing only and does not describe a real patient. '.repeat(
    8
  ).slice(0, 1200),
].join('');

class TestFailure extends Error {}

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new TestFailure('Required environment variable is missing');
  }
  return value;
}

function requireWriteConfirmation() {
  if (requireEnvironment('CONFIRM_RAG_TEST_DATABASE_WRITE') !== 'true') {
    throw new TestFailure('CONFIRM_RAG_TEST_DATABASE_WRITE must be exactly true');
  }
}

function getTestDatabaseUri() {
  const uri = requireEnvironment('RAG_TEST_MONGO_URI');

  if (!/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new TestFailure('RAG_TEST_MONGO_URI must be a MongoDB connection string');
  }

  const databaseName = new URL(uri).pathname.replace(/^\/+/, '');
  if (databaseName !== TEST_DATABASE_NAME) {
    throw new TestFailure(
      'RAG_TEST_MONGO_URI must target the isolated RAG test database'
    );
  }

  if (process.env.MONGO_URI?.trim() === uri) {
    throw new TestFailure(
      'RAG_TEST_MONGO_URI must be separate from the primary MONGO_URI'
    );
  }

  return uri;
}

function assert(condition, message) {
  if (!condition) throw new TestFailure(message);
}

function safeMongoDiagnostic(error) {
  const allowedNames = new Set([
    'AssertionError',
    'CastError',
    'MongoAuthenticationError',
    'MongoNetworkError',
    'MongoServerError',
    'MongoServerSelectionError',
    'MongooseError',
    'MongooseServerSelectionError',
    'ValidationError',
  ]);
  const diagnostic = {};

  if (allowedNames.has(error?.name)) diagnostic.name = error.name;
  if (
    typeof error?.code === 'number' ||
    (typeof error?.code === 'string' &&
      /^[A-Za-z0-9_.-]{1,64}$/.test(error.code))
  ) {
    diagnostic.code = error.code;
  }
  if (
    typeof error?.codeName === 'string' &&
    /^[A-Za-z0-9_.-]{1,64}$/.test(error.codeName)
  ) {
    diagnostic.codeName = error.codeName;
  }

  return diagnostic;
}

function reportPass(name) {
  console.log(`PASS: ${name}`);
}

function reportFailure(name, stage, error) {
  if (error instanceof TestFailure) {
    console.error(`FAIL: ${name} [stage: ${stage}] ${error.message}`);
    return;
  }
  console.error(`FAIL: ${name} [stage: ${stage}]`, safeMongoDiagnostic(error));
}

async function assertTestRecords(userId, reportId) {
  const ownerId = new mongoose.Types.ObjectId(userId);
  const sourceReportId = new mongoose.Types.ObjectId(reportId);
  const user = await User.exists({ _id: ownerId });
  assert(user, 'Test user not found');
  const report = await MedicalReport.exists({
    _id: sourceReportId,
    user: ownerId,
  });
  assert(report, 'Test report not found or not owned by test user');
  return { ownerId, sourceReportId };
}

async function countChunks(ownerId, sourceReportId) {
  return MedicalChunk.countDocuments({
    userId: ownerId,
    reportId: sourceReportId,
  });
}

async function waitForSearchable(ownerId, sourceReportId) {
  const deadline = Date.now() + 120000;

  while (Date.now() <= deadline) {
    const results = await retrieveRelevantChunks({
      userId: ownerId,
      reportId: sourceReportId,
      question: GLUCOSE_QUESTION,
    });
    if (results.length) return results;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new TestFailure('Vector index did not become searchable in time');
}

async function main() {
  let stage = 'validate env';
  let testName = 'setup';
  let failure;
  let ownerId;
  let sourceReportId;
  let preconditionPassed = false;

  try {
    requireWriteConfirmation();
    const mongoUri = getTestDatabaseUri();
    if (
      process.env.RAG_EMBEDDING_URL &&
      process.env.RAG_EMBEDDING_URL.trim() !== DEFAULT_EMBEDDING_URL
    ) {
      throw new TestFailure('RAG_EMBEDDING_URL must use the local embedding service');
    }
    if (
      requireEnvironment('RAG_VECTOR_INDEX_NAME') !==
      REQUIRED_VECTOR_INDEX_NAME
    ) {
      throw new TestFailure('RAG_VECTOR_INDEX_NAME must match the test index');
    }
    const userId = requireEnvironment('RAG_TEST_USER_ID');
    const reportId = requireEnvironment('RAG_TEST_REPORT_ID');

    if (!mongoose.isValidObjectId(userId)) {
      throw new TestFailure('RAG_TEST_USER_ID is not a valid ObjectId');
    }
    if (!mongoose.isValidObjectId(reportId)) {
      throw new TestFailure('RAG_TEST_REPORT_ID is not a valid ObjectId');
    }

    stage = 'connect';
    await mongoose.connect(mongoUri);
    assert(
      mongoose.connection.readyState === 1,
      'MongoDB connection did not reach the connected state'
    );
    assert(
      mongoose.connection.name === TEST_DATABASE_NAME,
      'MongoDB connection selected the wrong database'
    );

    stage = 'lookup user/report';
    ({ ownerId, sourceReportId } = await assertTestRecords(userId, reportId));

    stage = 'precondition';
    const initialCount = await countChunks(ownerId, sourceReportId);
    assert(initialCount === 0, 'Precondition requires zero existing chunks');
    preconditionPassed = true;

    stage = 'index report';
    testName = 'index report';
    const indexed = await indexMedicalReport({
      userId,
      reportId,
      text: TEST_TEXT,
    });
    assert(indexed.indexedChunks >= 2, 'Synthetic report did not produce enough chunks');
    reportPass('index report');

    stage = 'wait for vector index';
    testName = 'vector index became searchable';
    const glucoseResults = await waitForSearchable(ownerId, sourceReportId);
    reportPass('vector index became searchable');

    stage = 'relevance';
    testName = 'relevance';
    const ankleResults = await retrieveRelevantChunks({
      userId: ownerId,
      reportId: sourceReportId,
      question: ANKLE_QUESTION,
    });
    assert(
      glucoseResults[0]?.text?.toLowerCase().includes('glucose'),
      'Glucose result was not relevant'
    );
    assert(
      ankleResults[0]?.text?.toLowerCase().includes('ankle'),
      'Ankle result was not relevant'
    );
    reportPass('relevance');

    stage = 'access control';
    testName = 'access control';
    const randomUserResults = await retrieveRelevantChunks({
      userId: new mongoose.Types.ObjectId(),
      reportId: sourceReportId,
      question: GLUCOSE_QUESTION,
    });
    assert(randomUserResults.length === 0, 'Random user returned results');
    reportPass('access control');

    stage = 'report scoping';
    testName = 'report scoping';
    const randomReportResults = await retrieveRelevantChunks({
      userId: ownerId,
      reportId: new mongoose.Types.ObjectId(),
      question: GLUCOSE_QUESTION,
    });
    assert(randomReportResults.length === 0, 'Random report returned results');
    reportPass('report scoping');

    stage = 'shape and limits';
    testName = 'shape and limits';
    const largeLimitResults = await retrieveRelevantChunks({
      userId: ownerId,
      reportId: sourceReportId,
      question: GLUCOSE_QUESTION,
      limit: 100,
    });
    const expectedKeys = ['chunkIndex', 'reportId', 'score', 'text'];
    assert(
      largeLimitResults.length <= 20,
      'Limit was not capped at 20'
    );
    assert(
      largeLimitResults.every(
        (result) =>
          JSON.stringify(Object.keys(result).sort()) ===
          JSON.stringify(expectedKeys)
      ),
      'Retrieval result shape was unexpected'
    );
    let zeroLimitRejected = false;
    try {
      await retrieveRelevantChunks({
        userId: ownerId,
        reportId: sourceReportId,
        question: GLUCOSE_QUESTION,
        limit: 0,
      });
    } catch {
      zeroLimitRejected = true;
    }
    assert(zeroLimitRejected, 'Zero limit was accepted');
    reportPass('shape and limits');

    stage = 'missing index name';
    testName = 'missing index name';
    const previousIndexName = process.env.RAG_VECTOR_INDEX_NAME;
    try {
      delete process.env.RAG_VECTOR_INDEX_NAME;
      let missingIndexRejected = false;
      try {
        await retrieveRelevantChunks({
          userId: ownerId,
          reportId: sourceReportId,
          question: GLUCOSE_QUESTION,
        });
      } catch {
        missingIndexRejected = true;
      }
      assert(missingIndexRejected, 'Missing vector index name was accepted');
    } finally {
      if (previousIndexName === undefined) {
        delete process.env.RAG_VECTOR_INDEX_NAME;
      } else {
        process.env.RAG_VECTOR_INDEX_NAME = previousIndexName;
      }
    }
    reportPass('missing index name');
  } catch (error) {
    failure = error;
    reportFailure(testName, stage, error);
  } finally {
    stage = 'cleanup';
    if (
      preconditionPassed &&
      ownerId &&
      sourceReportId &&
      mongoose.connection.readyState === 1
    ) {
      try {
        const deletion = await MedicalChunk.deleteMany({
          userId: ownerId,
          reportId: sourceReportId,
        });
        console.log(`Cleanup deleted temporary chunks: ${deletion.deletedCount}`);
      } catch (error) {
        failure ||= error;
        reportFailure('cleanup', stage, error);
      }
    }

    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.connection.close();
      } catch (error) {
        failure ||= error;
        reportFailure('connection close', stage, error);
      }
    }
  }

  if (failure) process.exitCode = 1;
}

main().catch(() => {
  console.error('FAIL: RAG retrieval smoke test [stage: startup]');
  process.exitCode = 1;
});
