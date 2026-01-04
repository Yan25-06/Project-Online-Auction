import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";

const userRouter = Router();

import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

// Routes without parameters should come first
userRouter.get("/", UserController.findAll);
userRouter.post("/", UserController.create);
userRouter.get("/email", UserController.getByEmail);

userRouter.get(
  "/upgrade-requests",
  requireAuth,
  requireRole("admin"),
  UserController.getPendingUpgradeRequests
);

// Routes with :id parameter should come last
userRouter.get("/:id", UserController.getById);
userRouter.put("/:id", requireAuth, UserController.update);
userRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  UserController.delete
);
userRouter.post(
  "/:id/request-upgrade",
  requireAuth,
  requireRole("bidder"),
  UserController.requestUpgrade
);
userRouter.post(
  "/:id/approve-upgrade",
  requireAuth,
  requireRole("admin"),
  UserController.approveUpgrade
);
userRouter.post(
  "/:id/reject-upgrade",
  requireAuth,
  requireRole("admin"),
  UserController.rejectUpgrade
);

export { userRouter };
