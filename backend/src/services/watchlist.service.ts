import { watchlistModel } from '../models/watchlist.model.js';

export const WatchlistService = {
  add: async (userId: string, productId: string) => {
    return await watchlistModel.add(userId, productId);
  },

  remove: async (userId: string, productId: string) => {
    return await watchlistModel.remove(userId, productId);
  },

  isInWatchlist: async (userId: string, productId: string) => {
    return await watchlistModel.isInWatchlist(userId, productId);
  },

  findByUser: async (userId: string, page: number = 1, limit: number = 20) => {
    return await watchlistModel.findByUser(userId, page, limit);
  }
};
