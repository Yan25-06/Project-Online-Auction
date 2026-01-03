import { supabase } from '../config/supabase.js';
import type { Bid, CreateBidInput, BidWithUser, BidHistoryItem } from 'shared-auction';

export const bidModel = {
  // Create bid
  async create(bidData: CreateBidInput): Promise<Bid> {
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
      .order('bid_amount', { ascending: false })
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
      .order('bid_amount', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(2);

    if (error) throw error;
    if (!data || data.length < 2) return null;
    return data[1];
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

  // Get bid history for product (masked or full based on isSeller flag)
  async getBidHistory(productId: string, isSeller: boolean = false): Promise<any[]> {
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

    // Filter out rejected bids for non-sellers
    const filteredData = isSeller ? (data || []) : (data || []).filter(bid => !bid.is_rejected);

    // Mask bidder names for non-sellers, show full name for sellers
    return filteredData.map(bid => ({
      ...bid,
      bidder_name: Array.isArray(bid.bidder) && bid.bidder[0]?.full_name
        ? isSeller
          ? bid.bidder[0].full_name
          : `****${bid.bidder[0].full_name.slice(-3)}`
        : '****'
    }));
  }
};
