import { supabase } from '../config/supabase.js';
import type { Category, CreateCategoryInput, UpdateCategoryInput, CategoryHierarchy } from 'shared-auction';

export const categoryModel = {
  // Get category by ID
  async findById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Get all categories (2-level hierarchy)
  async findAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('parent_id', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get parent categories (level 1)
  async getParentCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get subcategories by parent ID
  async getSubcategories(parentId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Create category
  async create(categoryData: CreateCategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update category
  async update(id: string, categoryData: UpdateCategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Check if category has products
  async hasProducts(id: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (error) throw error;
    return (count || 0) > 0;
  },

  // Soft delete category (only if no products)
  async delete(id: string): Promise<void> {
    const hasProducts = await this.hasProducts(id);
    if (hasProducts) {
      throw new Error('Cannot delete category with existing products');
    }

    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Get category hierarchy (parent with children)
  async getHierarchy(): Promise<any[]> {
    const parents = await this.getParentCategories();
    
    const hierarchy = await Promise.all(
      parents.map(async (parent) => ({
        ...parent,
        subcategories: await this.getSubcategories(parent.id)
      }))
    );

    return hierarchy;
  }
};
