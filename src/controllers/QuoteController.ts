import type { Request, Response } from 'express';
import { Quote } from '../models/Quote.js';
import { Document } from '../models/Document.js';
import { calculateRawOffsets } from '../services/OffsetCalculator.js';

export class QuoteController {
  static createQuote = async (req: Request, res: Response) => {
    try {
      const { documentId, plainStart, plainEnd, selectedText, tags, color, memo, contextBefore, contextAfter } = req.body;

      const doc = await Document.findById(documentId);
      if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

      // Cálculo de offsets usando el servicio 
      const { rawStart, rawEnd } = calculateRawOffsets(doc.markdownContent, plainStart, plainEnd);

      const newQuote = new Quote({
        documentId,
        position: {
          rawStart,
          rawEnd,
          plainStart,
          plainEnd,
          selectedText,
          contextBefore,
          contextAfter
        },
        tags,
        color,
        memo
      });

      await newQuote.save();
      res.status(201).json(newQuote);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear la cita' });
    }
  };

  static getQuotesByDocument = async (req: Request, res: Response) => {
    try {
      const { documentId } = req.params;
      const quotes = await Quote.find({ documentId }).populate('tags');
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener citas' });
    }
  };
}