import express from 'express';
import { saveWhatsAppConfig, getWhatsAppConfig, deleteWhatsAppConfig } from '../controllers/whatsAppController.js';
import { verifyToken } from "./flowRoutes.js"

const router = express.Router();

// Save or update WhatsApp configuration
router.post('/config', verifyToken, saveWhatsAppConfig);

// Get WhatsApp configuration
router.get('/config', verifyToken, getWhatsAppConfig);

// Delete WhatsApp configuration
router.delete('/config', verifyToken, deleteWhatsAppConfig);

export default router; 