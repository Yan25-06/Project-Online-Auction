import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";

export const UserController = {
  getById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const user = await UserService.findById(id);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.status(200).json(user);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getByEmail: async (req: Request, res: Response) => {
    try {
      const email = String(req.query.email || "");
      if (!email) return res.status(400).json({ error: "email is required" });
      const user = await UserService.findByEmail(email);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.status(200).json(user);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const created = await UserService.create(data);
      return res.status(201).json(created);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const data = req.body;
      const updated = await UserService.update(id, data);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  findAll: async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const data = await UserService.findAll(page, limit);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  requestUpgrade: async (req: Request, res: Response) => {
    try {
      // Lấy userId từ auth token thay vì params
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Bạn cần đăng nhập để thực hiện chức năng này' });
      }
      const updated = await UserService.requestUpgrade(userId);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  getPendingUpgradeRequests: async (_req: Request, res: Response) => {
    try {
      const data = await UserService.getPendingUpgradeRequests();
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  approveUpgrade: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const updated = await UserService.approveUpgrade(id);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  rejectUpgrade: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const updated = await UserService.rejectUpgrade(id);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await UserService.delete(id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },
};
