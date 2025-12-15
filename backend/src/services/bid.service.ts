import { bidModel } from '../models/bid.model.js';
import { productModel } from '../models/product.model.js';

export const BidService = {
  create: async (bidData: any) => {
    const { product_id, bidder_id, bid_amount } = bidData;

    // Check if bidder is blocked
    const isBlocked = await bidModel.isBidderBlocked(product_id, bidder_id);
    if (isBlocked) throw new Error('Bidder is blocked for this product');

    // Check against current highest bid
    const highest = await bidModel.getHighestBid(product_id);
    if (highest && bid_amount <= highest.bid_amount) {
      throw new Error('Bid must be higher than current highest bid');
    }

    // Create bid
    const bid = await bidModel.create(bidData);

    // Update product price and bid count
    await productModel.updatePriceAndBidCount(product_id, bid_amount);

    return bid;
  },

  findByProduct: async (productId: string) => {
    return await bidModel.findByProduct(productId);
  },

  getHighestBid: async (productId: string) => {
    return await bidModel.getHighestBid(productId);
  },

  findByBidder: async (bidderId: string, page: number = 1, limit: number = 20) => {
    return await bidModel.findByBidder(bidderId, page, limit);
  },

  getWinningBids: async (bidderId: string) => {
    return await bidModel.getWinningBids(bidderId);
  },

  reject: async (id: string) => {
    return await bidModel.reject(id);
  }
};
