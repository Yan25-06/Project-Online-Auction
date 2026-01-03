import { supabase } from "../config/supabase.js";
import type { Rating, RatingWithDetails } from "shared-auction";

export const ratingModel = {
  // Create or update rating
  async upsert(
    orderId: string,
    ratingUserId: string,
    ratedUserId: string,
    score: "positive" | "negative",
    feedback?: string
  ): Promise<Rating> {
    const { data, error } = await supabase
      .from("ratings")
      .upsert({
        order_id: orderId,
        rating_user_id: ratingUserId,
        rated_user_id: ratedUserId,
        score,
        feedback,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update user's rating scores
    await this.updateUserRatings(ratedUserId);
    console.log("here");

    return data;
  },

  // Update user's aggregated ratings
  async updateUserRatings(userId: string): Promise<void> {
    const { data, error } = await supabase
      .from("ratings")
      .select("score")
      .eq("rated_user_id", userId);

    if (error) throw error;

    const positiveCount =
      data?.filter((r) => r.score === "positive").length || 0;
    const totalCount = data?.length || 0;
    let ratingScore = totalCount > 0 ? positiveCount / totalCount : null;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        positive_ratings: positiveCount,
        total_ratings: totalCount,
        rating_score: ratingScore,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user ratings:", updateError);
      throw updateError;
    }
  },

  // Get ratings for a user
  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("ratings")
      .select(
        `
        *,
        rater:users!rating_user_id(id, full_name),
        order:orders(
          id,
          product:products(id, name)
        )
      `,
        { count: "exact" }
      )
      .eq("rated_user_id", userId)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  // Get rating by order and rater
  async findByOrderAndRater(
    orderId: string,
    ratingUserId: string
  ): Promise<Rating | null> {
    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("order_id", orderId)
      .eq("rating_user_id", ratingUserId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  // Get all ratings for an order
  async findByOrder(orderId: string): Promise<Rating[]> {
    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("order_id", orderId);

    if (error) throw error;
    return data || [];
  },

  // Delete rating (for cancellation cleanup)
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("ratings").delete().eq("id", id);

    if (error) throw error;
  },
};
