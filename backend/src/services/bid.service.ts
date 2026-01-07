import { bidModel } from '../models/bid.model.js';
import { productModel } from '../models/product.model.js';
import { userModel } from '../models/user.model.js';
import { EmailService } from './email.service.js';
import { maskName } from '../helper/maskName.js';

export const BidService = {
  create: async (bidData: any) => {
    const { product_id, bidder_id, max_bid_amount } = bidData;

    // Validate max_bid_amount
    if (!max_bid_amount || max_bid_amount <= 0) {
      throw new Error('Max bid amount is required and must be greater than 0');
    }

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
          const html = `<p>Hi ${bidder.full_name || 'there'},</p><p>Your attempt to place a bid of <strong>${max_bid_amount}</strong> on <a href="${productUrl}">${product.name}</a> was denied because your account's rating is too low to place bids. If you believe this is an error, please contact support.</p>`;
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

    // Get all active bids sorted by max_bid_amount
    const allBids = await bidModel.getAllActiveBidsSorted(product_id);
    const currentPrice = product.current_price || product.starting_price || 0;
    const increment = product.bid_increment || 0;

    console.log('[BID DEBUG] allBids count:', allBids.length);
    console.log('[BID DEBUG] allBids:', allBids.map(b => ({ id: b.id, bidder_id: b.bidder_id, max_bid_amount: b.max_bid_amount, bid_amount: b.bid_amount })));
    console.log('[BID DEBUG] current bidder_id:', bidder_id);
    console.log('[BID DEBUG] currentPrice:', currentPrice, 'increment:', increment, 'max_bid_amount:', max_bid_amount);

    // Validate max_bid_amount against current requirements
    const minRequired = currentPrice + increment;
    if (max_bid_amount < minRequired) {
      throw new Error(`Max bid amount must be at least ${minRequired}`);
    }

    // Calculate actual bid_amount based on auto-bidding logic
    let actualBidAmount = minRequired;
    let currentWinnerNeedsUpdate = false;
    let updatedWinnerBidAmount = 0;
    let currentWinnerBid = null;

    if (allBids.length > 0) {
      // Find the highest bid that's not from the current bidder
      const otherBids = allBids.filter(b => b.bidder_id !== bidder_id);
      console.log('[BID DEBUG] otherBids count:', otherBids.length);
      console.log('[BID DEBUG] otherBids:', otherBids.map(b => ({ id: b.id, bidder_id: b.bidder_id, max_bid_amount: b.max_bid_amount })));
      
      if (otherBids.length > 0 && otherBids[0]) {
        const highestOtherBid = otherBids[0];
        const highestOtherMax = highestOtherBid.max_bid_amount || highestOtherBid.bid_amount;
        
        // If current bidder's max_bid is higher than highest other bid's max
        if (max_bid_amount > highestOtherMax) {
          // Current bidder wins with bid = highest other's max + increment
          actualBidAmount = highestOtherMax + increment;
        } else if (max_bid_amount === highestOtherMax) {
          // Same max bid - current bidder loses (bid placed later)
          throw new Error(`Your max bid amount must be higher than ${highestOtherMax} to win`);
        } else {
          // Current bidder's max is lower than highest other's max
          // Highest other person wins, need to auto-raise their bid_amount
          currentWinnerBid = highestOtherBid;
          currentWinnerNeedsUpdate = true;
          updatedWinnerBidAmount = max_bid_amount + increment;
          
          // Still create the new bid for current bidder at their max
          actualBidAmount = max_bid_amount;
        }
      } else if (allBids[0]) {
        // All existing bids are from current bidder - just update with new max
        const existingBid = allBids[0];
        const existingMax = existingBid.max_bid_amount || existingBid.bid_amount;
        if (max_bid_amount <= existingMax) {
          throw new Error(`Your new max bid must be higher than your current max bid of ${existingMax}`);
        }
        actualBidAmount = currentPrice; // Keep current price
      }
    }

    console.log('[BID DEBUG] actualBidAmount:', actualBidAmount, 'currentWinnerNeedsUpdate:', currentWinnerNeedsUpdate, 'updatedWinnerBidAmount:', updatedWinnerBidAmount);
    
    // Create bid with calculated actual amount
    const newBidData = {
      product_id,
      bidder_id,
      bid_amount: actualBidAmount,
      max_bid_amount: max_bid_amount,
      is_auto_bid: true,
      is_rejected: false
    };

    const bid = await bidModel.create(newBidData);
    console.log('[BID DEBUG] Created bid:', bid.id, 'bid_amount:', bid.bid_amount);

    // If current winner needs to be updated (auto-raise)
    if (currentWinnerNeedsUpdate && currentWinnerBid) {
      console.log('[BID DEBUG] Updating current winner bid_amount to:', updatedWinnerBidAmount);
      // Update the winner's bid_amount (auto-raise to beat new bid)
      await bidModel.updateBidAmount(currentWinnerBid.id, updatedWinnerBidAmount);
      // Update product price to winner's new bid_amount
      console.log('[BID DEBUG] Updating product price to:', updatedWinnerBidAmount);
      await productModel.updatePriceAndBidCount(product_id, updatedWinnerBidAmount);
    } else {
      // Update product price and bid count to new bid
      console.log('[BID DEBUG] Updating product price to:', actualBidAmount);
      await productModel.updatePriceAndBidCount(product_id, actualBidAmount);
    }
    
    const updatedProduct = await productModel.findById(product_id);
    console.log('[BID DEBUG] Final product current_price:', updatedProduct?.current_price, 'bid_count:', updatedProduct?.bid_count);

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
      
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
      const productUrl = frontendUrl ? `${frontendUrl}/products/${product.id}` : ''; 

      const mailPromises: Promise<any>[] = [];

      // Determine who is winning and what to notify
      if (currentWinnerNeedsUpdate && currentWinnerBid) {
        // Case: New bidder has lower max, current winner auto-raised
        const winner = await userModel.findById(currentWinnerBid.bidder_id);
        
        // Notify new bidder: they were outbid
        if (bidder && bidder.email) {
          const subject = `You were outbid on "${product.name}"`;
          const html = `<p>Hi ${bidder.full_name || 'there'},</p>
            <p>Your bid for <a href="${productUrl}">${product.name}</a> has been placed.</p>
            <p>Your max bid: <strong>${max_bid_amount.toLocaleString('vi-VN')} đ</strong></p>
            <p>However, you were immediately outbid. Current price: <strong>${updatedWinnerBidAmount.toLocaleString('vi-VN')} đ</strong></p>
            <p>You can increase your max bid to compete.</p>`;
          mailPromises.push(EmailService.sendMail(bidder.email, subject, html));
        }

        // Notify current winner: their bid was auto-raised
        if (winner && winner.email) {
          const subject = `Your bid was auto-raised on "${product.name}"`;
          const html = `<p>Hi ${winner.full_name || 'there'},</p>
            <p>Someone placed a bid on <a href="${productUrl}">${product.name}</a>.</p>
            <p>Your bid was automatically raised to <strong>${updatedWinnerBidAmount.toLocaleString('vi-VN')} đ</strong></p>
            <p>You are still winning with your max bid of <strong>${currentWinnerBid.max_bid_amount?.toLocaleString('vi-VN')} đ</strong></p>`;
          mailPromises.push(EmailService.sendMail(winner.email, subject, html));
        }
      } else {
        // Case: New bidder is winning
        
        // Get the person who was outbid (if any)
        const allActiveBids = await bidModel.getAllActiveBidsSorted(product_id);
        const previousHighest = allActiveBids.find(b => b.id !== bid.id && b.bidder_id !== bidder_id);
        const previousBidder = previousHighest?.bidder_id ? await userModel.findById(previousHighest.bidder_id) : null;

        // Notify new bidder: success
        if (bidder && bidder.email) {
          const subject = `Your bid for "${product.name}" is placed`;
          const html = `<p>Hi ${bidder.full_name || 'there'},</p>
            <p>Your bid for <a href="${productUrl}">${product.name}</a> has been placed successfully.</p>
            <p>Your max bid: <strong>${max_bid_amount.toLocaleString('vi-VN')} đ</strong></p>
            <p>Current bid: <strong>${actualBidAmount.toLocaleString('vi-VN')} đ</strong></p>
            <p>You are currently winning!</p>`;
          mailPromises.push(EmailService.sendMail(bidder.email, subject, html));
        }

        // Notify previous highest bidder if they were outbid
        if (previousBidder && previousBidder.email && previousBidder.id !== bidder_id) {
          const subject = `You were outbid on "${product.name}"`;
          const html = `<p>Hi ${previousBidder.full_name || 'there'},</p>
            <p>You have been outbid on <a href="${productUrl}">${product.name}</a>.</p>
            <p>New current bid: <strong>${actualBidAmount.toLocaleString('vi-VN')} đ</strong></p>`;
          mailPromises.push(EmailService.sendMail(previousBidder.email, subject, html));
        }
      }

      // Notify seller
      if (seller && seller.email) {
        const finalPrice = currentWinnerNeedsUpdate ? updatedWinnerBidAmount : actualBidAmount;
        const subject = `New bid on your product "${product.name}"`;
        const html = `<p>Hi ${seller.full_name || 'there'},</p>
          <p>Your product <a href="${productUrl}">${product.name}</a> received a new bid.</p>
          <p>Current price: <strong>${finalPrice.toLocaleString('vi-VN')} đ</strong></p>`;
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
        bidder_name: isSeller ? (fullName || 'Ẩn danh') : maskName(fullName || '')
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
