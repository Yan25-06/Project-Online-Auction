import type { Request, Response } from 'express';
import { OrderService } from '../services/order.service.js';

export const OrderController = {
  create: async (req: Request, res: Response) => {
    try {
      const { productId, sellerId, winnerId, finalPrice } = req.body;
      const order = await OrderService.create(productId, sellerId, winnerId, Number(finalPrice));
      return res.status(201).json(order);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  findById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const order = await OrderService.findById(id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      return res.status(200).json(order);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  findByProduct: async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId as string;
      const order = await OrderService.findByProduct(productId);
      if (!order) return res.status(404).json({ error: 'Order not found' });
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

  confirmDelivery: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const updated = await OrderService.confirmDelivery(id);
      return res.status(200).json(updated);
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
  }
};
