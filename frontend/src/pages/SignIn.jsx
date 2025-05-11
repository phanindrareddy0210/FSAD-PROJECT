import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/auth.css";

const Signin = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'patient',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8071";
  const signinUrl = `${API_URL}/api/auth/signin`;

  const validateForm = () => {
    const newErrors = {};
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters and can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const signinData = {
        username: formData.username,
        password: formData.password,
      };

      console.log("Sending signin payload:", JSON.stringify(signinData, null, 2));
      const response = await axios.post(
        signinUrl,
        signinData,
        { headers: { "Content-Type": "application/json" } }
      );

      const userData = response.data;

      localStorage.setItem("user", JSON.stringify(userData));
      if (setUser) {
        setUser(userData);
      }
      setMessage("✅ Successfully signed in!");

      setTimeout(() => {
        const role = userData.role.toLowerCase(); // Backend sends role in uppercase (e.g., "DOCTOR")
        if (role === "doctor") {
          navigate("/doctor/dashboard", { replace: true });
        } else if (role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/patient/dashboard", { replace: true });
        }
      }, 1500);
    } catch (error) {
      console.error("Signin error:", error);
      let errorMessage = "❌ Signin failed. Please try again.";
      if (error.isAxiosError) {
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
          switch (error.response.status) {
            case 401:
              errorMessage = "❌ Invalid username or password.";
              break;
            case 400:
              errorMessage = error.response.data || "❌ Invalid request. Please check your input.";
              break;
            case 500:
              errorMessage = "❌ Server error. Please try again later.";
              break;
            default:
              errorMessage = error.response.data || errorMessage;
          }
        } else if (error.request) {
          console.error("No response received:", error.request);
          errorMessage = "❌ Network error: Unable to reach the backend. Please check if the server is running.";
        } else {
          console.error("Error setting up request:", error.message);
          errorMessage = "❌ An unexpected error occurred while setting up the request.";
        }
      }
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Please sign in to continue</p>

        {message && (
          <p className={message.includes("Success") || message.startsWith("✅") ? "success-message" : "error-message"}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? "error" : ""}
              autoComplete="username"
              disabled={isLoading}
              required
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="role">Sign in as *</label>
            <select
              id="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group remember-forgot">
            <label className="remember-me">
              <input type="checkbox" disabled={isLoading} /> Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className={`submit-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? <span>🔄 Signing in...</span> : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;