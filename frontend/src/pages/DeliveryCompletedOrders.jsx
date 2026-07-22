import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import DeliveryLayout from "../components/DeliveryLayout";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

function DeliveryCompletedOrders() {
  const { currentUser } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCompletedOrders();
  }, []);

  const loadCompletedOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/delivery/orders/${currentUser.id}/completed`
      );

      const sortedOrders = [...response.data].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      );

      setOrders(sortedOrders);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load completed orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toFixed(2)}`;
  };

  const isToday = (dateValue) => {
    if (!dateValue) return false;

    const date = new Date(dateValue);
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const completedData = useMemo(() => {
    const todayCompleted = orders.filter((order) =>
      isToday(order.updatedAt || order.createdAt)
    );

    const totalValue = orders.reduce((total, order) => {
      return total + Number(order.totalAmount || 0);
    }, 0);

    return {
      totalCompleted: orders.length,
      todayCompleted: todayCompleted.length,
      totalValue,
    };
  }, [orders]);

  return (
    <DeliveryLayout
      title="Completed Orders"
      subtitle="Review your successfully delivered customer orders."
    >
      {message && <div className="error-box">{message}</div>}

      {loading ? (
        <LoadingSpinner text="Loading completed orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No completed deliveries"
          text="Completed delivery orders will appear here."
        />
      ) : (
        <>
          <div className="delivery-stats-grid">
            <div className="delivery-stat-card">
              <div className="delivery-stat-icon">✅</div>
              <h3>Total Completed</h3>
              <strong>{completedData.totalCompleted}</strong>
              <p>All successfully delivered orders</p>
            </div>

            <div className="delivery-stat-card">
              <div className="delivery-stat-icon">📅</div>
              <h3>Today Completed</h3>
              <strong>{completedData.todayCompleted}</strong>
              <p>Deliveries completed today</p>
            </div>

            <div className="delivery-stat-card">
              <div className="delivery-stat-icon">💰</div>
              <h3>Total Delivery Value</h3>
              <strong>{formatCurrency(completedData.totalValue)}</strong>
              <p>Total value of completed orders</p>
            </div>
          </div>

          <div className="order-list">
            {orders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-top">
                  <div>
                    <h2>Order #{order.id}</h2>
                    <p>
                      Delivered on{" "}
                      {new Date(
                        order.updatedAt || order.createdAt
                      ).toLocaleString()}
                    </p>
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
                    <strong>Payment Ref</strong>
                    <p>{order.paymentReference || "Not available"}</p>
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
              </div>
            ))}
          </div>
        </>
      )}
    </DeliveryLayout>
  );
}

export default DeliveryCompletedOrders;