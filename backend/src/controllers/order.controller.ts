import type { Request, Response } from "express";
import { OrderService } from "../services/order.service.js";
import { RatingService } from "../services/rating.service.js";

export const OrderController = {
  create: async (req: Request, res: Response) => {
    try {
      const { productId, sellerId, winnerId, finalPrice } = req.body;
      const order = await OrderService.create(
        productId,
        sellerId,
        winnerId,
        Number(finalPrice)
      );
      return res.status(201).json(order);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  findById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const order = await OrderService.findById(id);
      if (!order) return res.status(404).json({ error: "Order not found" });

      // Get ratings for this order
      const ratings = await RatingService.findByOrder(id);

      return res.status(200).json({ ...order, ratings });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  findByProduct: async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId as string;
      const order = await OrderService.findByProduct(productId);
      if (!order) return res.status(404).json({ error: "Order not found" });
      return res.status(200).json(order);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const updated = await OrderService.updateStatus(id, status);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  // Step 1: Buyer provides payment proof and shipping address
  submitPaymentAndAddress: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { shippingAddress, paymentProofUrl } = req.body;

      // Update shipping address
      await OrderService.updateShippingAddress(id, shippingAddress);

      // Update payment proof (this also sets status to 'paid')
      const updated = await OrderService.updatePaymentProof(
        id,
        paymentProofUrl
      );

      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  updateShippingAddress: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { address } = req.body;
      const updated = await OrderService.updateShippingAddress(id, address);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  updatePaymentProof: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { proofUrl } = req.body;
      const updated = await OrderService.updatePaymentProof(id, proofUrl);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  // Step 2: Seller confirms payment and provides shipping proof
  confirmPaymentAndShipping: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { shippingProofUrl } = req.body;

      const updated = await OrderService.updateShippingProof(
        id,
        shippingProofUrl
      );
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  updateShippingProof: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { proofUrl } = req.body;
      const updated = await OrderService.updateShippingProof(id, proofUrl);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  // Step 3: Buyer confirms delivery
  confirmDelivery: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const updated = await OrderService.confirmDelivery(id);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  // Step 4: Submit rating (buyer or seller)
  submitRating: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { score, feedback } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get order to determine who to rate
      const order = await OrderService.findById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Determine who is being rated
      let ratedUserId: string;
      if (userId === order.seller_id) {
        ratedUserId = order.winner_id; // Seller rates buyer
      } else if (userId === order.winner_id) {
        ratedUserId = order.seller_id; // Buyer rates seller
      } else {
        return res
          .status(403)
          .json({ error: "Not authorized to rate this order" });
      }

      const rating = await RatingService.upsert(
        id,
        userId,
        ratedUserId,
        score,
        feedback
      );
      return res.status(200).json(rating);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  cancel: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { cancelledBy, reason } = req.body;
      const updated = await OrderService.cancel(id, cancelledBy, reason);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  // Seller cancels transaction and auto-rates buyer negatively
  cancelBySeller: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Verify user is the seller
      const order = await OrderService.findById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.seller_id !== userId) {
        return res
          .status(403)
          .json({ error: "Only seller can cancel using this endpoint" });
      }

      const updated = await OrderService.cancelBySeller(id, reason);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  findBySeller: async (req: Request, res: Response) => {
    try {
      const sellerId = req.params.sellerId as string;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const data = await OrderService.findBySeller(sellerId, page, limit);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  findByWinner: async (req: Request, res: Response) => {
    try {
      const winnerId = req.params.winnerId as string;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const data = await OrderService.findByWinner(winnerId, page, limit);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },
};
