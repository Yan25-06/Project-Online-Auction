import { Router } from 'express';
import { WatchlistController } from '../controllers/watchlist.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const watchlistRouter = Router();

watchlistRouter.get('/user/:userId', requireAuth, WatchlistController.findByUser);
watchlistRouter.get('/:userId/:productId', requireAuth, WatchlistController.isInWatchlist);
watchlistRouter.post('/:productId', requireAuth, WatchlistController.add);
watchlistRouter.delete('/:productId', requireAuth, WatchlistController.remove);

export { watchlistRouter };
