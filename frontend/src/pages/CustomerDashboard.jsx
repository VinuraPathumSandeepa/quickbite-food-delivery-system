import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

function CustomerDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const cartResponse = await api.get(`/cart/${currentUser.id}`);
      const orderResponse = await api.get(`/orders/customer/${currentUser.id}`);

      setCartItems(cartResponse.data);
      setOrders(orderResponse.data);
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

  const dashboardData = useMemo(() => {
    const cartTotal = cartItems.reduce((total, item) => {
      return (
        total +
        Number(item.foodItem?.price || 0) * Number(item.quantity || 0)
      );
    }, 0);

    const activeOrders = orders.filter(
      (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED"
    );

    const completedOrders = orders.filter(
      (order) => order.status === "DELIVERED"
    );

    const cancelledOrders = orders.filter(
      (order) => order.status === "CANCELLED"
    );

    const latestActiveOrder = [...activeOrders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);

    const totalSpent = orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((total, order) => total + Number(order.totalAmount || 0), 0);

    return {
      cartTotal,
      activeOrders,
      completedOrders,
      cancelledOrders,
      latestActiveOrder,
      recentOrders,
      totalSpent,
    };
  }, [cartItems, orders]);

  return (
    <div className="app-page">
      <Navbar />

      <section className="customer-dashboard-section">
        <div className="customer-dashboard-hero">
          <div>
            <p className="customer-dashboard-kicker">Customer Dashboard</p>
            <h1>Hello, {currentUser?.fullName || "Customer"} 👋</h1>
            <p>
              Track your orders, review your cart, and continue your food order
              journey easily.
            </p>
          </div>

          <div className="customer-hero-action-card">
            <span>🍽️</span>
            <strong>Hungry?</strong>
            <p>Explore fresh meals and add your favourites to the cart.</p>
            <Link to="/menu" className="solid-btn">
              Browse Menu
            </Link>
          </div>
        </div>

        {message && <div className="error-box">{message}</div>}

        {loading ? (
          <LoadingSpinner text="Loading customer dashboard..." />
        ) : (
          <>
            <div className="customer-stats-grid">
              <div className="customer-stat-card">
                <div className="customer-stat-icon">🛒</div>
                <h3>Cart Items</h3>
                <strong>{cartItems.length}</strong>
                <p>{formatCurrency(dashboardData.cartTotal)} in your cart</p>
              </div>

              <div className="customer-stat-card">
                <div className="customer-stat-icon">🚚</div>
                <h3>Active Orders</h3>
                <strong>{dashboardData.activeOrders.length}</strong>
                <p>Orders currently being processed</p>
              </div>

              <div className="customer-stat-card">
                <div className="customer-stat-icon">✅</div>
                <h3>Completed Orders</h3>
                <strong>{dashboardData.completedOrders.length}</strong>
                <p>Successfully delivered orders</p>
              </div>

              <div className="customer-stat-card">
                <div className="customer-stat-icon">💳</div>
                <h3>Total Spent</h3>
                <strong>{formatCurrency(dashboardData.totalSpent)}</strong>
                <p>Total value of your non-cancelled orders</p>
              </div>
            </div>

            <div className="customer-dashboard-grid">
              <div className="customer-panel active-order-panel">
                <div className="customer-panel-header">
                  <div>
                    <h2>Active Delivery</h2>
                    <p>Track your latest active order</p>
                  </div>

                  <span className="customer-panel-icon">📍</span>
                </div>

                {dashboardData.latestActiveOrder ? (
                  <div className="active-order-card">
                    <div className="active-order-top">
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

                    <div className="active-order-info">
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
                          {dashboardData.latestActiveOrder.paymentMethod}
                        </strong>
                      </div>

                      <div>
                        <span>Delivery Person</span>
                        <strong>
                          {dashboardData.latestActiveOrder.deliveryPerson
                            ?.fullName || "Not assigned yet"}
                        </strong>
                      </div>
                    </div>

                    <button
                      className="full-btn"
                      onClick={() =>
                        navigate(
                          `/customer/orders/${dashboardData.latestActiveOrder.id}/track`
                        )
                      }
                    >
                      Track This Order
                    </button>
                  </div>
                ) : (
                  <div className="customer-empty-box">
                    <div>🚚</div>
                    <h3>No active delivery</h3>
                    <p>
                      When you place an order, your live order status will appear
                      here.
                    </p>

                    <Link to="/menu" className="solid-btn">
                      Order Food
                    </Link>
                  </div>
                )}
              </div>

              <div className="customer-panel cart-preview-panel">
                <div className="customer-panel-header">
                  <div>
                    <h2>Cart Preview</h2>
                    <p>Items waiting in your cart</p>
                  </div>

                  <span className="customer-panel-icon">🛒</span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="customer-empty-box small-empty-box">
                    <div>🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>Add food items from the menu.</p>
                    <Link to="/menu" className="outline-btn">
                      Browse Menu
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="cart-preview-list">
                      {cartItems.slice(0, 3).map((item) => (
                        <div className="cart-preview-item" key={item.id}>
                          <img
                            src={
                              item.foodItem?.imageUrl ||
                              "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
                            }
                            alt={item.foodItem?.name}
                          />

                          <div>
                            <strong>{item.foodItem?.name}</strong>
                            <p>
                              Qty: {item.quantity} •{" "}
                              {formatCurrency(item.foodItem?.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="cart-preview-footer">
                      <strong>{formatCurrency(dashboardData.cartTotal)}</strong>

                      <button
                        className="solid-btn"
                        onClick={() => navigate("/customer/cart")}
                      >
                        View Cart
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="customer-panel recent-orders-panel-customer">
              <div className="customer-panel-header">
                <div>
                  <h2>Recent Orders</h2>
                  <p>Your latest order history</p>
                </div>

                <Link to="/customer/orders" className="outline-btn">
                  View All Orders
                </Link>
              </div>

              {dashboardData.recentOrders.length === 0 ? (
                <div className="customer-empty-box small-empty-box">
                  <div>📦</div>
                  <h3>No orders yet</h3>
                  <p>Your order history will appear here after checkout.</p>
                </div>
              ) : (
                <div className="customer-order-list">
                  {dashboardData.recentOrders.map((order) => (
                    <div className="customer-order-row" key={order.id}>
                      <div>
                        <strong>Order #{order.id}</strong>
                        <p>{new Date(order.createdAt).toLocaleString()}</p>
                      </div>

                      <div>
                        <strong>{formatCurrency(order.totalAmount)}</strong>
                        <StatusBadge status={order.status} />
                      </div>

                      <button
                        className="table-edit-btn"
                        onClick={() =>
                          navigate(`/customer/orders/${order.id}/track`)
                        }
                      >
                        Track
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default CustomerDashboard;