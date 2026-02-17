import { Router } from 'express';
import { Project } from '../models/Project.js';

const router: Router = Router();

router.post('/', async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.status(201).json(project);
});

router.get('/', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

export default router;