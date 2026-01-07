import { supabase } from '../config/supabase.js';
import type { Bid, CreateBidInput, BidWithUser, BidHistoryItem } from 'shared-auction';

export const bidModel = {
  // Create bid
  async create(bidData: Partial<Bid>): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .insert(bidData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get bid by ID
  async findById(id: string): Promise<Bid | null> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Get bids for a product
  async findByProduct(productId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('bids')
      .select(`
        *,
        bidder:users!bidder_id(id, full_name, rating_score)
      `)
      .eq('product_id', productId)
      .eq('is_rejected', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get current highest bid for a product
  async getHighestBid(productId: string): Promise<Bid | null> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('product_id', productId)
      .eq('is_rejected', false)
      .order('max_bid_amount', { ascending: false })
      .order('created_at', { ascending: true }) // Earlier bid wins in case of tie
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Get second highest bid (for when highest is rejected)
  async getSecondHighestBid(productId: string): Promise<Bid | null> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('product_id', productId)
      .eq('is_rejected', false)
      .order('max_bid_amount', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(2);

    if (error) throw error;
    if (!data || data.length < 2) return null;
    return data[1];
  },

  // Get all active bids for a product ordered by max_bid_amount
  async getAllActiveBidsSorted(productId: string): Promise<Bid[]> {
    // Use raw query to properly sort with COALESCE handling NULL max_bid_amount
    const { data, error } = await supabase
      .rpc('get_active_bids_sorted', { p_product_id: productId });

    if (error) {
      // Fallback to client-side sorting if RPC doesn't exist
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('bids')
        .select('*')
        .eq('product_id', productId)
        .eq('is_rejected', false);

      if (fallbackError) throw fallbackError;
      
      // Sort in JavaScript: treat null max_bid_amount as bid_amount
      const sorted = (fallbackData || []).sort((a, b) => {
        const aMax = a.max_bid_amount ?? a.bid_amount;
        const bMax = b.max_bid_amount ?? b.bid_amount;
        if (bMax !== aMax) return bMax - aMax; // Descending by max
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); // Ascending by time
      });
      
      return sorted;
    }
    return data || [];
  },

  // Update bid amount (for auto-raising)
  async updateBidAmount(bidId: string, newBidAmount: number): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .update({ bid_amount: newBidAmount })
      .eq('id', bidId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get bids by bidder
  async findByBidder(bidderId: string, page: number = 1, limit: number = 20): Promise<{ data: any[], total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('bids')
      .select(`
        *,
        product:products(*)
      `, { count: 'exact' })
      .eq('bidder_id', bidderId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  // Get products where bidder is winning
  async getWinningBids(bidderId: string): Promise<any[]> {
    // This requires a more complex query - get products where user's bid is highest
    const { data, error } = await supabase
      .from('bids')
      .select(`
        *,
        product:products(
          *,
          seller:users!products_seller_id_fkey(id, full_name, email)
        )
      `)
      .eq('bidder_id', bidderId)
      .eq('is_rejected', false);

    if (error) throw error;

    // Filter to only include winning bids
    const winningBids = [];
    for (const bid of data || []) {
      const highestBid = await this.getHighestBid(bid.product_id);
      if (highestBid && highestBid.id === bid.id) {
        winningBids.push(bid);
      }
    }

    return winningBids;
  },

  // Reject bid
  async reject(id: string): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .update({ is_rejected: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Check if bidder is blocked for product
  async isBidderBlocked(productId: string, bidderId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('blocked_bidders')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('bidder_id', bidderId);

    if (error) throw error;
    return (count || 0) > 0;
  },

  // Get bid count for product
  async getProductBidCount(productId: string): Promise<number> {
    const { count, error } = await supabase
      .from('bids')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('is_rejected', false);

    if (error) throw error;
    return count || 0;
  },

  // Get bid history for product (raw data only)
  async getBidHistory(productId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('bids')
      .select(`
        id,
        bidder_id,
        bid_amount,
        created_at,
        is_rejected,
        bidder:users!bidder_id(full_name)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
