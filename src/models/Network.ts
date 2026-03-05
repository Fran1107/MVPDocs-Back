import mongoose, { Schema, Document, Date } from 'mongoose';

export interface INetwork extends Document {
  projectId: mongoose.Types.ObjectId;
  name: string;
  nodes: any[]; // Posiciones y datos de Tags/Quotes
  edges: any[]; // Conexiones entre nodos
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  version: number; // Para evitar que dos personas pisen el mismo cambio
  updatedAt: Date
}

const NetworkSchema = new Schema<INetwork>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  nodes: { type: [{}], default: [] },
  edges: { type: [{}], default: [] },
  viewport: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    zoom: { type: Number, default: 1 }
  },
  version: { type: Number, default: 1 }
}, { timestamps: true });

export const Network = mongoose.model<INetwork>('Network', NetworkSchema);