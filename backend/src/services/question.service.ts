import { questionModel } from '../models/question.model.js';
import { EmailService } from './email.service.js';
import { productModel } from '../models/product.model.js';
import { bidModel } from '../models/bid.model.js';
import { userModel } from '../models/user.model.js';

export const QuestionService = {
  create: async (userId: string, productId: string, questionText: string) => {
    const created = await questionModel.create(userId, productId, questionText);

    // Notify seller by email about the new question
    try {
      const product = await productModel.findById(productId);
      const seller = product?.seller || (product?.seller_id ? await userModel.findById(product.seller_id) : null);
      const asker = await userModel.findById(userId);

      if (seller && seller.email) {
        const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
        const productUrl = frontendUrl ? `${frontendUrl}/products/${product?.id}` : '';
        const subject = `New question on your product "${product?.name || 'your product'}"`;
        const html = `<p>Hi ${seller.full_name || 'there'},</p>
          <p>A new question has been posted for your product <a href="${productUrl}">${product?.name || 'product'}</a>:</p>
          <blockquote>${questionText}</blockquote>
          <p>Asked by: ${asker?.full_name || 'a user'}</p>`;

        await EmailService.sendMail(seller.email, subject, html);
      }
    } catch (e) {
      console.warn('Failed to send question notification email to seller:', e);
    }

    return created;
  },

  findByProduct: async (productId: string) => {
    return await questionModel.findByProduct(productId);
  },

  answer: async (questionId: string, sellerId: string, answerText: string) => {
    const ans = await questionModel.answer(questionId, sellerId, answerText);

    // Notify bidders and questioners about the answer
    try {
      const question = await questionModel.findById(questionId);
      if (!question) return ans;

      const product = question.product;
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
      const productUrl = frontendUrl ? `${frontendUrl}/products/${product?.id}` : '';

      // Get all bidder IDs who participated in bids on this product
      const bids = await bidModel.findByProduct(product.id);
      const bidderIds = new Set<string>();
      for (const b of bids || []) {
        if (b.bidder_id) bidderIds.add(b.bidder_id);
      }

      // Get all questioner IDs for this product
      const questions = await questionModel.findByProduct(product.id);
      for (const q of questions || []) {
        if (q.user_id) bidderIds.add(q.user_id);
      }

      // Remove seller (don't notify the seller)
      bidderIds.delete(sellerId);

      // Fetch user details and send emails
      const mailPromises: Promise<any>[] = [];
      for (const uid of bidderIds) {
        try {
          const user = await userModel.findById(uid);
          if (user && user.email) {
            const subject = `Question answered for "${product?.name || 'product'}"`;
            const html = `<p>Hi ${user.full_name || 'there'},</p>
              <p>A question about <a href="${productUrl}">${product?.name || 'a product'}</a> has been answered by the seller:</p>
              <blockquote><strong>Q:</strong> ${question.question_text || ''}</blockquote>
              <blockquote><strong>A:</strong> ${answerText}</blockquote>`;
            mailPromises.push(EmailService.sendMail(user.email, subject, html));
          }
        } catch (e) {
          console.warn(`Failed to prepare email for user ${uid}:`, e);
        }
      }

      await Promise.allSettled(mailPromises);
    } catch (e) {
      console.warn('Failed to send answer notifications:', e);
    }

    return ans;
  },

  findById: async (id: string) => {
    return await questionModel.findById(id);
  },

  getUnansweredBySeller: async (sellerId: string) => {
    return await questionModel.getUnansweredBySeller(sellerId);
  }
};
