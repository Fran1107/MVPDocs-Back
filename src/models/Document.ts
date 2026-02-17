// backend/src/models/Document.ts
import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  title: string;
  originalFilename: string;
  originalFormat: 'docx' | 'txt' | 'md';
  markdownContent: string;
  contentHash: string;
  metadata: {
    uploadDate: Date;
    lastModified: Date;
    wordCount: number;
    characterCount: number;
  };
  projectId: mongoose.Types.ObjectId;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    originalFormat: {
      type: String,
      enum: ['docx', 'txt', 'md'],
      required: true,
    },
    markdownContent: {
      type: String,
      required: true,
    },
    contentHash: {
      type: String,
      required: true,
    },
    metadata: {
      uploadDate: {
        type: Date,
        default: Date.now,
      },
      lastModified: {
        type: Date,
        default: Date.now,
      },
      wordCount: {
        type: Number,
        default: 0,
      },
      characterCount: {
        type: Number,
        default: 0,
      },
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    summary: {
      type: String,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

export const Document = mongoose.model<IDocument>('Document', DocumentSchema);