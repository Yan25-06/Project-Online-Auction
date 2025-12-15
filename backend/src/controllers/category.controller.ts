import type { Request, Response } from "express";
import { exampleModel } from "../models/example.model.js"; 
import { SupabaseCategoryService } from "../services/supabaseCategory.service.js";


export const CategoryController = {
    getAll: async (req: Request, res: Response) => {
        const categories = await SupabaseCategoryService.getAll();
        return res.status(200).json(categories);
    },

    getProductsById: async (req: Request, res: Response) => {
        const id = req.params.id;
        const products = await SupabaseCategoryService.getProductsById(id);
        return res.status(200).json(products);
    }
}