import { Request, Response } from 'express';
import prisma from '../prisma.js';

export async function getMenu(req: Request, res: Response) {
  const items = await prisma.menuItem.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: 'desc' }
  });
  const categories = await prisma.menuCategory.findMany();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const normalized = items.map((item) => ({
    ...item,
    category: categoryMap.get(item.categoryId) || { id: 0, name: 'ไม่มีหมวดหมู่' }
  }));
  return res.json(normalized);
}

export async function getRecommended(req: Request, res: Response) {
  const items = await prisma.menuItem.findMany({
    where: { isAvailable: true, isRecommended: true },
    orderBy: { createdAt: 'desc' }
  });
  const categories = await prisma.menuCategory.findMany();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const normalized = items.map((item) => ({
    ...item,
    category: categoryMap.get(item.categoryId) || { id: 0, name: 'ไม่มีหมวดหมู่' }
  }));
  return res.json(normalized);
}

export async function createMenuItem(req: Request, res: Response) {
  const { categoryId, name, description, price, imageUrl, isAvailable, isRecommended } = req.body || {};
  if (!categoryId || !name || price === undefined || !imageUrl) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const item = await prisma.menuItem.create({
    data: {
      categoryId: Number(categoryId),
      name,
      description: description || null,
      price: Number(price),
      imageUrl,
      isAvailable: isAvailable !== false,
      isRecommended: Boolean(isRecommended)
    }
  });
  return res.json(item);
}

export async function updateMenuItem(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { categoryId, name, description, price, imageUrl, isAvailable, isRecommended } = req.body || {};

  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      categoryId: categoryId ? Number(categoryId) : undefined,
      name,
      description,
      price: price !== undefined ? Number(price) : undefined,
      imageUrl,
      isAvailable,
      isRecommended
    }
  });
  return res.json(item);
}

export async function deleteMenuItem(req: Request, res: Response) {
  const id = Number(req.params.id);
  await prisma.menuItem.delete({ where: { id } });
  return res.json({ ok: true });
}

export async function createCategory(req: Request, res: Response) {
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ message: 'Missing name' });
  }
  const category = await prisma.menuCategory.create({ data: { name } });
  return res.json(category);
}

export async function updateCategory(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ message: 'Missing name' });
  }
  const category = await prisma.menuCategory.update({ where: { id }, data: { name } });
  return res.json(category);
}

export async function deleteCategory(req: Request, res: Response) {
  const id = Number(req.params.id);
  const count = await prisma.menuItem.count({ where: { categoryId: id } });
  if (count > 0) {
    return res.status(400).json({ message: 'ลบไม่ได้ เพราะยังมีเมนูในหมวดหมู่นี้' });
  }
  await prisma.menuCategory.delete({ where: { id } });
  return res.json({ ok: true });
}

export async function listCategories(req: Request, res: Response) {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return res.json(categories);
}
