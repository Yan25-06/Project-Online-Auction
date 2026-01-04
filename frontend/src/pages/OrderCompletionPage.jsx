import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OrderService, ProductService } from "../services/backendService";
import { supabase } from "../config/supabase";
import "./OrderCompletionPage.css";

const OrderCompletionPage = () => {
  const { orderId, productId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [shippingProofUrl, setShippingProofUrl] = useState("");
  const [rating, setRating] = useState("positive");
  const [feedback, setFeedback] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    loadData();
  }, [orderId, productId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      let orderData;

      // Fetch order by ID or by product
      if (orderId) {
        orderData = await OrderService.getById(orderId);
      } else if (productId) {
        orderData = await OrderService.getByProduct(productId);
      }

      if (!orderData) {
        throw new Error("Order not found");
      }

      setOrder(orderData);

      // Fetch product details
      const productData = await ProductService.getById(orderData.product_id);
      setProduct(productData);

      // Pre-fill shipping address if exists
      if (orderData.shipping_address) {
        setShippingAddress(orderData.shipping_address);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error loading order:", err);
    } finally {
      setLoading(false);
    }
  };

  const isSeller = currentUser?.id === order?.seller_id;
  const isBuyer = currentUser?.id === order?.winner_id;

  const handleStep1Submit = async () => {
    try {
      if (!shippingAddress || !paymentProofUrl) {
        alert("Vui lòng nhập đầy đủ địa chỉ giao hàng và hoá đơn thanh toán");
        return;
      }

      await OrderService.submitPaymentAndAddress(
        order.id,
        shippingAddress,
        paymentProofUrl
      );
      alert("Đã gửi thông tin thanh toán thành công!");
      loadData();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleStep2Submit = async () => {
    try {
      if (!shippingProofUrl) {
        alert("Vui lòng nhập hoá đơn vận chuyển");
        return;
      }

      await OrderService.confirmPaymentAndShipping(order.id, shippingProofUrl);
      alert("Đã xác nhận và gửi hoá đơn vận chuyển!");
      loadData();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleStep3Submit = async () => {
    try {
      await OrderService.confirmDelivery(order.id);
      alert("Đã xác nhận nhận hàng!");
      loadData();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleRatingSubmit = async () => {
    try {
      await OrderService.submitRating(order.id, rating, feedback);
      alert("Đã gửi đánh giá thành công!");
      loadData();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleSellerCancel = async () => {
    try {
      if (
        !window.confirm(
          "Bạn có chắc muốn hủy giao dịch? Người mua sẽ nhận đánh giá -1."
        )
      ) {
        return;
      }

      await OrderService.cancelBySeller(order.id, cancelReason);
      alert("Đã hủy giao dịch và đánh giá người mua!");
      loadData();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const getMyRating = () => {
    if (!order?.ratings || !currentUser) return null;
    return order.ratings.find((r) => r.rating_user_id === currentUser.id);
  };

  const getOtherRating = () => {
    if (!order?.ratings || !currentUser) return null;
    return order.ratings.find((r) => r.rating_user_id !== currentUser.id);
  };

  if (loading) return <div className="order-completion-page">Đang tải...</div>;
  if (error) return <div className="order-completion-page">Lỗi: {error}</div>;
  if (!order || !product)
    return <div className="order-completion-page">Không tìm thấy đơn hàng</div>;

  if (!isSeller && !isBuyer) {
    return (
      <div className="order-completion-page">
        <div className="product-ended-notice">
          <h2>Sản phẩm đã kết thúc</h2>
          <p>Phiên đấu giá cho sản phẩm này đã kết thúc.</p>
          <button onClick={() => navigate(`/products/${product.id}`)}>
            Xem thông tin sản phẩm
          </button>
        </div>
      </div>
    );
  }

  const myRating = getMyRating();
  const otherRating = getOtherRating();

  return (
    <div className="order-completion-page">
      <h1>Hoàn Tất Đơn Hàng</h1>

      <div className="product-info">
        <h2>{product.name}</h2>
        <p>Giá cuối: {order.final_price.toLocaleString()} VND</p>
        <p>
          Trạng thái:{" "}
          <span className={`status-${order.status}`}>
            {getStatusText(order.status)}
          </span>
        </p>
      </div>

      {order.status === "cancelled" ? (
        <div className="cancelled-notice">
          <h3>Giao dịch đã bị hủy</h3>
          <p>
            Người hủy:{" "}
            {order.cancelled_by === "seller" ? "Người bán" : "Người mua"}
          </p>
          {order.cancellation_reason && (
            <p>Lý do: {order.cancellation_reason}</p>
          )}
        </div>
      ) : (
        <div className="order-steps">
          {/* Step 1: Buyer provides payment proof and shipping address */}
          <div
            className={`step ${
              order.status === "pending_payment" ? "active" : "completed"
            }`}
          >
            <h3>
              Bước 1: Người mua cung cấp hoá đơn thanh toán và địa chỉ giao hàng
            </h3>
            {isBuyer && order.status === "pending_payment" && (
              <div className="step-form">
                <input
                  type="text"
                  placeholder="Địa chỉ giao hàng"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="URL hoá đơn thanh toán"
                  value={paymentProofUrl}
                  onChange={(e) => setPaymentProofUrl(e.target.value)}
                />
                <button onClick={handleStep1Submit}>Gửi thông tin</button>
              </div>
            )}
            {order.shipping_address && (
              <div className="step-info">
                <p>Địa chỉ: {order.shipping_address}</p>
                {order.payment_proof_url && (
                  <p>
                    Hoá đơn thanh toán:
                    <a
                      href={order.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Xem
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Seller confirms payment and provides shipping proof */}
          <div
            className={`step ${
              order.status === "paid"
                ? "active"
                : order.status !== "pending_payment"
                ? "completed"
                : ""
            }`}
          >
            <h3>
              Bước 2: Người bán xác nhận đã nhận tiền và gửi hoá đơn vận chuyển
            </h3>
            {isSeller && order.status === "paid" && (
              <div className="step-form">
                <input
                  type="text"
                  placeholder="URL hoá đơn vận chuyển"
                  value={shippingProofUrl}
                  onChange={(e) => setShippingProofUrl(e.target.value)}
                />
                <button onClick={handleStep2Submit}>Xác nhận gửi hàng</button>
              </div>
            )}
            {order.shipping_proof_url && (
              <div className="step-info">
                <p>
                  Hoá đơn vận chuyển:
                  <a
                    href={order.shipping_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Xem
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Step 3: Buyer confirms delivery */}
          <div
            className={`step ${
              order.status === "shipped"
                ? "active"
                : order.status === "delivered" || order.status === "completed"
                ? "completed"
                : ""
            }`}
          >
            <h3>Bước 3: Người mua xác nhận đã nhận hàng</h3>
            {isBuyer && order.status === "shipped" && (
              <div className="step-form">
                <button onClick={handleStep3Submit}>
                  Xác nhận đã nhận hàng
                </button>
              </div>
            )}
            {(order.status === "delivered" || order.status === "completed") && (
              <div className="step-info">
                <p>✓ Đã xác nhận nhận hàng</p>
              </div>
            )}
          </div>

          {/* Step 4: Rating */}
          <div
            className={`step ${
              order.status === "delivered" || order.status === "completed"
                ? "active"
                : ""
            }`}
          >
            <h3>Bước 4: Đánh giá chất lượng giao dịch</h3>

            {(order.status === "delivered" || order.status === "completed") && (
              <div className="rating-section">
                {myRating ? (
                  <div className="my-rating">
                    <p>
                      Đánh giá của bạn:{" "}
                      {myRating.score === "positive" ? "+1" : "-1"}
                    </p>
                    <p>Nhận xét: {myRating.feedback || "Không có"}</p>
                    <p className="rating-note">
                      Bạn có thể thay đổi đánh giá bất cứ lúc nào:
                    </p>
                  </div>
                ) : (
                  <p>Bạn chưa đánh giá giao dịch này</p>
                )}

                <div className="step-form">
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="positive">Tích cực (+1)</option>
                    <option value="negative">Tiêu cực (-1)</option>
                  </select>
                  <textarea
                    placeholder="Nhận xét ngắn (tùy chọn)"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                  />
                  <button onClick={handleRatingSubmit}>
                    {myRating ? "Cập nhật đánh giá" : "Gửi đánh giá"}
                  </button>
                </div>

                {otherRating && (
                  <div className="other-rating">
                    <p>
                      Đánh giá từ {isSeller ? "người mua" : "người bán"}:{" "}
                      {otherRating.score === "positive" ? "+1" : "-1"}
                    </p>
                    {otherRating.feedback && (
                      <p>Nhận xét: {otherRating.feedback}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seller cancel option */}
      {isSeller &&
        order.status !== "cancelled" &&
        order.status !== "completed" && (
          <div className="cancel-section">
            <h3>Hủy giao dịch</h3>
            <p className="warning">
              Nếu người mua không đáp ứng yêu cầu thanh toán, bạn có thể hủy
              giao dịch. Người mua sẽ nhận đánh giá -1.
            </p>
            <textarea
              placeholder="Lý do hủy giao dịch"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
            <button onClick={handleSellerCancel} className="cancel-button">
              Hủy giao dịch
            </button>
          </div>
        )}
    </div>
  );
};

const getStatusText = (status) => {
  const statusMap = {
    pending_payment: "Chờ thanh toán",
    paid: "Đã thanh toán",
    shipped: "Đã gửi hàng",
    delivered: "Đã nhận hàng",
    completed: "Hoàn tất",
    cancelled: "Đã hủy",
  };
  return statusMap[status] || status;
};

export default OrderCompletionPage;
