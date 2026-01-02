import type { Request, Response } from 'express';
import { BidService } from '../services/bid.service.js';

export const BidController = {
  create: async (req: Request, res: Response) => {
    try {
      const bidData = req.body;
      const bid = await BidService.create(bidData);
      return res.status(201).json(bid);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  findByProduct: async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId as string;
      const data = await BidService.findByProduct(productId);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Get bid history for product (masked or full based on user role)
  getHistory: async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId as string;
      
      // Check if user is the seller of this product
      let isSeller = false;
      if (req.user) {
        try {
          const { ProductService } = await import('../services/product.service.js');
          const product = await ProductService.getById(productId);
          const sellerId = product.seller_id || (product.seller && product.seller.id);
          isSeller = req.user.id === sellerId;
        } catch (e) {
          isSeller = false;
        }
      }
      
      const data = await BidService.getHistory(productId, isSeller);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getHighestBid: async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId as string;
      const bid = await BidService.getHighestBid(productId);
      return res.status(200).json(bid || null);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  findByBidder: async (req: Request, res: Response) => {
    try {
      const bidderId = req.params.bidderId as string;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const data = await BidService.findByBidder(bidderId, page, limit);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getWinningBids: async (req: Request, res: Response) => {
    try {
      const bidderId = req.params.bidderId as string;
      const data = await BidService.getWinningBids(bidderId);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  reject: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const data = await BidService.reject(id);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
};
