import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

function MyOrders() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/orders/customer/${currentUser.id}`);

      const sortedOrders = [...response.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sortedOrders);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toFixed(2)}`;
  };

  const showToast = (toastData) => {
    setToast(toastData);

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const isActiveOrder = (status) => {
    return status !== "DELIVERED" && status !== "CANCELLED";
  };

  const canCancelOrder = (order) => {
    return order.status === "PENDING";
  };

  const orderData = useMemo(() => {
    const activeOrders = orders.filter((order) => isActiveOrder(order.status));
    const deliveredOrders = orders.filter(
      (order) => order.status === "DELIVERED"
    );
    const cancelledOrders = orders.filter(
      (order) => order.status === "CANCELLED"
    );

    const totalSpent = orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((total, order) => total + Number(order.totalAmount || 0), 0);

    return {
      totalOrders: orders.length,
      activeOrders,
      deliveredOrders,
      cancelledOrders,
      totalSpent,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (activeFilter === "ACTIVE") {
      result = result.filter((order) => isActiveOrder(order.status));
    }

    if (activeFilter === "DELIVERED") {
      result = result.filter((order) => order.status === "DELIVERED");
    }

    if (activeFilter === "CANCELLED") {
      result = result.filter((order) => order.status === "CANCELLED");
    }

    if (searchTerm.trim()) {
      const keyword = searchTerm.toLowerCase();

      result = result.filter((order) => {
        const orderIdMatch = String(order.id).includes(keyword);
        const statusMatch = order.status?.toLowerCase().includes(keyword);

        const foodMatch = order.orderItems?.some((item) =>
          item.foodItem?.name?.toLowerCase().includes(keyword)
        );

        return orderIdMatch || statusMatch || foodMatch;
      });
    }

    return result;
  }, [orders, activeFilter, searchTerm]);

  const openCancelModal = (order) => {
    setOrderToCancel(order);
  };

  const closeCancelModal = () => {
    if (cancelling) return;
    setOrderToCancel(null);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      setCancelling(true);

      await api.put(`/orders/${orderToCancel.id}/cancel`);

      showToast({
        type: "success",
        title: "Order Cancelled",
        message: `Order #${orderToCancel.id} has been cancelled successfully.`,
      });

      setOrderToCancel(null);
      loadOrders();
    } catch (error) {
      showToast({
        type: "error",
        title: "Cancel Failed",
        message:
          error.response?.data?.message ||
          "Failed to cancel order. This order may already be processed.",
      });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="app-page">
      <Navbar />

      <PageHeader
        title="My Orders"
        subtitle="View your order history, check status, and track delivery."
      />

      <section className="my-orders-section">
        {message && <div className="error-box">{message}</div>}

        {loading ? (
          <LoadingSpinner text="Loading your orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            text="Your orders will appear here after you checkout."
            linkText="Browse Menu"
            linkTo="/menu"
          />
        ) : (
          <>
            <div className="orders-overview-grid">
              <div className="orders-overview-card">
                <div className="orders-overview-icon">📦</div>
                <div>
                  <span>Total Orders</span>
                  <strong>{orderData.totalOrders}</strong>
                </div>
              </div>

              <div className="orders-overview-card">
                <div className="orders-overview-icon">🚚</div>
                <div>
                  <span>Active Orders</span>
                  <strong>{orderData.activeOrders.length}</strong>
                </div>
              </div>

              <div className="orders-overview-card">
                <div className="orders-overview-icon">✅</div>
                <div>
                  <span>Delivered</span>
                  <strong>{orderData.deliveredOrders.length}</strong>
                </div>
              </div>

              <div className="orders-overview-card">
                <div className="orders-overview-icon">💳</div>
                <div>
                  <span>Total Spent</span>
                  <strong>{formatCurrency(orderData.totalSpent)}</strong>
                </div>
              </div>
            </div>

            <div className="orders-toolbar">
              <div>
                <h2>Order History</h2>
                <p>Search, filter, and track your food orders.</p>
              </div>

              <div className="orders-search-box">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search order ID, status, food..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {searchTerm && (
                  <button type="button" onClick={() => setSearchTerm("")}>
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="orders-filter-tabs">
              <button
                className={
                  activeFilter === "ALL"
                    ? "orders-filter-tab active-orders-filter-tab"
                    : "orders-filter-tab"
                }
                onClick={() => setActiveFilter("ALL")}
              >
                All Orders
              </button>

              <button
                className={
                  activeFilter === "ACTIVE"
                    ? "orders-filter-tab active-orders-filter-tab"
                    : "orders-filter-tab"
                }
                onClick={() => setActiveFilter("ACTIVE")}
              >
                Active
              </button>

              <button
                className={
                  activeFilter === "DELIVERED"
                    ? "orders-filter-tab active-orders-filter-tab"
                    : "orders-filter-tab"
                }
                onClick={() => setActiveFilter("DELIVERED")}
              >
                Delivered
              </button>

              <button
                className={
                  activeFilter === "CANCELLED"
                    ? "orders-filter-tab active-orders-filter-tab"
                    : "orders-filter-tab"
                }
                onClick={() => setActiveFilter("CANCELLED")}
              >
                Cancelled
              </button>
            </div>

            {filteredOrders.length === 0 ? (
              <EmptyState
                icon="🔎"
                title="No matching orders"
                text="Try another search keyword or filter."
              />
            ) : (
              <div className="professional-order-list">
                {filteredOrders.map((order) => (
                  <div className="professional-order-card" key={order.id}>
                    <div className="professional-order-top">
                      <div>
                        <span className="order-id-badge">
                          Order #{order.id}
                        </span>

                        <h2>
                          {order.orderItems?.length || 0} item
                          {order.orderItems?.length === 1 ? "" : "s"} ordered
                        </h2>

                        <p>{new Date(order.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="order-status-area">
                        <StatusBadge status={order.status} />
                        <StatusBadge
                          status={order.paymentStatus}
                          type="payment"
                        />
                      </div>
                    </div>

                    <div className="professional-order-details-grid">
                      <div>
                        <span>Total Amount</span>
                        <strong>{formatCurrency(order.totalAmount)}</strong>
                      </div>

                      <div>
                        <span>Payment Method</span>
                        <strong>{order.paymentMethod || "Not available"}</strong>
                      </div>

                      <div>
                        <span>Delivery Person</span>
                        <strong>
                          {order.deliveryPerson?.fullName || "Not assigned yet"}
                        </strong>
                      </div>

                      <div>
                        <span>Delivery Address</span>
                        <strong>{order.deliveryAddress}</strong>
                      </div>
                    </div>

                    <div className="professional-order-items">
                      <h3>Food Items</h3>

                      {order.orderItems?.map((item) => (
                        <div className="professional-order-item" key={item.id}>
                          <div>
                            <strong>{item.foodItem?.name}</strong>
                            <p>Qty: {item.quantity}</p>
                          </div>

                          <span>{formatCurrency(item.price)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="professional-order-actions">
                      <button
                        className="solid-btn"
                        onClick={() =>
                          navigate(`/customer/orders/${order.id}/track`)
                        }
                      >
                        Track Order
                      </button>

                      {canCancelOrder(order) && (
                        <button
                          className="order-cancel-btn"
                          onClick={() => openCancelModal(order)}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {orderToCancel && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card">
            <button
              className="confirm-modal-close"
              onClick={closeCancelModal}
              disabled={cancelling}
            >
              ✕
            </button>

            <div className="confirm-modal-icon">⚠️</div>

            <h2>Cancel Order?</h2>

            <p>
              Are you sure you want to cancel{" "}
              <strong>Order #{orderToCancel.id}</strong>? This action cannot be
              undone.
            </p>

            <div className="confirm-modal-actions">
              <button
                className="confirm-cancel-btn"
                onClick={closeCancelModal}
                disabled={cancelling}
              >
                Keep Order
              </button>

              <button
                className="confirm-delete-btn"
                onClick={confirmCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={
            toast.type === "success"
              ? "cart-toast cart-toast-success"
              : "cart-toast cart-toast-error"
          }
        >
          <button className="cart-toast-close" onClick={() => setToast(null)}>
            ✕
          </button>

          <div className="cart-toast-icon">
            {toast.type === "success" ? "✅" : "⚠️"}
          </div>

          <div className="cart-toast-content">
            <h3>{toast.title}</h3>
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;