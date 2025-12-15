import { Router } from 'express';
import { BlockedBidderController } from '../controllers/blocked-bidder.controller.js';

const blockedBidderRouter = Router();

blockedBidderRouter.post('/', BlockedBidderController.block);
blockedBidderRouter.delete('/:productId/:bidderId', BlockedBidderController.unblock);
blockedBidderRouter.get('/:productId/:bidderId', BlockedBidderController.isBlocked);
blockedBidderRouter.get('/product/:productId', BlockedBidderController.findByProduct);

export { blockedBidderRouter };
