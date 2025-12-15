import { categoryModel } from '../models/category.model.js';
import { productModel } from '../models/product.model.js';

export const CategoryService = {
    // Mirror categoryModel API
    findById: async (id: string) => await categoryModel.findById(id),

    findAll: async () => await categoryModel.findAll(),

    getParentCategories: async () => await categoryModel.getParentCategories(),

    getSubcategories: async (parentId: string) => await categoryModel.getSubcategories(parentId),

    create: async (categoryData: any) => await categoryModel.create(categoryData),

    update: async (id: string, categoryData: any) => await categoryModel.update(id, categoryData),

    hasProducts: async (id: string) => await categoryModel.hasProducts(id),

    delete: async (id: string) => await categoryModel.delete(id),

    getHierarchy: async () => await categoryModel.getHierarchy(),

    // Convenience: get products by category using product model
    getProductsById: async (id?: string, page: number = 1, limit: number = 20) => {
        if (!id) return { data: [], total: 0 };
        return await productModel.findByCategory(id, page, limit);
    }
}