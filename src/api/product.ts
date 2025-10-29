import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { validateProductInput } from '../models/productValidation';
import { Product } from '../models/productTypes';

const prisma = new PrismaClient();
const productApi = new Hono();

productApi.post('/products', async (c) => {
  const data = await c.req.json();
  const errors = validateProductInput(data);
  if (errors.length > 0) {
    return c.json({ errors }, 400);
  }
  // 檢查名稱唯一
  const exists = await prisma.product.findUnique({ where: { name: data.name } });
  if (exists) {
    return c.json({ errors: ['商品名稱已存在'] }, 400);
  }
  const created = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
    },
  });
  return c.json(created, 201);
});

export default productApi;

// 查詢商品列表（支援排序/篩選）
productApi.get('/products', async (c) => {
  const { name, minPrice, maxPrice, sortBy, order } = c.req.query();
  const where: any = {};
  if (name) where.name = { contains: name };
  if (minPrice) where.price = { ...where.price, gte: Number(minPrice) };
  if (maxPrice) where.price = { ...where.price, lte: Number(maxPrice) };
  const sortField = sortBy || 'createdAt';
  const sortOrder = order === 'asc' ? 'asc' : 'desc';
  const products = await prisma.product.findMany({
    where,
    orderBy: { [sortField]: sortOrder },
  });
  return c.json(products);
});

// 編輯商品
productApi.put('/products/:id', async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  const errors = validateProductInput(data);
  if (errors.length > 0) {
    return c.json({ errors }, 400);
  }
  // 檢查名稱唯一（排除自己）
  const exists = await prisma.product.findFirst({ where: { name: data.name, NOT: { id } } });
  if (exists) {
    return c.json({ errors: ['商品名稱已存在'] }, 400);
  }
  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
    },
  });
  return c.json(updated);
});

// 刪除商品
productApi.delete('/products/:id', async (c) => {
  const id = c.req.param('id');
  await prisma.product.delete({ where: { id } });
  return c.json({ success: true });
});
