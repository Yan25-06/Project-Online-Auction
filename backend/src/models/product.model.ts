import { supabase } from "../config/supabase.js";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductWithDetails,
  ProductWithSellerAndCategory,
} from "shared-auction";

export const productModel = {
  // Get product by ID with relations
  async findById(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        seller:users!seller_id(*),
        category:categories(*),
        product_images(*),
        product_descriptions(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  // Hàm xử lý upload file lên Storage
  async uploadImage(file: any) {
    const fileName = `product_${Date.now()}_${file.originalname}`;

    const { data, error } = await supabase.storage
      .from("product_images")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from("product_images")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  },
  // Create product
  async create(productData: CreateProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert({
        ...productData,
        current_price: productData.starting_price,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update product (append description)
  async appendDescription(
    id: string,
    additionalDescription: string
  ): Promise<void> {
    // Get the current max order to determine next order
    const { data: existing, error: fetchError } = await supabase
      .from("product_descriptions")
      .select("description_order")
      .eq("product_id", id)
      .order("description_order", { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    const nextOrder = (existing?.[0]?.description_order ?? 0) + 1;

    const { error } = await supabase.from("product_descriptions").insert({
      product_id: id,
      description_text: additionalDescription,
      description_order: nextOrder,
    });

    if (error) throw error;
  },

  // Get products by category
  async findByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("products")
      .select(
        `
        *,
        seller:users!seller_id(id, full_name, rating_score),
        category:categories(id, name)
      `,
        { count: "exact" }
      )
      .eq("category_id", categoryId)
      .eq("status", "active")
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  // Search products with full-text search
  async search(
    query: string,
    categoryId?: string,
    sortBy?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;

    let queryBuilder = supabase
      .from("products")
      .select(
        `
        *,
        seller:users!seller_id(id, full_name, rating_score),
        category:categories(id, name)
      `,
        { count: "exact" }
      )
      .eq("status", "active");

    if (query) {
      queryBuilder = queryBuilder.textSearch("name", query, {
        type: "websearch",
        config: "english",
      });
    }

    if (categoryId) {
      queryBuilder = queryBuilder.eq("category_id", categoryId);
    }

    // Apply sorting
    switch (sortBy) {
      case "end_time_desc":
        queryBuilder = queryBuilder.order("ends_at", { ascending: false });
        break;
      case "price_asc":
        queryBuilder = queryBuilder.order("current_price", { ascending: true });
        break;
      case "price_desc":
        queryBuilder = queryBuilder.order("current_price", {
          ascending: false,
        });
        break;
      default:
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
    }

    const { data, error, count } = await queryBuilder.range(
      offset,
      offset + limit - 1
    );

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  // Get top 5 products ending soon
  async getEndingSoon(limit: number = 5): Promise<any[]> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        seller:users!seller_id(id, full_name, rating_score),
        category:categories(id, name)
      `
      )
      .eq("status", "active")
      .gt("ends_at", new Date().toISOString())
      .order("ends_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get top 5 products with most bids
  async getMostBids(limit: number = 5): Promise<any[]> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        seller:users!seller_id(id, full_name, rating_score),
        category:categories(id, name)
      `
      )
      .eq("status", "active")
      .order("bid_count", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get top 5 products with highest price
  async getHighestPrice(limit: number = 5): Promise<any[]> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        seller:users!seller_id(id, full_name, rating_score),
        category:categories(id, name)
      `
      )
      .eq("status", "active")
      .order("current_price", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get products by seller
  async findBySeller(
    sellerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(id, name)
      `,
        { count: "exact" }
      )
      .eq("seller_id", sellerId)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  // Update product status
  async updateStatus(
    id: string,
    status: "active" | "ended" | "sold" | "cancelled"
  ): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .update({ status, updated_at: new Date() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update product ends_at (used for auto-extension)
  async updateEndsAt(id: string, newEndsAt: string | Date): Promise<Product> {
    const endsAtIso =
      newEndsAt instanceof Date ? newEndsAt.toISOString() : newEndsAt;
    const { data, error } = await supabase
      .from("products")
      .update({ ends_at: endsAtIso, updated_at: new Date() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update current price and bid count
  async updatePriceAndBidCount(id: string, newPrice: number): Promise<Product> {
    // 1. Lấy bid_count hiện tại
    const { data: currentProduct } = await supabase
      .from("products")
      .select("bid_count")
      .eq("id", id)
      .single();

    const newBidCount = (currentProduct?.bid_count || 0) + 1;

    // 2. Cập nhật với con số cụ thể
    const { data, error } = await supabase
      .from("products")
      .update({
        current_price: newPrice,
        bid_count: newBidCount, // Truyền con số cụ thể vào đây
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Increment view count
  async incrementViewCount(id: string): Promise<void> {
    // Read current view_count then update with incremented value
    const { data: current, error: fetchErr } = await supabase
      .from("products")
      .select("view_count")
      .eq("id", id)
      .single();

    if (fetchErr) throw fetchErr;

    const newViewCount = (current?.view_count ?? 0) + 1;

    const { error } = await supabase
      .from("products")
      .update({ view_count: newViewCount })
      .eq("id", id);

    if (error) throw error;
  },

  // Delete product (only by admin or seller)
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;
  },

  // Get newly listed products (within N minutes)
  async getNewlyListed(minutes: number = 60): Promise<any[]> {
    const timeThreshold = new Date(Date.now() - minutes * 60 * 1000);

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        seller:users!seller_id(id, full_name, rating_score),
        category:categories(id, name)
      `
      )
      .eq("status", "active")
      .gte("listed_at", timeThreshold.toISOString())
      .order("listed_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
