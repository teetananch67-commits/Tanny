import { Request, Response } from 'express';
import prisma from '../prisma.js';

export async function listPromotions(_req: Request, res: Response) {
  const promos = await prisma.promotion.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
  });
  return res.json(promos);
}

export async function merchantListPromotions(_req: Request, res: Response) {
  const promos = await prisma.promotion.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
  });
  return res.json(promos);
}

export async function createPromotion(req: Request, res: Response) {
  const { title, imageUrl, isActive, sortOrder } = req.body || {};
  if (!imageUrl) return res.status(400).json({ message: 'imageUrl required' });

  const promo = await prisma.promotion.create({
    data: {
      title: title || null,
      imageUrl,
      isActive: isActive !== false,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0
    }
  });
  return res.json(promo);
}

export async function updatePromotion(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { title, imageUrl, isActive, sortOrder } = req.body || {};

  const promo = await prisma.promotion.update({
    where: { id },
    data: {
      title: title === undefined ? undefined : title,
      imageUrl: imageUrl === undefined ? undefined : imageUrl,
      isActive: isActive === undefined ? undefined : Boolean(isActive),
      sortOrder: sortOrder === undefined ? undefined : Number(sortOrder)
    }
  });
  return res.json(promo);
}

export async function deletePromotion(req: Request, res: Response) {
  const id = Number(req.params.id);
  await prisma.promotion.delete({ where: { id } });
  return res.json({ ok: true });
}