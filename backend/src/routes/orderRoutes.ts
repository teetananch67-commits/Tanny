import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createOrder,
  createPayment,
  getOrderDetail,
  listOrders,
  cancelOrder,
  merchantCancel,
  merchantConfirm,
  merchantDashboard,
  merchantGetOrder,
  merchantListOrders,
  merchantReject,
  merchantUpdateStatus,
  reorder
} from '../controllers/orderController.js';

const router = Router();

router.post('/orders', requireAuth, createOrder);
router.post('/payments', requireAuth, createPayment);
router.get('/orders', requireAuth, listOrders);
router.get('/orders/:id', requireAuth, getOrderDetail);
router.post('/orders/:id/reorder', requireAuth, reorder);
router.post('/orders/:id/cancel', requireAuth, cancelOrder);

router.get('/merchant/orders', requireAuth, requireRole('MERCHANT_ADMIN'), merchantListOrders);
router.get('/merchant/orders/:id', requireAuth, requireRole('MERCHANT_ADMIN'), merchantGetOrder);
router.post('/merchant/orders/:id/confirm', requireAuth, requireRole('MERCHANT_ADMIN'), merchantConfirm);
router.post('/merchant/orders/:id/reject', requireAuth, requireRole('MERCHANT_ADMIN'), merchantReject);
router.post('/merchant/orders/:id/status', requireAuth, requireRole('MERCHANT_ADMIN'), merchantUpdateStatus);
router.post('/merchant/orders/:id/cancel', requireAuth, requireRole('MERCHANT_ADMIN'), merchantCancel);
router.get('/merchant/dashboard', requireAuth, requireRole('MERCHANT_ADMIN'), merchantDashboard);

export default router;
