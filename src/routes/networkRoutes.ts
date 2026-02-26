import { Router } from 'express';
import { body, param } from 'express-validator';
import { NetworkController } from '../controllers/NetworkController.js';
import { handleInputErrors } from '../middlewares/validation.js';

const router: Router = Router();

// Endpoint de generación automática (Día 1-2) 
router.post('/generate-from-project',
  body('projectId').isMongoId().withMessage('ID de proyecto no válido'),
  handleInputErrors,
  NetworkController.generateFromProject
);

router.get('/:id',
  param('id').isMongoId().withMessage('ID de red no válido'),
  handleInputErrors,
  NetworkController.getNetworkById
);

router.patch('/:id', NetworkController.updateNetwork);

// Agregá aquí los CRUD básicos (GET listado, PATCH update, DELETE) 

export default router;