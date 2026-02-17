import { Router } from 'express';
import { Tag } from '../models/Tag.js';

const router: Router = Router();

router.post('/', async (req, res) => {
  try {
    const tag = new Tag(req.body);
    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear tag (quizás el nombre ya existe en este proyecto)' });
  }
});

router.get('/:projectId', async (req, res) => {
  const tags = await Tag.find({ projectId: req.params.projectId });
  res.json(tags);
});

export default router;