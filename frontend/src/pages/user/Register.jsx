import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

const API_URL = "http://localhost:5000/api/auth";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agreeTerms, setAgreeTerms] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert("Please fill all fields.");
      return;
    }

    const mobile =
      formData.mobile.replace(/\D/g, "");

    if (mobile.length !== 10) {
      alert(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (formData.password.length < 6) {
      alert(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      alert("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      alert(
        "Please accept the Terms & Conditions."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email:
              formData.email
                .trim()
                .toLowerCase(),
            mobile,
            password:
              formData.password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Registration failed."
        );
      }

      alert(
        "Account created successfully!"
      );

      navigate("/login");

    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      alert(
        error.message ||
          "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-container">

        <div className="register-brand">
          <Link
            to="/"
            className="register-logo"
          >
            ShopNest
          </Link>

          <p>
            Create your ShopNest account
          </p>
        </div>

        <div className="register-card">

          <div className="register-header">
            <div className="register-icon">
              🛍️
            </div>

            <h1>Create Account</h1>

            <p>
              Join ShopNest and start
              shopping today.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="register-form-group">
              <label>Full Name</label>

              <div className="register-input-wrapper">
                <span>👤</span>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="register-form-group">
              <label>Email Address</label>

              <div className="register-input-wrapper">
                <span>✉️</span>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="register-form-group">
              <label>Mobile Number</label>

              <div className="register-input-wrapper">
                <span>📱</span>

                <input
                  type="tel"
                  name="mobile"
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  value={formData.mobile}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="register-form-group">
              <label>Password</label>

              <div className="register-input-wrapper">
                <span>🔒</span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>
              </div>
            </div>

            <div className="register-form-group">
              <label>
                Confirm Password
              </label>

              <div className="register-input-wrapper">
                <span>🔐</span>

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword
                    ? "🙈"
                    : "👁️"}
                </button>
              </div>
            </div>

            <label className="register-terms">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) =>
                  setAgreeTerms(
                    e.target.checked
                  )
                }
              />

              <span>
                I agree to the{" "}
                <Link to="/terms">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              type="submit"
              className="register-submit-btn"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}

              {!loading && (
                <span>→</span>
              )}
            </button>

          </form>

          <div className="already-account">
            Already have an account?

            <Link to="/login">
              Login
            </Link>
          </div>

        </div>

        <div className="register-footer">
          <span>
            🔒 Secure Registration
          </span>

          <span>•</span>

          <span>ShopNest</span>
        </div>

      </div>
    </main>
  );
};

export default Register;