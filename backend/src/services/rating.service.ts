import { ratingModel } from "../models/rating.model.js";
import { orderModel } from "../models/order.model.js";

export const RatingService = {
  upsert: async (
    orderId: string,
    ratingUserId: string,
    ratedUserId: string,
    score: "positive" | "negative",
    feedback?: string
  ) => {
    const rating = await ratingModel.upsert(
      orderId,
      ratingUserId,
      ratedUserId,
      score,
      feedback
    );
    console.log(
      `Rating upserted for order ${orderId} by user ${ratingUserId} for user ${ratedUserId} with score ${score}`
    );

    // Check if both parties have rated, if so, mark order as completed
    const bothRated = await orderModel.checkBothRated(orderId);
    if (bothRated) {
      await orderModel.markCompleted(orderId);
    }

    return rating;
  },

  findByUser: async (userId: string, page: number = 1, limit: number = 20) => {
    return await ratingModel.findByUser(userId, page, limit);
  },

  findByOrderAndRater: async (orderId: string, ratingUserId: string) => {
    return await ratingModel.findByOrderAndRater(orderId, ratingUserId);
  },

  findByOrder: async (orderId: string) => {
    return await ratingModel.findByOrder(orderId);
  },
};
