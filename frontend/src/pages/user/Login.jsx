import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     HANDLE INPUT
  ===================================================== */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  /* =====================================================
     JWT CHECK
  ===================================================== */

  const isValidJwt = (token) => {
    if (!token || typeof token !== "string") {
      return false;
    }

    return token.trim().split(".").length === 3;
  };

  /* =====================================================
     LOGIN
     ADMIN + USER
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !formData.email.trim() ||
      !formData.password
    ) {
      setError("Please enter email and password.");
      return;
    }

    const email = formData.email
      .trim()
      .toLowerCase();

    const password = formData.password;

    try {
      setLoading(true);

      /* =================================================
         CLEAR OLD LOGIN DATA
      ================================================= */

      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      localStorage.removeItem("userToken");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");

      /* =================================================
         ADMIN LOGIN
         Same /login page se admin login
      ================================================= */

      if (email === "admin@shopnest.com") {

        console.log("ADMIN LOGIN ATTEMPT");

        const adminResponse = await fetch(
         "https://ecommerce-dmv8.vercel.app/api/auth/admin-login",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        const adminData =
          await adminResponse.json();

        console.log(
          "ADMIN LOGIN RESPONSE:",
          adminData
        );

        if (
          adminResponse.ok &&
          adminData.success &&
          isValidJwt(adminData.token)
        ) {

          /* =============================================
             SAVE REAL ADMIN JWT
          ============================================= */

          localStorage.setItem(
            "adminToken",
            adminData.token
          );

          localStorage.setItem(
            "admin",
            JSON.stringify(
              adminData.admin || {
                id: "admin",
                name: "ShopNest Admin",
                email,
                role: "admin",
              }
            )
          );

          console.log(
            "REAL ADMIN JWT SAVED"
          );

          /* =============================================
             DIRECT ADMIN DASHBOARD
          ============================================= */

          navigate(
            "/admin/dashboard",
            {
              replace: true,
            }
          );

          return;
        }

        /* =============================================
           ADMIN EMAIL BUT WRONG PASSWORD
        ============================================= */

        throw new Error(
          adminData.message ||
          "Invalid admin email or password."
        );
      }

      /* =================================================
         USER LOGIN
      ================================================= */

      console.log("USER LOGIN ATTEMPT");

      const response = await fetch(
       "https://ecommerce-dmv8.vercel.app/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "USER LOGIN RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
          "Invalid email or password."
        );
      }

      /* =================================================
         GET USER JWT
      ================================================= */

      const token =
        data.token ||
        data.accessToken ||
        data.jwt;

      if (!isValidJwt(token)) {

        throw new Error(
          "Login successful, but valid authentication token was not received."
        );
      }

      /* =================================================
         SAVE USER LOGIN
      ================================================= */

      localStorage.setItem(
        "userToken",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user || {}
        )
      );

      localStorage.setItem(
        "rememberMe",
        rememberMe
          ? "true"
          : "false"
      );

      console.log(
        "REAL USER JWT SAVED"
      );

      /* =================================================
         DIRECT USER ACCOUNT
      ================================================= */

      navigate(
        "/account",
        {
          replace: true,
        }
      );

    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error.message ||
        "Invalid email or password."
      );

    } finally {

      setLoading(false);

    }
  };

  /* =====================================================
     FORGOT PASSWORD
  ===================================================== */

  const handleForgotPassword = () => {
    alert(
      "Forgot Password feature will be connected to email reset."
    );
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main className="login-page">

      <div className="login-container">

        {/* BRAND */}

        <div className="login-brand">

          <Link
            to="/"
            className="login-logo"
          >
            ShopNest
          </Link>

          <p>
            Your everyday shopping destination
          </p>

        </div>

        {/* LOGIN CARD */}

        <div className="login-card">

          {/* HEADER */}

          <div className="login-header">

            <div className="login-icon">
              👋
            </div>

            <h1>
              Welcome Back!
            </h1>

            <p>
              Login to continue shopping with ShopNest.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}

            <div className="login-form-group">

              <label>
                Email Address
              </label>

              <div className="login-input-wrapper">

                <span>
                  ✉️
                </span>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  disabled={loading}
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="login-form-group">

              <div className="login-label-row">

                <label>
                  Password
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "#6d4aff",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Forgot Password?
                </button>

              </div>

              <div className="login-input-wrapper">

                <span>
                  🔒
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* REMEMBER */}

            <label className="remember-me">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
                disabled={loading}
              />

              <span>
                Remember me
              </span>

            </label>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >

              {loading
                ? "Logging in..."
                : "Login"}

              {!loading && (
                <span>
                  →
                </span>
              )}

            </button>

          </form>

          {/* DIVIDER */}

          <div className="login-divider">
            <span>
              OR
            </span>
          </div>

          {/* ADMIN LOGIN */}

          <div className="demo-login">

            <span>
              👑
            </span>

            <p>

              <strong>
                Administrator?
              </strong>

              <br />

              <Link
                to="/admin/login"
                style={{
                  color: "#6d4aff",
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                Login to Admin Panel →
              </Link>

            </p>

          </div>

          {/* REGISTER */}

          <div className="register-link">

            Don't have an account?

            {" "}

            <Link to="/register">
              Create Account
            </Link>

          </div>

        </div>

        {/* FOOTER */}

        <div className="login-footer">

          <span>
            🔒 Secure Login
          </span>

          <span>
            •
          </span>

          <span>
            ShopNest
          </span>

        </div>

      </div>

    </main>
  );
};

export default Login;