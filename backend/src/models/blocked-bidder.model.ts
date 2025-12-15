import { supabase } from '../config/supabase.js';
import type { BlockedBidder } from 'shared-auction';

export const blockedBidderModel = {
  // Block a bidder
  async block(productId: string, bidderId: string, sellerId: string, reason?: string): Promise<BlockedBidder> {
    const { data, error } = await supabase
      .from('blocked_bidders')
      .insert({
        product_id: productId,
        bidder_id: bidderId,
        seller_id: sellerId,
        reason
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Unblock a bidder
  async unblock(productId: string, bidderId: string): Promise<void> {
    const { error } = await supabase
      .from('blocked_bidders')
      .delete()
      .eq('product_id', productId)
      .eq('bidder_id', bidderId);

    if (error) throw error;
  },

  // Check if bidder is blocked
  async isBlocked(productId: string, bidderId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('blocked_bidders')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('bidder_id', bidderId);

    if (error) throw error;
    return (count || 0) > 0;
  },

  // Get blocked bidders for a product
  async findByProduct(productId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('blocked_bidders')
      .select(`
        *,
        bidder:users!bidder_id(id, full_name, email)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
