import { ProductImageModel } from '../models/product-image.model.js';
import { uploadToStorage } from './storage.service.js';

export const ProductImageService = {
  async uploadImages(productId: string, files: Express.Multer.File[]) {
    const uploadPromises = files.map(async (file, index) => {
      // Upload to Supabase Storage
      const imageUrl = await uploadToStorage(file);
      
      return {
        product_id: productId,
        image_url: imageUrl,
        image_order: index + 1
      };
    });

    const imageData = await Promise.all(uploadPromises);
    return await ProductImageModel.createBatch(imageData);
  },

  async getProductImages(productId: string) {
    return await ProductImageModel.findByProduct(productId);
  },

  async deleteImage(imageId: string) {
    // TODO: Also delete from storage if needed
    return await ProductImageModel.delete(imageId);
  },

  async deleteProductImages(productId: string) {
    return await ProductImageModel.deleteByProduct(productId);
  }
};
