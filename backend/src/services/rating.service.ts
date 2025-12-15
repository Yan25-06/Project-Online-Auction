import { ratingModel } from '../models/rating.model.js';

export const RatingService = {
  upsert: async (orderId: string, ratingUserId: string, ratedUserId: string, score: 'positive' | 'negative', feedback?: string) => {
    return await ratingModel.upsert(orderId, ratingUserId, ratedUserId, score, feedback);
  },

  findByUser: async (userId: string, page: number = 1, limit: number = 20) => {
    return await ratingModel.findByUser(userId, page, limit);
  },

  findByOrderAndRater: async (orderId: string, ratingUserId: string) => {
    return await ratingModel.findByOrderAndRater(orderId, ratingUserId);
  }
};
