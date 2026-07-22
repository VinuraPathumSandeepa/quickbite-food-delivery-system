import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/api";
import DeliveryLayout from "../components/DeliveryLayout";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

function DeliveryAssignedOrders() {
  const { currentUser } = useAuth();

  const location = useLocation();
  const highlightedOrderId = new URLSearchParams(location.search).get("orderId");
  const orderRefs = useRef({});

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [toast, setToast] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [orderToReject, setOrderToReject] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  const deliveryStatuses = [
    "ACCEPTED_BY_DELIVERY",
    "PICKED_UP",
    "ON_THE_WAY",
    "DELIVERED",
  ];

  useEffect(() => {
    loadAssignedOrders();
  }, []);

  useEffect(() => {
    if (!loading && highlightedOrderId && orderRefs.current[highlightedOrderId]) {
      setTimeout(() => {
        orderRefs.current[highlightedOrderId].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }, [loading, highlightedOrderId, orders]);

  const loadAssignedOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/delivery/orders/${currentUser.id}`);

      const sortedOrders = [...response.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sortedOrders);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load assigned orders."
      );
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

  const acceptDelivery = async (orderId) => {
    try {
      setUpdatingOrderId(orderId);

      await api.put(`/delivery/orders/${orderId}/accept/${currentUser.id}`);

      showToast({
        type: "success",
        title: "Delivery Accepted",
        message: `Order #${orderId} accepted successfully.`,
      });

      loadAssignedOrders();
    } catch (error) {
      showToast({
        type: "error",
        title: "Accept Failed",
        message: error.response?.data?.message || "Failed to accept delivery.",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openRejectModal = (order) => {
    setOrderToReject(order);
  };

  const closeRejectModal = () => {
    if (rejecting) return;
    setOrderToReject(null);
  };

  const confirmRejectDelivery = async () => {
    if (!orderToReject) return;

    try {
      setRejecting(true);
      setUpdatingOrderId(orderToReject.id);

      await api.put(
        `/delivery/orders/${orderToReject.id}/reject/${currentUser.id}`
      );

      showToast({
        type: "success",
        title: "Delivery Rejected",
        message: `Order #${orderToReject.id} rejected successfully.`,
      });

      setOrderToReject(null);
      loadAssignedOrders();
    } catch (error) {
      showToast({
        type: "error",
        title: "Reject Failed",
        message: error.response?.data?.message || "Failed to reject delivery.",
      });
    } finally {
      setRejecting(false);
      setUpdatingOrderId(null);
    }
  };

  const updateDeliveryStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);

      await api.put(`/delivery/orders/${orderId}/status/${currentUser.id}`, {
        status,
      });

      showToast({
        type: "success",
        title: "Status Updated",
        message: `Order #${orderId} status updated successfully.`,
      });

      loadAssignedOrders();
    } catch (error) {
      showToast({
        type: "error",
        title: "Update Failed",
        message:
          error.response?.data?.message || "Failed to update delivery status.",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const canAccept = (status) => {
    return status === "ASSIGNED_TO_DELIVERY";
  };

  const canReject = (status) => {
    return status === "ASSIGNED_TO_DELIVERY";
  };

  const canUpdateStatus = (status) => {
    return (
      status === "ACCEPTED_BY_DELIVERY" ||
      status === "PICKED_UP" ||
      status === "ON_THE_WAY"
    );
  };

  return (
    <DeliveryLayout
      title="Assigned Orders"
      subtitle="View assigned customer orders, accept deliveries, and update delivery progress."
    >
      {message && <div className="error-box">{message}</div>}

      {loading ? (
        <LoadingSpinner text="Loading assigned orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="🚚"
          title="No assigned orders"
          text="Assigned delivery orders will appear here."
        />
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div
              ref={(element) => {
                orderRefs.current[order.id] = element;
              }}
              className={
                String(order.id) === String(highlightedOrderId)
                  ? "order-card highlighted-target-order"
                  : "order-card"
              }
              key={order.id}
            >
              <div className="order-top">
                <div>
                  <h2>Order #{order.id}</h2>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                </div>

                <div className="order-status-box">
                  <StatusBadge status={order.status} />
                  <StatusBadge status={order.paymentStatus} type="payment" />
                </div>
              </div>

              <div className="order-info-grid">
                <div>
                  <strong>Customer</strong>
                  <p>{order.customer?.fullName || "Customer"}</p>
                </div>

                <div>
                  <strong>Phone</strong>
                  <p>{order.customer?.phone || "Not available"}</p>
                </div>

                <div>
                  <strong>Total</strong>
                  <p>{formatCurrency(order.totalAmount)}</p>
                </div>

                <div>
                  <strong>Payment</strong>
                  <p>{order.paymentMethod || "Not available"}</p>
                </div>

                <div>
                  <strong>Address</strong>
                  <p>{order.deliveryAddress}</p>
                </div>

                <div>
                  <strong>Notes</strong>
                  <p>{order.notes || "No notes"}</p>
                </div>
              </div>

              <div className="order-items">
                <h3>Food Items</h3>

                {order.orderItems?.map((item) => (
                  <div className="order-item-row" key={item.id}>
                    <span>{item.foodItem?.name}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="admin-order-actions">
                {canAccept(order.status) && (
                  <button
                    className="solid-btn"
                    disabled={updatingOrderId === order.id}
                    onClick={() => acceptDelivery(order.id)}
                  >
                    {updatingOrderId === order.id ? "Accepting..." : "Accept"}
                  </button>
                )}

                {canReject(order.status) && (
                  <button
                    className="order-cancel-btn"
                    disabled={updatingOrderId === order.id}
                    onClick={() => openRejectModal(order)}
                  >
                    Reject
                  </button>
                )}

                {canUpdateStatus(order.status) && (
                  <div>
                    <label>Update Delivery Status</label>
                    <select
                      value={order.status}
                      disabled={updatingOrderId === order.id}
                      onChange={(e) =>
                        updateDeliveryStatus(order.id, e.target.value)
                      }
                    >
                      {deliveryStatuses.map((status) => (
                        <option value={status} key={status}>
                          {status.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {orderToReject && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card reject-delivery-modal">
            <button
              className="confirm-modal-close"
              onClick={closeRejectModal}
              disabled={rejecting}
            >
              ✕
            </button>

            <div className="confirm-modal-icon reject-delivery-icon">🚚</div>

            <h2>Reject Delivery?</h2>

            <p>
              Are you sure you want to reject{" "}
              <strong>Order #{orderToReject.id}</strong>? This order will be
              returned to admin for reassignment.
            </p>

            <div className="reject-order-summary">
              <div>
                <span>Customer</span>
                <strong>{orderToReject.customer?.fullName || "Customer"}</strong>
              </div>

              <div>
                <span>Total</span>
                <strong>{formatCurrency(orderToReject.totalAmount)}</strong>
              </div>

              <div>
                <span>Address</span>
                <strong>{orderToReject.deliveryAddress}</strong>
              </div>
            </div>

            <div className="confirm-modal-actions">
              <button
                className="confirm-cancel-btn"
                onClick={closeRejectModal}
                disabled={rejecting}
              >
                Keep Delivery
              </button>

              <button
                className="confirm-delete-btn"
                onClick={confirmRejectDelivery}
                disabled={rejecting}
              >
                {rejecting ? "Rejecting..." : "Reject Delivery"}
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
    </DeliveryLayout>
  );
}

export default DeliveryAssignedOrders;