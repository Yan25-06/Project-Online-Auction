import type { Request, Response } from "express";
import { ProductService } from "../services/product.service.js";
import { uploadToStorage } from "../services/storage.service.js";


export const ProductController = {
    getAll: async (req: Request, res: Response) => {
        const { 
            sort = null,
            order = null,
            limit = '5',
        } = req.query
        const limitNum = Number(limit) || 5;
        try {
            const products = await ProductService.getAll(sort as string, order as string, limitNum);
            return res.status(200).json(products);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    },

    getById: async (req: Request, res: Response) => {
        const id = req.params.id as string;
        try {
            const product = await ProductService.getById(id);
            if (!product) return res.status(404).json({ error: 'Product not found' });
            return res.status(200).json(product);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }
,

    search: async (req: Request, res: Response) => {
        try {
            const { q = '', categoryId, sortBy, page = '1', limit = '20' } = req.query;
            const pageNum = Number(page) || 1;
            const limitNum = Number(limit) || 20;
            const result = await ProductService.search(q as string, categoryId as string | undefined, sortBy as string | undefined, pageNum, limitNum);
            return res.status(200).json(result);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    },

    endingSoon: async (req: Request, res: Response) => {
        try {
            const limit = Number(req.query.limit) || 5;
            const data = await ProductService.getEndingSoon(limit);
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    },

    mostBids: async (req: Request, res: Response) => {
        try {
            const limit = Number(req.query.limit) || 5;
            const data = await ProductService.getMostBids(limit);
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    },

    highestPrice: async (req: Request, res: Response) => {
        try {
            const limit = Number(req.query.limit) || 5;
            const data = await ProductService.getHighestPrice(limit);
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    },

    findBySeller: async (req: Request, res: Response) => {
        try {
            const sellerId = req.params.sellerId as string;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const data = await ProductService.findBySeller(sellerId, page, limit);
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    },

    create: async (req: Request, res: Response) => {
        console.log("File nhận được:", (req as any).file); 
        console.log("Body nhận được:", req.body);
        try {
            const file = (req as any).file; 
            const imageUrl = await uploadToStorage(file);
            const productData = { 
                ...req.body,
                main_image_url: imageUrl,
            }
            const created = await ProductService.create(productData);
            return res.status(201).json(created);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    },

    appendDescription: async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const { description } = req.body;
            console.log('Append description request:', { id, body: req.body, user: (req as any).user });
            if (!description || typeof description !== 'string') return res.status(400).json({ error: 'description is required' });
            await ProductService.appendDescription(id, description);
            return res.status(204).send();
        } catch (err: any) {
            console.error('Append description error:', err);
            return res.status(400).json({ error: err.message });
        }
    },

    updateStatus: async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const { status } = req.body;
            if (!status) return res.status(400).json({ error: 'status is required' });
            const updated = await ProductService.updateStatus(id, status as 'active' | 'ended' | 'sold' | 'cancelled');
            return res.status(200).json(updated);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    },

    updatePrice: async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const { newPrice } = req.body;
            if (newPrice === undefined) return res.status(400).json({ error: 'newPrice is required' });
            
            // Check authorization: must be admin or the seller of this product
            const product = await ProductService.getById(id);
            if (!product) return res.status(404).json({ error: 'Product not found' });
            
            const sellerId = product.seller_id || (product.seller && product.seller.id);
            const isAdmin = req.user?.role === 'admin';
            const isSeller = req.user?.id === sellerId;
            
            if (!isAdmin && !isSeller) {
                return res.status(403).json({ error: 'You do not have permission to update this product price' });
            }
            
            const updated = await ProductService.updatePriceAndBidCount(id, Number(newPrice));
            return res.status(200).json(updated);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    },

    incrementView: async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            await ProductService.incrementViewCount(id);
            return res.status(204).send();
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            await ProductService.delete(id);
            return res.status(204).send();
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    }
}