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

    // Check bidder rating: 80% threshold or unrated (if seller allows)
    const allowUnrated = product.allow_unrated_bidders !== false; // default true
    const canBid = await userModel.canBid(bidder_id, allowUnrated);
    
    if (!canBid) {
      const bidder = await userModel.findById(bidder_id);
      const totalRatings = bidder?.total_ratings || 0;
      const positiveRatings = bidder?.positive_ratings || 0;
      const ratingScore = bidder?.rating_score || 0;
      
      if (totalRatings === 0) {
        throw new Error('Người bán không cho phép bidder chưa có đánh giá tham gia đấu giá');
      } else {
        throw new Error(`Điểm đánh giá của bạn là ${positiveRatings}/${totalRatings} (${(ratingScore * 100).toFixed(1)}%). Cần tối thiểu 80% để tham gia đấu giá`);
      }
    }

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

    // Auto-extend auction if bid placed within threshold time before end
    try {
      const now = new Date();
      const endsAt = new Date(product.ends_at);
      const thresholdMinutes = product.threshold_minutes || 5; // use product's setting, default 5
      const extensionMinutes = product.auto_extend_minutes || 10; // use product's setting, default 10

      const timeLeftMs = endsAt.getTime() - now.getTime();
      if (timeLeftMs <= thresholdMinutes * 60 * 1000 && timeLeftMs > 0) {
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
