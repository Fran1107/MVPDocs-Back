import { Router } from "express";
import { ChatController } from "../controllers/ChatController.js";
import { body, query } from "express-validator";
import { ChatRole } from "../models/ChatMessage.js";
import { handleInputErrors } from "../middlewares/validation.js";

const router: Router = Router();

router.post('/messages',
    body('projectId').isString().notEmpty().withMessage('Project ID is required'),
    body('quoteId').isString().optional().withMessage('Quote ID is required'),
    body('documentId').isString().optional().withMessage('Document ID is required'),
    body('content').isString().notEmpty().withMessage('Content is required'),
    body('role').isString().isIn(Object.values(ChatRole)).withMessage('Invalid role'),
    handleInputErrors,
    ChatController.sendMessage);
router.get('/messages',
    query('projectId').isString().notEmpty().withMessage('Project ID is required'),
    query('quoteId').isString().optional().withMessage('Quote ID is required'),
    query('limit').isInt().optional().withMessage('Limit must be an integer'),
    handleInputErrors,
    ChatController.getMessages);
router.delete('/messages',
    query('projectId').isString().notEmpty().withMessage('Project ID is required'),
    query('quoteId').isString().optional().withMessage('Quote ID is required'),
    handleInputErrors,
    ChatController.deleteMessages);

export default router;