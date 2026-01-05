import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { BidService, RatingService, OrderService } from '../../services/backendService';

const WonProducts = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ratingStates, setRatingStates] = useState({});
  const [orders, setOrders] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        const res = await BidService.getWinningBids(user.id);
        console.log(res);
        setBids(res);
        
        // Fetch orders for each product
        const ordersMap = {};
        for (const bid of res) {
          try {
            const order = await OrderService.getByProduct(bid.product.id);
            if (order) {
              ordersMap[bid.product.id] = order;
            }
          } catch (err) {
            // Order doesn't exist, skip
            console.log('No order for product', bid.product.id);
          }
        }
        setOrders(ordersMap);
      }
      catch (err) {
        console.log('Error fetching bids', err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) fetchBids();

  }, [user]);

  const handleRatingChange = (bidId, type, value) => {
    setRatingStates(prev => ({
      ...prev,
      [bidId]: {
        ...prev[bidId],
        [type]: value
      }
    }));
  };

  const submitRating = async (bid) => {
    const state = ratingStates[bid.id] || {};
    if (!state.score) {
      toast.show('Vui lòng chọn đánh giá (Hài lòng hoặc Không hài lòng)', { type: 'error' });
      return;
    }

    try {
      const order = orders[bid.product.id];
      if (!order) {
        toast.show('Không tìm thấy đơn hàng cho sản phẩm này', { type: 'error' });
        return;
      }

      // Get seller ID from the nested seller object or fallback to seller_id
      const sellerId = bid.product.seller?.id || bid.product.seller_id;
      
      if (!sellerId) {
        toast.show('Không tìm thấy thông tin người bán', { type: 'error' });
        return;
      }

      // Submit the rating with the order ID
      await RatingService.upsert({
        orderId: order.id,
        ratingUserId: user.id,
        ratedUserId: sellerId,
        score: state.score,
        feedback: state.feedback || ''
      });
      
      toast.show('Đánh giá đã được gửi thành công!', { type: 'success' });
      // Clear rating state for this bid
      setRatingStates(prev => {
        const newState = { ...prev };
        delete newState[bid.id];
        return newState;
      });
    } catch (err) {
      console.error('Rating error:', err);
      toast.show('Lỗi khi gửi đánh giá: ' + (err.response?.data?.error || err.message), { type: 'error' });
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(bids.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBids = bids.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div>
        <h3 className="text-2xl font-bold mb-6 border-b pb-2">Sản phẩm đã thắng</h3>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-2">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 border-b pb-2">Sản phẩm đã thắng ({bids.length})</h3>
      
      {bids.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Bạn chưa thắng sản phẩm nào</p>
        </div>
      ) : (
        <div className="space-y-6">
          {currentBids.map(bid => (
            <div key={bid.id} className="border rounded-lg p-4">
              <Link to={`/my-orders`} className="flex justify-between mb-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden shrink-0">
                    {bid.product?.main_image_url ? (
                      <img 
                        src={bid.product.main_image_url} 
                        alt={bid.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{bid.product?.name}</h4>
                    <p className="text-sm text-gray-500">
                      Người bán: <span className="text-blue-600 cursor-pointer">{bid.product?.seller?.full_name || 'Không rõ'}</span>
                    </p>
                    <p className="text-green-600 font-bold text-xl mt-1">
                      Giá thắng: {bid.bid_amount?.toLocaleString('vi-VN')} đ
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Đấu giá lúc: {new Date(bid.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Đã thắng
                  </span>
                </div>
              </Link>

              {/* Form đánh giá người bán - Only show if order exists */}
              {orders[bid.product.id] ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
                  <p className="font-bold text-sm mb-2 text-gray-700">Đánh giá người bán:</p>
                  <div className="flex gap-2 mb-3">
                    <button 
                      onClick={() => handleRatingChange(bid.id, 'score', 'positive')}
                      className={`flex items-center gap-1 px-3 py-1 rounded transition ${
                        ratingStates[bid.id]?.score === 'positive'
                          ? 'bg-green-500 text-white border-green-600'
                          : 'bg-white border border-gray-300 hover:bg-green-50 hover:border-green-500 hover:text-green-600'
                      }`}
                    >
                      👍 Hài lòng (+1)
                    </button>
                    <button 
                      onClick={() => handleRatingChange(bid.id, 'score', 'negative')}
                      className={`flex items-center gap-1 px-3 py-1 rounded transition ${
                        ratingStates[bid.id]?.score === 'negative'
                          ? 'bg-red-500 text-white border-red-600'
                          : 'bg-white border border-gray-300 hover:bg-red-50 hover:border-red-500 hover:text-red-600'
                      }`}
                    >
                      👎 Không hài lòng (-1)
                    </button>
                  </div>
                  <textarea 
                    value={ratingStates[bid.id]?.feedback || ''}
                    onChange={(e) => handleRatingChange(bid.id, 'feedback', e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500" 
                    placeholder="Nhập nhận xét của bạn về người bán này (ví dụ: Giao hàng nhanh, đóng gói kỹ...)"
                    rows="2"
                  ></textarea>
                  <div className="text-right mt-2">
                    <button 
                      onClick={() => submitRating(bid)}
                      className="bg-gray-800 text-white text-sm px-4 py-2 rounded hover:bg-black"
                    >
                      Gửi đánh giá
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-2">
                  <p className="text-sm text-yellow-800">
                    ⏳ Đơn hàng chưa được tạo. Vui lòng đợi người bán xác nhận đơn hàng để có thể đánh giá.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default WonProducts;
