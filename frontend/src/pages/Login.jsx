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
  const { currentUser, authReady, loginUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
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

  if (authReady && currentUser) {
    return <Navigate to={getLandingPath(currentUser.role)} replace />;
  }

  return (
    <div className="app-page">
      <Navbar />

      <section className="auth-section">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Welcome Back</h1>
          <p>Login to continue your food order journey.</p>

          {errorMessage && <div className="error-box" role="alert">{errorMessage}</div>}

          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className={errors.email ? "input-error" : ""}
            type="email"
            name="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="field-error" id="login-email-error">{errors.email}</span>}

          <label htmlFor="login-password">Password</label>
          <div className="password-field">
            <input
              id="login-password"
              className={errors.password ? "input-error" : ""}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "login-password-error" : undefined}
              value={formData.password}
              onChange={handleChange}
            />
            <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <span className="field-error" id="login-password-error">{errors.password}</span>
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
