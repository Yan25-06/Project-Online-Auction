import { Router } from "express"; 
import { ProductController } from "../controllers/product.controller.js";

const productRouter = Router();  

productRouter.get("/", ProductController.getAll);
productRouter.get("/:id", ProductController.getById);
productRouter.get("/search", ProductController.search);
productRouter.get("/ending-soon", ProductController.endingSoon);
productRouter.get("/most-bids", ProductController.mostBids);
productRouter.get("/highest-price", ProductController.highestPrice);
productRouter.get("/seller/:sellerId", ProductController.findBySeller);
productRouter.post("/", ProductController.create);
productRouter.post("/:id/description", ProductController.appendDescription);
productRouter.patch("/:id/status", ProductController.updateStatus);
productRouter.patch("/:id/price", ProductController.updatePrice);
productRouter.patch("/:id/view", ProductController.incrementView);
productRouter.delete("/:id", ProductController.delete);

export { productRouter };