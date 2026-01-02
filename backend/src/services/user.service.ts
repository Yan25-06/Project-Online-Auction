import { userModel } from "../models/user.model.js";

// Helper function to mask name: "Nguyễn Văn Khoa" -> "****Khoa"
const maskName = (name: string): string => {
  if (!name) return "****";
  
  const str = name.trim();
  const parts = str.split(" ");
  
  // Lấy phần cuối cùng của tên (tên gọi)
  const lastName = parts[parts.length - 1];
  
  return `****${lastName}`;
};

export const UserService = {
  findById: async (id: string, currentUserId?: string) => {
    const user = await userModel.findById(id);
    if (!user) return null;
    
    const shouldMask = currentUserId !== id;
    if (shouldMask) {
      return {
        ...user,
        full_name: maskName(user.full_name)
      };
    }
    
    return user;
  },

  findByEmail: async (email: string) => {
    return await userModel.findByEmail(email);
  },

  create: async (userData: any) => {
    return await userModel.create(userData);
  },

  update: async (id: string, userData: any) => {
    return await userModel.update(id, userData);
  },

  findAll: async (page: number = 1, limit: number = 20) => {
    return await userModel.findAll(page, limit);
  },

  // Business logic: Request upgrade to seller (with 7-day cooldown check)
  requestUpgrade: async (id: string) => {
    // Check if user exists
    const user = await userModel.findById(id);
    if (!user) throw new Error('Người dùng không tồn tại');
    
    // Only bidders can request upgrade
    if (user.role !== 'bidder') {
      throw new Error('Chỉ người mua mới có thể yêu cầu nâng cấp');
    }
    
    // Check if already has pending request
    if (user.upgrade_requested) {
      throw new Error('Bạn đã có yêu cầu đang chờ duyệt');
    }
    
    // Check 7-day cooldown after rejection
    if (user.upgrade_rejected_at) {
      const rejectedDate = new Date(user.upgrade_rejected_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (rejectedDate > sevenDaysAgo) {
        const daysLeft = Math.ceil((rejectedDate.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
        throw new Error(`Yêu cầu của bạn đã bị từ chối. Vui lòng đợi ${daysLeft} ngày nữa để gửi lại.`);
      }
    }
    
    return await userModel.requestUpgrade(id);
  },

  getPendingUpgradeRequests: async () => {
    return await userModel.getPendingUpgradeRequests();
  },

  approveUpgrade: async (id: string) => {
    return await userModel.approveUpgrade(id);
  },

  rejectUpgrade: async (id: string) => {
    return await userModel.rejectUpgrade(id);
  },

  delete: async (id: string) => {
    return await userModel.delete(id);
  },
};
