import { userModel } from '../models/user.model.js';

export const UserService = {
  findById: async (id: string) => {
    return await userModel.findById(id);
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

  requestUpgrade: async (id: string) => {
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
  }
};
