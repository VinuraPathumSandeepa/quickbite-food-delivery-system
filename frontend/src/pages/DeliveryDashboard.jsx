import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import DeliveryLayout from "../components/DeliveryLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

function DeliveryDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [assignedOrders, setAssignedOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const assignedResponse = await api.get(
        `/delivery/orders/${currentUser.id}`
      );

      const activeResponse = await api.get(
        `/delivery/orders/${currentUser.id}/active`
      );

      const completedResponse = await api.get(
        `/delivery/orders/${currentUser.id}/completed`
      );

      setAssignedOrders(assignedResponse.data);
      setActiveOrders(activeResponse.data);
      setCompletedOrders(completedResponse.data);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load delivery dashboard."
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

  const dashboardData = useMemo(() => {
    const todayCompleted = completedOrders.filter((order) =>
      isToday(order.updatedAt || order.createdAt)
    );

    const totalDeliveryValue = completedOrders.reduce((total, order) => {
      return total + Number(order.totalAmount || 0);
    }, 0);

    const latestActiveOrder = [...activeOrders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    const recentCompletedOrders = [...completedOrders]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      )
      .slice(0, 4);

    return {
      totalAssigned: assignedOrders.length,
      totalActive: activeOrders.length,
      totalCompleted: completedOrders.length,
      todayCompleted: todayCompleted.length,
      totalDeliveryValue,
      latestActiveOrder,
      recentCompletedOrders,
    };
  }, [assignedOrders, activeOrders, completedOrders]);

  return (
    <DeliveryLayout
      title="Delivery Dashboard"
      subtitle="Manage assigned deliveries, update delivery progress, and review completed work."
    >
      {message && <div className="error-box">{message}</div>}

      {loading ? (
        <LoadingSpinner text="Loading delivery dashboard..." />
      ) : (
        <>
          <div className="delivery-hero-card">
            <div>
              <p className="delivery-kicker">Welcome Back</p>
              <h1>Hello, {currentUser?.fullName || "Delivery Person"} 👋</h1>
              <p>
                Check your assigned orders, manage active deliveries, and keep
                customers updated with delivery progress.
              </p>

              <div className="delivery-hero-actions">
                <button
                  className="solid-btn"
                  onClick={() => navigate("/delivery/assigned-orders")}
                >
                  View Assigned Orders
                </button>

                <button
                  className="outline-btn"
                  onClick={() => navigate("/delivery/completed-orders")}
                >
                  Completed Orders
                </button>
              </div>
            </div>

            <div className="delivery-profile-mini-card">
              <div className="delivery-profile-icon">🚚</div>

              <h3>{currentUser?.fullName || "Delivery Person"}</h3>
              <p>Delivery Person</p>

              <div className="delivery-profile-row">
                <span>Vehicle Type</span>
                <strong>{currentUser?.vehicleType || "Not added"}</strong>
              </div>

              <div className="delivery-profile-row">
                <span>Vehicle Number</span>
                <strong>{currentUser?.vehicleNumber || "Not added"}</strong>
              </div>
            </div>
          </div>

          <div className="delivery-stats-grid">
            <div className="delivery-stat-card">
              <div className="delivery-stat-icon">📦</div>
              <h3>Assigned Orders</h3>
              <strong>{dashboardData.totalAssigned}</strong>
              <p>Total orders assigned to you</p>
            </div>

            <div className="delivery-stat-card">
              <div className="delivery-stat-icon">🚚</div>
              <h3>Active Deliveries</h3>
              <strong>{dashboardData.totalActive}</strong>
              <p>Orders still in delivery progress</p>
            </div>

            <div className="delivery-stat-card">
              <div className="delivery-stat-icon">✅</div>
              <h3>Completed Deliveries</h3>
              <strong>{dashboardData.totalCompleted}</strong>
              <p>Successfully delivered orders</p>
            </div>

            <div className="delivery-stat-card">
              <div className="delivery-stat-icon">📅</div>
              <h3>Today Completed</h3>
              <strong>{dashboardData.todayCompleted}</strong>
              <p>Deliveries completed today</p>
            </div>
          </div>

          <div className="delivery-dashboard-grid">
            <div className="delivery-panel">
              <div className="delivery-panel-header">
                <div>
                  <h2>Current Delivery</h2>
                  <p>Your latest active delivery order</p>
                </div>

                <span>📍</span>
              </div>

              {dashboardData.latestActiveOrder ? (
                <div className="current-delivery-card">
                  <div className="current-delivery-top">
                    <div>
                      <h3>Order #{dashboardData.latestActiveOrder.id}</h3>
                      <p>
                        {new Date(
                          dashboardData.latestActiveOrder.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>

                    <StatusBadge status={dashboardData.latestActiveOrder.status} />
                  </div>

                  <div className="current-delivery-info-grid">
                    <div>
                      <span>Customer</span>
                      <strong>
                        {dashboardData.latestActiveOrder.customer?.fullName ||
                          "Customer"}
                      </strong>
                    </div>

                    <div>
                      <span>Phone</span>
                      <strong>
                        {dashboardData.latestActiveOrder.customer?.phone ||
                          "Not available"}
                      </strong>
                    </div>

                    <div>
                      <span>Total Amount</span>
                      <strong>
                        {formatCurrency(
                          dashboardData.latestActiveOrder.totalAmount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Payment</span>
                      <strong>
                        {dashboardData.latestActiveOrder.paymentMethod ||
                          "Not available"}
                      </strong>
                    </div>
                  </div>

                  <div className="delivery-address-box">
                    <span>Delivery Address</span>
                    <strong>
                      {dashboardData.latestActiveOrder.deliveryAddress}
                    </strong>
                  </div>

                  <button
                    className="full-btn"
                    onClick={() => navigate("/delivery/assigned-orders")}
                  >
                    Update Delivery Status
                  </button>
                </div>
              ) : (
                <div className="delivery-empty-box">
                  <div>🚚</div>
                  <h3>No active delivery</h3>
                  <p>
                    Active delivery details will appear here after you accept an
                    assigned order.
                  </p>

                  <button
                    className="solid-btn"
                    onClick={() => navigate("/delivery/assigned-orders")}
                  >
                    Check Assigned Orders
                  </button>
                </div>
              )}
            </div>

            <div className="delivery-panel">
              <div className="delivery-panel-header">
                <div>
                  <h2>Delivery Summary</h2>
                  <p>Quick overview of your delivery work</p>
                </div>

                <span>📊</span>
              </div>

              <div className="delivery-summary-list">
                <div className="delivery-summary-row">
                  <div>
                    <strong>Total Delivery Value</strong>
                    <p>Value of completed delivered orders</p>
                  </div>

                  <span>{formatCurrency(dashboardData.totalDeliveryValue)}</span>
                </div>

                <div className="delivery-summary-row">
                  <div>
                    <strong>Active Orders</strong>
                    <p>Orders still assigned or on the way</p>
                  </div>

                  <span>{dashboardData.totalActive}</span>
                </div>

                <div className="delivery-summary-row">
                  <div>
                    <strong>Completed Today</strong>
                    <p>Orders delivered today</p>
                  </div>

                  <span>{dashboardData.todayCompleted}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="delivery-panel recent-delivery-panel">
            <div className="delivery-panel-header">
              <div>
                <h2>Recent Completed Deliveries</h2>
                <p>Your latest successfully delivered orders</p>
              </div>

              <button
                className="outline-btn"
                onClick={() => navigate("/delivery/completed-orders")}
              >
                View All
              </button>
            </div>

            {dashboardData.recentCompletedOrders.length === 0 ? (
              <div className="delivery-empty-mini">
                No completed deliveries yet.
              </div>
            ) : (
              <div className="recent-delivery-list">
                {dashboardData.recentCompletedOrders.map((order) => (
                  <div className="recent-delivery-row" key={order.id}>
                    <div>
                      <strong>Order #{order.id}</strong>
                      <p>
                        {order.customer?.fullName || "Customer"} •{" "}
                        {new Date(
                          order.updatedAt || order.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <strong>{formatCurrency(order.totalAmount)}</strong>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DeliveryLayout>
  );
}

export default DeliveryDashboard;