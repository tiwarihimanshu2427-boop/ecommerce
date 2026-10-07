import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadDashboardData();

    window.addEventListener("userUpdated", loadDashboardData);
    window.addEventListener("cartUpdated", loadDashboardData);
    window.addEventListener("wishlistUpdated", loadDashboardData);

    return () => {
      window.removeEventListener("userUpdated", loadDashboardData);
      window.removeEventListener("cartUpdated", loadDashboardData);
      window.removeEventListener("wishlistUpdated", loadDashboardData);
    };
  }, []);

  const loadDashboardData = () => {
    try {
      // User
      const savedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      setUser(savedUser);

      // Orders
      const savedOrders = JSON.parse(
        localStorage.getItem("orders") || "[]"
      );

      setOrders(savedOrders);

      // Wishlist
      const wishlist = JSON.parse(
        localStorage.getItem("wishlist") || "[]"
      );

      setWishlistCount(wishlist.length);

      // Cart
      const cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      const totalCartItems = cart.reduce(
        (total, item) => total + (Number(item.quantity) || 1),
        0
      );

      setCartCount(totalCartItems);
    } catch (error) {
      console.error("Dashboard data error:", error);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("user");
    localStorage.removeItem("userToken");

    navigate("/login");
  };

  const getInitials = () => {
    if (!user?.name) return "U";

    return user.name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getFirstName = () => {
    if (!user?.name) return "User";

    return user.name.split(" ")[0];
  };

  const getRecentOrders = () => {
    return orders.slice(0, 3);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (!status) return "status-default";

    const value = status.toLowerCase();

    if (value.includes("deliver")) {
      return "status-delivered";
    }

    if (value.includes("cancel")) {
      return "status-cancelled";
    }

    if (value.includes("ship")) {
      return "status-shipped";
    }

    return "status-processing";
  };

  return (
    <main className="dashboard-page">

      {/* Dashboard Header */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">

          <div className="dashboard-welcome">
            <div className="dashboard-avatar">
              {getInitials()}
            </div>

            <div>
              <span className="dashboard-small-text">
                Welcome back,
              </span>

              <h1>
                Hello, {getFirstName()}! 👋
              </h1>

              <p>
                Manage your account, orders and shopping activity.
              </p>
            </div>
          </div>

          <div className="dashboard-header-actions">
            <Link
              to="/products"
              className="continue-shopping-btn"
            >
              🛍️ Continue Shopping
            </Link>
          </div>

        </div>
      </section>

      <div className="dashboard-container">

        {/* Statistics */}
        <section className="dashboard-stats">

          <div className="dashboard-stat-card">
            <div className="stat-icon orders-icon">
              📦
            </div>

            <div className="stat-info">
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
              <small>All your orders</small>
            </div>

            <Link to="/orders" className="stat-arrow">
              →
            </Link>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon wishlist-icon">
              ❤️
            </div>

            <div className="stat-info">
              <span>Wishlist</span>
              <strong>{wishlistCount}</strong>
              <small>Saved products</small>
            </div>

            <Link to="/wishlist" className="stat-arrow">
              →
            </Link>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon cart-icon">
              🛒
            </div>

            <div className="stat-info">
              <span>Cart Items</span>
              <strong>{cartCount}</strong>
              <small>Ready to checkout</small>
            </div>

            <Link to="/cart" className="stat-arrow">
              →
            </Link>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon account-icon">
              👤
            </div>

            <div className="stat-info">
              <span>Account</span>
              <strong>Active</strong>
              <small>Your account</small>
            </div>

            <Link to="/account/edit" className="stat-arrow">
              →
            </Link>
          </div>

        </section>

        {/* Main Dashboard Grid */}
        <section className="dashboard-main-grid">

          {/* Left Column */}
          <div className="dashboard-left">

            {/* Quick Actions */}
            <div className="dashboard-card">

              <div className="dashboard-card-header">
                <div>
                  <span className="section-label">
                    ACCOUNT
                  </span>

                  <h2>Quick Actions</h2>
                </div>
              </div>

              <div className="quick-actions">

                <Link
                  to="/orders"
                  className="quick-action-card"
                >
                  <div className="quick-icon">
                    📦
                  </div>

                  <div>
                    <h3>My Orders</h3>
                    <p>Track and manage your orders</p>
                  </div>

                  <span className="action-arrow">
                    →
                  </span>
                </Link>

                <Link
                  to="/wishlist"
                  className="quick-action-card"
                >
                  <div className="quick-icon">
                    ❤️
                  </div>

                  <div>
                    <h3>My Wishlist</h3>
                    <p>View your saved products</p>
                  </div>

                  <span className="action-arrow">
                    →
                  </span>
                </Link>

                <Link
                  to="/account/addresses"
                  className="quick-action-card"
                >
                  <div className="quick-icon">
                    📍
                  </div>

                  <div>
                    <h3>My Addresses</h3>
                    <p>Manage your delivery addresses</p>
                  </div>

                  <span className="action-arrow">
                    →
                  </span>
                </Link>

                <Link
                  to="/account/edit"
                  className="quick-action-card"
                >
                  <div className="quick-icon">
                    ✏️
                  </div>

                  <div>
                    <h3>Edit Profile</h3>
                    <p>Update your personal information</p>
                  </div>

                  <span className="action-arrow">
                    →
                  </span>
                </Link>

              </div>
            </div>

            {/* Recent Orders */}
            <div className="dashboard-card">

              <div className="dashboard-card-header">
                <div>
                  <span className="section-label">
                    SHOPPING
                  </span>

                  <h2>Recent Orders</h2>
                </div>

                {orders.length > 0 && (
                  <Link to="/orders" className="view-all-link">
                    View All →
                  </Link>
                )}
              </div>

              {getRecentOrders().length === 0 ? (

                <div className="empty-orders">
                  <div className="empty-orders-icon">
                    📦
                  </div>

                  <h3>No orders yet</h3>

                  <p>
                    Your recent orders will appear here.
                  </p>

                  <Link
                    to="/products"
                    className="shop-now-btn"
                  >
                    Start Shopping
                  </Link>
                </div>

              ) : (

                <div className="recent-orders-list">

                  {getRecentOrders().map((order) => (

                    <div
                      className="recent-order-item"
                      key={order.id}
                    >

                      <div className="order-product-icon">
                        📦
                      </div>

                      <div className="recent-order-info">
                        <h3>
                          Order #{order.id}
                        </h3>

                        <p>
                          {formatDate(order.createdAt)}
                        </p>

                        <span>
                          {order.items?.length || 0} item
                          {(order.items?.length || 0) !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>

                      <div className="recent-order-right">

                        <strong>
                          ₹{Number(order.total || 0).toLocaleString("en-IN")}
                        </strong>

                        <span
                          className={`order-status ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status || "Processing"}
                        </span>

                      </div>

                      <Link
                        to={`/order-success/${order.id}`}
                        className="order-view-btn"
                      >
                        View
                      </Link>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

          {/* Right Column */}
          <div className="dashboard-right">

            {/* Profile Card */}
            <div className="profile-dashboard-card">

              <div className="profile-card-top">

                <div className="large-profile-avatar">
                  {getInitials()}
                </div>

                <div className="profile-online">
                  <span></span>
                  Active
                </div>

              </div>

              <h2>
                {user?.name || "User"}
              </h2>

              <p>
                {user?.email || "No email available"}
              </p>

              <Link
                to="/account/edit"
                className="profile-edit-btn"
              >
                ✏️ Edit Profile
              </Link>

              <div className="profile-details">

                <div>
                  <span>📧</span>

                  <section>
                    <small>Email</small>
                    <strong>
                      {user?.email || "Not available"}
                    </strong>
                  </section>
                </div>

                <div>
                  <span>📱</span>

                  <section>
                    <small>Mobile</small>
                    <strong>
                      {user?.mobile || "Not added"}
                    </strong>
                  </section>
                </div>

              </div>

            </div>

            {/* Need Help */}
            <div className="dashboard-help-card">

              <div className="help-icon">
                💬
              </div>

              <div>
                <span>NEED HELP?</span>

                <h3>
                  We're here for you
                </h3>

                <p>
                  Have a question about your order?
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  alert("Customer support will be available soon.")
                }
              >
                Contact Support
              </button>

            </div>

            {/* Logout */}
            <button
              type="button"
              className="dashboard-logout-btn"
              onClick={handleLogout}
            >
              <span>🚪</span>
              Logout from Account
            </button>

          </div>

        </section>

      </div>
    </main>
  );
};

export default UserDashboard;