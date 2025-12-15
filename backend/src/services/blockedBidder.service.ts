import { blockedBidderModel } from '../models/blocked-bidder.model.js';

export const BlockedBidderService = {
  block: async (productId: string, bidderId: string, sellerId: string, reason?: string) => {
    return await blockedBidderModel.block(productId, bidderId, sellerId, reason);
  },

  unblock: async (productId: string, bidderId: string) => {
    return await blockedBidderModel.unblock(productId, bidderId);
  },

  isBlocked: async (productId: string, bidderId: string) => {
    return await blockedBidderModel.isBlocked(productId, bidderId);
  },

  findByProduct: async (productId: string) => {
    return await blockedBidderModel.findByProduct(productId);
  }
};
