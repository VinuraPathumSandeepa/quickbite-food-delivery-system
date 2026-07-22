import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

function DeliveryLayout({ title, subtitle, children }) {
  const { currentUser, logoutUser } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      path: "/delivery/dashboard",
      label: "Dashboard",
      icon: "📊",
    },
    {
      path: "/delivery/assigned-orders",
      label: "Assigned Orders",
      icon: "🚚",
    },
    {
      path: "/delivery/completed-orders",
      label: "Completed Orders",
      icon: "✅",
    },
    {
      path: "/profile",
      label: "My Profile",
      icon: "👤",
    },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "D";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <div className="delivery-layout-page">
      <aside className="delivery-sidebar">
        <div className="delivery-sidebar-brand">
          <span>🚚</span>
          <strong>QuickBite Delivery</strong>
        </div>

        <div className="delivery-sidebar-profile">
          <div className="delivery-sidebar-avatar">
            {getInitials(currentUser?.fullName)}
          </div>

          <div>
            <strong>{currentUser?.fullName || "Delivery Person"}</strong>
            <span>Delivery Person</span>
          </div>
        </div>

        <nav className="delivery-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "delivery-sidebar-link active-delivery-sidebar-link"
                  : "delivery-sidebar-link"
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="delivery-sidebar-bottom">
          <div className="delivery-sidebar-note">
            <span>📌</span>

            <div>
              <strong>Delivery Mode</strong>
              <p>Manage your assigned deliveries and update order status.</p>
            </div>
          </div>

          <button className="delivery-logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="delivery-main-area">
        <header className="delivery-main-header">
          <div>
            <p className="delivery-main-kicker">QuickBite Delivery</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="layout-header-actions">
            <NotificationBell />

            <button
              className="delivery-header-profile"
              onClick={() => navigate("/profile")}
            >
              <div className="delivery-header-avatar">
                {getInitials(currentUser?.fullName)}
              </div>

              <div>
                <strong>{currentUser?.fullName || "Delivery"}</strong>
                <span>Delivery Person</span>
              </div>
            </button>
          </div>
        </header>

        <section className="delivery-main-content">{children}</section>
      </main>
    </div>
  );
}

export default DeliveryLayout;