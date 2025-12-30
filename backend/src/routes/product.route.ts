import { Router } from "express"; 
import { ProductController } from "../controllers/product.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";
import upload from "../config/multer.js";

const productRouter = Router();  

productRouter.get("/", ProductController.getAll);
productRouter.get("/search", ProductController.search);
productRouter.get("/ending-soon", ProductController.endingSoon);
productRouter.get("/most-bids", ProductController.mostBids);
productRouter.get("/highest-price", ProductController.highestPrice);
productRouter.get("/seller/:sellerId", ProductController.findBySeller);
productRouter.post("/", requireAuth, requireRole('seller'), upload.single('image'), ProductController.create);
productRouter.post("/:id/description", requireAuth, requireRole('seller'), requireFields('description'), ProductController.appendDescription);
productRouter.patch("/:id/status", requireAuth, requireRole(['seller','admin']), ProductController.updateStatus);
productRouter.patch("/:id/price", requireAuth, ProductController.updatePrice);
productRouter.patch("/:id/view", ProductController.incrementView);
productRouter.delete("/:id", requireAuth, requireRole(['seller','admin']), ProductController.delete);
productRouter.get("/:id", ProductController.getById);

export { productRouter };