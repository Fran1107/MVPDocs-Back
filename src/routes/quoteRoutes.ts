import { Router } from 'express';
import { Quote } from '../models/Quote.js';
import { Document } from '../models/Document.js';
import { calculateRawOffsets } from '../services/OffsetCalculator.js';

const router: Router = Router();

router.post('/', async (req, res) => {
  try {
    const { documentId, plainStart, plainEnd, selectedText, tags, color, memo, contextBefore, contextAfter } = req.body;

    // 1. Buscar el documento para obtener el Markdown original
    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

    // 2. Calcular los offsets reales (raw) sobre el Markdown [cite: 48, 50]
    const { rawStart, rawEnd } = calculateRawOffsets(doc.markdownContent, plainStart, plainEnd);

    // 3. Crear la cita con la estrategia de doble offset [cite: 28, 32]
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
    console.error(error);
    res.status(500).json({ error: 'Error al crear la cita' });
  }
});

export default router;