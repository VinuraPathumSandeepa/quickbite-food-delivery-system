import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

const linksByRole = {
  guest: [{ path: "/", label: "Home", icon: "home" }, { path: "/menu", label: "Menu", icon: "menu" }, { path: "/login", label: "Login", icon: "login", mobileOnly: true }, { path: "/register", label: "Join", icon: "plus", mobileOnly: true }],
  CUSTOMER: [{ path: "/", label: "Home", icon: "home" }, { path: "/menu", label: "Menu", icon: "menu" }, { path: "/customer/cart", label: "Cart", icon: "cart" }, { path: "/customer/orders", label: "Orders", icon: "orders" }, { path: "/profile", label: "Profile", icon: "user", mobileOnly: true }],
  ADMIN: [{ path: "/", label: "Home", icon: "home" }, { path: "/menu", label: "Menu", icon: "menu" }, { path: "/admin/dashboard", label: "Admin Panel", icon: "dashboard" }, { path: "/profile", label: "Profile", icon: "user", mobileOnly: true }],
  DELIVERY: [{ path: "/delivery/dashboard", label: "Dashboard", icon: "dashboard" }, { path: "/delivery/assigned-orders", label: "Assigned", icon: "delivery" }, { path: "/delivery/completed-orders", label: "Completed", icon: "check" }, { path: "/profile", label: "Profile", icon: "user", mobileOnly: true }],
};

function Navbar() {
  const { currentUser, logoutUser } = useAuth();
  const navigate = useNavigate();
  const links = linksByRole[currentUser?.role || "guest"] || linksByRole.guest;
  const initials = currentUser?.fullName?.trim().split(/\s+/).map((part) => part[0]).filter(Boolean);
  const displayInitials = initials?.length ? `${initials[0]}${initials.length > 1 ? initials.at(-1) : ""}`.toUpperCase() : "U";

  const handleLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand" aria-label="QuickBite home">
        <span className="brand-icon"><Icon name="menu" size={23} /></span>
        <span>QuickBite<span className="brand-period">.</span></span>
      </Link>

      <nav className="nav-links" aria-label="Main navigation">
        {links.map((link) => (
          <NavLink key={link.path} to={link.path} end={link.path === "/"} className={({ isActive }) => `nav-link${isActive ? " active-nav-link" : ""}${link.mobileOnly ? " mobile-only-nav-link" : ""}`}>
            <Icon name={link.icon} size={20} className="nav-link-icon" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="nav-actions">
        {currentUser ? (
          <>
            <button type="button" className="user-profile-chip" onClick={() => navigate("/profile")} aria-label={`View profile for ${currentUser.fullName}`}>
              <span className="profile-avatar">{displayInitials}</span>
              <span className="profile-text"><strong>{currentUser.fullName}</strong><span>{currentUser.role === "DELIVERY" ? "Delivery Person" : currentUser.role === "ADMIN" ? "Admin" : "Customer"}</span></span>
            </button>
            <button type="button" className="solid-btn nav-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/register" className="outline-btn nav-register">Create Account</Link>
            <Link to="/login" className="solid-btn nav-login">Login</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
