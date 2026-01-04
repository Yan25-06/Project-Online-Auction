import React, { useState } from 'react';
import { Clock, Store, XCircle, CheckCircle } from 'lucide-react';
import { UserService } from '../../services/backendService';

const UpgradeToSeller = ({ profile, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Calculate days left if rejected
  const getDaysLeftAfterRejection = () => {
    if (!profile?.upgrade_rejected_at) return 0;
    const rejectedDate = new Date(profile.upgrade_rejected_at);
    const sevenDaysLater = new Date(rejectedDate);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const now = new Date();
    const daysLeft = Math.ceil((sevenDaysLater - now) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const daysLeft = getDaysLeftAfterRejection();
  const isPending = profile?.upgrade_requested === true;
  const wasRejected = profile?.upgrade_rejected_at && daysLeft > 0;

  const handleRequestUpgrade = async () => {
    try {
      setLoading(true);
      setError(null);
      // Truyền profile.id vào requestUpgrade theo route backend
      await UserService.requestUpgrade(profile.id);
      setSuccess(true);
      if (onRefresh) await onRefresh();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Gửi yêu cầu thất bại';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 border-b pb-2">Đăng ký trở thành Người bán</h3>
      
      <div className="max-w-2xl">
        {/* Benefits */}
        <div className="bg-linear-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100 mb-6">
          <h4 className="font-bold text-lg text-blue-800 mb-4 flex items-center gap-2">
            <Store size={20} /> Lợi ích khi trở thành Người bán
          </h4>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Đăng bán sản phẩm đấu giá không giới hạn</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Quản lý sản phẩm và theo dõi lượt đấu giá</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Nhận thanh toán an toàn qua hệ thống</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Hỗ trợ ưu tiên từ đội ngũ chăm sóc khách hàng</span>
            </li>
          </ul>
        </div>

        {/* Status display */}
        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <div>
                <h4 className="font-bold text-yellow-800">Đang chờ duyệt</h4>
                <p className="text-sm text-yellow-700">
                  Yêu cầu của bạn đã được gửi và đang chờ Admin phê duyệt.
                  Thời gian xử lý thông thường từ 1-3 ngày làm việc.
                </p>
              </div>
            </div>
          </div>
        )}

        {wasRejected && !isPending && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-red-800">Yêu cầu đã bị từ chối</h4>
                <p className="text-sm text-red-700">
                  Yêu cầu nâng cấp trước đó của bạn đã bị từ chối. 
                  Bạn có thể gửi lại yêu cầu sau <strong>{daysLeft} ngày</strong> nữa.
                </p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-green-800">Gửi yêu cầu thành công!</h4>
                <p className="text-sm text-green-700">
                  Yêu cầu của bạn đã được gửi đến Admin. Vui lòng chờ phê duyệt.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Action button */}
        {!isPending && !success && (
          <button
            onClick={handleRequestUpgrade}
            disabled={loading || wasRejected}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              loading || wasRejected
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-linear-to-r from-blue-600 to-purple-600 text-black dark:text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang gửi...
              </span>
            ) : wasRejected ? (
              `Gửi lại sau ${daysLeft} ngày`
            ) : (
              'Gửi yêu cầu nâng cấp'
            )}
          </button>
        )}

        {/* Requirements note */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h5 className="font-semibold text-gray-700 mb-2">Lưu ý:</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Tài khoản cần có điểm đánh giá tốt để được duyệt nhanh hơn</li>
            <li>• Admin sẽ xem xét lịch sử giao dịch của bạn trước khi phê duyệt</li>
            <li>• Nếu bị từ chối, bạn có thể gửi lại yêu cầu sau 7 ngày</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UpgradeToSeller