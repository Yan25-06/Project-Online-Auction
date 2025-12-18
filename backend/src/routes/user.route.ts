import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.get('/', UserController.findAll);
userRouter.post('/', UserController.create);
userRouter.get('/email', UserController.getByEmail);
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

userRouter.get('/upgrade-requests', requireAuth, requireRole('admin'), UserController.getPendingUpgradeRequests);
userRouter.post('/:id/request-upgrade', requireAuth, requireRole('bidder'), UserController.requestUpgrade);
userRouter.post('/:id/approve-upgrade', requireAuth, requireRole('admin'), UserController.approveUpgrade);
userRouter.post('/:id/reject-upgrade', requireAuth, requireRole('admin'), UserController.rejectUpgrade);
userRouter.get('/:id', UserController.getById);
userRouter.put('/:id', UserController.update);

export { userRouter };
