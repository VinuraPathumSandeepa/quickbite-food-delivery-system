import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import AdminLayout from "../components/AdminLayout";
import DeliveryLayout from "../components/DeliveryLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import {
  getBackendFieldErrors,
  safeCustomerMessage,
  validateProfileForm,
} from "../utils/validation";

function Profile() {
  const { currentUser, updateCurrentUser } = useAuth();
  const userId = currentUser?.id;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    vehicleType: "",
    vehicleNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get(`/users/${userId}`);
      const user = response.data;

      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "",
        vehicleType: user.vehicleType || "",
        vehicleNumber: user.vehicleNumber || "",
      });

      setMessage("");
    } catch (error) {
      setMessage(safeCustomerMessage(error, "Couldn't load your profile. Please try again."));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) void Promise.resolve().then(loadProfile);
  }, [userId, loadProfile]);

  const getInitials = (name) => {
    if (!name) return "U";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const formatRole = (role) => {
    if (role === "CUSTOMER") return "Customer";
    if (role === "ADMIN") return "Administrator";
    if (role === "DELIVERY") return "Delivery Person";
    return "User";
  };

  const getRoleDescription = (role) => {
    if (role === "CUSTOMER") {
      return "You can browse food, manage your cart, place orders, and track deliveries.";
    }

    if (role === "ADMIN") {
      return "You can manage foods, categories, collections, orders, and system operations.";
    }

    if (role === "DELIVERY") {
      return "You can view assigned orders, accept deliveries, and update delivery status.";
    }

    return "Manage your account details.";
  };

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setErrors((previous) => ({
      ...previous,
      [e.target.name]: "",
    }));

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const validationErrors = validateProfileForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(`/users/${currentUser.id}/profile`, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
      });

      updateCurrentUser(response.data);

      setMessage("Profile updated successfully.");
      setMessageType("success");
    } catch (error) {
      const backendErrors = getBackendFieldErrors(error);

      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      } else {
        setMessage(safeCustomerMessage(error, "Couldn't update your profile. Please try again."));
        setMessageType("error");
      }
    } finally {
      setSaving(false);
    }
  };

  const renderQuickLinks = () => {
    if (formData.role === "CUSTOMER") {
      return (
        <>
          <Link to="/menu" className="profile-quick-link">
            <span>🍽️</span>
            <div>
              <strong>Browse Menu</strong>
              <p>Find and order food</p>
            </div>
          </Link>

          <Link to="/customer/cart" className="profile-quick-link">
            <span>🛒</span>
            <div>
              <strong>My Cart</strong>
              <p>Review selected items</p>
            </div>
          </Link>

          <Link to="/customer/orders" className="profile-quick-link">
            <span>📦</span>
            <div>
              <strong>My Orders</strong>
              <p>Track order history</p>
            </div>
          </Link>
        </>
      );
    }

    if (formData.role === "ADMIN") {
      return (
        <>
          <Link to="/admin/dashboard" className="profile-quick-link">
            <span>📊</span>
            <div>
              <strong>Admin Dashboard</strong>
              <p>View revenue and order summary</p>
            </div>
          </Link>

          <Link to="/admin/foods" className="profile-quick-link">
            <span>🍔</span>
            <div>
              <strong>Manage Foods</strong>
              <p>Add and update food items</p>
            </div>
          </Link>

          <Link to="/admin/orders" className="profile-quick-link">
            <span>📦</span>
            <div>
              <strong>Manage Orders</strong>
              <p>Update and assign orders</p>
            </div>
          </Link>
        </>
      );
    }

    if (formData.role === "DELIVERY") {
      return (
        <>
          <Link to="/delivery/dashboard" className="profile-quick-link">
            <span>📊</span>
            <div>
              <strong>Delivery Dashboard</strong>
              <p>View delivery summary</p>
            </div>
          </Link>

          <Link to="/delivery/assigned-orders" className="profile-quick-link">
            <span>🚚</span>
            <div>
              <strong>Assigned Orders</strong>
              <p>Manage assigned deliveries</p>
            </div>
          </Link>

          <Link to="/delivery/completed-orders" className="profile-quick-link">
            <span>✅</span>
            <div>
              <strong>Completed Orders</strong>
              <p>View delivered orders</p>
            </div>
          </Link>
        </>
      );
    }

    return null;
  };

  const profileContent = (
    <section className="pro-profile-section">
      {loading ? (
        <LoadingSpinner text="Loading profile..." />
      ) : (
        <div className="pro-profile-grid">
          <aside className="pro-profile-sidebar">
            <div className="pro-profile-card">
              <div className="pro-profile-avatar">
                {getInitials(formData.fullName)}
              </div>

              <h2>{formData.fullName}</h2>
              <p>{formData.email}</p>

              <span className="pro-profile-role">
                {formatRole(formData.role)}
              </span>
            </div>

            <div className="pro-profile-info-card">
              <h3>Account Overview</h3>

              <div className="pro-profile-info-row">
                <span>👤</span>
                <div>
                  <strong>Role</strong>
                  <p>{formatRole(formData.role)}</p>
                </div>
              </div>

              <div className="pro-profile-info-row">
                <span>📞</span>
                <div>
                  <strong>Phone</strong>
                  <p>{formData.phone || "Not available"}</p>
                </div>
              </div>

              <div className="pro-profile-info-row">
                <span>📍</span>
                <div>
                  <strong>Address</strong>
                  <p>{formData.address || "Not available"}</p>
                </div>
              </div>

              {formData.role === "DELIVERY" && (
                <>
                  <div className="pro-profile-info-row">
                    <span>🏍️</span>
                    <div>
                      <strong>Vehicle Type</strong>
                      <p>{formData.vehicleType || "Not available"}</p>
                    </div>
                  </div>

                  <div className="pro-profile-info-row">
                    <span>🔢</span>
                    <div>
                      <strong>Vehicle Number</strong>
                      <p>{formData.vehicleNumber || "Not available"}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pro-profile-info-card">
              <h3>Quick Access</h3>
              <div className="profile-quick-link-list">{renderQuickLinks()}</div>
            </div>
          </aside>

          <div className="pro-profile-main">
            <div className="pro-profile-header-card">
              <div>
                <p className="profile-kicker">Profile Settings</p>
                <h2>Personal Details</h2>
                <p>{getRoleDescription(formData.role)}</p>
              </div>

              <div className="profile-header-icon">⚙️</div>
            </div>

            <form className="pro-profile-form-card" onSubmit={handleSubmit}>
              {message && (
                <div
                  className={
                    messageType === "success" ? "success-box" : "error-box"
                  }
                >
                  {message}
                </div>
              )}

              <div className="profile-form-grid">
                <div>
                  <label htmlFor="profile-fullName">Full Name</label>
                  <input
                    id="profile-fullName"
                    className={errors.fullName ? "input-error" : ""}
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                  {errors.fullName && (
                    <span className="field-error">{errors.fullName}</span>
                  )}
                </div>

                <div>
                  <label htmlFor="profile-email">Email</label>
                  <input
                    id="profile-email"
                    className={errors.email ? "input-error" : ""}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <span className="field-error">{errors.email}</span>
                  )}
                </div>

                <div>
                  <label htmlFor="profile-phone">Phone Number</label>
                  <input
                    id="profile-phone"
                    className={errors.phone ? "input-error" : ""}
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <span className="field-error">{errors.phone}</span>
                  )}
                </div>

                <div>
                  <label htmlFor="profile-role">Role</label>
                  <input
                    id="profile-role"
                    type="text"
                    value={formatRole(formData.role)}
                    disabled
                  />
                  <p className="form-note">Role cannot be changed from profile.</p>
                </div>

                <div className="profile-form-full">
                  <label htmlFor="profile-address">Address</label>
                  <textarea
                    id="profile-address"
                    className={errors.address ? "input-error" : ""}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                  ></textarea>
                  {errors.address && (
                    <span className="field-error">{errors.address}</span>
                  )}
                </div>

                {formData.role === "DELIVERY" && (
                  <>
                    <div>
                      <label htmlFor="profile-vehicleType">Vehicle Type</label>
                      <input
                        id="profile-vehicleType"
                        className={errors.vehicleType ? "input-error" : ""}
                        type="text"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        placeholder="Example: Motor Bike"
                      />
                      {errors.vehicleType && (
                        <span className="field-error">
                          {errors.vehicleType}
                        </span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="profile-vehicleNumber">Vehicle Number</label>
                      <input
                        id="profile-vehicleNumber"
                        className={errors.vehicleNumber ? "input-error" : ""}
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        placeholder="Example: WP ABC 1234"
                      />
                      {errors.vehicleNumber && (
                        <span className="field-error">
                          {errors.vehicleNumber}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="profile-form-actions">
                <button type="submit" className="full-btn" disabled={saving}>
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );

  if (currentUser?.role === "ADMIN") {
    return (
      <AdminLayout
        title="My Profile"
        subtitle="View and update your admin account details."
      >
        {profileContent}
      </AdminLayout>
    );
  }

  if (currentUser?.role === "DELIVERY") {
    return (
      <DeliveryLayout
        title="My Profile"
        subtitle="View and update your delivery account details."
      >
        {profileContent}
      </DeliveryLayout>
    );
  }

  return (
    <div className="app-page">
      <Navbar />

      <PageHeader
        title="My Profile"
        subtitle="View and update your registered account details."
      />

      {profileContent}
    </div>
  );
}

export default Profile;
