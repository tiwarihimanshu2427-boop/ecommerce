import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AdminPanel.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [admin, setAdmin] = useState({
    name: "ShopNest Admin",
    email: "admin@shopnest.com",
  });

  const [stats, setStats] = useState({
    products: 12,
    orders: 24,
    customers: 156,
    revenue: 284750,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedAdmin = JSON.parse(
      localStorage.getItem("admin") || "null"
    );

    if (savedAdmin) {
      setAdmin(savedAdmin);
    }

    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    try {
      const products = JSON.parse(
        localStorage.getItem("products") || "[]"
      );

      const orders = JSON.parse(
        localStorage.getItem("orders") || "[]"
      );

      const customers = JSON.parse(
        localStorage.getItem("customers") || "[]"
      );

      const revenue = orders.reduce(
        (total, order) =>
          total + Number(order.total || 0),
        0
      );

      setStats({
        products: products.length || 12,
        orders: orders.length || 24,
        customers: customers.length || 156,
        revenue: revenue || 284750,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === path;
    }

    return location.pathname.startsWith(path);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  return (
    <div className="admin-layout">

      {/* ======================================
          MOBILE OVERLAY
      ====================================== */}

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={closeSidebar}
        ></div>
      )}

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        {/* Logo */}

        <div className="admin-sidebar-logo">

          <div className="admin-logo-icon">
            S
          </div>

          <div>
            <strong>
              SHOP<span>NEST</span>
            </strong>

            <small>
              ADMIN PANEL
            </small>
          </div>

        </div>

        {/* Admin Profile */}

      
        {/* Navigation */}

        <nav className="admin-sidebar-nav">

          <div className="admin-nav-label">
            MAIN MENU
          </div>

          <Link
            to="/admin/dashboard"
            className={
              isActive("/admin/dashboard")
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeSidebar}
          >
            <span className="admin-nav-icon">
              📊
            </span>

            <span>
              Dashboard
            </span>
          </Link>

          <Link
            to="/admin/products"
            className={
              isActive("/admin/products")
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeSidebar}
          >
            <span className="admin-nav-icon">
              📦
            </span>

            <span>
              Products
            </span>
          </Link>

          <Link
            to="/admin/categories"
            className={
              isActive("/admin/categories")
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeSidebar}
          >
            <span className="admin-nav-icon">
              📂
            </span>

            <span>
              Categories
            </span>
          </Link>

          <Link
            to="/admin/orders"
            className={
              isActive("/admin/orders")
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeSidebar}
          >
            <span className="admin-nav-icon">
              🛒
            </span>

            <span>
              Orders
            </span>

            <span className="admin-nav-badge">
              24
            </span>
          </Link>

          <div className="admin-nav-label">
            MANAGEMENT
          </div>

          <Link
            to="/admin/customers"
            className={
              isActive("/admin/customers")
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeSidebar}
          >
            <span className="admin-nav-icon">
              👥
            </span>

            <span>
              Customers
            </span>
          </Link>

          <Link
            to="/admin/inventory"
            className={
              isActive("/admin/inventory")
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeSidebar}
          >
            <span className="admin-nav-icon">
              📊
            </span>

            <span>
              Inventory
            </span>
          </Link>

          <Link
            to="/admin/coupons"
            className={
              isActive("/admin/coupons")
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeSidebar}
          >
            <span className="admin-nav-icon">
              🎟️
            </span>

            <span>
              Coupons
            </span>
          </Link>

          <Link
            to="/admin/reviews"
            className={
              isActive("/admin/reviews")
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeSidebar}
          >
            <span className="admin-nav-icon">
              ⭐
            </span>

            <span>
              Reviews
            </span>
          </Link>

          <div className="admin-nav-label">
            SYSTEM
          </div>

          <Link
            to="/admin/settings"
            className={
              isActive("/admin/settings")
                ? "admin-nav-link active"
                : "admin-nav-link"
            }
            onClick={closeSidebar}
          >
            <span className="admin-nav-icon">
              ⚙️
            </span>

            <span>
              Settings
            </span>
          </Link>

        </nav>

        {/* Sidebar Bottom */}

        <div className="admin-sidebar-bottom">

          <Link
            to="/"
            className="admin-store-link"
            onClick={closeSidebar}
          >
            🛍️
            <span>
              View Store
            </span>
          </Link>

          <button
            type="button"
            className="admin-sidebar-logout"
            onClick={handleLogout}
          >
            🚪
            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* ======================================
          MAIN AREA
      ====================================== */}

      <div className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">

          <button
            type="button"
            className="admin-mobile-menu"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            ☰
          </button>

          <div className="admin-topbar-title">
            <span>
              ShopNest Admin
            </span>

            <small>
              / Dashboard
            </small>
          </div>

          <div className="admin-topbar-right">

            <button
              type="button"
              className="admin-notification-btn"
              title="Notifications"
            >
              🔔
              <span>3</span>
            </button>

            <div className="admin-topbar-user">

              <div className="admin-topbar-avatar">
                {admin.name
                  ?.charAt(0)
                  .toUpperCase() || "A"}
              </div>

              <div>
                <strong>
                  {admin.name || "Admin"}
                </strong>

                <small>
                  Administrator
                </small>
              </div>

            </div>

          </div>

        </header>

        {/* ======================================
            CONTENT
        ====================================== */}

        <main className="admin-content">

          {/* Welcome */}

          <div className="admin-welcome">

            <div>
              <span>
                ADMIN DASHBOARD
              </span>

              <h1>
                Welcome back,{" "}
                {admin.name || "Admin"} 👋
              </h1>

              <p>
                Here's what's happening with your
                store today.
              </p>
            </div>

            <Link
              to="/admin/products"
              className="admin-add-product-btn"
            >
              + Add Product
            </Link>

          </div>

          {/* Stats */}

          <section className="admin-stats-grid">

            <div className="admin-stat-card">

              <div className="admin-stat-icon purple">
                📦
              </div>

              <div>
                <span>
                  Total Products
                </span>

                <strong>
                  {stats.products}
                </strong>

                <small>
                  +12.5% this month
                </small>
              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon blue">
                🛒
              </div>

              <div>
                <span>
                  Total Orders
                </span>

                <strong>
                  {stats.orders}
                </strong>

                <small>
                  +8.4% this month
                </small>
              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon green">
                👥
              </div>

              <div>
                <span>
                  Customers
                </span>

                <strong>
                  {stats.customers}
                </strong>

                <small>
                  +15.2% this month
                </small>
              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon orange">
                💰
              </div>

              <div>
                <span>
                  Total Revenue
                </span>

                <strong>
                  {formatCurrency(
                    stats.revenue
                  )}
                </strong>

                <small>
                  +18.7% this month
                </small>
              </div>

            </div>

          </section>

          {/* Dashboard Grid */}

          <section className="admin-dashboard-grid">

            {/* Sales */}

            <div className="admin-card sales-card">

              <div className="admin-card-header">

                <div>
                  <span>
                    PERFORMANCE
                  </span>

                  <h2>
                    Sales Overview
                  </h2>
                </div>

                <select defaultValue="7">
                  <option value="7">
                    Last 7 Days
                  </option>

                  <option value="30">
                    Last 30 Days
                  </option>

                  <option value="90">
                    Last 3 Months
                  </option>
                </select>

              </div>

              <div className="simple-chart">

                <div
                  style={{
                    height: "42%",
                  }}
                >
                  <span>Mon</span>
                </div>

                <div
                  style={{
                    height: "65%",
                  }}
                >
                  <span>Tue</span>
                </div>

                <div
                  style={{
                    height: "50%",
                  }}
                >
                  <span>Wed</span>
                </div>

                <div
                  style={{
                    height: "76%",
                  }}
                >
                  <span>Thu</span>
                </div>

                <div
                  style={{
                    height: "61%",
                  }}
                >
                  <span>Fri</span>
                </div>

                <div
                  style={{
                    height: "90%",
                  }}
                >
                  <span>Sat</span>
                </div>

                <div
                  style={{
                    height: "72%",
                  }}
                >
                  <span>Sun</span>
                </div>

              </div>

            </div>

            {/* Quick Actions */}

            <div className="admin-card">

              <div className="admin-card-header">

                <div>
                  <span>
                    SHORTCUTS
                  </span>

                  <h2>
                    Quick Actions
                  </h2>
                </div>

              </div>

              <div className="admin-quick-actions">

                <Link
                  to="/admin/products"
                  className="admin-quick-action"
                >
                  <span>➕</span>

                  <div>
                    <strong>
                      Add Product
                    </strong>

                    <small>
                      Create new product
                    </small>
                  </div>

                  →
                </Link>

                <Link
                  to="/admin/orders"
                  className="admin-quick-action"
                >
                  <span>📦</span>

                  <div>
                    <strong>
                      Manage Orders
                    </strong>

                    <small>
                      View all orders
                    </small>
                  </div>

                  →
                </Link>

                <Link
                  to="/admin/customers"
                  className="admin-quick-action"
                >
                  <span>👥</span>

                  <div>
                    <strong>
                      Customers
                    </strong>

                    <small>
                      Manage customers
                    </small>
                  </div>

                  →
                </Link>

                <Link
                  to="/admin/inventory"
                  className="admin-quick-action"
                >
                  <span>📊</span>

                  <div>
                    <strong>
                      Inventory
                    </strong>

                    <small>
                      Check stock
                    </small>
                  </div>

                  →
                </Link>

              </div>

            </div>

          </section>

          {/* Bottom Cards */}

          <section className="admin-bottom-grid">

            <div className="admin-card">

              <div className="admin-card-header">

                <div>
                  <span>
                    STORE
                  </span>

                  <h2>
                    Store Health
                  </h2>
                </div>

              </div>

              <div className="store-health">

                <div>
                  <span>
                    🟢
                  </span>

                  <strong>
                    Store Status
                  </strong>

                  <b>
                    Active
                  </b>
                </div>

                <div>
                  <span>
                    📦
                  </span>

                  <strong>
                    Inventory
                  </strong>

                  <b>
                    Healthy
                  </b>
                </div>

                <div>
                  <span>
                    ⭐
                  </span>

                  <strong>
                    Reviews
                  </strong>

                  <b>
                    4.6 / 5
                  </b>
                </div>

                <div>
                  <span>
                    🎟️
                  </span>

                  <strong>
                    Coupons
                  </strong>

                  <b>
                    8 Active
                  </b>
                </div>

              </div>

            </div>

            

          </section>

        </main>

      </div>

    </div>
  );
}

export default AdminDashboard;