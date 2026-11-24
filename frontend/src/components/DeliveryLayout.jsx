import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import Icon from "./Icon";

function DeliveryLayout({ title, subtitle, children }) {
  const { currentUser, logoutUser } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      path: "/delivery/dashboard",
      label: "Dashboard",
      icon: "dashboard",
    },
    {
      path: "/delivery/assigned-orders",
      label: "Assigned Orders",
      icon: "delivery",
    },
    {
      path: "/delivery/completed-orders",
      label: "Completed Orders",
      icon: "check",
    },
    {
      path: "/profile",
      label: "My Profile",
      icon: "user",
    },
  ];

  const handleLogout = () => {
    navigate("/login", { replace: true });
    logoutUser();
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
          <span><Icon name="delivery" size={25} /></span>
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
              <Icon name={item.icon} size={21} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="delivery-sidebar-bottom">
          <div className="delivery-sidebar-note">
            <span><Icon name="delivery" size={21} /></span>

            <div>
              <strong>Delivery Mode</strong>
              <p>Manage your assigned deliveries and update order status.</p>
            </div>
          </div>

          <button className="delivery-logout-btn" onClick={handleLogout}>
            <Icon name="login" size={19} />
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
      <nav className="delivery-mobile-nav" aria-label="Delivery navigation">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `delivery-mobile-link${isActive ? " active-delivery-mobile-link" : ""}`}>
            <Icon name={item.icon} size={21} />
            <span>{item.label.replace(" Orders", "").replace("My ", "")}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default DeliveryLayout;
