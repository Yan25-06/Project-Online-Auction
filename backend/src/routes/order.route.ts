import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const orderRouter = Router();

// Create order
orderRouter.post("/", requireAuth, OrderController.create);

// Get order details
orderRouter.get("/:id", OrderController.findById);
orderRouter.get("/product/:productId", OrderController.findByProduct);

// Step 1: Buyer submits payment proof and shipping address
orderRouter.post(
  "/:id/payment-address",
  requireAuth,
  OrderController.submitPaymentAndAddress
);

// Step 2: Seller confirms payment and provides shipping proof
orderRouter.post(
  "/:id/confirm-shipping",
  requireAuth,
  OrderController.confirmPaymentAndShipping
);

// Step 3: Buyer confirms delivery
orderRouter.post(
  "/:id/confirm-delivery",
  requireAuth,
  OrderController.confirmDelivery
);

// Step 4: Submit rating (both buyer and seller can update their rating)
orderRouter.post("/:id/rating", requireAuth, OrderController.submitRating);

// Legacy endpoints (kept for compatibility)
orderRouter.patch("/:id/status", requireAuth, OrderController.updateStatus);
orderRouter.patch(
  "/:id/shipping",
  requireAuth,
  OrderController.updateShippingAddress
);
orderRouter.post(
  "/:id/payment-proof",
  requireAuth,
  OrderController.updatePaymentProof
);
orderRouter.post(
  "/:id/shipping-proof",
  requireAuth,
  OrderController.updateShippingProof
);
orderRouter.post("/:id/confirm", requireAuth, OrderController.confirmDelivery);

// Cancel order
orderRouter.post("/:id/cancel", requireAuth, OrderController.cancel);

// Seller cancel with auto negative rating
orderRouter.post(
  "/:id/cancel-seller",
  requireAuth,
  OrderController.cancelBySeller
);

// Get orders by user
orderRouter.get("/seller/:sellerId", OrderController.findBySeller);
orderRouter.get("/winner/:winnerId", OrderController.findByWinner);

export { orderRouter };
