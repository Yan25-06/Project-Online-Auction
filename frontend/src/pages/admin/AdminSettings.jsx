import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight, Settings, Save, RefreshCw, Clock, Timer } from "lucide-react";
import { AdminService } from "../../services/adminService";

export default function AdminSettings() {
  const [autoExtendSettings, setAutoExtendSettings] = useState({
    threshold_minutes: 5,
    auto_extend_minutes: 10,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await AdminService.products.getAutoExtendSettings();
      setAutoExtendSettings(settings);
    } catch (error) {
      console.error("Error loading settings:", error);
      setMessage({ type: "error", text: "Không thể tải cấu hình" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const result = await AdminService.products.updateAutoExtendSettings(
        autoExtendSettings.threshold_minutes,
        autoExtendSettings.auto_extend_minutes
      );
      setMessage({
        type: "success",
        text: result.message || `Đã cập nhật ${result.updated} sản phẩm!`,
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Lỗi khi lưu cấu hình",
      });
    } finally {
      setSaving(false);
    }
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
              Admin Dashboard
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-900 font-medium">Cài đặt hệ thống</span>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Cài đặt hệ thống
              </h1>
            </div>
            <button
              onClick={loadSettings}
              disabled={loading}
              className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Làm mới
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Auto-Extend Settings Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <Timer className="h-5 w-5 text-orange-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Cấu hình tự động gia hạn đấu giá
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Khi có người đặt giá trong thời gian cuối của phiên đấu giá, hệ
                thống sẽ tự động gia hạn thêm thời gian để các bidder khác có cơ
                hội đặt giá.
              </p>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Đang tải...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Threshold Minutes */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 text-blue-600 mr-2" />
                        <label className="block text-sm font-medium text-gray-700">
                          Ngưỡng kích hoạt (phút)
                        </label>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={autoExtendSettings.threshold_minutes}
                        onChange={(e) =>
                          setAutoExtendSettings((prev) => ({
                            ...prev,
                            threshold_minutes: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Nếu có bid trong{" "}
                        <strong>{autoExtendSettings.threshold_minutes}</strong>{" "}
                        phút cuối → kích hoạt gia hạn
                      </p>
                    </div>

                    {/* Extension Minutes */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Timer className="h-5 w-5 text-green-600 mr-2" />
                        <label className="block text-sm font-medium text-gray-700">
                          Thời gian gia hạn (phút)
                        </label>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={autoExtendSettings.auto_extend_minutes}
                        onChange={(e) =>
                          setAutoExtendSettings((prev) => ({
                            ...prev,
                            auto_extend_minutes: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Gia hạn thêm{" "}
                        <strong>
                          {autoExtendSettings.auto_extend_minutes}
                        </strong>{" "}
                        phút khi có bid
                      </p>
                    </div>
                  </div>

                  {/* Preview Rule */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      📋 Quy tắc hiện tại:
                    </h4>
                    <p className="text-blue-700">
                      Khi có người đặt giá trong{" "}
                      <strong>
                        {autoExtendSettings.threshold_minutes} phút cuối
                      </strong>{" "}
                      của phiên đấu giá, hệ thống sẽ tự động gia hạn thêm{" "}
                      <strong>
                        {autoExtendSettings.auto_extend_minutes} phút
                      </strong>
                      .
                    </p>
                  </div>

                  {/* Save Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition font-medium"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Lưu cấu hình
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                ℹ️ Thông tin
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Cấu hình sẽ được áp dụng cho <strong>tất cả sản phẩm đang hoạt động</strong>.
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Sản phẩm mới đăng sẽ kế thừa cấu hình này.
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Giá trị hợp lệ: từ 1 đến 60 phút.
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">💡</span>
                  Giá trị mặc định: Ngưỡng = 5 phút, Gia hạn = 10 phút.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
