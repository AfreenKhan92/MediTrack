import crypto from 'node:crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import MedicalReport from '../models/MedicalReport.js';
import User from '../models/User.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const TEST_EMAIL_PREFIX = 'meditrack-rag-seed-';

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getTestDatabaseUri() {
  const uri = requireEnvironment('RAG_TEST_MONGO_URI');

  if (!/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new Error('RAG_TEST_MONGO_URI must be a MongoDB connection string');
  }

  let databaseName;
  try {
    databaseName = new URL(uri).pathname.replace(/^\/+/, '');
  } catch {
    throw new Error('RAG_TEST_MONGO_URI is not a valid MongoDB URI');
  }

  if (!databaseName || !/(test|smoke)/i.test(databaseName)) {
    throw new Error(
      'RAG_TEST_MONGO_URI must include a database name containing "test" or "smoke"'
    );
  }

  if (process.env.MONGO_URI?.trim() === uri) {
    throw new Error(
      'RAG_TEST_MONGO_URI must be separate from the primary MONGO_URI'
    );
  }

  return uri;
}

function requireSeedConfirmation() {
  if (requireEnvironment('RAG_TEST_SEED_CONFIRM') !== 'true') {
    throw new Error('RAG_TEST_SEED_CONFIRM must be exactly true');
  }
}

function createTestEmail() {
  return `${TEST_EMAIL_PREFIX}${Date.now()}-${crypto
    .randomBytes(8)
    .toString('hex')}@example.com`;
}

function getErrorChain(error) {
  const chain = [];
  let current = error;

  while (current && chain.length < 3) {
    chain.push(current);
    current = current.cause;
  }

  return chain;
}

function getFailureDiagnostic(error, stage) {
  const errorChain = getErrorChain(error);
  const networkCodes = new Set([
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'EAI_AGAIN',
    'ENOTFOUND',
  ]);
  const knownNames = new Set([
    'MongoAuthenticationError',
    'MongoBulkWriteError',
    'MongoError',
    'MongoNetworkError',
    'MongoNetworkTimeoutError',
    'MongoParseError',
    'MongoServerError',
    'MongoServerSelectionError',
    'MongooseError',
  ]);

  let category = stage === 'configuration' ? 'configuration validation' : null;
  for (const candidate of errorChain) {
    if (
      networkCodes.has(candidate?.code) ||
      [
        'MongoServerSelectionError',
        'MongoNetworkError',
        'MongoNetworkTimeoutError',
      ].includes(candidate?.name)
    ) {
      category = 'DNS/network';
      break;
    }
    if (
      candidate?.code === 18 ||
      candidate?.codeName === 'AuthenticationFailed' ||
      candidate?.name === 'MongoAuthenticationError'
    ) {
      category = 'authentication';
      break;
    }
    if (candidate?.code === 13 || candidate?.codeName === 'Unauthorized') {
      category = 'authorization';
      break;
    }
    if (
      candidate?.code === 11000 ||
      candidate?.codeName === 'DuplicateKey' ||
      candidate?.name === 'MongoBulkWriteError'
    ) {
      category = 'duplicate key';
      break;
    }
  }

  if (!category && stage === 'user creation') category = 'user creation';
  if (!category && stage === 'report creation') category = 'report creation';

  const metadataSource = errorChain.find(
    (candidate) =>
      (typeof candidate?.name === 'string' && knownNames.has(candidate.name)) ||
      typeof candidate?.code === 'number' ||
      (typeof candidate?.code === 'string' &&
        /^[A-Za-z0-9_.-]{1,64}$/.test(candidate.code))
  );
  const safeName =
    typeof metadataSource?.name === 'string' &&
    knownNames.has(metadataSource.name)
      ? metadataSource.name
      : undefined;
  const safeCode =
    typeof metadataSource?.code === 'number' ||
    (typeof metadataSource?.code === 'string' &&
      /^[A-Za-z0-9_.-]{1,64}$/.test(metadataSource.code))
      ? metadataSource.code
      : undefined;

  return {
    category: category || 'unknown database error',
    name: safeName,
    code: safeCode,
  };
}

function formatFailureDiagnostic(error, stage) {
  const diagnostic = getFailureDiagnostic(error, stage);
  const metadata = [
    diagnostic.name && `name: ${diagnostic.name}`,
    diagnostic.code !== undefined && `code: ${diagnostic.code}`,
  ].filter(Boolean);
  const details = metadata.length ? `; ${metadata.join(', ')}` : '';

  return `RAG test record seed failed [${diagnostic.category}; stage: ${stage}${details}].`;
}

async function main() {
  let createdUserId;
  let failure;
  let stage = 'configuration';

  try {
    requireSeedConfirmation();
    const mongoUri = getTestDatabaseUri();
    const testEmail = createTestEmail();
    const testPassword = crypto.randomBytes(32).toString('base64url');

    stage = 'database connection';
    await mongoose.connect(mongoUri);

    stage = 'duplicate check';
    const existingUser = await User.findOne({
      email: new RegExp(`^${TEST_EMAIL_PREFIX}`),
    })
      .select('_id email')
      .lean();

    if (existingUser) {
      throw new Error(
        'A reserved RAG seed user already exists. No records were created or deleted; handle the existing disposable records manually before rerunning.'
      );
    }

    stage = 'user creation';
    const user = new User({
      name: 'Fictional RAG Test User',
      email: testEmail,
      password: testPassword,
      role: 'user',
    });
    await user.save();
    createdUserId = user._id;

    stage = 'report creation';
    const report = await MedicalReport.create({
      user: createdUserId,
      title: 'Fictional RAG Storage Smoke Test Report',
      patientName: 'Fictional Test Patient',
      category: 'Other',
      fileUrl: 'https://example.com/meditrack-rag-placeholder.pdf',
      cloudinaryId: 'meditrack-rag-placeholder',
    });

    console.log(`Created test user ObjectId: ${createdUserId}`);
    console.log(`Created test report ObjectId: ${report._id}`);
  } catch (error) {
    failure = error;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.connection.close();
      } catch {
        failure ||= new Error('Failed to close the MongoDB connection');
      }
    }
  }

  if (failure) {
    console.error(formatFailureDiagnostic(failure, stage));
    if (createdUserId) {
      console.error(
        `Seed failed; the user record may remain. User ObjectId: ${createdUserId}`
      );
    }
    process.exitCode = 1;
  }
}

main().catch(() => {
  console.error(
    'RAG test record seed failed [unknown database error; stage: startup].'
  );
  process.exitCode = 1;
});
