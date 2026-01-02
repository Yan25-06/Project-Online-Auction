import React, { useState } from "react";
import { Calendar, AlertCircle, Plus } from "lucide-react";
import { ProductService } from "../../services/backendService";
import { useToast } from "../common/Toast";
import { useAuth } from "../../context/AuthContext";

const ProductDescriptionSection = ({
  productId,
  description,
  initialAppendedDescriptions = [],
  sellerId,
}) => {
  const toast = useToast();
  const { user } = useAuth();
  const [appendedDescriptions, setAppendedDescriptions] = useState(
    initialAppendedDescriptions
  );
  const [showAppendForm, setShowAppendForm] = useState(false);
  const [appendText, setAppendText] = useState("");
  const [appendingLoading, setAppendingLoading] = useState(false);

  const handleAppendDescription = async () => {
    if (!appendText.trim()) {
      toast.show("Vui lòng nhập nội dung bổ sung", { type: "error" });
      return;
    }

    setAppendingLoading(true);
    try {
      await ProductService.appendDescription(productId, appendText);

      // Add to local state with timestamp
      const newDescription = {
        id: Date.now().toString(),
        text: appendText,
        timestamp: new Date().toISOString(),
      };
      setAppendedDescriptions([...appendedDescriptions, newDescription]);

      // Reset form
      setAppendText("");
      setShowAppendForm(false);
      toast.show("Bổ sung mô tả thành công!", { type: "success" });
    } catch (error) {
      console.error("Lỗi bổ sung mô tả:", error);
      toast.show("Bổ sung mô tả thất bại. Vui lòng thử lại.", { type: "error" });
    } finally {
      setAppendingLoading(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
        Mô tả chi tiết sản phẩm
      </h3>

      {/* Original Description */}
      <div className="mb-8 pb-8 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
          Mô tả gốc
        </h4>
        <div
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>

      {/* Appended Descriptions */}
      {appendedDescriptions.length > 0 && (
        <div className="mb-8 pb-8 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
            Bổ sung ({appendedDescriptions.length})
          </h4>
          <div className="space-y-4">
            {appendedDescriptions.map((desc, idx) => (
              <div
                key={desc.id}
                className="bg-amber-50 border border-amber-200 rounded-lg p-4"
              >
                <p className="text-xs text-amber-700 font-semibold mb-2 flex items-center gap-2">
                  <Calendar size={14} />
                  Bổ sung ngày:{" "}
                  {new Date(desc.timestamp).toLocaleString("vi-VN")}
                </p>
                <p className="text-gray-700 leading-relaxed">{desc.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Append Description Form */}
      <div className="pt-4">
        {user?.id === sellerId ? (
          !showAppendForm ? (
            <button
              onClick={() => setShowAppendForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <Plus size={18} />
              Bổ sung mô tả
            </button>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle size={18} className="text-blue-600" />
                Thêm bổ sung mô tả sản phẩm
              </h4>
              <textarea
                value={appendText}
                onChange={(e) => setAppendText(e.target.value)}
                placeholder="Nhập nội dung bổ sung (không thể sửa mô tả cũ, chỉ có thể nối thêm thông tin mới)..."
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="5"
              />
              <p className="text-xs text-gray-500">
                {appendText.length}/1000 ký tự • Timestamp sẽ được tự động thêm
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAppendDescription}
                  disabled={appendingLoading || !appendText.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {appendingLoading ? "Đang gửi..." : "Xác nhận bổ sung"}
                </button>
                <button
                  onClick={() => {
                    setShowAppendForm(false);
                    setAppendText("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Hủy
                </button>
              </div>
            </div>
          )
        ) : null}
      </div>
    </section>
  );
};

export default ProductDescriptionSection;
