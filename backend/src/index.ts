import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { productRouter } from './routes/product.route.js';
import { categoryRouter } from './routes/category.route.js';
import { userRouter } from './routes/user.route.js';
import { bidRouter } from './routes/bid.route.js';
import { watchlistRouter } from './routes/watchlist.route.js';
import { orderRouter } from './routes/order.route.js';
import { questionRouter } from './routes/question.route.js';
import { ratingRouter } from './routes/rating.route.js';
import { blockedBidderRouter } from './routes/blocked-bidder.route.js';
import { sharedFunction } from 'shared-auction/test.js';

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://project-online-auction.vercel.app',
  'https://project-online-auction-be.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/users', userRouter);
app.use('/api/bids', bidRouter);
app.use('/api/watchlists', watchlistRouter);
app.use('/api/orders', orderRouter);
app.use('/api/questions', questionRouter);
app.use('/api/ratings', ratingRouter);
app.use('/api/blocked-bidders', blockedBidderRouter);

// Global error handler (should be last middleware)
import { errorHandler } from './middlewares/error.middleware.js';
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});