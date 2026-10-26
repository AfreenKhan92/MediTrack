import mongoose from 'mongoose';
import MedicalChunk from '../models/MedicalChunk.js';
import { generateEmbeddings } from './ragIndexing.service.js';

const MAX_LIMIT = 20;

function isObjectId(value) {
  return (
    value instanceof mongoose.Types.ObjectId ||
    (typeof value === 'string' && /^[a-f\d]{24}$/i.test(value))
  );
}

export async function retrieveRelevantChunks({
  userId,
  reportId,
  question,
  limit = 5,
}) {
  if (!isObjectId(userId)) {
    throw new Error('Invalid userId');
  }

  if (reportId !== undefined && !isObjectId(reportId)) {
    throw new Error('Invalid reportId');
  }

  if (typeof question !== 'string' || !question.trim()) {
    throw new Error('Question must be a non-empty string');
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error('Limit must be a positive integer');
  }

  const indexName = process.env.RAG_VECTOR_INDEX_NAME?.trim();
  if (!indexName) {
    throw new Error('RAG_VECTOR_INDEX_NAME is required');
  }

  let queryVector;
  try {
    [queryVector] = await generateEmbeddings([question.trim()]);
  } catch {
    throw new Error('Embedding request failed');
  }
  const safeLimit = Math.min(limit, MAX_LIMIT);
  const filter = {
    userId: { $eq: new mongoose.Types.ObjectId(userId) },
  };

  if (reportId !== undefined) {
    filter.reportId = {
      $eq: new mongoose.Types.ObjectId(reportId),
    };
  }

  return MedicalChunk.aggregate([
    {
      $vectorSearch: {
        index: indexName,
        path: 'embedding',
        queryVector,
        numCandidates: Math.max(100, safeLimit * 20),
        limit: safeLimit,
        filter,
      },
    },
    {
      $project: {
        _id: 0,
        text: 1,
        reportId: 1,
        chunkIndex: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);
}

export default { retrieveRelevantChunks };
