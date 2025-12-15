import type { Request, Response } from 'express';
import { RatingService } from '../services/rating.service.js';

export const RatingController = {
  upsert: async (req: Request, res: Response) => {
    try {
      const { orderId, ratingUserId, ratedUserId, score, feedback } = req.body;
      const data = await RatingService.upsert(orderId, ratingUserId, ratedUserId, score, feedback);
      return res.status(201).json(data);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  findByUser: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const data = await RatingService.findByUser(userId, page, limit);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  findByOrderAndRater: async (req: Request, res: Response) => {
    try {
      const orderId = req.params.orderId as string;
      const ratingUserId = req.params.ratingUserId as string;
      const data = await RatingService.findByOrderAndRater(orderId, ratingUserId);
      if (!data) return res.status(404).json({ error: 'Rating not found' });
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
