// backend/src/models/Quote.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuote extends Document {
  documentId: mongoose.Types.ObjectId;
  position: {
    rawStart: number;
    rawEnd: number;
    plainStart: number;
    plainEnd: number;
    selectedText: string;
    contextBefore: string;
    contextAfter: string;
  };
  tags: mongoose.Types.ObjectId[];
  memo?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    position: {
      rawStart: {
        type: Number,
        required: true,
      },
      rawEnd: {
        type: Number,
        required: true,
      },
      plainStart: {
        type: Number,
        required: true,
      },
      plainEnd: {
        type: Number,
        required: true,
      },
      selectedText: {
        type: String,
        required: true,
        maxlength: 1000,
      },
      contextBefore: {
        type: String,
        maxlength: 200,
      },
      contextAfter: {
        type: String,
        maxlength: 200,
      },
    },
    tags: [{
      type: Schema.Types.ObjectId,
      ref: 'Tag',
    }],
    memo: {
      type: String,
      maxlength: 1000,
    },
    color: {
      type: String,
      required: true,
      match: /^#[0-9A-F]{6}$/i,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para búsquedas eficientes
QuoteSchema.index({ documentId: 1, 'position.plainStart': 1 });

export const Quote = mongoose.model<IQuote>('Quote', QuoteSchema);