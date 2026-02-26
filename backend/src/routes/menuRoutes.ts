import { Router } from 'express';
import {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  getMenu,
  getRecommended,
  listCategories,
  updateCategory,
  updateMenuItem
} from '../controllers/menuController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/menu', getMenu);
router.get('/menu/recommended', getRecommended);
router.get('/categories', listCategories);

router.post('/merchant/menu', requireAuth, requireRole('MERCHANT_ADMIN'), createMenuItem);
router.put('/merchant/menu/:id', requireAuth, requireRole('MERCHANT_ADMIN'), updateMenuItem);
router.delete('/merchant/menu/:id', requireAuth, requireRole('MERCHANT_ADMIN'), deleteMenuItem);

router.post('/merchant/categories', requireAuth, requireRole('MERCHANT_ADMIN'), createCategory);
router.put('/merchant/categories/:id', requireAuth, requireRole('MERCHANT_ADMIN'), updateCategory);
router.delete('/merchant/categories/:id', requireAuth, requireRole('MERCHANT_ADMIN'), deleteCategory);

export default router;
