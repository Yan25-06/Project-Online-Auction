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
    return response.data;
  },

  search: async (q, categoryId, sortBy, page, limit) => {
    const response = await apiClient.get('/products/search', { params: { q, categoryId, sortBy, page, limit } });
    return response.data;
  },

  getEndingSoon: async (limit = 5) => {
    const response = await apiClient.get('/products/ending-soon', { params: { limit } });
    return response.data;
  },

  getMostBids: async (limit = 5) => {
    const response = await apiClient.get('/products/most-bids', { params: { limit } });
    return response.data;
  },

  getHighestPrice: async (limit = 5) => {
    const response = await apiClient.get('/products/highest-price', { params: { limit } });
    return response.data;
  },

  findBySeller: async (sellerId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/products/seller/${sellerId}`, { params: { page, limit } });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  appendDescription: async (id, description) => {
    const response = await apiClient.post(`/products/${id}/description`, { description });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/products/${id}/status`, { status });
    return response.data;
  },

  updatePrice: async (id, newPrice) => {
    const response = await apiClient.patch(`/products/${id}/price`, { newPrice });
    return response.data;
  },

  incrementView: async (id) => {
    const response = await apiClient.patch(`/products/${id}/view`);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }
};

export const CategoryService = {
  getAll: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getHierarchy: async () => {
    const response = await apiClient.get('/categories/hierarchy');
    return response.data;
  },

  getParents: async () => {
    const response = await apiClient.get('/categories/parents');
    return response.data;
  },

  getSubcategories: async (parentId) => {
    const response = await apiClient.get(`/categories/${parentId}/subcategories`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  getProductsById: async (id, page = 1, limit = 20) => {
    const response = await apiClient.get(`/categories/${id}/products`, { params: { page, limit } });
    return response.data;
  },

  create: async (categoryData) => {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  },

  update: async (id, categoryData) => {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  }
};

export const BidService = {
  create: async (bidData) => {
    const response = await apiClient.post('/bids', bidData);
    return response.data;
  },

  findByProduct: async (productId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/bids/product/${productId}`, { params: { page, limit } });
    return response.data;
  },

  getHighestBid: async (productId) => {
    const response = await apiClient.get(`/bids/product/${productId}/highest`);
    return response.data;
  },

  findByBidder: async (bidderId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/bids/bidder/${bidderId}`, { params: { page, limit } });
    return response.data;
  },

  getWinningBids: async (bidderId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/bids/bidder/${bidderId}/winning`, { params: { page, limit } });
    return response.data;
  },

  reject: async (bidId) => {
    const response = await apiClient.patch(`/bids/${bidId}/reject`);
    return response.data;
  }
};

export const WatchlistService = {
  add: async (productId) => {
    const response = await apiClient.post('/watchlists', { productId });
    return response.data;
  },

  remove: async (productId) => {
    const response = await apiClient.delete(`/watchlists/${productId}`);
    return response.data;
  },

  isInWatchlist: async (productId) => {
    const response = await apiClient.get(`/watchlists/check/${productId}`);
    return response.data;
  },

  findByUser: async (userId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/watchlists/user/${userId}`, { params: { page, limit } });
    return response.data;
  }
};

export const OrderService = {
  create: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  getByProduct: async (productId) => {
    const response = await apiClient.get(`/orders/product/${productId}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  updateShippingAddress: async (id, address) => {
    const response = await apiClient.patch(`/orders/${id}/address`, address);
    return response.data;
  },

  updatePaymentProof: async (id, proofUrl) => {
    const response = await apiClient.patch(`/orders/${id}/payment-proof`, { proofUrl });
    return response.data;
  },

  updateShippingProof: async (id, proofUrl) => {
    const response = await apiClient.patch(`/orders/${id}/shipping-proof`, { proofUrl });
    return response.data;
  },

  confirmDelivery: async (id) => {
    const response = await apiClient.patch(`/orders/${id}/confirm-delivery`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await apiClient.patch(`/orders/${id}/cancel`);
    return response.data;
  },

  findBySeller: async (sellerId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/orders/seller/${sellerId}`, { params: { page, limit } });
    return response.data;
  },

  findByWinner: async (winnerId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/orders/winner/${winnerId}`, { params: { page, limit } });
    return response.data;
  }
};

export const QuestionService = {
  create: async (questionData) => {
    const response = await apiClient.post('/questions', questionData);
    return response.data;
  },

  findByProduct: async (productId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/questions/product/${productId}`, { params: { page, limit } });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/questions/${id}`);
    return response.data;
  },

  answer: async (id, answer) => {
    const response = await apiClient.patch(`/questions/${id}/answer`, { answer });
    return response.data;
  },

  getUnansweredBySeller: async (sellerId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/questions/seller/${sellerId}/unanswered`, { params: { page, limit } });
    return response.data;
  }
};

export const RatingService = {
  upsert: async (ratingData) => {
    const response = await apiClient.post('/ratings', ratingData);
    return response.data;
  },

  findByUser: async (userId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/ratings/user/${userId}`, { params: { page, limit } });
    return response.data;
  },

  findByOrderAndRater: async (orderId, raterId) => {
    const response = await apiClient.get(`/ratings/order/${orderId}/rater/${raterId}`);
    return response.data;
  }
};

export const UserService = {
  getAll: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/users', { params: { page, limit } });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  getByEmail: async (email) => {
    const response = await apiClient.get('/users/email', { params: { email } });
    return response.data;
  },

  create: async (userData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await apiClient.patch(`/users/${id}`, userData);
    return response.data;
  },

  getPendingUpgradeRequests: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/users/upgrade-requests', { params: { page, limit } });
    return response.data;
  },

  requestUpgrade: async () => {
    const response = await apiClient.post('/users/request-upgrade');
    return response.data;
  },

  approveUpgrade: async (userId) => {
    const response = await apiClient.post(`/users/${userId}/approve-upgrade`);
    return response.data;
  },

  rejectUpgrade: async (userId) => {
    const response = await apiClient.post(`/users/${userId}/reject-upgrade`);
    return response.data;
  }
};

export const BlockedBidderService = {
  block: async (blockData) => {
    const response = await apiClient.post('/blocked-bidders', blockData);
    return response.data;
  },

  unblock: async (productId, bidderId) => {
    const response = await apiClient.delete(`/blocked-bidders/product/${productId}/bidder/${bidderId}`);
    return response.data;
  },

  isBlocked: async (productId, bidderId) => {
    const response = await apiClient.get(`/blocked-bidders/check`, { params: { productId, bidderId } });
    return response.data;
  },

  findByProduct: async (productId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/blocked-bidders/product/${productId}`, { params: { page, limit } });
    return response.data;
  }
};
