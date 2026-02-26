import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createPromotion,
  deletePromotion,
  listPromotions,
  merchantListPromotions,
  updatePromotion
} from '../controllers/promotionController.js';

const router = Router();

router.get('/promotions', listPromotions);

router.get('/merchant/promotions', requireAuth, requireRole('MERCHANT_ADMIN'), merchantListPromotions);
router.post('/merchant/promotions', requireAuth, requireRole('MERCHANT_ADMIN'), createPromotion);
router.put('/merchant/promotions/:id', requireAuth, requireRole('MERCHANT_ADMIN'), updatePromotion);
router.delete('/merchant/promotions/:id', requireAuth, requireRole('MERCHANT_ADMIN'), deletePromotion);

export default router;