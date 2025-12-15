import type { Request, Response } from 'express';
import { BlockedBidderService } from '../services/blockedBidder.service.js';

export const BlockedBidderController = {
  block: async (req: Request, res: Response) => {
    try {
      const { productId, bidderId, sellerId, reason } = req.body;
      const data = await BlockedBidderService.block(productId, bidderId, sellerId, reason);
      return res.status(201).json(data);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  unblock: async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId as string;
      const bidderId = req.params.bidderId as string;
      await BlockedBidderService.unblock(productId, bidderId);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  isBlocked: async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId as string;
      const bidderId = req.params.bidderId as string;
      const blocked = await BlockedBidderService.isBlocked(productId, bidderId);
      return res.status(200).json({ blocked });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  findByProduct: async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId as string;
      const data = await BlockedBidderService.findByProduct(productId);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
