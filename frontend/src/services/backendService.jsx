import axios from 'axios';
import { CATEGORIES, MOCK_PRODUCTS } from '../data/mockData';
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

const initDB = () => {
  const existingData = localStorage.getItem('PRODUCTS_DB');
  if (!existingData) {
    localStorage.setItem('PRODUCTS_DB', JSON.stringify(MOCK_PRODUCTS));
  }
};

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
    return ProductService.getAll({ sort: 'current_price', order: 'desc', limit: 5});
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
  },
  search: async ({ keyword, categoryId, sort, page = 1, limit = 8 }) => {
    initDB();
    await new Promise(r => setTimeout(r, 600)); // Delay giả lập mạng

    // 1. Lấy dữ liệu gốc
    let products = JSON.parse(localStorage.getItem('PRODUCTS_DB')) || [];

    // 2. Lọc theo Tên (Keyword)
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(lowerKeyword));
    }

    // 3. Lọc theo Danh mục (CategoryId)
    if (categoryId) {
      const targetIds = [categoryId];
      
      const childCats = CATEGORIES.filter(c => c.parentId === categoryId);
      childCats.forEach(child => targetIds.push(child.id));

      // Lọc sản phẩm nằm trong danh sách ID (Cha + Con)
      products = products.filter(p => targetIds.includes(p.categoryId));
    }

    // 4. Sắp xếp (Sort)
    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'ends_soon') {
      products.sort((a, b) => new Date(a.timeLeft) - new Date(b.timeLeft));
    }

    // 5. Phân trang (Pagination)
    const totalItems = products.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedData = products.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages
      }
    };
  },

  // --- ĐẤU GIÁ (RA GIÁ) ---
  placeBid: async (productId, price) => {
    await new Promise(r => setTimeout(r, 800));
    
    // 1. Check Login
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!token || !currentUser) throw new Error("Vui lòng đăng nhập!");

    // 2. Lấy DB
    const products = JSON.parse(localStorage.getItem('PRODUCTS_DB'));
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) throw new Error("Sản phẩm không tồn tại");
    
    const product = products[index];

    // 3. Validate Giá
    if (price <= product.price) throw new Error("Giá đặt phải cao hơn giá hiện tại!");
    
    // 4. Tạo Bid Mới
    const newBid = {
      id: `bid_${Date.now()}`,
      bidderId: currentUser.id,
      bidderName: currentUser.fullName || currentUser.email,
      price: price,
      time: new Date().toISOString()
    };

    // 5. Logic tự động gia hạn (Nếu < 5 phút -> Cộng 10 phút)
    const now = new Date();
    const timeLeft = new Date(product.timeLeft);
    const diffMinutes = (timeLeft - now) / 1000 / 60;
    
    if (diffMinutes > 0 && diffMinutes <= 5) {
       product.timeLeft = new Date(timeLeft.getTime() + 10 * 60 * 1000).toISOString();
    }

    // 6. Cập nhật và Lưu
    product.bids.unshift(newBid);
    product.price = price;
    product.bidCount += 1;
    products[index] = product;
    
    localStorage.setItem('PRODUCTS_DB', JSON.stringify(products));

    return { success: true, newPrice: price };
  }
};

export const CategoryService = {
  getAll: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getProductsById: async (id) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  }
};

// // You can also export standalone functions if you prefer that style over objects:
// export const AuthService = {
//     loginUser: async (credentials) => {
//         const response = await apiClient.post('/auth/login', credentials);
//         return response.data;
//     },

//     registerUser: async (credentials) => {
//         const response = await apiClient.post('/auth/register', credentials);
//         return response.data;
//     }
// }
