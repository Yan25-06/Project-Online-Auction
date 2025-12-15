import type { Request, Response } from "express";
import { exampleModel } from "../models/example.model.js"; 
import { ProductService } from "../services/product.service.js";


export const ProductController = {
    getAll: async (req: Request, res: Response) => {
        const { 
            sort = null,
            order = null,
            limit = '5',
        } = req.query
        const limitNum = Number(limit) || 5;
        const products = await ProductService.getAll(sort as string, order as string, limitNum);
        return res.status(200).json(products);
    },

    getById: async (req: Request, res: Response) => {
        const id = req.params.id;
        const product = await ProductService.getById(id);
        return res.status(200).json(product);
    }
}