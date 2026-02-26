import { Request, Response } from 'express';
import prisma from '../prisma.js';

export async function getSettings(_req: Request, res: Response) {
  const settings = await prisma.restaurantSettings.findUnique({ where: { id: 1 } });
  return res.json(settings || null);
}

export async function updateSettings(req: Request, res: Response) {
  const { deliveryFee, openHours, qrImageUrl, acceptCash } = req.body || {};
  const normalizedQr = qrImageUrl === '' ? null : qrImageUrl;

  const updated = await prisma.restaurantSettings.upsert({
    where: { id: 1 },
    update: {
      deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : undefined,
      openHours: openHours !== undefined ? String(openHours) : undefined,
      qrImageUrl: qrImageUrl !== undefined ? normalizedQr : undefined,
      acceptCash: acceptCash !== undefined ? Boolean(acceptCash) : undefined
    },
    create: {
      id: 1,
      deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : 0,
      openHours: openHours || '09:00 - 21:00',
      qrImageUrl: normalizedQr || null,
      acceptCash: acceptCash !== undefined ? Boolean(acceptCash) : true
    }
  });

  return res.json(updated);
}
