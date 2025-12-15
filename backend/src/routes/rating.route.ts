import { Router } from 'express';
import { RatingController } from '../controllers/rating.controller.js';

const ratingRouter = Router();

ratingRouter.post('/', RatingController.upsert);
ratingRouter.get('/user/:userId', RatingController.findByUser);
ratingRouter.get('/order/:orderId/rater/:ratingUserId', RatingController.findByOrderAndRater);

export { ratingRouter };
