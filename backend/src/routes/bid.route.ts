import { Router } from 'express';
import { BidController } from '../controllers/bid.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const bidRouter = Router();

bidRouter.post('/', requireAuth, BidController.create);
bidRouter.get('/product/:productId', BidController.findByProduct);
bidRouter.get('/product/:productId/history', BidController.getHistory);
bidRouter.get('/product/:productId/highest', BidController.getHighestBid);
bidRouter.get('/bidder/:bidderId', BidController.findByBidder);
bidRouter.get('/winning/:bidderId', BidController.getWinningBids);
bidRouter.patch('/:id/reject', requireAuth, requireRole('seller'), BidController.reject);

export { bidRouter };
