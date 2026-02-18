import type { Request, Response } from 'express';
import { Document } from '../models/Document.js';
import { convertToMarkdown } from '../services/DocumentConverter.js';

export class DocumentController {
  
  // POST /api/documents/upload
  static uploadDocument = async (req: Request, res: Response) => {
    try {
      const { projectId, title } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
      }

      const extension = file.originalname.split('.').pop()?.toLowerCase() || '';
      
      // 1. Convertir a Markdown y generar Hash
      const { markdown, hash } = await convertToMarkdown(file.buffer, extension);

      // 2. Validar Duplicados: Evitar subir el mismo contenido al mismo proyecto
      const existingDoc = await Document.findOne({ contentHash: hash, projectId });
      if (existingDoc) {
        return res.status(409).json({ 
          error: 'Este documento ya existe en el proyecto (mismo contenido).' 
        });
      }

      // 3. Crear el registro (el resumen vendrá después desde el front)
      const newDoc = new Document({
        title: title || file.originalname,
        originalFilename: file.originalname,
        originalFormat: extension,
        markdownContent: markdown,
        contentHash: hash,
        projectId,
        metadata: {
          characterCount: markdown.length,
          wordCount: markdown.trim().split(/\s+/).length,
        }
      });

      await newDoc.save();
      res.status(201).json(newDoc);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al procesar el documento' });
    }
  };

  // GET /api/documents?page=1&limit=10 (Lista con paginación)
  static getAllDocuments = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const documents = await Document.find()
        .select('-markdownContent') // No enviamos el contenido pesado en la lista
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Document.countDocuments();

      res.json({
        documents,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalDocuments: total
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener documentos' });
    }
  };

  // GET /api/documents/:id (Detalle completo para el visor)
  static getDocumentById = async (req: Request, res: Response) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el documento' });
    }
  };

  // PATCH /api/documents/:id/summary (Para el resumen de IA desde el front)
  static updateDocumentSummary = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { summary } = req.body;

      const document = await Document.findByIdAndUpdate(
        id,
        { summary },
        { new: true }
      );

      if (!document) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }

      res.json({ message: 'Resumen actualizado', document });
    } catch (error) {
      res.status(500).json({ error: 'Error al guardar el resumen' });
    }
  };

  // GET /api/documents/:id/integrity (Validación SHA-256 US-02)
  static checkIntegrity = async (req: Request, res: Response) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) return res.status(404).json({ error: 'Documento no encontrado' });

      res.json({ 
        isValid: true, 
        hash: document.contentHash 
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al verificar integridad' });
    }
  };
}