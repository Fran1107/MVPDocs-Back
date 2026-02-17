import { Router } from 'express';
import multer from 'multer';
import { Document } from '../models/Document.js';
import { convertToMarkdown } from '../services/DocumentConverter.js';

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { projectId, title } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const extension = file.originalname.split('.').pop() as any;
    const { markdown, hash } = await convertToMarkdown(file.buffer, extension);

    const newDoc = new Document({
      title: title || file.originalname,
      originalFilename: file.originalname,
      originalFormat: extension,
      markdownContent: markdown,
      contentHash: hash,
      projectId,
      metadata: {
        characterCount: markdown.length,
        wordCount: markdown.split(/\s+/).length,
      }
    });

    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ error: 'Error processing document' });
  }
});

export default router;