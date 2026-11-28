import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  getBackendFieldErrors,
  safeCustomerMessage,
  validateRegisterForm,
} from "../utils/validation";

function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    role: "CUSTOMER",
    vehicleType: "",
    vehicleNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [registering, setRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setErrors((previous) => ({
      ...previous,
      [e.target.name]: "",
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationErrors = validateRegisterForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const registerPayload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address,
      role: formData.role,
      vehicleType: formData.vehicleType,
      vehicleNumber: formData.vehicleNumber,
    };

    try {
      setRegistering(true);

      await registerUser(registerPayload);

      setSuccessMessage("Account created successfully. Please login.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      const backendErrors = getBackendFieldErrors(error);

      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      } else {
        setErrorMessage(
          safeCustomerMessage(error, "Registration failed. Please try again.")
        );
      }
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="app-page">
      <Navbar />

      <section className="auth-section">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Create Account</h1>
          <p>Register as customer or delivery person.</p>

          {errorMessage && <div className="error-box" role="alert">{errorMessage}</div>}
          {successMessage && (
            <div className="success-box" role="status">{successMessage}</div>
          )}

          <label htmlFor="register-fullName">Full Name</label>
          <input
            id="register-fullName"
            className={errors.fullName ? "input-error" : ""}
            type="text"
            name="fullName"
            autoComplete="name"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && (
            <span className="field-error">{errors.fullName}</span>
          )}

          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            className={errors.email ? "input-error" : ""}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}

          <label htmlFor="register-password">Password</label>
          <div className="password-field">
            <input
              id="register-password"
              className={errors.password ? "input-error" : ""}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide passwords" : "Show passwords"} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button>
          </div>
          {errors.password && (
            <span className="field-error">{errors.password}</span>
          )}

          <label htmlFor="register-confirmPassword">Confirm Password</label>
          <input
            id="register-confirmPassword"
            className={errors.confirmPassword ? "input-error" : ""}
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <span className="field-error">{errors.confirmPassword}</span>
          )}

          <label htmlFor="register-phone">Phone</label>
          <input
            id="register-phone"
            className={errors.phone ? "input-error" : ""}
            type="text"
            name="phone"
            autoComplete="tel"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}

          <label htmlFor="register-address">Address</label>
          <input
            id="register-address"
            className={errors.address ? "input-error" : ""}
            type="text"
            name="address"
            autoComplete="street-address"
            placeholder="Enter address"
            value={formData.address}
            onChange={handleChange}
          />
          {errors.address && (
            <span className="field-error">{errors.address}</span>
          )}

          <label htmlFor="register-role">Register As</label>
          <select id="register-role" name="role" value={formData.role} onChange={handleChange}>
            <option value="CUSTOMER">Customer</option>
            <option value="DELIVERY">Delivery Person</option>
          </select>

          {formData.role === "DELIVERY" && (
            <>
              <label htmlFor="register-vehicleType">Vehicle Type</label>
              <input
                id="register-vehicleType"
                className={errors.vehicleType ? "input-error" : ""}
                type="text"
                name="vehicleType"
                placeholder="Example: Motor Bike"
                value={formData.vehicleType}
                onChange={handleChange}
              />
              {errors.vehicleType && (
                <span className="field-error">{errors.vehicleType}</span>
              )}

              <label htmlFor="register-vehicleNumber">Vehicle Number</label>
              <input
                id="register-vehicleNumber"
                className={errors.vehicleNumber ? "input-error" : ""}
                type="text"
                name="vehicleNumber"
                placeholder="Example: WP ABC 1234"
                value={formData.vehicleNumber}
                onChange={handleChange}
              />
              {errors.vehicleNumber && (
                <span className="field-error">{errors.vehicleNumber}</span>
              )}
            </>
          )}

          <button type="submit" className="full-btn" disabled={registering}>
            {registering ? "Creating Account..." : "Create Account"}
          </button>

          <p className="auth-bottom-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </div>
  );
}

export default Register;
