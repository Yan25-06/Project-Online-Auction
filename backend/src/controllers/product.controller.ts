import type { Request, Response } from "express";
import { exampleModel } from "../models/example.model.js"; 
import { SupabaseProductService } from "../services/supabaseProduct.service.js";


export const ProductController = {
    getAll: async (req: Request, res: Response) => {
        const { 
            sort = null,
            order = null,
            limit = 5,
        } = req.query

        const products = await SupabaseProductService.getAll(sort as string | null, order as string | null, Number(limit));
        return res.status(200).json(products);
    },

    getById: async (req: Request, res: Response) => {
        const id = req.params.id;
        const product = await SupabaseProductService.getById(id);
        return res.status(200).json(product);
    }
}