import { supabase } from '../config/supabase.js';
import type { Order, OrderWithDetails } from 'shared-auction';

export const orderModel = {
  // Create order after auction ends
  async create(productId: string, sellerId: string, winnerId: string, finalPrice: number): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        product_id: productId,
        seller_id: sellerId,
        winner_id: winnerId,
        final_price: finalPrice
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get order by ID
  async findById(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(*),
        seller:users!seller_id(*),
        winner:users!winner_id(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Get order by product ID
  async findByProduct(productId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Update order status
  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update shipping address
  async updateShippingAddress(id: string, address: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ shipping_address: address, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload payment proof
  async updatePaymentProof(id: string, proofUrl: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        payment_proof_url: proofUrl, 
        status: 'paid',
        updated_at: new Date() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload shipping proof
  async updateShippingProof(id: string, proofUrl: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        shipping_proof_url: proofUrl, 
        status: 'shipped',
        updated_at: new Date() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Confirm delivery
  async confirmDelivery(id: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'delivered', updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Cancel order
  async cancel(id: string, cancelledBy: 'seller' | 'buyer', reason?: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled', 
        cancelled_by: cancelledBy,
        cancellation_reason: reason,
        updated_at: new Date() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get orders by seller
  async findBySeller(sellerId: string, page: number = 1, limit: number = 20): Promise<{ data: any[], total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(*),
        winner:users!winner_id(*)
      `, { count: 'exact' })
      .eq('seller_id', sellerId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  // Get orders by winner
  async findByWinner(winnerId: string, page: number = 1, limit: number = 20): Promise<{ data: any[], total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(*),
        seller:users!seller_id(*)
      `, { count: 'exact' })
      .eq('winner_id', winnerId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
};
