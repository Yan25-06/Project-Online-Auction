import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProductService, BlockedBidderService } from '../../services/backendService';

const BlockedBidders = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [blockedList, setBlockedList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await ProductService.findBySeller(user.id);
        setProducts(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedProduct(res.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchProducts();
  }, [user]);

  useEffect(() => {
    const fetchBlockedList = async () => {
      if (!selectedProduct) return;
      try {
        const res = await BlockedBidderService.findByProduct(selectedProduct);
        console.log('Blocked bidders:', res);
        setBlockedList(res || []);
      } catch (err) {
        console.error('Error fetching blocked list:', err);
      }
    };

    fetchBlockedList();
  }, [selectedProduct]);

  const handleUnblock = async (bidderId) => {
    if (!confirm('Bạn có chắc muốn bỏ chặn người này?')) return;

    try {
      await BlockedBidderService.unblock(selectedProduct, bidderId);
      alert('Đã bỏ chặn!');
      // Refresh
      const res = await BlockedBidderService.findByProduct(selectedProduct);
      setBlockedList(res || []);
    } catch (err) {
      console.error('Error unblocking:', err);
      alert('Không thể bỏ chặn');
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  if (products.length === 0) {
    return (
      <div>
        <h3 className="text-2xl font-bold mb-6 border-b pb-2">Danh sách chặn</h3>
        <p className="text-gray-500 italic">Bạn chưa có sản phẩm nào để quản lý danh sách chặn.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 border-b pb-2">Danh sách chặn</h3>
      
      {/* Product Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn sản phẩm:</label>
        <select
          className="w-full md:w-1/2 border border-gray-300 rounded p-2"
          value={selectedProduct || ''}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Blocked List */}
      {blockedList.length === 0 ? (
        <p className="text-gray-500 italic">Chưa có ai bị chặn cho sản phẩm này.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3">Người dùng</th>
                <th className="p-3">Email</th>
                <th className="p-3">Ngày chặn</th>
                <th className="p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {blockedList.map((blocked) => (
                <tr key={blocked.id} className="border-b">
                  <td className="p-3 font-medium">{blocked.bidder?.full_name || 'N/A'}</td>
                  <td className="p-3">{blocked.bidder?.email || 'N/A'}</td>
                  <td className="p-3 text-sm text-gray-500">
                    {new Date(blocked.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleUnblock(blocked.bidder_id)}
                      className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200"
                    >
                      Bỏ chặn
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BlockedBidders;
