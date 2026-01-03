import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OrderService } from "../services/backendService";
import { supabase } from "../config/supabase";
import { Clock, Package, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import "./MyOrdersPage.css";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("buyer"); // 'buyer' or 'seller'

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setCurrentUser(user);

      // Fetch orders as buyer (winner)
      const buyerData = await OrderService.findByWinner(user.id);
      setBuyerOrders(buyerData.data || []);

      // Fetch orders as seller
      const sellerData = await OrderService.findBySeller(user.id);
      setSellerOrders(sellerData.data || []);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_payment: {
        label: "Chờ thanh toán",
        color: "orange",
        icon: Clock,
      },
      paid: { label: "Đã thanh toán", color: "blue", icon: Package },
      shipped: { label: "Đã gửi hàng", color: "purple", icon: Package },
      delivered: { label: "Đã nhận hàng", color: "green", icon: CheckCircle },
      completed: { label: "Hoàn tất", color: "teal", icon: CheckCircle },
      cancelled: { label: "Đã hủy", color: "red", icon: XCircle },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "gray",
      icon: Clock,
    };
    const Icon = config.icon;

    return (
      <span className={`status-badge status-${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const OrderCard = ({ order, role }) => {
    const product = order.product;
    const otherParty = role === "buyer" ? order.seller : order.winner;

    return (
      <div className="order-card">
        <div className="order-header">
          <div className="order-info">
            <img
              src={product?.main_image_url || "https://via.placeholder.com/80"}
              alt={product?.name}
              className="order-image"
            />
            <div className="order-details">
              <h3>{product?.name || "Unknown Product"}</h3>
              <p className="order-price">
                {order.final_price?.toLocaleString()} VND
              </p>
              <p className="order-party">
                {role === "buyer" ? "Người bán" : "Người mua"}:{" "}
                {otherParty?.full_name || "Unknown"}
              </p>
            </div>
          </div>
          <div className="order-status">{getStatusBadge(order.status)}</div>
        </div>

        <div className="order-actions">
          <Link to={`/orders/${order.id}`} className="btn-view-order">
            Xem chi tiết đơn hàng
            <ArrowRight size={16} />
          </Link>
        </div>

        {order.status === "cancelled" && order.cancellation_reason && (
          <div className="cancellation-notice">
            <XCircle size={16} />
            <span>Lý do hủy: {order.cancellation_reason}</span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="loading">Đang tải đơn hàng...</div>
      </div>
    );
  }

  const ordersToShow = activeTab === "buyer" ? buyerOrders : sellerOrders;

  return (
    <div className="my-orders-page">
      <div className="page-header">
        <h1>Đơn Hàng Của Tôi</h1>
        <p>Quản lý các đơn hàng đấu giá đã kết thúc</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "buyer" ? "active" : ""}`}
          onClick={() => setActiveTab("buyer")}
        >
          Tôi là người mua ({buyerOrders.length})
        </button>
        <button
          className={`tab ${activeTab === "seller" ? "active" : ""}`}
          onClick={() => setActiveTab("seller")}
        >
          Tôi là người bán ({sellerOrders.length})
        </button>
      </div>

      <div className="orders-list">
        {ordersToShow.length === 0 ? (
          <div className="empty-state">
            <Package size={64} className="empty-icon" />
            <h3>Chưa có đơn hàng nào</h3>
            <p>
              {activeTab === "buyer"
                ? "Bạn chưa thắng phiên đấu giá nào."
                : "Bạn chưa có sản phẩm nào được bán."}
            </p>
            <Link to="/" className="btn-browse">
              Xem sản phẩm đấu giá
            </Link>
          </div>
        ) : (
          ordersToShow.map((order) => (
            <OrderCard key={order.id} order={order} role={activeTab} />
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
