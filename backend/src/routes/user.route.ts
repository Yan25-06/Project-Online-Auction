import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.get('/', UserController.findAll);
userRouter.post('/', UserController.create);
userRouter.get('/email', UserController.getByEmail);
userRouter.get('/upgrade-requests', UserController.getPendingUpgradeRequests);
userRouter.post('/:id/request-upgrade', UserController.requestUpgrade);
userRouter.post('/:id/approve-upgrade', UserController.approveUpgrade);
userRouter.post('/:id/reject-upgrade', UserController.rejectUpgrade);
userRouter.get('/:id', UserController.getById);
userRouter.put('/:id', UserController.update);

export { userRouter };
