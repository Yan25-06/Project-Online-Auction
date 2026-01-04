import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProductService } from '../../services/backendService';
import ProductCard from '../product/ProductCard';

const MyProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, sold: 0, closed: 0 });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await ProductService.findBySeller(user.id);
        console.log('Seller products:', res);
        setProducts(res.data || []);
        
        // Calculate stats
        const active = res.data?.filter(p => p.status === 'active').length || 0;
        const sold = res.data?.filter(p => p.status === 'sold').length || 0;
        const closed = res.data?.filter(p => p.status === 'closed').length || 0;
        setStats({ active, sold, closed });
      } catch (err) {
        console.error('Error fetching seller products:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchProducts();
  }, [user]);

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 border-b pb-2">Sản phẩm của tôi</h3>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Đang bán</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
          <div className="text-sm text-gray-600">Đã bán</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
          <div className="text-sm text-gray-600">Đã đóng</div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <p className="text-gray-500 italic">Bạn chưa đăng sản phẩm nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
