import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, organic, sort } = req.query;

    const where: any = {};

    if (category && category !== 'all') {
      where.category = String(category);
    }

    if (organic === 'true') {
      where.isOrganic = true;
    }

    if (search) {
      const q = String(search);
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
    });

    const formatted = products.map((p) => ({
      ...p,
      _id: p.id,
      discount: p.originalPrice && p.originalPrice > p.price
        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
        : 0,
    }));

    return res.json({ success: true, products: formatted, count: formatted.length });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFlashDeals = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        originalPrice: {
          gt: 0,
        },
      },
      orderBy: { rating: 'desc' },
    });

    const deals = products
      .filter((p) => (p.originalPrice || 0) > p.price)
      .map((p) => ({
        ...p,
        _id: p.id,
        discount: Math.round((((p.originalPrice || 0) - p.price) / (p.originalPrice || 1)) * 100),
      }));

    return res.json({ success: true, products: deals, count: deals.length });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({
      success: true,
      product: {
        ...product,
        _id: product.id,
        discount: product.originalPrice && product.originalPrice > product.price
          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
          : 0,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, originalPrice, image, category, unit, stock, isOrganic } = req.body;

    if (!name || price === undefined || !image || !category) {
      return res.status(400).json({ success: false, message: 'Missing required product fields' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : 0,
        image,
        category,
        unit: unit || 'piece',
        stock: stock ? parseInt(stock, 10) : 0,
        isOrganic: Boolean(isOrganic),
        rating: 4.5,
        reviewCount: 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: { ...product, _id: product.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, originalPrice, image, category, unit, stock, isOrganic } = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: parseFloat(originalPrice) }),
        ...(image && { image }),
        ...(category && { category }),
        ...(unit && { unit }),
        ...(stock !== undefined && { stock: parseInt(stock, 10) }),
        ...(isOrganic !== undefined && { isOrganic: Boolean(isOrganic) }),
      },
    });

    return res.json({
      success: true,
      message: 'Product updated successfully',
      product: { ...updated, _id: updated.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
