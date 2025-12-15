import { Router } from 'express';
import { BidController } from '../controllers/bid.controller.js';

const bidRouter = Router();

bidRouter.post('/', BidController.create);
bidRouter.get('/product/:productId', BidController.findByProduct);
bidRouter.get('/product/:productId/highest', BidController.getHighestBid);
bidRouter.get('/bidder/:bidderId', BidController.findByBidder);
bidRouter.get('/winning/:bidderId', BidController.getWinningBids);
bidRouter.post('/:id/reject', BidController.reject);

export { bidRouter };
