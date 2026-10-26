import dotenv from 'dotenv';
import mongoose from 'mongoose';
import MedicalChunk from '../models/MedicalChunk.js';
import MedicalReport from '../models/MedicalReport.js';
import User from '../models/User.js';
import { indexMedicalReport } from '../services/ragIndexing.service.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const TEST_DATABASE_NAME = 'meditrack_rag_test';
const DEFAULT_EMBEDDING_URL = 'http://127.0.0.1:8001';
const TEST_TEXT_A = 'Fictional synthetic report A. '.repeat(200).slice(0, 2500);
const TEST_TEXT_B = 'Fictional synthetic report B. '.repeat(120).slice(0, 1500);

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

async function countChunks(ownerId, sourceReportId, filter = {}) {
  return MedicalChunk.countDocuments({
    userId: ownerId,
    reportId: sourceReportId,
    ...filter,
  });
}

async function main() {
  let stage = 'validate env';
  let failure;
  let cleanupCount = 0;
  let ownerId;
  let sourceReportId;
  let preconditionPassed = false;
  let originalInsertMany;
  let insertManyWrapped = false;

  try {
    requireWriteConfirmation();
    const mongoUri = getTestDatabaseUri();
    if (
      process.env.RAG_EMBEDDING_URL &&
      process.env.RAG_EMBEDDING_URL.trim() !== DEFAULT_EMBEDDING_URL
    ) {
      throw new TestFailure('RAG_EMBEDDING_URL must use the local embedding service');
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

    stage = 'index setup';
    await MedicalChunk.createIndexes();
    const indexes = await MedicalChunk.listIndexes();
    const currentIndexNames = new Set(indexes.map((index) => index.name));
    assert(
      currentIndexNames.has(
        'userId_1_reportId_1_indexVersion_1_chunkIndex_1'
      ),
      'Required versioned unique index is missing'
    );
    assert(
      !currentIndexNames.has('userId_1_reportId_1_chunkIndex_1'),
      'Legacy unique index is still present'
    );
    reportPass('index setup');

    stage = 'index text A';
    const resultA = await indexMedicalReport({
      reportId,
      userId,
      text: TEST_TEXT_A,
    });
    const countA = await countChunks(ownerId, sourceReportId);
    const versionACount = await countChunks(ownerId, sourceReportId, {
      indexVersion: resultA.indexVersion,
    });
    const versionsA = await MedicalChunk.distinct('indexVersion', {
      userId: ownerId,
      reportId: sourceReportId,
    });
    assert(countA === resultA.indexedChunks, 'Text A count mismatch');
    assert(resultA.indexedChunks >= 3, 'Text A did not produce at least 3 chunks');
    assert(versionACount === resultA.indexedChunks, 'Text A version count mismatch');
    assert(versionsA.length === 1, 'Text A has multiple index versions');
    assert(resultA.staleChunksRemain === false, 'Text A retained stale chunks');
    reportPass('index text A');

    stage = 're-index text B';
    const resultB = await indexMedicalReport({
      reportId,
      userId,
      text: TEST_TEXT_B,
    });
    const countB = await countChunks(ownerId, sourceReportId);
    const versionACountAfterB = await countChunks(ownerId, sourceReportId, {
      indexVersion: resultA.indexVersion,
    });
    const versionBCount = await countChunks(ownerId, sourceReportId, {
      indexVersion: resultB.indexVersion,
    });
    assert(countB === resultB.indexedChunks, 'Text B count mismatch');
    assert(resultB.indexedChunks >= 2, 'Text B did not produce at least 2 chunks');
    assert(resultA.indexVersion !== resultB.indexVersion, 'Index version did not change');
    assert(versionACountAfterB === 0, 'Text A chunks remain after re-index');
    assert(versionBCount === resultB.indexedChunks, 'Text B version count mismatch');
    assert(resultB.staleChunksRemain === false, 'Text B retained stale chunks');
    reportPass('re-index text B');

    stage = 'forced insert failure';
    originalInsertMany = MedicalChunk.insertMany;
    MedicalChunk.insertMany = async (documents, options) => {
      await originalInsertMany.call(
        MedicalChunk,
        documents.slice(0, 1),
        options
      );
      throw new TestFailure('Forced insert failure for rollback test');
    };
    insertManyWrapped = true;

    let forcedFailureObserved = false;
    try {
      await indexMedicalReport({
        reportId,
        userId,
        text: TEST_TEXT_A,
      });
    } catch {
      forcedFailureObserved = true;
    } finally {
      MedicalChunk.insertMany = originalInsertMany;
      insertManyWrapped = false;
    }

    const countAfterFailure = await countChunks(ownerId, sourceReportId);
    const versionBCountAfterFailure = await countChunks(ownerId, sourceReportId, {
      indexVersion: resultB.indexVersion,
    });
    const versionsAfterFailure = await MedicalChunk.distinct('indexVersion', {
      userId: ownerId,
      reportId: sourceReportId,
    });
    assert(forcedFailureObserved, 'Forced insert failure was not observed');
    assert(
      countAfterFailure === resultB.indexedChunks,
      'Chunk count changed after forced failure'
    );
    assert(
      versionBCountAfterFailure === resultB.indexedChunks,
      'Version B chunks changed after forced failure'
    );
    assert(versionsAfterFailure.length === 1, 'Unexpected version remains after failure');
    assert(
      versionsAfterFailure[0].toString() === resultB.indexVersion,
      'A non-B version remains after forced failure'
    );
    reportPass('forced insert failure rollback');
  } catch (error) {
    failure = error;
    reportFailure('RAG reindex smoke test', stage, error);
  } finally {
    if (insertManyWrapped) {
      MedicalChunk.insertMany = originalInsertMany;
    }

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
        cleanupCount = deletion.deletedCount;
        console.log(`Cleanup deleted temporary chunks: ${cleanupCount}`);
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
  console.error('FAIL: RAG reindex smoke test [stage: startup]');
  process.exitCode = 1;
});
