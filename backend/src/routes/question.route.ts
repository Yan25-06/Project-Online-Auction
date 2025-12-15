import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller.js';

const questionRouter = Router();

questionRouter.post('/', QuestionController.create);
questionRouter.get('/product/:productId', QuestionController.findByProduct);
questionRouter.post('/:id/answer', QuestionController.answer);
questionRouter.get('/:id', QuestionController.findById);
questionRouter.get('/unanswered/:sellerId', QuestionController.getUnansweredBySeller);

export { questionRouter };
