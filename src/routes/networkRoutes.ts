import { Router } from 'express';
import { body, param } from 'express-validator';
import { NetworkController } from '../controllers/NetworkController.js';
import { handleInputErrors } from '../middlewares/validation.js';

const router: Router = Router();

// Endpoint para redes recientes (dashboard)
router.get('/recent', NetworkController.getRecentNetworks);

// Endpoint de generación automática 
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

// Endpoint para obtener redes por proyecto
router.get('/project/:projectId',
    param('projectId').isMongoId().withMessage('ID de proyecto no válido'),
    handleInputErrors,
    NetworkController.getNetworksByProject
);
 
 
// Endpoint para eliminar una red
router.delete('/:id',
    param('id').isMongoId().withMessage('ID de red no válido'),
    handleInputErrors,
    NetworkController.deleteNetwork
);

export default router;