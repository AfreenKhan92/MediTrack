
import mongoose from 'mongoose';

const medicalChunkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalReport',
      required: true,
      index: true,
    },
    indexVersion: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: (values) => values.length === 384,
        message: 'Embedding must contain exactly 384 dimensions',
      },
    },
    embeddingModel: {
      type: String,
      default: 'sentence-transformers/all-MiniLM-L6-v2',
    },
  },
  { timestamps: true, collection: 'medicalchunks' }
);

medicalChunkSchema.index(
  { userId: 1, reportId: 1, indexVersion: 1, chunkIndex: 1 },
  { unique: true }
);

export default mongoose.model('MedicalChunk', medicalChunkSchema);
