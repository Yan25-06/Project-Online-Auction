import { orderModel } from "../models/order.model.js";
import { ratingModel } from "../models/rating.model.js";

export const OrderService = {
  create: async (
    productId: string,
    sellerId: string,
    winnerId: string,
    finalPrice: number
  ) => {
    return await orderModel.create(productId, sellerId, winnerId, finalPrice);
  },

  findById: async (id: string) => {
    return await orderModel.findById(id);
  },

  findByProduct: async (productId: string) => {
    return await orderModel.findByProduct(productId);
  },

  updateStatus: async (id: string, status: any) => {
    return await orderModel.updateStatus(id, status);
  },

  updateShippingAddress: async (id: string, address: string) => {
    return await orderModel.updateShippingAddress(id, address);
  },

  updatePaymentProof: async (id: string, proofUrl: string) => {
    return await orderModel.updatePaymentProof(id, proofUrl);
  },

  updateShippingProof: async (id: string, proofUrl: string) => {
    return await orderModel.updateShippingProof(id, proofUrl);
  },

  confirmDelivery: async (id: string) => {
    return await orderModel.confirmDelivery(id);
  },

  markCompleted: async (id: string) => {
    return await orderModel.markCompleted(id);
  },

  cancel: async (
    id: string,
    cancelledBy: "seller" | "buyer",
    reason?: string
  ) => {
    return await orderModel.cancel(id, cancelledBy, reason);
  },

  // Cancel order by seller and automatically rate buyer negatively
  cancelBySeller: async (id: string, reason?: string) => {
    // Get order details
    const order = await orderModel.findById(id);
    if (!order) throw new Error("Order not found");

    // Cancel the order
    const cancelled = await orderModel.cancel(id, "seller", reason);

    // Automatically create negative rating for the winner (buyer)
    await ratingModel.upsert(
      id,
      order.seller_id, // seller is rating
      order.winner_id, // buyer is being rated
      "negative",
      reason || "Giao dịch bị hủy bởi người bán"
    );

    return cancelled;
  },

  findBySeller: async (
    sellerId: string,
    page: number = 1,
    limit: number = 20
  ) => {
    return await orderModel.findBySeller(sellerId, page, limit);
  },

  findByWinner: async (
    winnerId: string,
    page: number = 1,
    limit: number = 20
  ) => {
    return await orderModel.findByWinner(winnerId, page, limit);
  },
};
