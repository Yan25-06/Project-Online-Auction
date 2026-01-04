import { supabase } from '../config/supabase.js';

export const ProductImageModel = {
  async create(productId: string, imageUrl: string, imageOrder: number) {
    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: imageUrl,
        image_order: imageOrder
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createBatch(images: { product_id: string; image_url: string; image_order: number }[]) {
    const { data, error } = await supabase
      .from('product_images')
      .insert(images)
      .select();

    if (error) throw error;
    return data;
  },

  async findByProduct(productId: string) {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('image_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteByProduct(productId: string) {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if (error) throw error;
  }
};
