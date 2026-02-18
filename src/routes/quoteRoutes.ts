import { Router } from 'express';
import { QuoteController } from '../controllers/QuoteController.js';
import { body, param } from 'express-validator';
import { handleInputErrors } from '../middlewares/validation.js';

const router: Router = Router();

router.post('/',
    body('documentId').isMongoId().withMessage('ID de documento no válido'),
    body('plainStart').isInt({ min: 0 }).withMessage('plainStart debe ser un número positivo'),
    body('plainEnd').isInt({ min: 0 }).withMessage('plainEnd debe ser un número positivo'),
    body('selectedText').notEmpty().withMessage('El texto seleccionado es requerido'),
    body('color').isHexColor().withMessage('El color debe ser un formato hexadecimal válido'),
    body('tags').isArray().withMessage('Tags debe ser un arreglo de IDs'),
    handleInputErrors,
    QuoteController.createQuote
);

router.get('/document/:documentId',
    param('documentId').isMongoId().withMessage('ID de documento no válido'),
    handleInputErrors,
    QuoteController.getQuotesByDocument
);

export default router;