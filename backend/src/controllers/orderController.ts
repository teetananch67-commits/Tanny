import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { canTransition } from '../utils/orderStatus.js';

function generateOrderNo() {
  const now = new Date();
  return `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function createOrder(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { items, address, addressId, deliveryFee } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items required' });
  }

  const menuIds = items.map((i: any) => Number(i.menuItemId));
  const invalidQty = items.some((i: any) => Number(i.qty || 0) <= 0);
  if (invalidQty) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuIds }, isAvailable: true }
  });

  if (menuItems.length !== items.length) {
    return res.status(400).json({ message: 'Some items are unavailable' });
  }

  let subtotal = 0;
  const orderItemsData = items.map((i: any) => {
    const menuItem = menuItems.find((m) => m.id === Number(i.menuItemId));
    const qty = Number(i.qty || 1);
    const price = menuItem ? Number(menuItem.price) : 0;
    const total = price * qty;
    subtotal += total;
    return {
      menuItemId: menuItem!.id,
      nameSnapshot: menuItem!.name,
      priceSnapshot: menuItem!.price,
      qty,
      total
    };
  });

  let addressSnapshot = address || null;
  let addressRefId: number | null = null;

  if (addressId) {
    const saved = await prisma.address.findUnique({ where: { id: Number(addressId) } });
    if (!saved || saved.userId !== userId) {
      return res.status(400).json({ message: 'Invalid address' });
    }
    addressRefId = saved.id;
    addressSnapshot = {
      label: saved.label,
      recipientName: saved.recipientName,
      phone: saved.phone,
      line1: saved.line1,
      note: saved.note
    };
  }

  const settings = await prisma.restaurantSettings.findUnique({ where: { id: 1 } });
  const delivery = deliveryFee !== undefined ? Number(deliveryFee) : Number(settings?.deliveryFee ?? 0);
  const total = subtotal + delivery;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const order = await prisma.order.create({
    data: {
      orderNo: generateOrderNo(),
      customerUserId: userId,
      status: OrderStatus.PENDING_PAYMENT,
      subtotal,
      deliveryFee: delivery,
      total,
      customerNameSnapshot: user.name,
      customerPhoneSnapshot: user.phone,
      addressSnapshot,
      addressId: addressRefId,
      items: {
        create: orderItemsData
      },
      statusLogs: {
        create: {
          status: OrderStatus.PENDING_PAYMENT,
          byRole: 'CUSTOMER',
          byUserId: userId
        }
      }
    },
    include: { items: true }
  });

  return res.json(order);
}

export async function createPayment(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { orderId, method, slipImageUrl } = req.body || {};
  if (!orderId) return res.status(400).json({ message: 'orderId required' });

  const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.customerUserId !== userId) return res.status(403).json({ message: 'Forbidden' });
  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    return res.status(400).json({ message: 'Order not pending payment' });
  }

  const paymentMethod = method || 'MOCK';
  if (!Object.values(PaymentMethod).includes(paymentMethod)) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }
  if (paymentMethod === 'CASH') {
    const settings = await prisma.restaurantSettings.findUnique({ where: { id: 1 } });
    if (settings && !settings.acceptCash) {
      return res.status(400).json({ message: 'Cash payment not accepted' });
    }
  }
  if (paymentMethod === 'QR_CODE' && !slipImageUrl) {
    return res.status(400).json({ message: 'slipImageUrl required for QR payment' });
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        method: paymentMethod,
        amount: order.total,
        status: 'SUCCESS',
        paidAt: new Date(),
        refCode: `${paymentMethod}-${Date.now()}`,
        slipImageUrl: slipImageUrl || null
      }
    });

    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PAID }
    });

    await tx.orderStatusLog.create({
      data: {
        orderId: order.id,
        status: OrderStatus.PAID,
        byRole: 'CUSTOMER',
        byUserId: userId
      }
    });

    return { payment, updatedOrder };
  });

  return res.json({
    payment: result.payment,
    order: result.updatedOrder
  });
}

export async function listOrders(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const orders = await prisma.order.findMany({
    where: { customerUserId: userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
  return res.json(orders);
}

export async function getOrderDetail(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const id = Number(req.params.id);
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      statusLogs: { orderBy: { createdAt: 'asc' } }
    }
  });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.customerUserId !== userId) return res.status(403).json({ message: 'Forbidden' });

  return res.json(order);
}

export async function reorder(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const id = Number(req.params.id);
  const prev = await prisma.order.findUnique({
    where: { id },
    include: { items: true }
  });
  if (!prev) return res.status(404).json({ message: 'Order not found' });
  if (prev.customerUserId !== userId) return res.status(403).json({ message: 'Forbidden' });

  const menuIds = prev.items.map((i) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuIds }, isAvailable: true }
  });

  if (menuItems.length !== prev.items.length) {
    return res.status(400).json({ message: 'Some items are unavailable for reorder' });
  }

  let subtotal = 0;
  const orderItemsData = prev.items.map((i) => {
    const menuItem = menuItems.find((m) => m.id === i.menuItemId);
    const price = menuItem ? Number(menuItem.price) : 0;
    const total = price * i.qty;
    subtotal += total;
    return {
      menuItemId: i.menuItemId,
      nameSnapshot: menuItem!.name,
      priceSnapshot: menuItem!.price,
      qty: i.qty,
      total
    };
  });

  const delivery = Number(prev.deliveryFee);
  const total = subtotal + delivery;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const order = await prisma.order.create({
    data: {
      orderNo: generateOrderNo(),
      customerUserId: userId,
      status: OrderStatus.PENDING_PAYMENT,
      subtotal,
      deliveryFee: delivery,
      total,
      customerNameSnapshot: user.name,
      customerPhoneSnapshot: user.phone,
      addressSnapshot: prev.addressSnapshot,
      addressId: prev.addressId,
      items: { create: orderItemsData },
      statusLogs: {
        create: {
          status: OrderStatus.PENDING_PAYMENT,
          byRole: 'CUSTOMER',
          byUserId: userId
        }
      }
    },
    include: { items: true }
  });

  return res.json(order);
}

export async function cancelOrder(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const id = Number(req.params.id);
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.customerUserId !== userId) return res.status(403).json({ message: 'Forbidden' });

  if (![OrderStatus.PENDING_PAYMENT, OrderStatus.PAID].includes(order.status)) {
    return res.status(400).json({ message: 'Order cannot be cancelled after confirmation' });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED }
    });
    await tx.orderStatusLog.create({
      data: {
        orderId: id,
        status: OrderStatus.CANCELLED,
        byRole: 'CUSTOMER',
        byUserId: userId
      }
    });
    return result;
  });

  return res.json(updated);
}

export async function merchantListOrders(req: AuthRequest, res: Response) {
  const statusParam = req.query.status as string | undefined;
  const status = statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;
  const orders = await prisma.order.findMany({
    where: status ? { status } : {},
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
  return res.json(orders);
}

export async function merchantGetOrder(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, statusLogs: { orderBy: { createdAt: 'asc' } } }
  });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  return res.json(order);
}

async function updateStatus(orderId: number, toStatus: OrderStatus, byRole: 'MERCHANT_ADMIN', byUserId: number) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('NOT_FOUND');

    if (!canTransition(order.status, toStatus)) {
      throw new Error('INVALID_TRANSITION');
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: toStatus }
    });

    await tx.orderStatusLog.create({
      data: {
        orderId,
        status: toStatus,
        byRole,
        byUserId
      }
    });

    return updated;
  });
}

export async function merchantConfirm(req: AuthRequest, res: Response) {
  const userId = req.user?.id || 0;
  const id = Number(req.params.id);
  try {
    const order = await updateStatus(id, OrderStatus.CONFIRMED, 'MERCHANT_ADMIN', userId);
    return res.json(order);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ message: 'Order not found' });
    return res.status(400).json({ message: 'Invalid status transition' });
  }
}

export async function merchantReject(req: AuthRequest, res: Response) {
  const userId = req.user?.id || 0;
  const id = Number(req.params.id);
  try {
    const order = await updateStatus(id, OrderStatus.REJECTED, 'MERCHANT_ADMIN', userId);
    return res.json(order);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ message: 'Order not found' });
    return res.status(400).json({ message: 'Invalid status transition' });
  }
}

export async function merchantUpdateStatus(req: AuthRequest, res: Response) {
  const userId = req.user?.id || 0;
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ message: 'status required' });
  if (!Object.values(OrderStatus).includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const order = await updateStatus(id, status as OrderStatus, 'MERCHANT_ADMIN', userId);
    return res.json(order);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ message: 'Order not found' });
    return res.status(400).json({ message: 'Invalid status transition' });
  }
}

export async function merchantCancel(req: AuthRequest, res: Response) {
  const userId = req.user?.id || 0;
  const id = Number(req.params.id);
  try {
    const order = await updateStatus(id, OrderStatus.CANCELLED, 'MERCHANT_ADMIN', userId);
    return res.json(order);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ message: 'Order not found' });
    return res.status(400).json({ message: 'Invalid status transition' });
  }
}

export async function merchantDashboard(req: AuthRequest, res: Response) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [dailyOrders, monthlyOrders, topItems] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfDay }, status: { not: 'PENDING_PAYMENT' } },
      _count: { id: true },
      _sum: { total: true }
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth }, status: { not: 'PENDING_PAYMENT' } },
      _count: { id: true },
      _sum: { total: true }
    }),
    prisma.orderItem.groupBy({
      by: ['nameSnapshot'],
      _sum: { qty: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: 5
    })
  ]);

  return res.json({
    daily: {
      orders: dailyOrders._count.id || 0,
      revenue: dailyOrders._sum.total || 0
    },
    monthly: {
      orders: monthlyOrders._count.id || 0,
      revenue: monthlyOrders._sum.total || 0
    },
    topItems
  });
}
