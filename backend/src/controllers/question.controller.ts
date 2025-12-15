import type { Request, Response } from 'express';
import { QuestionService } from '../services/question.service.js';

export const QuestionController = {
  create: async (req: Request, res: Response) => {
    try {
      const { userId, productId, questionText } = req.body;
      const created = await QuestionService.create(userId, productId, questionText);
      return res.status(201).json(created);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  findByProduct: async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId as string;
      const data = await QuestionService.findByProduct(productId);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  answer: async (req: Request, res: Response) => {
    try {
      const questionId = req.params.id as string;
      const { sellerId, answerText } = req.body;
      const ans = await QuestionService.answer(questionId, sellerId, answerText);
      return res.status(201).json(ans);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  findById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const q = await QuestionService.findById(id);
      if (!q) return res.status(404).json({ error: 'Question not found' });
      return res.status(200).json(q);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  getUnansweredBySeller: async (req: Request, res: Response) => {
    try {
      const sellerId = req.params.sellerId as string;
      const data = await QuestionService.getUnansweredBySeller(sellerId);
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
