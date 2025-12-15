import { Router } from 'express';
import { BlockedBidderController } from '../controllers/blocked-bidder.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const blockedBidderRouter = Router();

blockedBidderRouter.post('/', requireAuth, requireRole('seller'), BlockedBidderController.block);
blockedBidderRouter.delete('/:productId/:bidderId', requireAuth, requireRole('seller'), BlockedBidderController.unblock);
blockedBidderRouter.get('/:productId/:bidderId', requireAuth, BlockedBidderController.isBlocked);
blockedBidderRouter.get('/product/:productId', requireAuth, requireRole('seller'), BlockedBidderController.findByProduct);

export { blockedBidderRouter };
