import { supabase } from '../config/supabase.js';
import type { WatchlistItem, WatchlistWithProduct } from 'shared-auction';

export const watchlistModel = {
  // Add product to watchlist
  async add(userId: string, productId: string): Promise<WatchlistItem> {
    const { data, error } = await supabase
      .from('watchlists')
      .insert({ user_id: userId, product_id: productId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove product from watchlist
  async remove(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  },

  // Check if product is in user's watchlist
  async isInWatchlist(userId: string, productId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('watchlists')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
    return (count || 0) > 0;
  },

  // Get user's watchlist
  async findByUser(userId: string, page: number = 1, limit: number = 20): Promise<{ data: any[], total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('watchlists')
      .select(`
        *,
        product:products(
          *,
          seller:users!seller_id(id, full_name, rating_score),
          category:categories(id, name)
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
};
