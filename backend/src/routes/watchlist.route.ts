import { Router } from 'express';
import { WatchlistController } from '../controllers/watchlist.controller.js';

const watchlistRouter = Router();

watchlistRouter.post('/', WatchlistController.add);
watchlistRouter.delete('/:userId/:productId', WatchlistController.remove);
watchlistRouter.get('/:userId/:productId', WatchlistController.isInWatchlist);
watchlistRouter.get('/user/:userId', WatchlistController.findByUser);

export { watchlistRouter };
