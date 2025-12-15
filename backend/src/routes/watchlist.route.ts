import { Router } from 'express';
import { WatchlistController } from '../controllers/watchlist.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const watchlistRouter = Router();

watchlistRouter.post('/', requireAuth, WatchlistController.add);
watchlistRouter.delete('/:userId/:productId', requireAuth, WatchlistController.remove);
watchlistRouter.get('/:userId/:productId', requireAuth, WatchlistController.isInWatchlist);
watchlistRouter.get('/user/:userId', requireAuth, WatchlistController.findByUser);

export { watchlistRouter };
