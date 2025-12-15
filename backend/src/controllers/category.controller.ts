import type { Request, Response } from "express";
import { exampleModel } from "../models/example.model.js"; 
import { CategoryService } from "../services/category.service.js";


export const CategoryController = {
    getAll: async (req: Request, res: Response) => {
        const categories = await CategoryService.getAll();
        return res.status(200).json(categories);
    },

    getProductsById: async (req: Request, res: Response) => {
        const id = req.params.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const products = await CategoryService.getProductsById(id, page, limit);
        return res.status(200).json(products);
    }
}