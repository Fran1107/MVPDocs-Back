import { model, Schema } from "mongoose"

export enum ChatRole {
    USER = 'user',
    ASSISTANT = 'assistant',
    SYSTEM = 'system',
}

export interface IChatMessage {
    projectId: string
    quoteId?: string
    documentId?: string
    content: string
    role: ChatRole
}

const ChatMessageSchema = new Schema<IChatMessage>({
    projectId: {
        type: String,
        required: true,
        index: true,
    },
    quoteId: {
        type: String,
        index: true,
    },
    documentId: {
        type: String,
    },
    content: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(ChatRole),
        required: true,
    },
}, { timestamps: true });

ChatMessageSchema.index({ projectId: 1, quoteId: 1 });
ChatMessageSchema.index({ projectId: 1, documentId: 1 });

export const ChatMessage = model<IChatMessage>('ChatMessage', ChatMessageSchema);