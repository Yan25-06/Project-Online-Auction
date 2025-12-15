import { Router } from 'express';
import { BidController } from '../controllers/bid.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const bidRouter = Router();

bidRouter.post('/', requireAuth, BidController.create);
bidRouter.get('/product/:productId', BidController.findByProduct);
bidRouter.get('/product/:productId/highest', BidController.getHighestBid);
bidRouter.get('/bidder/:bidderId', BidController.findByBidder);
bidRouter.get('/winning/:bidderId', BidController.getWinningBids);
bidRouter.post('/:id/reject', requireAuth, BidController.reject);

export { bidRouter };
