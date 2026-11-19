import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getLandingPath } from "../context/session";
import {
  getBackendFieldErrors,
  validateLoginForm,
} from "../utils/validation";

function Login() {
  const { currentUser, loginUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    const validationErrors = validateLoginForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoggingIn(true);

      const user = await loginUser(formData.email, formData.password);

      navigate(getLandingPath(user.role), { replace: true });
    } catch (error) {
      const backendErrors = getBackendFieldErrors(error);

      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      } else {
        setErrorMessage(
          error.response?.data?.message ||
            "Login failed. Check your email and password."
        );
      }
    } finally {
      setLoggingIn(false);
    }
  };

  if (currentUser) {
    return <Navigate to={getLandingPath(currentUser.role)} replace />;
  }

  return (
    <div className="app-page">
      <Navbar />

      <section className="auth-section">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Welcome Back</h1>
          <p>Login to continue your food order journey.</p>

          {errorMessage && <div className="error-box">{errorMessage}</div>}

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

          <button type="submit" className="full-btn" disabled={loggingIn}>
            {loggingIn ? "Logging In..." : "Login"}
          </button>

          <p className="auth-bottom-text">
            Do not have an account?{" "}
            <Link to="/register">Create Account</Link>
          </p>
        </form>
      </section>
    </div>
  );
}

export default Login;
