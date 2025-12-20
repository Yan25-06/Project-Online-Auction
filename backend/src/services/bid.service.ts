import { bidModel } from '../models/bid.model.js';
import { productModel } from '../models/product.model.js';
import { userModel } from '../models/user.model.js';

export const BidService = {
  create: async (bidData: any) => {
    const { product_id, bidder_id, bid_amount } = bidData;

    // Check if bidder is blocked
    const isBlocked = await bidModel.isBidderBlocked(product_id, bidder_id);
    if (isBlocked) throw new Error('Bidder is blocked for this product');

    // Check product exists and auction active
    const product = await productModel.findById(product_id);
    if (!product) throw new Error('Product not found');
    if (product.status !== 'active' || new Date(product.ends_at) <= new Date()) {
      throw new Error('Auction is not active');
    }

    // Prevent seller from bidding on their own product
    const sellerId = product.seller_id || (product.seller && product.seller.id);
    if (sellerId && sellerId === bidder_id) {
      throw new Error('Sellers cannot bid on their own product');
    }

    // Check bidder rating / permission to bid
    const canBid = await userModel.canBid(bidder_id);
    if (!canBid) throw new Error('Your rating is too low to place bids');

    // Check bid step/increment and amount greater than current price
    const highest = await bidModel.getHighestBid(product_id);
    const currentPrice = product.current_price || 0;
    const increment = product.bid_increment || 0;
    const minRequired = (highest && highest.bid_amount) ? (highest.bid_amount + increment) : (currentPrice + increment);

    if (bid_amount < minRequired) {
      throw new Error(`Bid must be at least ${minRequired}`);
    }

    // Create bid
    const bid = await bidModel.create(bidData);

    // Update product price and bid count
    await productModel.updatePriceAndBidCount(product_id, bid_amount);

    // Auto-extend auction if bid placed within the final 5 minutes -> add 10 minutes
    try {
      const now = new Date();
      const endsAt = new Date(product.ends_at);
      const thresholdMinutes = 5; // fixed 5 minutes threshold
      const extensionMinutes = 10; // fixed 10 minutes extension

      const timeLeftMs = endsAt.getTime() - now.getTime();
      if (timeLeftMs <= thresholdMinutes * 60 * 1000) {
        const newEndsAt = new Date(endsAt.getTime() + extensionMinutes * 60 * 1000);
        await productModel.updateEndsAt(product_id, newEndsAt);
      }
    } catch (e) {
      // don't block bid creation if extension fails; log or ignore
      console.warn('Failed to auto-extend auction:', e);
    }

    return bid;
  },

  findByProduct: async (productId: string) => {
    return await bidModel.findByProduct(productId);
  },

  getHistory: async (productId: string) => {
    return await bidModel.getBidHistory(productId);
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
