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

  getHighestBid: async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId as string;
      const bid = await BidService.getHighestBid(productId);
      if (!bid) return res.status(404).json({ error: 'No bids found' });
      return res.status(200).json(bid);
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
