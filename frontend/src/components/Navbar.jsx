import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { currentUser, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const getNavLinks = () => {
    if (!currentUser) {
      return [
        { path: "/", label: "Home", icon: "🏠" },
        { path: "/menu", label: "Menu", icon: "🍽️" },
      ];
    }

    if (currentUser.role === "CUSTOMER") {
      return [
        { path: "/", label: "Home", icon: "🏠" },
        { path: "/menu", label: "Menu", icon: "🍽️" },
        { path: "/customer/cart", label: "Cart", icon: "🛒" },
        { path: "/customer/orders", label: "My Orders", icon: "📦" },
      ];
    }

    if (currentUser.role === "ADMIN") {
      return [
        { path: "/", label: "Home", icon: "🏠" },
        { path: "/menu", label: "Menu", icon: "🍽️" },
        { path: "/admin/dashboard", label: "Admin Panel", icon: "📊" },
      ];
    }

    if (currentUser.role === "DELIVERY") {
      return [
        { path: "/delivery/dashboard", label: "Dashboard", icon: "📊" },
        { path: "/delivery/assigned-orders", label: "Assigned", icon: "🚚" },
        { path: "/delivery/completed-orders", label: "Completed", icon: "✅" },
      ];
    }

    return [];
  };

  const getInitials = (name) => {
    if (!name) return "U";

    const nameParts = name.trim().split(" ");

    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }

    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const formatRole = (role) => {
    if (!role) return "User";

    if (role === "CUSTOMER") return "Customer";
    if (role === "ADMIN") return "Admin";
    if (role === "DELIVERY") return "Delivery Person";

    return role;
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">🍽</span>
        <span>QuickBite.</span>
      </Link>

      <nav className="nav-links">
        {getNavLinks().map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              isActive ? "nav-link active-nav-link" : "nav-link"
            }
          >
            <span className="nav-link-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="nav-actions">
        {currentUser ? (
          <>
            <button
              className="user-profile-chip"
              onClick={() => navigate("/profile")}
              title="View and update profile"
            >
              <div className="profile-avatar">
                {getInitials(currentUser.fullName)}
              </div>

              <div className="profile-text">
                <strong>{currentUser.fullName}</strong>
                <span>{formatRole(currentUser.role)}</span>
              </div>
            </button>

            <button className="solid-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/register" className="outline-btn">
              Create Account
            </Link>

            <Link to="/login" className="solid-btn">
              Login
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;