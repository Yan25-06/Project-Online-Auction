import { supabase } from '../config/supabase.js';
import type { User, CreateUserInput, UpdateUserInput } from 'shared-auction';

export const userModel = {
  // Get user by ID
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get user by email
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  // Create new user
  async create(userData: CreateUserInput): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update user
  async update(id: string, userData: UpdateUserInput): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...userData, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user rating percentage
  async getRatingPercentage(id: string): Promise<number> {
    const user = await this.findById(id);
    if (!user || user.total_ratings === 0) return 0;
    return (user.positive_ratings / user.total_ratings) * 100;
  },

  // Check if user can bid (rating >= 80% or no ratings with seller permission)
  // rating_score is stored as decimal (0.80 = 80%)
  async canBid(userId: string, allowUnrated: boolean = true): Promise<boolean> {
    const user = await this.findById(userId);
    
    if (!user) return false;
    if (user.total_ratings === 0) return allowUnrated;
    // rating_score is stored as decimal, so 80% = 0.80
    return (user.rating_score || 0) >= 0.80;
  },

  // Request upgrade to seller (DB operation only - business logic in service)
  async requestUpgrade(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        upgrade_requested: true, 
        upgrade_requested_at: new Date(),
        updated_at: new Date() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get users with pending upgrade requests
  async getPendingUpgradeRequests(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('upgrade_requested', true)
      .eq('role', 'bidder')
      .order('upgrade_requested_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Approve upgrade request
  async approveUpgrade(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        role: 'seller', 
        upgrade_requested: false,
        updated_at: new Date() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Reject upgrade request (save rejection timestamp for 7-day cooldown)
  async rejectUpgrade(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        upgrade_requested: false,
        upgrade_rejected_at: new Date(),
        updated_at: new Date() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete user
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // List all users (for admin)
  async findAll(page: number = 1, limit: number = 20): Promise<{ data: User[], total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
};
