import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import AdminLayout from "../components/AdminLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders");
      setOrders(response.data);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toFixed(2)}`;
  };

  const isToday = (dateValue) => {
    const date = new Date(dateValue);
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const getMonthLabel = (date) => {
    return date.toLocaleString("en-US", {
      month: "short",
    });
  };

  const dashboardData = useMemo(() => {
    const validSalesOrders = orders.filter(
      (order) => order.status !== "CANCELLED"
    );

    const deliveredOrders = orders.filter(
      (order) => order.status === "DELIVERED"
    );

    const pendingOrders = orders.filter(
      (order) =>
        order.status === "PENDING" ||
        order.status === "CONFIRMED" ||
        order.status === "PREPARING"
    );

    const cancelledOrders = orders.filter(
      (order) => order.status === "CANCELLED"
    );

    const totalRevenue = validSalesOrders.reduce(
      (total, order) => total + Number(order.totalAmount || 0),
      0
    );

    const todayRevenue = validSalesOrders
      .filter((order) => isToday(order.createdAt))
      .reduce((total, order) => total + Number(order.totalAmount || 0), 0);

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    const salesByMonth = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);

      salesByMonth.push({
        month: getMonthLabel(monthDate),
        monthNumber: monthDate.getMonth(),
        year: monthDate.getFullYear(),
        revenue: 0,
      });
    }

    validSalesOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt);

      const targetMonth = salesByMonth.find(
        (item) =>
          item.monthNumber === orderDate.getMonth() &&
          item.year === orderDate.getFullYear()
      );

      if (targetMonth) {
        targetMonth.revenue += Number(order.totalAmount || 0);
      }
    });

    const maxMonthlyRevenue = Math.max(
      ...salesByMonth.map((item) => item.revenue),
      1
    );

    return {
      totalRevenue,
      todayRevenue,
      totalOrders: orders.length,
      deliveredCount: deliveredOrders.length,
      pendingCount: pendingOrders.length,
      cancelledCount: cancelledOrders.length,
      recentOrders,
      salesByMonth,
      maxMonthlyRevenue,
    };
  }, [orders]);

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Monitor revenue, orders, sales performance and recent activity."
    >
      {message && <div className="error-box">{message}</div>}

      {loading ? (
        <LoadingSpinner text="Loading admin dashboard..." />
      ) : (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon">💰</div>
              <h3>Total Revenue</h3>
              <strong>{formatCurrency(dashboardData.totalRevenue)}</strong>
              <p>Revenue from all non-cancelled orders</p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">📅</div>
              <h3>Today Revenue</h3>
              <strong>{formatCurrency(dashboardData.todayRevenue)}</strong>
              <p>Total sales generated today</p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">📦</div>
              <h3>Total Orders</h3>
              <strong>{dashboardData.totalOrders}</strong>
              <p>All customer orders in the system</p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">⏳</div>
              <h3>Pending Orders</h3>
              <strong>{dashboardData.pendingCount}</strong>
              <p>Orders waiting or being prepared</p>
            </div>
          </div>

          <div className="admin-dashboard-grid">
            <div className="admin-dashboard-panel sales-overview-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>Sales Overview</h2>
                  <p>Monthly revenue trend for the last 6 months</p>
                </div>

                <span className="chart-badge">Last 6 months</span>
              </div>

              <div className="sales-chart">
                {dashboardData.salesByMonth.map((item, index) => {
                  const barHeight =
                    (item.revenue / dashboardData.maxMonthlyRevenue) * 220;

                  return (
                    <div
                      className="sales-bar-item"
                      key={`${item.month}-${item.year}`}
                    >
                      <span className="sales-bar-value">
                        {formatCurrency(item.revenue)}
                      </span>

                      <div className="sales-bar-track">
                        <div
                          className="sales-bar"
                          style={{
                            height: `${Math.max(barHeight, 8)}px`,
                            animationDelay: `${index * 0.12}s`,
                          }}
                          title={`${item.month}: ${formatCurrency(
                            item.revenue
                          )}`}
                        ></div>
                      </div>

                      <span className="sales-bar-label">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="admin-dashboard-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>Order Summary</h2>
                  <p>Current order performance</p>
                </div>
              </div>

              <div className="recent-order-list">
                <div className="recent-order-item">
                  <div>
                    <strong>Delivered Orders</strong>
                    <p>Successfully completed orders</p>
                  </div>

                  <div className="order-count-pill">
                    {dashboardData.deliveredCount}
                  </div>
                </div>

                <div className="recent-order-item">
                  <div>
                    <strong>Pending Orders</strong>
                    <p>Orders still in progress</p>
                  </div>

                  <div className="order-count-pill">
                    {dashboardData.pendingCount}
                  </div>
                </div>

                <div className="recent-order-item">
                  <div>
                    <strong>Cancelled Orders</strong>
                    <p>Orders cancelled by customer/admin</p>
                  </div>

                  <div className="order-count-pill">
                    {dashboardData.cancelledCount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-dashboard-panel recent-orders-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Recent Orders</h2>
                <p>Latest customer orders received by the system</p>
              </div>
            </div>

            {dashboardData.recentOrders.length === 0 ? (
              <div className="admin-empty-mini">No recent orders found.</div>
            ) : (
              <div className="recent-order-list">
                {dashboardData.recentOrders.map((order) => (
                  <div className="recent-order-item" key={order.id}>
                    <div>
                      <strong>Order #{order.id}</strong>
                      <p>
                        {order.customer?.fullName || "Customer"} •{" "}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="recent-order-right">
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
    </AdminLayout>
  );
}

export default AdminDashboard;