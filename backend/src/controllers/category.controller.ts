import type { Request, Response } from "express";
import { CategoryService } from "../services/category.service.js";


export const CategoryController = {
    // Return category hierarchy
    // Return all categories (flat list)
    getAll: async (req: Request, res: Response) => {
        try {
            const categories = await CategoryService.findAll();
            return res.status(200).json(categories);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    },

    // Return category hierarchy (parents with children)
    getHierarchy: async (req: Request, res: Response) => {
        try {
            const hierarchy = await CategoryService.getHierarchy();
            return res.status(200).json(hierarchy);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    },

    // Get single category
    getById: async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const category = await CategoryService.findById(id);
            if (!category) return res.status(404).json({ error: 'Category not found' });
            return res.status(200).json(category);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    },

    // Create category
    create: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const created = await CategoryService.create(data);
            return res.status(201).json(created);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    },

    // Update category
    update: async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const data = req.body;
            const updated = await CategoryService.update(id, data);
            return res.status(200).json(updated);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    },

    // Delete (soft) category
    delete: async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            await CategoryService.delete(id);
            return res.status(204).send();
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    },

    // Parent categories
    parents: async (req: Request, res: Response) => {
        try {
            const parents = await CategoryService.getParentCategories();
            return res.status(200).json(parents);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    },

    // Subcategories of a parent
    subcategories: async (req: Request, res: Response) => {
        try {
            const parentId = req.params.id as string;
            const subs = await CategoryService.getSubcategories(parentId);
            return res.status(200).json(subs);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    },

    // Get products by category
    getProductsById: async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const products = await CategoryService.getProductsById(id, page, limit);
            return res.status(200).json(products);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }
}