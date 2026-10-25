
import axios from 'axios';
import mongoose from 'mongoose';
import MedicalChunk from '../models/MedicalChunk.js';

const EMBEDDING_URL =
  process.env.RAG_EMBEDDING_URL || 'http://127.0.0.1:8001';

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;
const EMBEDDING_BATCH_SIZE = 16;

function splitIntoChunks(text) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  const chunks = [];
  let start = 0;

  while (start < cleaned.length) {
    const end = Math.min(start + CHUNK_SIZE, cleaned.length);
    const chunk = cleaned.slice(start, end).trim();

    if (chunk) chunks.push(chunk);
    if (end === cleaned.length) break;

    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

async function generateEmbeddings(texts) {
  const response = await axios.post(
    `${EMBEDDING_URL}/embed`,
    { texts },
    { timeout: 120000 }
  );

  const { embeddings, dimensions } = response.data;

  if (
    dimensions !== 384 ||
    !Array.isArray(embeddings) ||
    embeddings.length !== texts.length ||
    embeddings.some(
      (vector) =>
        !Array.isArray(vector) ||
        vector.length !== 384 ||
        vector.some((value) => !Number.isFinite(value))
    )
  ) {
    throw new Error('Embedding service returned invalid vectors');
  }

  return embeddings;
}

export async function indexMedicalReport({ reportId, userId, text }) {
  if (
    !mongoose.isValidObjectId(reportId) ||
    !mongoose.isValidObjectId(userId)
  ) {
    throw new Error('Invalid reportId or userId');
  }

  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Cannot index empty report text');
  }

  const chunks = splitIntoChunks(text);
  if (!chunks.length) throw new Error('No chunks generated');

  // Generate every vector before changing stored chunks.
  const vectors = [];

  for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
    vectors.push(
      ...(await generateEmbeddings(
        chunks.slice(i, i + EMBEDDING_BATCH_SIZE)
      ))
    );
  }

  const ownerId = new mongoose.Types.ObjectId(userId);
  const sourceReportId = new mongoose.Types.ObjectId(reportId);

  const documents = chunks.map((chunk, index) => ({
    userId: ownerId,
    reportId: sourceReportId,
    chunkIndex: index,
    text: chunk,
    embedding: vectors[index],
    embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
  }));

  // Use the confirmed collection name: medicalchunks.
  // Replacement is scoped to this user and report.
  await MedicalChunk.deleteMany({
    userId: ownerId,
    reportId: sourceReportId,
  });

  await MedicalChunk.insertMany(documents, { ordered: true });

  return { indexedChunks: documents.length };
}

export default { indexMedicalReport };
