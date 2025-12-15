import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const orderRouter = Router();

orderRouter.post('/', requireAuth, OrderController.create);
orderRouter.get('/:id', OrderController.findById);
orderRouter.get('/product/:productId', OrderController.findByProduct);
orderRouter.patch('/:id/status', requireAuth, OrderController.updateStatus);
orderRouter.patch('/:id/shipping', requireAuth, OrderController.updateShippingAddress);
orderRouter.post('/:id/payment-proof', requireAuth, OrderController.updatePaymentProof);
orderRouter.post('/:id/shipping-proof', requireAuth, OrderController.updateShippingProof);
orderRouter.post('/:id/confirm', requireAuth, OrderController.confirmDelivery);
orderRouter.post('/:id/cancel', requireAuth, OrderController.cancel);
orderRouter.get('/seller/:sellerId', OrderController.findBySeller);
orderRouter.get('/winner/:winnerId', OrderController.findByWinner);

export { orderRouter };
