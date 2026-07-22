import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/api";
import AdminLayout from "../components/AdminLayout";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";

function AdminOrders() {
  const location = useLocation();
  const highlightedOrderId = new URLSearchParams(location.search).get("orderId");
  const orderRefs = useRef({});

  const [orders, setOrders] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const orderStatuses = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "ASSIGNED_TO_DELIVERY",
    "ACCEPTED_BY_DELIVERY",
    "PICKED_UP",
    "ON_THE_WAY",
    "DELIVERED",
    "CANCELLED",
  ];

  useEffect(() => {
    loadOrders();
    loadDeliveryPersons();
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

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders");

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

  const loadDeliveryPersons = async () => {
    try {
      const response = await api.get("/delivery/persons");
      setDeliveryPersons(response.data);
    } catch (error) {
      console.error("Failed to load delivery persons", error);
    }
  };

  const showToast = (toastData) => {
    setToast(toastData);

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toFixed(2)}`;
  };

  const canAssignDelivery = (order) => {
    return order.status !== "DELIVERED" && order.status !== "CANCELLED";
  };

  const canDeleteOrder = (order) => {
    return order.status === "DELIVERED" || order.status === "CANCELLED";
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        status,
      });

      showToast({
        type: "success",
        title: "Status Updated",
        message: `Order #${orderId} status updated successfully.`,
      });

      loadOrders();
    } catch (error) {
      showToast({
        type: "error",
        title: "Update Failed",
        message:
          error.response?.data?.message || "Failed to update order status.",
      });
    }
  };

  const handleDeliverySelect = (orderId, deliveryPersonId) => {
    setSelectedDeliveryPerson((previous) => ({
      ...previous,
      [orderId]: deliveryPersonId,
    }));
  };

  const assignDeliveryPerson = async (orderId) => {
    const deliveryPersonId = selectedDeliveryPerson[orderId];

    if (!deliveryPersonId) {
      showToast({
        type: "error",
        title: "Delivery Person Required",
        message: "Please select a delivery person first.",
      });
      return;
    }

    try {
      await api.put(`/delivery/assign/${orderId}`, {
        deliveryPersonId: Number(deliveryPersonId),
      });

      showToast({
        type: "success",
        title: "Delivery Assigned",
        message: `Delivery person assigned to Order #${orderId}.`,
      });

      loadOrders();
    } catch (error) {
      showToast({
        type: "error",
        title: "Assign Failed",
        message:
          error.response?.data?.message || "Failed to assign delivery person.",
      });
    }
  };

  const openDeleteModal = (order) => {
    setOrderToDelete(order);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setOrderToDelete(null);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      setDeleting(true);

      await api.delete(`/orders/${orderToDelete.id}`);

      setOrders((previous) =>
        previous.filter((order) => order.id !== orderToDelete.id)
      );

      showToast({
        type: "success",
        title: "Order Deleted",
        message: `Order #${orderToDelete.id} was removed successfully.`,
      });

      setOrderToDelete(null);
    } catch (error) {
      showToast({
        type: "error",
        title: "Delete Failed",
        message:
          error.response?.data?.message ||
          "Failed to delete order. Only delivered or cancelled orders can be deleted.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Manage Orders"
      subtitle="View customer orders, update status, assign delivery persons, and clear completed records."
    >
      {message && <div className="error-box">{message}</div>}

      {loading ? (
        <LoadingSpinner text="Loading customer orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders found"
          text="Customer orders will appear here."
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
                  <strong>Delivery Person</strong>
                  <p>{order.deliveryPerson?.fullName || "Not assigned"}</p>
                </div>

                <div>
                  <strong>Address</strong>
                  <p>{order.deliveryAddress}</p>
                </div>

                <div>
                  <strong>Payment Ref</strong>
                  <p>{order.paymentReference || "Not available"}</p>
                </div>
              </div>

              <div className="order-items">
                <h3>Order Items</h3>

                {order.orderItems?.map((item) => (
                  <div className="order-item-row" key={item.id}>
                    <span>{item.foodItem?.name}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="admin-order-actions">
                <div>
                  <label>Update Status</label>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order.id, e.target.value)
                    }
                  >
                    {orderStatuses.map((status) => (
                      <option value={status} key={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                {canAssignDelivery(order) ? (
                  <>
                    <div>
                      <label>Assign Delivery Person</label>
                      <select
                        value={selectedDeliveryPerson[order.id] || ""}
                        onChange={(e) =>
                          handleDeliverySelect(order.id, e.target.value)
                        }
                      >
                        <option value="">Select delivery person</option>

                        {deliveryPersons.map((person) => (
                          <option value={person.id} key={person.id}>
                            {person.fullName} -{" "}
                            {person.vehicleNumber || "No vehicle"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="solid-btn"
                      onClick={() => assignDeliveryPerson(order.id)}
                    >
                      Assign
                    </button>
                  </>
                ) : (
                  <div className="completed-order-note">
                    <span>✅</span>

                    <div>
                      <strong>Delivery Closed</strong>
                      <p>No driver assignment needed for this order.</p>
                    </div>
                  </div>
                )}

                {canDeleteOrder(order) && (
                  <button
                    className="order-delete-record-btn"
                    onClick={() => openDeleteModal(order)}
                  >
                    Delete Record
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {orderToDelete && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card">
            <button
              className="confirm-modal-close"
              onClick={closeDeleteModal}
              disabled={deleting}
            >
              ✕
            </button>

            <div className="confirm-modal-icon">🗑️</div>

            <h2>Delete Order Record?</h2>

            <p>
              Are you sure you want to permanently delete{" "}
              <strong>Order #{orderToDelete.id}</strong>? This action cannot be
              undone.
            </p>

            <div className="confirm-modal-actions">
              <button
                className="confirm-cancel-btn"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={confirmDeleteOrder}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Record"}
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
    </AdminLayout>
  );
}

export default AdminOrders;