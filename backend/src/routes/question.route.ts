import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const questionRouter = Router();

questionRouter.post('/', requireAuth, QuestionController.create);
questionRouter.get('/product/:productId', QuestionController.findByProduct);
questionRouter.post('/:id/answer', requireAuth, QuestionController.answer);
questionRouter.get('/:id', QuestionController.findById);
questionRouter.get('/unanswered/:sellerId', QuestionController.getUnansweredBySeller);

export { questionRouter };
