import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  getBackendFieldErrors,
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
          error.response?.data?.message ||
            "Registration failed. Please try again."
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

          {errorMessage && <div className="error-box">{errorMessage}</div>}
          {successMessage && (
            <div className="success-box">{successMessage}</div>
          )}

          <label>Full Name</label>
          <input
            className={errors.fullName ? "input-error" : ""}
            type="text"
            name="fullName"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && (
            <span className="field-error">{errors.fullName}</span>
          )}

          <label>Email</label>
          <input
            className={errors.email ? "input-error" : ""}
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}

          <label>Password</label>
          <input
            className={errors.password ? "input-error" : ""}
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <span className="field-error">{errors.password}</span>
          )}

          <label>Confirm Password</label>
          <input
            className={errors.confirmPassword ? "input-error" : ""}
            type="password"
            name="confirmPassword"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <span className="field-error">{errors.confirmPassword}</span>
          )}

          <label>Phone</label>
          <input
            className={errors.phone ? "input-error" : ""}
            type="text"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}

          <label>Address</label>
          <input
            className={errors.address ? "input-error" : ""}
            type="text"
            name="address"
            placeholder="Enter address"
            value={formData.address}
            onChange={handleChange}
          />
          {errors.address && (
            <span className="field-error">{errors.address}</span>
          )}

          <label>Register As</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="CUSTOMER">Customer</option>
            <option value="DELIVERY">Delivery Person</option>
          </select>

          {formData.role === "DELIVERY" && (
            <>
              <label>Vehicle Type</label>
              <input
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

              <label>Vehicle Number</label>
              <input
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