import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

function AdminLayout({ title, subtitle, children }) {
  const { currentUser, logoutUser } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: "📊",
    },
    {
      path: "/admin/categories",
      label: "Categories",
      icon: "📂",
    },
    {
      path: "/admin/foods",
      label: "Foods",
      icon: "🍔",
    },
    {
      path: "/admin/collections",
      label: "Collections",
      icon: "🖼️",
    },
    {
      path: "/admin/orders",
      label: "Orders",
      icon: "📦",
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
    if (!name) return "A";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <div className="admin-layout-page">
      <aside className="admin-sidebar">
        <Link to="/admin/dashboard" className="admin-sidebar-brand">
          <span>🍽</span>
          <strong>QuickBite Admin</strong>
        </Link>

        <div className="admin-sidebar-profile">
          <div className="admin-sidebar-avatar">
            {getInitials(currentUser?.fullName)}
          </div>

          <div>
            <strong>{currentUser?.fullName || "Admin User"}</strong>
            <span>Administrator</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "admin-sidebar-link active-admin-sidebar-link"
                  : "admin-sidebar-link"
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <p className="sidebar-section-title">Public Preview</p>

          <Link to="/" className="admin-preview-card">
            <div className="admin-preview-icon">🏠</div>

            <div>
              <strong>Home Page</strong>
              <span>Preview public homepage</span>
            </div>
          </Link>

          <Link to="/menu" className="admin-preview-card">
            <div className="admin-preview-icon">🍽️</div>

            <div>
              <strong>View Menu</strong>
              <span>Check customer menu view</span>
            </div>
          </Link>

          <button className="admin-logout-btn-pro" onClick={handleLogout}>
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main-area">
        <header className="admin-main-header">
          <div>
            <p className="admin-main-kicker">QuickBite Management</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="layout-header-actions">
            <NotificationBell />

            <button
              className="admin-header-profile"
              onClick={() => navigate("/profile")}
            >
              <div className="admin-header-avatar">
                {getInitials(currentUser?.fullName)}
              </div>

              <div>
                <strong>{currentUser?.fullName || "Admin"}</strong>
                <span>Admin</span>
              </div>
            </button>
          </div>
        </header>

        <section className="admin-main-content">{children}</section>
      </main>
    </div>
  );
}

export default AdminLayout;