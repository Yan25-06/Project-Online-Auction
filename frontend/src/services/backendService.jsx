import axios from 'axios';

// 1. Create the Axios Instance
// We don't export this directly to force the app to use the functions below
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Your Express Backend URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add interceptors (e.g., for attaching tokens)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// 2. Define Custom Service Functions
// These functions wrap the axios calls

export const ProductService = {
  getAll: async (params) => {
    const response = await apiClient.get('/products', { params });
    return response.data; // Return only the data, not the whole HTTP object
  },

  getEndingSoon: async () => {
    return ProductService.getAll({ sort: 'ends_at', order: 'asc', limit: 5 });
  },

  getTopBids: async () => {
    return ProductService.getAll({ sort: 'bid_count', order: 'desc', limit: 5 });
  },

  getTopPrices: async () => {
    return ProductService.getAll({ sort: 'current_price', order: 'desc', limit: 5 });
  },

  getById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (productData) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },
  
  countByCategory: async () => {
      // Based on your previous context about counting products
      const response = await apiClient.get('/products/count-by-category');
      return response.data;
  }
};

export const CategoryService = {
  getAll: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getProductsById: async (id) => {
    const response = await apiClient.get(`/categories/${id}/products`);
    return response.data;
  }
};

export const AuthService = {
    loginUser: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    registerUser: async (credentials) => {
        const response = await apiClient.post('/auth/register', credentials);
        return response.data;
    }
}
