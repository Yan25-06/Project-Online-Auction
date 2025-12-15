import { questionModel } from '../models/question.model.js';

export const QuestionService = {
  create: async (userId: string, productId: string, questionText: string) => {
    return await questionModel.create(userId, productId, questionText);
  },

  findByProduct: async (productId: string) => {
    return await questionModel.findByProduct(productId);
  },

  answer: async (questionId: string, sellerId: string, answerText: string) => {
    return await questionModel.answer(questionId, sellerId, answerText);
  },

  findById: async (id: string) => {
    return await questionModel.findById(id);
  },

  getUnansweredBySeller: async (sellerId: string) => {
    return await questionModel.getUnansweredBySeller(sellerId);
  }
};
