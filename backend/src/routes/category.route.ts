import { Router } from "express"; 
import { CategoryController } from "../controllers/category.controller.js";

const categoryRouter = Router();  

categoryRouter.get("/", CategoryController.getAll);
categoryRouter.get("/:id/products", CategoryController.getProductsById);

export { categoryRouter };