import { Router } from 'express'
import multer from 'multer'
import { body, param, query } from 'express-validator'
import { handleInputErrors } from '../middlewares/validation.js'
import { DocumentController } from '../controllers/DocumentControlle.js'

const router: Router = Router()
const upload = multer({ storage: multer.memoryStorage() })

/** POST /api/documents/upload
 * Sube un archivo y lo convierte a Markdown
 */
router.post('/upload', 
    upload.single('file'), 
    body('projectId').isMongoId().withMessage('ID de proyecto no válido'),
    handleInputErrors,
    DocumentController.uploadDocument
)

/** GET /api/documents
 *Obtiene lista de documentos con paginación
 */
router.get('/',
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1 }),
    handleInputErrors,
    DocumentController.getAllDocuments
)

/** GET /api/documents/:id
 * Detalle de un documento (incluye el contenido Markdown)
 */
router.get('/:id',
    param('id').isMongoId().withMessage('ID de documento no válido'),
    handleInputErrors,
    DocumentController.getDocumentById
)

/** PATCH /api/documents/:id/summary
 * Actualiza el resumen generado por la IA en el frontend
 */
router.patch('/:id/summary',
    param('id').isMongoId().withMessage('ID de documento no válido'),
    body('summary').notEmpty().withMessage('El resumen no puede estar vacío'),
    handleInputErrors,
    DocumentController.updateDocumentSummary
)

/** GET /api/documents/:id/integrity
 * Verifica el hash del documento
 */
router.get('/:id/integrity',
    param('id').isMongoId().withMessage('ID de documento no válido'),
    handleInputErrors,
    DocumentController.checkIntegrity
)

router.delete('/:id', param('id').isMongoId(), handleInputErrors, DocumentController.deleteDocument);

export default router;