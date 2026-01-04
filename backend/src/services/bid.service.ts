import { bidModel } from '../models/bid.model.js';
import { productModel } from '../models/product.model.js';
import { userModel } from '../models/user.model.js';
import { EmailService } from './email.service.js';

export const BidService = {
  create: async (bidData: any) => {
    const { product_id, bidder_id, bid_amount } = bidData;

    // Check if bidder is blocked
    const isBlocked = await bidModel.isBidderBlocked(product_id, bidder_id);
    if (isBlocked) {
      try {
        const bidder = await userModel.findById(bidder_id);
        const productForEmail = await productModel.findById(product_id);
        if (bidder && bidder.email) {
          const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
          const productUrl = frontendUrl ? `${frontendUrl}/products/${productForEmail?.id}` : '';
          const subject = `You are blocked from bidding on "${productForEmail?.name || 'this product'}"`;
          const html = `<p>Hi ${bidder.full_name || 'there'},</p><p>You are blocked from placing bids on <a href="${productUrl}">${productForEmail?.name || 'this product'}</a>. If you think this is a mistake, please contact support.</p>`;
          await EmailService.sendMail(bidder.email, subject, html);
        }
      } catch (e) {
        console.warn('Failed to send blocked notification email:', e);
      }

      throw new Error('Bidder is blocked for this product');
    }

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

    const allowUnrated = product.allow_unrated_bidders !== false;
    // Check bidder rating / permission to bid
    const canBid = await userModel.canBid(bidder_id, allowUnrated);
    if (!canBid) {
      try {
        const bidder = await userModel.findById(bidder_id);
        if (bidder && bidder.email) {
          const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
          const productUrl = frontendUrl ? `${frontendUrl}/products/${product.id}` : '';
          const subject = `Bid denied for "${product.name}"`;
          const html = `<p>Hi ${bidder.full_name || 'there'},</p><p>Your attempt to place a bid of <strong>${bid_amount}</strong> on <a href="${productUrl}">${product.name}</a> was denied because your account's rating is too low to place bids. If you believe this is an error, please contact support.</p>`;
          await EmailService.sendMail(bidder.email, subject, html);
        }
      } catch (e) {
        console.warn('Failed to send bid denial email:', e);
      }

      throw new Error('Your rating is too low to place bids');
    }
    
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

    // Send email notifications (bidder confirmation, previous highest bidder outbid, seller notification)
    try {
      // Fetch involved users
      const bidder = await userModel.findById(bidder_id);
      const seller = product.seller || (product.seller_id ? await userModel.findById(product.seller_id) : null);
      const previousHighest = highest; // fetched before creating the new bid
      const previousBidder = previousHighest?.bidder_id ? await userModel.findById(previousHighest.bidder_id) : null;

      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
      const productUrl = frontendUrl ? `${frontendUrl}/products/${product.id}` : ''; 

      const mailPromises: Promise<any>[] = [];

      // Bidder confirmation
      if (bidder && bidder.email) {
        const subject = `Your bid for "${product.name}" is placed`;
        const html = `<p>Hi ${bidder.full_name || 'there'},</p>
          <p>Your bid of <strong>${bid_amount}</strong> for <a href="${productUrl}">${product.name}</a> has been placed successfully.</p>`;
        mailPromises.push(EmailService.sendMail(bidder.email, subject, html));
      }

      // Notify previous highest bidder if they exist and are different from the new bidder
      if (previousBidder && previousBidder.email && previousBidder.id !== bidder_id) {
        const subject = `You were outbid on "${product.name}"`;
        const html = `<p>Hi ${previousBidder.full_name || 'there'},</p>
          <p>Your previous bid of <strong>${previousHighest?.bid_amount || ''}</strong> has been outbid by ${bidder?.full_name || 'another bidder'} with <strong>${bid_amount}</strong> on <a href="${productUrl}">${product.name}</a>.</p>`;
        mailPromises.push(EmailService.sendMail(previousBidder.email, subject, html));
      }

      // Notify seller
      if (seller && seller.email) {
        const subject = `New bid on your product "${product.name}"`;
        const html = `<p>Hi ${seller.full_name || 'there'},</p>
          <p>Your product <a href="${productUrl}">${product.name}</a> received a new bid of <strong>${bid_amount}</strong> by ${bidder?.full_name || 'a bidder'}.</p>`;
        mailPromises.push(EmailService.sendMail(seller.email, subject, html));
      }

      // Send in parallel but don't fail bid creation if email fails
      await Promise.allSettled(mailPromises);
    } catch (e) {
      console.warn('Failed to send bid notification emails:', e);
    }

    return bid;
  },

  findByProduct: async (productId: string) => {
    return await bidModel.findByProduct(productId);
  },

  getHistory: async (productId: string, isSeller: boolean = false) => {
    const data = await bidModel.getBidHistory(productId);

    // Filter out rejected bids for non-sellers
    const filteredData = isSeller ? data : data.filter(bid => !bid.is_rejected);

    // Mask bidder names for non-sellers, show full name for sellers
    return filteredData.map(bid => {
      // Handle both object and array format from Supabase
      const fullName = Array.isArray(bid.bidder) 
        ? bid.bidder[0]?.full_name 
        : bid.bidder?.full_name;

      return {
        ...bid,
        bidder_name: fullName
          ? isSeller
            ? fullName
            : `****${fullName.slice(-4)}`
          : '****'
      };
    });
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
