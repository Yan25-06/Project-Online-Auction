import type { Request, Response } from 'express';
import { WatchlistService } from '../services/watchlist.service.js';

export const WatchlistController = {
  add: async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId as string;
      const userId = req.user.id;
      const added = await WatchlistService.add(userId, productId);
      return res.status(201).json(added);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const productId = req.params.productId as string;
      await WatchlistService.remove(userId, productId);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  isInWatchlist: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;
      const productId = req.params.productId as string;
      const present = await WatchlistService.isInWatchlist(userId, productId);
      return res.status(200).json({ inWatchlist: present });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  findByUser: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const data = await WatchlistService.findByUser(userId, page, limit);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
