import { Router } from "express";
import { TagController } from "../controlles/TagController.js";
import { body, param, query } from "express-validator";
import { handleInputErrors } from "../middlewares/validation.js";

const router: Router = Router();

router.post('/',
    body('name').notEmpty().withMessage('El nombre del tag es requerido'),
    body('color').optional().isHexColor().withMessage('El color debe ser un color hexadecimal'),
    body('description').optional().isString().withMessage('La descripción debe ser una cadena de texto'),
    body('projectId').notEmpty().isMongoId().withMessage('El ID del proyecto es inválido'),
    handleInputErrors,
    TagController.createTag);

router.get('/',
    query('projectId', 'El ID del proyecto es inválido').isMongoId(),
    query('categoryId', 'El ID de la categoría es inválido').optional().isMongoId(),
    query('search', 'El término de búsqueda debe ser una cadena de texto').optional().isString(),
    handleInputErrors,
    TagController.getTagsByProjectId);

router.get('/:tagId',
    param('tagId').isMongoId().withMessage('El ID del tag es inválido'),
    handleInputErrors,
    TagController.getTagById);

router.put('/:tagId',
    param('tagId').isMongoId().withMessage('El ID del tag es inválido'),
    body('name').optional().isString().withMessage('El nombre debe ser una cadena de texto'),
    body('color').optional().isHexColor().withMessage('El color debe ser un color hexadecimal'),
    body('description').optional().isString().withMessage('La descripción debe ser una cadena de texto'),
    body('categoryId').optional().isMongoId().withMessage('El ID de la categoría es inválido'),
    handleInputErrors,
    TagController.updateTag);

router.delete('/:tagId',
    param('tagId').isMongoId().withMessage('El ID del tag es inválido'),
    query('force').optional().isBoolean().withMessage('El parámetro force debe ser un booleano'),
    handleInputErrors,
    TagController.deleteTag);

export default router;