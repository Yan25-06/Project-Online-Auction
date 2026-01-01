import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight, CheckCircle, XCircle, User, Mail, Calendar, Star } from "lucide-react";
import { AdminService } from "../../services/adminService";

export default function AdminUpgradeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await AdminService.users.getPendingUpgrades();
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading upgrade requests:", error);
      alert("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, userName) => {
    if (!confirm(`Bạn có chắc muốn duyệt yêu cầu của "${userName}"?`)) return;

    try {
      await AdminService.users.approveUpgrade(userId);
      alert("Đã duyệt yêu cầu nâng cấp thành công!");
      loadRequests();
    } catch (error) {
      console.error("Error approving upgrade:", error);
      alert("Duyệt yêu cầu thất bại");
    }
  };

  const handleReject = async (userId, userName) => {
    if (!confirm(`Bạn có chắc muốn từ chối yêu cầu của "${userName}"? Người dùng sẽ phải chờ 7 ngày để gửi lại.`)) return;

    try {
      await AdminService.users.rejectUpgrade(userId);
      alert("Đã từ chối yêu cầu nâng cấp");
      loadRequests();
    } catch (error) {
      console.error("Error rejecting upgrade:", error);
      alert("Từ chối yêu cầu thất bại");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Rating score is stored as decimal (0.80 = 80%)
  const formatRating = (user) => {
    if (!user.total_ratings || user.total_ratings === 0) {
      return <span className="text-gray-400 italic">Chưa có đánh giá</span>;
    }
    const score = (user.rating_score || 0) * 100;
    const colorClass = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
    return (
      <span className={`font-medium ${colorClass}`}>
        {user.positive_ratings}+/{user.total_ratings - user.positive_ratings}- ({score.toFixed(0)}%)
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link to="/" className="flex items-center hover:text-blue-600">
              <Home size={16} className="mr-1" /> Trang chủ
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link to="/admin" className="hover:text-blue-600">
              Trang quản trị
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-900 font-medium">Yêu cầu nâng cấp Seller</span>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Yêu cầu nâng cấp Seller
              </h1>
              <p className="text-gray-500 mt-1">Quản lý các yêu cầu nâng cấp từ Bidder lên Seller</p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
              {requests.length} yêu cầu đang chờ
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white shadow sm:rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có yêu cầu nào</h3>
              <p className="text-gray-500">Hiện tại không có yêu cầu nâng cấp nào đang chờ duyệt.</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <User size={14} /> Người dùng
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Mail size={14} /> Email
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} /> Ngày gửi
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Star size={14} /> Điểm đánh giá
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {(user.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'Không tên'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.upgrade_requested_at
                            ? formatDate(user.upgrade_requested_at)
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatRating(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(user.id, user.full_name)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
                          >
                            <CheckCircle size={16} /> Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(user.id, user.full_name)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                          >
                            <XCircle size={16} /> Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
