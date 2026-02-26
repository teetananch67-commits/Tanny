import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress
} from '../controllers/addressController.js';

const router = Router();

router.get('/addresses', requireAuth, listAddresses);
router.post('/addresses', requireAuth, createAddress);
router.put('/addresses/:id', requireAuth, updateAddress);
router.delete('/addresses/:id', requireAuth, deleteAddress);
router.post('/addresses/:id/default', requireAuth, setDefaultAddress);

export default router;