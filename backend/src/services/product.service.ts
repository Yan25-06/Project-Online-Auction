import { productModel } from "../models/product.model.js";

export const ProductService = {
  getAll: async (sort?: string, order?: string, limit: number = 5) => {
    // Map simple sort keys used by controller/frontend to model methods
    switch (sort) {
      case "ends_at":
        return await productModel.getEndingSoon(limit);
      case "bid_count":
        return await productModel.getMostBids(limit);
      case "current_price":
        return await productModel.getHighestPrice(limit);
      default:
        // Fallback to newly listed items
        return await productModel.getNewlyListed();
    }
  },

  getById: async (id?: string) => {
    if (!id) return null;
    return await productModel.findById(id);
  },

  // Mirror productModel API
  findById: async (id: string) => await productModel.findById(id),

  create: async (productData: any) => await productModel.create(productData),

  appendDescription: async (id: string, additionalDescription: string) =>
    await productModel.appendDescription(id, additionalDescription),

  findByCategory: async (
    categoryId: string,
    page: number = 1,
    limit: number = 20
  ) => await productModel.findByCategory(categoryId, page, limit),

  search: async (
    query: string,
    categoryId?: string,
    sortBy?: string,
    page: number = 1,
    limit: number = 20
  ) => await productModel.search(query, categoryId, sortBy, page, limit),

  getEndingSoon: async (limit: number = 5) =>
    await productModel.getEndingSoon(limit),

  getMostBids: async (limit: number = 5) =>
    await productModel.getMostBids(limit),

  getHighestPrice: async (limit: number = 5) =>
    await productModel.getHighestPrice(limit),

  findBySeller: async (
    sellerId: string,
    page: number = 1,
    limit: number = 20
  ) => await productModel.findBySeller(sellerId, page, limit),

  updateStatus: async (
    id: string,
    status: "active" | "ended" | "sold" | "cancelled"
  ) => await productModel.updateStatus(id, status),

  updatePriceAndBidCount: async (id: string, newPrice: number) =>
    await productModel.updatePriceAndBidCount(id, newPrice),

  incrementViewCount: async (id: string) =>
    await productModel.incrementViewCount(id),

  delete: async (id: string) => await productModel.delete(id),

  getNewlyListed: async (minutes: number = 60) =>
    await productModel.getNewlyListed(minutes),

  getAllForAdmin: async (
    page: number = 1,
    limit: number = 20,
    statusFilter?: string
  ) => await productModel.getAllForAdmin(page, limit, statusFilter),

  // Auto-extend settings
  getAutoExtendSettings: async () =>
    await productModel.getAutoExtendSettings(),

  updateAutoExtendSettings: async (thresholdMinutes: number, extensionMinutes: number) =>
    await productModel.updateAutoExtendSettings(thresholdMinutes, extensionMinutes),
};
