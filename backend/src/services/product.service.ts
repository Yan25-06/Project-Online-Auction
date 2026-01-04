import { productModel } from "../models/product.model.js";
import { bidModel } from "../models/bid.model.js";
import { orderModel } from "../models/order.model.js";

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

  // End auction and create order if there's a winner
  endAuction: async (productId: string) => {
    const product = await productModel.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if auction has actually ended
    const now = new Date();
    const endsAt = new Date(product.ends_at);
    if (endsAt > now) {
      throw new Error("Auction has not ended yet");
    }

    // Check if already ended
    if (product.status === "ended" || product.status === "sold") {
      return { product, order: null, message: "Auction already ended" };
    }

    // Get highest bid
    const highestBid = await bidModel.getHighestBid(productId);

    let order = null;
    let newStatus: "ended" | "sold" = "ended";

    if (highestBid && highestBid.bid_amount >= product.starting_price) {
      // There's a valid winner, create order
      newStatus = "sold";
      order = await orderModel.create(
        productId,
        product.seller_id,
        highestBid.bidder_id,
        highestBid.bid_amount
      );
    }

    // Update product status
    const updatedProduct = await productModel.updateStatus(
      productId,
      newStatus
    );

    return {
      product: updatedProduct,
      order,
      message: order
        ? "Auction ended with winner"
        : "Auction ended without winner",
    };
  },

  // Check and end all expired auctions
  endExpiredAuctions: async () => {
    const { data: expiredProducts } = await productModel.search(
      "",
      undefined,
      "ends_at",
      1,
      100
    );

    const now = new Date();
    const results = [];

    for (const product of expiredProducts || []) {
      const endsAt = new Date(product.ends_at);
      if (endsAt <= now && product.status === "active") {
        try {
          const result = await ProductService.endAuction(product.id);
          results.push(result);
        } catch (error) {
          console.error(
            `Failed to end auction for product ${product.id}:`,
            error
          );
        }
      }
    }

    return results;
  },
};
