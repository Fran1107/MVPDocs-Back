import { Request, Response } from "express";
import { ChatMessage } from "../models/ChatMessage.js";

export class ChatController {

    static async sendMessage(req: Request, res: Response) {
        try {
            const { projectId, quoteId, documentId, role, content } = req.body;
            const message = await ChatMessage.create({ projectId, quoteId, documentId, role, content });
            res.status(201).json(message);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getMessages(req: Request, res: Response) {
        try {
            const { projectId, quoteId, limit = 30 } = req.query;

            const messages = await ChatMessage.find({ projectId, quoteId })
                .select('-projectId -quoteId -documentId -__v')
                .limit(Number(limit))
                .sort({ createdAt: -1 });

            if (messages.length === 0) {
                return res.status(404).json({ error: 'No messages found' });
            }

            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteMessages(req: Request, res: Response) {
        try {
            const { projectId, quoteId } = req.query;
            const messages = await ChatMessage.deleteMany({ projectId, quoteId });
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}