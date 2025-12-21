import { supabase } from "../config/supabase.js";

export const uploadToStorage = async (file: any) => {
  const fileName = `${Date.now()}-${file.originalname}`;
  
  const { data, error } = await supabase.storage
    .from('product_images')
    .upload(fileName, file.buffer, { 
        contentType: file.mimetype,
        upsert: false 
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('product_images')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};