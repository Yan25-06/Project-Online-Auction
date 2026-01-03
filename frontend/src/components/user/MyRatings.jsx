import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RatingService } from '../../services/backendService';

const MyRatings = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [positiveCount, setPositiveCount] = useState(0);
  const [negativeCount, setNegativeCount] = useState(0);
  const itemsPerPage = 5;
  const totalRate = positiveCount - negativeCount;

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'vài giây trước';
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    }
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} tuần trước`;
    }
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} tháng trước`;
    }
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} năm trước`;
  };

  const fetchRatings = async (page = 1) => {
    try {
      setLoading(true);
      const res = await RatingService.findByUser(user.id, page, itemsPerPage);
      setRatings(res.data);
      setTotalCount(res.total || res.data.length);
      setPositiveCount(res.positiveCount || 0);
      setNegativeCount(res.negativeCount || 0);
      console.log(res);
    } catch (err) {
      console.log('Error fetching rating', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchRatings(pageNumber);
  }

  useEffect(() => {
    if (user?.id) fetchRatings(currentPage);
  }, [user]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading) {
    return (
      <div>
        <h3 className="text-2xl font-bold mb-6 border-b pb-2">Hồ sơ uy tín</h3>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-2">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 border-b pb-2">Hồ sơ uy tín</h3>
      
      {/* Tổng điểm */}
      <div className="flex items-center space-x-4 mb-8 bg-blue-50 p-4 rounded-lg">
        <div className="text-4xl font-bold text-blue-600">{totalRate > 0 ? '+' + totalRate : totalRate}</div>
        <div>
          <p className="font-semibold">Điểm uy tín hiện tại</p>
          <p className="text-sm text-gray-500">Dựa trên các giao dịch mua bán thành công</p>
        </div>
      </div>

      {/* List nhận xét */}
      <h4 className="font-bold text-lg mb-4">Nhận xét từ cộng đồng ({totalCount})</h4>
      
      {ratings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có nhận xét nào</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {ratings.map(rating => {
          return (
            <div key={rating.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold">{rating.rater.full_name}</span>
                  <span className="text-xs text-gray-400 ml-2">{getTimeAgo(rating.created_at)}</span>
                </div>
                {rating.score === 'positive' 
                ? <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">👍 +1</span>
                : <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">👎 -1</span>}
              </div>
              <p className="text-gray-600 mt-2">{rating.feedback}</p>
              <p className="text-xs text-gray-400 mt-1 italic">Sản phẩm: {rating.order.product.name}</p>
            </div>
          )
        })}
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
}
export default MyRatings;
