import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export async function listAddresses(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
  });
  return res.json(addresses);
}

export async function createAddress(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { label, recipientName, phone, line1, note, isDefault } = req.body || {};
  if (!label || !recipientName || !line1) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const created = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    return tx.address.create({
      data: {
        userId,
        label,
        recipientName,
        phone: phone || null,
        line1,
        note: note || null,
        isDefault: Boolean(isDefault)
      }
    });
  });

  return res.json(created);
}

export async function updateAddress(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const id = Number(req.params.id);
  const { label, recipientName, phone, line1, note, isDefault } = req.body || {};

  const address = await prisma.address.findUnique({ where: { id } });
  if (!address) return res.status(404).json({ message: 'Address not found' });
  if (address.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

  const updated = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    return tx.address.update({
      where: { id },
      data: {
        label,
        recipientName,
        phone,
        line1,
        note,
        isDefault: isDefault === undefined ? undefined : Boolean(isDefault)
      }
    });
  });

  return res.json(updated);
}

export async function deleteAddress(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const id = Number(req.params.id);
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address) return res.status(404).json({ message: 'Address not found' });
  if (address.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id } });

    if (address.isDefault) {
      const next = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      if (next) {
        await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }
  });

  return res.json({ ok: true });
}

export async function setDefaultAddress(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const id = Number(req.params.id);
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address) return res.status(404).json({ message: 'Address not found' });
  if (address.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

  const updated = await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.update({ where: { id }, data: { isDefault: true } });
  });

  return res.json(updated);
}