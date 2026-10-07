import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /*
  =====================================================
  HANDLE INPUT
  =====================================================
  */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  /*
  =====================================================
  CHECK JWT FORMAT
  =====================================================
  */

  const isValidJwt = (token) => {
    if (
      !token ||
      typeof token !== "string"
    ) {
      return false;
    }

    const parts =
      token.trim().split(".");

    return (
      parts.length === 3 &&
      parts.every(
        (part) =>
          part &&
          part.length > 0
      )
    );
  };

  /*
  =====================================================
  ADMIN LOGIN
  =====================================================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !form.email.trim() ||
      !form.password.trim()
    ) {
      setError(
        "Please enter email and password."
      );

      return;
    }

    try {
      setLoading(true);

      /*
      ==============================================
      ADMIN LOGIN API
      ==============================================
      */

      const response = await fetch(
        "http://localhost:5000/api/auth/admin-login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              form.email.trim(),

            password:
              form.password,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "ADMIN LOGIN RESPONSE:",
        data
      );

      /*
      ==============================================
      CHECK API RESPONSE
      ==============================================
      */

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Invalid admin email or password."
        );
      }

      /*
      ==============================================
      GET TOKEN
      ==============================================

      Different backend response formats are
      supported here.
      */

      const token =
        data.token ||
        data.accessToken ||
        data.jwt ||
        data.data?.token ||
        data.data?.accessToken ||
        data.admin?.token ||
        null;

      console.log(
        "ADMIN TOKEN RECEIVED:",
        token
          ? "YES"
          : "NO"
      );

      /*
      ==============================================
      TOKEN VALIDATION
      ==============================================
      */

      if (!isValidJwt(token)) {
        console.error(
          "INVALID ADMIN JWT:",
          token
        );

        throw new Error(
          "Admin login succeeded, but the server did not return a valid JWT token."
        );
      }

      /*
      ==============================================
      CLEAR OLD TOKENS
      ==============================================
      */

      localStorage.removeItem(
        "adminToken"
      );

      localStorage.removeItem(
        "userToken"
      );

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "authToken"
      );

      /*
      ==============================================
      SAVE FRESH ADMIN JWT
      ==============================================
      */

      localStorage.setItem(
        "adminToken",
        token
      );

      /*
      ==============================================
      SAVE ADMIN DATA
      ==============================================
      */

      if (data.admin) {
        localStorage.setItem(
          "admin",
          JSON.stringify(
            data.admin
          )
        );
      }

      /*
      ==============================================
      VERIFY TOKEN WAS ACTUALLY SAVED
      ==============================================
      */

      const savedToken =
        localStorage.getItem(
          "adminToken"
        );

      if (
        !isValidJwt(savedToken)
      ) {
        throw new Error(
          "Admin token could not be saved correctly."
        );
      }

      console.log(
        "ADMIN JWT TOKEN SAVED SUCCESSFULLY"
      );

      /*
      ==============================================
      GO TO DASHBOARD
      ==============================================
      */

      navigate(
        "/admin/dashboard",
        {
          replace: true,
        }
      );

    } catch (error) {
      console.error(
        "ADMIN LOGIN ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to login as admin."
      );

    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================================
  FORGOT PASSWORD
  =====================================================
  */

  const handleForgotPassword = () => {
    alert(
      "Demo Admin Login\n\n" +
        "Email: admin@shopnest.com\n" +
        "Password: admin123"
    );
  };

  /*
  =====================================================
  UI
  =====================================================
  */

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        {/* LOGO */}

        <div className="admin-login-logo">

          <div className="logo-icon">
            S
          </div>

          <h1>
            SHOP<span>ADMIN</span>
          </h1>

        </div>

        {/* HEADING */}

        <div className="login-heading">

          <h2>
            Welcome Back
          </h2>

          <p>
            Sign in to access your admin panel
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
        >

          {/* EMAIL */}

          <div className="input-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="admin@shopnest.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              disabled={loading}
            />

          </div>

          {/* PASSWORD */}

          <div className="input-group">

            <div className="password-label">

              <label>
                Password
              </label>

              <button
                type="button"
                onClick={
                  handleForgotPassword
                }
                disabled={loading}
              >
                Forgot Password?
              </button>

            </div>

            <div className="password-input">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="show-password"
                disabled={loading}
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >

            {loading
              ? "Signing In..."
              : "Sign In to Dashboard"}

            {!loading && (
              <span>
                →
              </span>
            )}

          </button>

        </form>

        {/* DEMO CREDENTIALS */}

        <div className="admin-demo-box">

          <div className="admin-demo-icon">
            💡
          </div>

          <div>

            <strong>
              Demo Admin Login
            </strong>

            <p>
              Email: admin@shopnest.com
            </p>

            <p>
              Password: admin123
            </p>

          </div>

        </div>

        {/* FOOTER */}

        <div className="login-footer">

          <span>
            🔒
          </span>

          Secure administrator access

        </div>

      </div>

    </div>
  );
}

export default AdminLogin;