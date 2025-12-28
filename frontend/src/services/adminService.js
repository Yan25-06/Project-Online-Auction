import axios from "axios";
import { supabase } from "../config/supabase";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AdminService = {
  // User Management
  users: {
    getAll: async (page = 1, limit = 20) => {
      const response = await apiClient.get("/users", {
        params: { page, limit },
      });
      return response.data;
    },

    getById: async (id) => {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    },

    update: async (id, userData) => {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    },

    delete: async (id) => {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    },

    getPendingUpgrades: async () => {
      const response = await apiClient.get("/users/upgrade-requests");
      return response.data;
    },

    approveUpgrade: async (id) => {
      const response = await apiClient.post(`/users/${id}/approve-upgrade`);
      return response.data;
    },

    rejectUpgrade: async (id) => {
      const response = await apiClient.post(`/users/${id}/reject-upgrade`);
      return response.data;
    },
  },

  // Category Management
  categories: {
    getAll: async () => {
      const response = await apiClient.get("/categories");
      return response.data;
    },

    getById: async (id) => {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data;
    },

    create: async (categoryData) => {
      const response = await apiClient.post("/categories", categoryData);
      return response.data;
    },

    update: async (id, categoryData) => {
      const response = await apiClient.put(`/categories/${id}`, categoryData);
      return response.data;
    },

    delete: async (id) => {
      const response = await apiClient.delete(`/categories/${id}`);
      return response.data;
    },
  },

  // Product Management
  products: {
    getAll: async (page = 1, limit = 20, status = null) => {
      const params = { page, limit };
      if (status) params.status = status;
      const response = await apiClient.get("/products/admin/all", {
        params,
      });
      return response.data;
    },

    getById: async (id) => {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    },

    updateStatus: async (id, status) => {
      const response = await apiClient.patch(`/products/${id}/status`, {
        status,
      });
      return response.data;
    },

    delete: async (id) => {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    },
  },
};
