import { orderModel } from '../models/order.model.js';

export const OrderService = {
  create: async (productId: string, sellerId: string, winnerId: string, finalPrice: number) => {
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

  cancel: async (id: string, cancelledBy: 'seller' | 'buyer', reason?: string) => {
    return await orderModel.cancel(id, cancelledBy, reason);
  },

  findBySeller: async (sellerId: string, page: number = 1, limit: number = 20) => {
    return await orderModel.findBySeller(sellerId, page, limit);
  },

  findByWinner: async (winnerId: string, page: number = 1, limit: number = 20) => {
    return await orderModel.findByWinner(winnerId, page, limit);
  }
};
