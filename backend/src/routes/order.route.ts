import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';

const orderRouter = Router();

orderRouter.post('/', OrderController.create);
orderRouter.get('/:id', OrderController.findById);
orderRouter.get('/product/:productId', OrderController.findByProduct);
orderRouter.patch('/:id/status', OrderController.updateStatus);
orderRouter.patch('/:id/shipping', OrderController.updateShippingAddress);
orderRouter.post('/:id/payment-proof', OrderController.updatePaymentProof);
orderRouter.post('/:id/shipping-proof', OrderController.updateShippingProof);
orderRouter.post('/:id/confirm', OrderController.confirmDelivery);
orderRouter.post('/:id/cancel', OrderController.cancel);
orderRouter.get('/seller/:sellerId', OrderController.findBySeller);
orderRouter.get('/winner/:winnerId', OrderController.findByWinner);

export { orderRouter };
