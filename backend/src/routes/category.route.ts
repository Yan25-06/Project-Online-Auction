import { Router } from "express"; 
import { CategoryController } from "../controllers/category.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";

const categoryRouter = Router();  

categoryRouter.get("/", CategoryController.getAll);
categoryRouter.post("/", requireAuth, requireRole('admin'), requireFields('name'), CategoryController.create);
categoryRouter.get("/hierarchy", CategoryController.getHierarchy);
categoryRouter.get("/parents", CategoryController.parents);
categoryRouter.get("/:id/subcategories", CategoryController.subcategories);
categoryRouter.get("/:id/products", CategoryController.getProductsById);
categoryRouter.get("/:id", CategoryController.getById);
categoryRouter.put("/:id", requireAuth, requireRole('admin'), CategoryController.update);
categoryRouter.delete("/:id", requireAuth, requireRole('admin'), CategoryController.delete);

export { categoryRouter };