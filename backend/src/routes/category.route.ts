import { Router } from "express"; 
import { CategoryController } from "../controllers/category.controller.js";

const categoryRouter = Router();  

categoryRouter.get("/", CategoryController.getAll);
categoryRouter.post("/", CategoryController.create);
categoryRouter.get("/hierarchy", CategoryController.getHierarchy);
categoryRouter.get("/parents", CategoryController.parents);
categoryRouter.get("/:id/subcategories", CategoryController.subcategories);
categoryRouter.get("/:id/products", CategoryController.getProductsById);
categoryRouter.get("/:id", CategoryController.getById);
categoryRouter.put("/:id", CategoryController.update);
categoryRouter.delete("/:id", CategoryController.delete);

export { categoryRouter };