import axios from 'axios';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import MedicalChunk from '../models/MedicalChunk.js';
import MedicalReport from '../models/MedicalReport.js';
import User from '../models/User.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const SAMPLE_TEXT =
  'Sample report: vitamin D level recorded as 22 ng/mL.';
const EXPECTED_DIMENSIONS = 384;
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requireWriteConfirmation() {
  const confirmation = requireEnvironment('CONFIRM_RAG_TEST_DATABASE_WRITE');
  if (confirmation !== 'true') {
    throw new Error(
      'CONFIRM_RAG_TEST_DATABASE_WRITE must be exactly true'
    );
  }
}

function getTestDatabaseUri() {
  const uri = requireEnvironment('RAG_TEST_MONGO_URI');

  if (!/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new Error('RAG_TEST_MONGO_URI must be a MongoDB connection string');
  }

  const databaseName = new URL(uri).pathname.replace(/^\/+/, '');
  if (databaseName !== 'meditrack_rag_test') {
    throw new Error(
      'RAG_TEST_MONGO_URI must target the isolated RAG test database'
    );
  }

  if (process.env.MONGO_URI && uri === process.env.MONGO_URI.trim()) {
    throw new Error(
      'RAG_TEST_MONGO_URI must be separate from the primary MONGO_URI'
    );
  }

  return uri;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEmbedding(embedding) {
  assert(
    Array.isArray(embedding) && embedding.length === EXPECTED_DIMENSIONS,
    `Expected an embedding with exactly ${EXPECTED_DIMENSIONS} values`
  );
  assert(
    embedding.every(
      (value) => typeof value === 'number' && Number.isFinite(value)
    ),
    'Embedding must contain only finite numeric values'
  );
}

function safeMongoDiagnostic(error) {
  const allowedNames = new Set([
    'AssertionError',
    'CastError',
    'MongoServerError',
    'MongoNetworkError',
    'MongoServerSelectionError',
    'MongoAuthenticationError',
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

async function generateEmbedding() {
  const response = await axios.post(
    'http://127.0.0.1:8001/embed',
    { texts: [SAMPLE_TEXT] },
    { timeout: 120000 }
  );
  const { dimensions, embeddings } = response.data;

  assert(
    dimensions === EXPECTED_DIMENSIONS,
    `Embedding service reported ${dimensions} dimensions`
  );
  assert(
    Array.isArray(embeddings) && embeddings.length === 1,
    'Embedding service must return one vector for the sample text'
  );
  assertEmbedding(embeddings[0]);
  return embeddings[0];
}

async function main() {
  let stage = 'validate env';
  let failureStage;
  let failureMessage;
  let insertedId;
  let failure;

  try {
    requireWriteConfirmation();
    const mongoUri = getTestDatabaseUri();
    const userId = requireEnvironment('RAG_TEST_USER_ID');
    const reportId = requireEnvironment('RAG_TEST_REPORT_ID');

    if (!mongoose.isValidObjectId(userId)) {
      failureMessage = 'RAG_TEST_USER_ID is not a valid ObjectId';
      throw new Error(failureMessage);
    }
    if (!mongoose.isValidObjectId(reportId)) {
      failureMessage = 'RAG_TEST_REPORT_ID is not a valid ObjectId';
      throw new Error(failureMessage);
    }

    stage = 'connect';
    await mongoose.connect(mongoUri);
    assert(
      mongoose.connection.readyState === 1,
      'MongoDB connection did not reach the connected state'
    );
    assert(
      mongoose.connection.name === 'meditrack_rag_test',
      'MongoDB connection selected the wrong database'
    );
    console.log('Connected to the explicitly configured RAG test database.');

    stage = 'lookup user/report';
    const ownerId = new mongoose.Types.ObjectId(userId);
    const sourceReportId = new mongoose.Types.ObjectId(reportId);
    let user;
    try {
      user = await User.exists({ _id: ownerId });
    } catch (error) {
      failureMessage = 'Test user lookup failed in meditrack_rag_test';
      throw error;
    }
    if (!user) {
      failureMessage = 'Test user not found in meditrack_rag_test';
      throw new Error(failureMessage);
    }

    let report;
    try {
      report = await MedicalReport.exists({
        _id: sourceReportId,
        user: ownerId,
      });
    } catch (error) {
      failureMessage = 'Test report lookup failed in meditrack_rag_test';
      throw error;
    }
    if (!report) {
      failureMessage = 'Test report not found, or not owned by the test user';
      throw new Error(failureMessage);
    }

    stage = 'embed';
    const embedding = await generateEmbedding();
    insertedId = new mongoose.Types.ObjectId();

    stage = 'insert';
    const chunkIndex = -(Date.now() * 1000 + crypto.randomInt(0, 1000));
    await MedicalChunk.create({
      _id: insertedId,
      userId: ownerId,
      reportId: sourceReportId,
      chunkIndex,
      text: SAMPLE_TEXT,
      embedding,
      embeddingModel: EMBEDDING_MODEL,
    });

    stage = 'read-back';
    const stored = await MedicalChunk.findById(insertedId).lean();
    assert(stored, 'Inserted test chunk could not be read back');
    assert(stored.text === SAMPLE_TEXT, 'Stored chunk text did not match');
    assert(
      stored.embedding.length === EXPECTED_DIMENSIONS &&
        stored.embedding.every(
          (value) => typeof value === 'number' && Number.isFinite(value)
        ),
      'Stored embedding did not pass dimension and numeric-value checks'
    );
    assert(
      stored.userId.toString() === userId,
      'Stored userId did not match the configured test user'
    );
    assert(
      stored.reportId.toString() === reportId,
      'Stored reportId did not match the configured test report'
    );
  } catch (error) {
    failure = error;
    failureStage = stage;
  } finally {
    stage = 'cleanup';
    if (insertedId) {
      if (mongoose.connection.readyState === 1) {
        try {
          const deletion = await MedicalChunk.deleteOne({ _id: insertedId });
          assert(
            deletion.deletedCount === 1,
            'The exact inserted test chunk was not deleted'
          );
          console.log('Deleted the exact test chunk inserted by this script.');
        } catch (error) {
          console.warn(
            `WARNING: Temporary test chunk may remain; cleanup failed for _id ${insertedId}.`,
            safeMongoDiagnostic(error)
          );
          if (!failure) {
            failure = error;
            failureStage = stage;
          }
        }
      } else {
        const warning = `WARNING: Temporary test chunk may remain; MongoDB connection is unavailable for cleanup of _id ${insertedId}`;
        console.warn(warning);
        if (!failure) {
          failure = new Error(warning);
          failureStage = stage;
        }
      }
    }

    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
      } catch (error) {
        console.error(
          'MongoDB connection close failed.',
          safeMongoDiagnostic(error)
        );
        if (!failure) {
          failure = error;
          failureStage = stage;
        }
      }
    }
  }

  if (failure) {
    console.error(
      `${failureMessage || 'RAG storage smoke test failed'} at stage: ${
        failureStage || stage
      }.`,
      safeMongoDiagnostic(failure)
    );
    process.exitCode = 1;
    return;
  }
  console.log('RAG storage smoke test passed.');
}

main().catch(() => {
  console.error(
    'RAG storage smoke test failed before a safe diagnostic was available.'
  );
  process.exitCode = 1;
});
