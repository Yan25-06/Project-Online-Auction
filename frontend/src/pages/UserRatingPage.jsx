import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ThumbsUp, ThumbsDown, ArrowLeft, Package } from 'lucide-react';
import { UserService, RatingService } from '../services/backendService';
import { formatPostDate } from '../utils/formatters';

const UserRatingPage = () => {
  const { id } = useParams();
  
  const [user, setUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // 1. Lấy thông tin chi tiết người dùng
        const userData = await UserService.getById(id);
        setUser(userData);

        // 2. Lấy danh sách các đánh giá mà người dùng này nhận được
        try {
          const ratingsData = await RatingService.findByUser(id);
          const allRatings = Array.isArray(ratingsData) ? ratingsData : ratingsData.data || [];
          setRatings(allRatings);
        } catch (e) {
          console.error('Error fetching ratings:', e);
          setRatings([]);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md mx-auto">
          <p className="text-lg font-semibold">{error || 'Không tìm thấy người dùng'}</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
            <ArrowLeft size={16} /> Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Logic hiển thị điểm số
  const totalRatings = user.total_ratings || 0;
  const positiveRatings = user.positive_ratings || 0;
  const negativeRatings = totalRatings - positiveRatings;
  const userAverageScore = user.rating_score || 0; // Điểm trung bình từ 0.0 - 1.0
  const ratingPercentage = totalRatings > 0 ? (userAverageScore * 100).toFixed(1) : '0.0';

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={18} /> Quay lại
      </Link>

      {/* User Header Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{user.full_name || 'Người dùng'}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            user.role === 'seller' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {user.role === 'seller' ? '🏪 Người bán' : '🛍️ Người mua'}
          </span>
        </div>

        {/* Rating Display Summary */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex flex-wrap items-center gap-8 mb-4">
            <div className="flex items-center gap-3">
              <Star className="fill-yellow-400 text-yellow-400" size={32} />
              <span className="text-4xl font-black text-gray-900">{ratingPercentage}%</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-green-200 shadow-sm">
                <ThumbsUp className="text-green-600" size={20} />
                <span className="font-bold text-green-700">{positiveRatings}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-red-200 shadow-sm">
                <ThumbsDown className="text-red-600" size={20} />
                <span className="font-bold text-red-700">{negativeRatings}</span>
              </div>
              <span className="text-gray-500 text-sm italic">Dựa trên {totalRatings} lượt đánh giá</span>
            </div>
          </div>

          {/* Progress Bar */}
          {totalRatings > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  userAverageScore >= 0.80 ? 'bg-green-500' : 
                  userAverageScore >= 0.50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${ratingPercentage}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Ratings Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Package className="text-blue-600" size={20} />
          <h2 className="text-xl font-bold text-gray-900">Lịch sử đánh giá</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{ratings.length} đánh giá</span>
        </div>

            {ratings.length > 0 ? (
              <div className="space-y-4">
                {ratings.map((item) => {
                  const isPositive = item.score === 'positive';
                  return (
                    <div key={item.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                            isPositive ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {isPositive ? <ThumbsUp size={18} /> : <ThumbsDown size={18} />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{item.rater?.full_name || 'Người dùng'}</p>
                            <p className="text-xs text-gray-400">{formatPostDate(item.created_at)}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                          isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isPositive ? 'TÍCH CỰC' : 'TIÊU CỰC'}
                        </span>
                      </div>
                      {item.feedback && (
                        <p className="text-gray-600 text-sm bg-white p-3 rounded-lg border border-gray-50 mt-2">
                          "{item.feedback}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-200">
                  <Star size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium mb-1">Chưa có đánh giá nào</p>
                  <p className="text-sm text-gray-400">Người dùng này chưa nhận được đánh giá từ ai</p>
                </div>
              </div>
            )}
        </div>
    </div>
  );
};

export default UserRatingPage;
