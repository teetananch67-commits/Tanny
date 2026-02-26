import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = Router();

router.get('/settings', getSettings);
router.put('/merchant/settings', requireAuth, requireRole('MERCHANT_ADMIN'), updateSettings);

export default router;