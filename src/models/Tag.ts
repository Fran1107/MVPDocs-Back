// backend/src/models/Tag.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  name: string;
  color: string;
  description?: string;
  categoryId?: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    color: {
      type: String,
      required: true,
      match: /^#[0-9A-F]{6}$/i,
      default: '#3B82F6',
    },
    description: {
      type: String,
      maxlength: 200,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para unicidad por proyecto
TagSchema.index({ projectId: 1, name: 1 }, { unique: true });

export const Tag = mongoose.model<ITag>('Tag', TagSchema);