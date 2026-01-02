import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";
import upload from "../config/multer.js";

const productRouter = Router();

productRouter.get("/", ProductController.getAll);
productRouter.get(
  "/admin/all",
  requireAuth,
  requireRole("admin"),
  ProductController.getAllForAdmin
);
// Admin: auto-extend settings
productRouter.get(
  "/admin/auto-extend",
  requireAuth,
  requireRole("admin"),
  ProductController.getAutoExtendSettings
);
productRouter.put(
  "/admin/auto-extend",
  requireAuth,
  requireRole("admin"),
  ProductController.updateAutoExtendSettings
);
productRouter.get("/search", ProductController.search);
productRouter.get("/ending-soon", ProductController.endingSoon);
productRouter.get("/most-bids", ProductController.mostBids);
productRouter.get("/highest-price", ProductController.highestPrice);
productRouter.get("/seller/:sellerId", ProductController.findBySeller);
productRouter.post(
  "/",
  requireAuth,
  requireRole("seller"),
  upload.single("image"),
  ProductController.create
);
productRouter.post(
  "/:id/description",
  requireAuth,
  requireRole("seller"),
  requireFields("description"),
  ProductController.appendDescription
);
productRouter.patch(
  "/:id/status",
  requireAuth,
  requireRole(["seller", "admin"]),
  ProductController.updateStatus
);
productRouter.patch(
  "/:id/price",
  requireAuth,
  requireRole("admin"),
  ProductController.updatePrice
);
productRouter.post("/", requireAuth, requireRole('seller'), upload.single('image'), ProductController.create);
productRouter.post("/:id/description", requireAuth, requireRole('seller'), requireFields('description'), ProductController.appendDescription);
productRouter.patch("/:id/status", requireAuth, requireRole(['seller','admin']), ProductController.updateStatus);
productRouter.patch("/:id/price", requireAuth, ProductController.updatePrice);
productRouter.patch("/:id/view", ProductController.incrementView);
productRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["seller", "admin"]),
  ProductController.delete
);

// Product images routes
productRouter.post(
  "/:id/images",
  requireAuth,
  requireRole("seller"),
  upload.array("images", 5), // Max 5 images
  ProductController.uploadImages
);
productRouter.get("/:id/images", ProductController.getImages);

productRouter.get("/:id", ProductController.getById);

export { productRouter };
