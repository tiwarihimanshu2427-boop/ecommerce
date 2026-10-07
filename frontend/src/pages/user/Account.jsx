import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Account.css";

const API_URL = "https://ecommerce-dmv8.vercel.app";

function Account() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("User data error:", error);
      }
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("userToken");

      if (!token) {
        setOrders([]);
        setLoading(false);
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("MY ORDERS RESPONSE:", response.data);

      if (response.data.success) {
        setOrders(
          Array.isArray(response.data.orders)
            ? response.data.orders
            : []
        );
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch orders:",
        error.response?.data || error.message
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (!status) return "status-default";

    const value = status.toLowerCase();

    if (
      value.includes("delivered") ||
      value.includes("complete")
    ) {
      return "status-success";
    }

    if (value.includes("cancel")) {
      return "status-danger";
    }

    if (
      value.includes("ship") ||
      value.includes("dispatch")
    ) {
      return "status-info";
    }

    return "status-warning";
  };

  return (
    <div className="account-page">

      {/* HEADER */}
      <div className="account-header">
        <div>
          <h1>My Account</h1>
          <p>
            Manage your profile, orders and account settings.
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* USER PROFILE */}
      <div className="account-grid">

        <div className="account-card profile-card">
          <div className="profile-icon">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div className="profile-info">
            <h2>{user?.name || "User"}</h2>

            <p>
              {user?.email || "No email available"}
            </p>

            {user?.mobile && (
              <p>{user.mobile}</p>
            )}
          </div>

          <Link
            to="/account/edit"
            className="edit-profile-btn"
          >
            Edit Profile
          </Link>
        </div>

        {/* QUICK LINKS */}
        <div className="account-card">
          <h3>Quick Links</h3>

          <div className="quick-links">

            <Link to="/orders">
              <span>📦</span>
              <div>
                <strong>My Orders</strong>
                <small>View all your orders</small>
              </div>
            </Link>

            <Link to="/account/addresses">
              <span>📍</span>
              <div>
                <strong>My Addresses</strong>
                <small>Manage delivery addresses</small>
              </div>
            </Link>

            <Link to="/wishlist">
              <span>❤️</span>
              <div>
                <strong>Wishlist</strong>
                <small>View your saved products</small>
              </div>
            </Link>

            <Link to="/products">
              <span>🛍️</span>
              <div>
                <strong>Continue Shopping</strong>
                <small>Explore our products</small>
              </div>
            </Link>

          </div>
        </div>

      </div>

      {/* RECENT ORDERS */}
      <div className="orders-section">

        <div className="section-heading">
          <div>
            <h2>Recent Orders</h2>
            <p>Your latest purchases</p>
          </div>

          <Link to="/orders">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="account-message">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="account-message empty-orders">

            <div className="empty-icon">
              📦
            </div>

            <h3>No Orders Yet</h3>

            <p>
              You haven't placed any orders yet.
            </p>

            <Link
              to="/products"
              className="shop-now-btn"
            >
              Start Shopping
            </Link>

          </div>
        ) : (
          <div className="orders-list">

            {orders.slice(0, 5).map((order) => {

              const orderNumber =
                order.order_number ||
                order.orderNumber ||
                `#${order.id}`;

              const createdAt =
                order.created_at ||
                order.createdAt;

              const paymentMethod =
                order.payment_method ||
                order.paymentMethod ||
                "COD";

              return (
                <div
                  className="order-card"
                  key={order.id || orderNumber}
                >

                  {/* ORDER MAIN */}
                  <div className="order-main">

                    <div>
                      <span className="order-label">
                        Order Number
                      </span>

                      <strong>
                        {orderNumber}
                      </strong>
                    </div>

                    <div>
                      <span className="order-label">
                        Date
                      </span>

                      <strong>
                        {formatDate(createdAt)}
                      </strong>
                    </div>

                    <div>
                      <span className="order-label">
                        Total
                      </span>

                      <strong>
                        ₹
                        {Number(
                          order.total || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div>
                      <span className="order-label">
                        Status
                      </span>

                      <span
                        className={`order-status ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status || "Order Placed"}
                      </span>
                    </div>

                  </div>

                  {/* PRODUCTS */}
                  {Array.isArray(order.items) &&
                    order.items.length > 0 && (
                      <div className="order-products">

                        {order.items
                          .slice(0, 3)
                          .map((item) => (

                            <div
                              className="order-product"
                              key={item.id}
                            >

                              <img
                                src={
                                  item.image ||
                                  "/placeholder-shoe.png"
                                }
                                alt={
                                  item.product_name ||
                                  "Product"
                                }
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder-shoe.png";
                                }}
                              />

                              <div>
                                <strong>
                                  {item.product_name ||
                                    "Product"}
                                </strong>

                                <p>
                                  Qty:{" "}
                                  {item.quantity || 1}

                                  {item.selected_size && (
                                    <>
                                      {" • Size: "}
                                      {item.selected_size}
                                    </>
                                  )}
                                </p>
                              </div>

                            </div>

                          ))}

                      </div>
                    )}

                  {/* FOOTER */}
                  <div className="order-footer">

                    <span>
                      Payment:{" "}
                      <strong>
                        {paymentMethod}
                      </strong>
                    </span>

                    <Link
                      to={`/order-success/${
                        order.order_number || order.id
                      }`}
                      className="view-order-btn"
                    >
                      View Order
                    </Link>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* ACCOUNT INFO */}
      <div className="account-info-grid">

        <div className="info-card">
          <span>📧</span>
          <div>
            <small>Email</small>
            <strong>
              {user?.email || "-"}
            </strong>
          </div>
        </div>

        <div className="info-card">
          <span>📱</span>
          <div>
            <small>Mobile</small>
            <strong>
              {user?.mobile || "-"}
            </strong>
          </div>
        </div>

        <div className="info-card">
          <span>📦</span>
          <div>
            <small>Total Orders</small>
            <strong>
              {orders.length}
            </strong>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Account;