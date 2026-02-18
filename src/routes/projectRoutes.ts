import { Router } from 'express';
import { body, param } from 'express-validator';
import { handleInputErrors } from '../middlewares/validation.js';
import { ProjectController } from '../controllers/ProjectController.js';

const router: Router = Router();

router.post('/',
  body('name')
    .notEmpty().withMessage('El nombre del proyecto es obligatorio')
    .isLength({ max: 200 }).withMessage('El nombre es demasiado largo'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('La descripción es demasiado larga'),
  handleInputErrors,
  ProjectController.createProject
);

router.get('/', ProjectController.getAllProjects);

router.get('/:projectId',
  param('projectId').isMongoId().withMessage('ID de proyecto no válido'),
  handleInputErrors,
  ProjectController.getProjectById
);

export default router;