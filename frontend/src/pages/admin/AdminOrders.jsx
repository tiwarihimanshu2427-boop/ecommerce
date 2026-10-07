import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./AdminOrders.css";

const API_URL = "http://localhost:5000/api/orders";

/*
========================================================
STATUS OPTIONS
========================================================
*/

const STATUS_OPTIONS = [
  "Order Placed",
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",

  // RETURN
  "Return Requested",
  "Return Approved",
  "Return Rejected",
  "Return Picked Up",
  "Refund Initiated",
  "Refund Completed",

  // EXCHANGE
  "Exchange Requested",
  "Exchange Approved",
  "Exchange Rejected",
  "Exchange Picked Up",
  "Exchange Shipped",
  "Exchange Completed",
];

/*
========================================================
HELPER
========================================================
*/

const isValidJwt = (token) => {
  if (!token || typeof token !== "string") {
    return false;
  }

  const parts = token.trim().split(".");

  return (
    parts.length === 3 &&
    parts[0].length > 0 &&
    parts[1].length > 0 &&
    parts[2].length > 0
  );
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [error, setError] = useState("");

  /*
  ======================================================
  AUTH TOKEN
  ======================================================
  */

  const getAuthToken = () => {

  const adminToken = localStorage.getItem("adminToken");

  if (
    !adminToken ||
    typeof adminToken !== "string"
  ) {
    console.error("ADMIN TOKEN NOT FOUND");
    return null;
  }

  const token = adminToken.trim();

  if (!isValidJwt(token)) {

    console.error(
      "INVALID ADMIN JWT TOKEN"
    );

    localStorage.removeItem("adminToken");

    return null;
  }

  console.log(
    "ADMIN JWT FOUND:",
    token.substring(0, 20) + "..."
  );

  return token;
};

  /*
  ======================================================
  LOAD ORDERS
  ======================================================
  */

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      if (!token) {
        setError(
          "Valid admin authentication token not found. Please login to Admin again."
        );

        setOrders([]);

        return;
      }

      console.log(
        "ADMIN TOKEN:",
        token ? "VALID JWT FOUND" : "NOT FOUND"
      );

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log(
        "ADMIN ORDERS RESPONSE:",
        data
      );

      /*
      ================================================
      INVALID TOKEN
      ================================================
      */

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        /*
          Sirf malformed/invalid admin token ko
          remove karenge.
        */

        const adminToken =
          localStorage.getItem("adminToken");

        if (
          adminToken &&
          !isValidJwt(adminToken)
        ) {
          localStorage.removeItem("adminToken");
        }

        throw new Error(
          data.message ||
            "Invalid or expired authentication token. Please login to Admin again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load orders."
        );
      }

      const receivedOrders =
        Array.isArray(data.orders)
          ? data.orders
          : Array.isArray(data)
          ? data
          : [];

      /*
      ================================================
      LOAD DETAILED ORDERS
      ================================================
      */

      const detailedOrders =
        await Promise.all(
          receivedOrders.map(
            async (order) => {
              try {
                const reference =
                  order.order_number ||
                  order.orderNumber ||
                  order.id;

                const detailResponse =
                  await fetch(
                    `${API_URL}/${reference}`
                  );

                const detailData =
                  await detailResponse.json();

                if (
                  detailResponse.ok &&
                  detailData.order
                ) {
                  return normalizeOrder(
                    detailData.order
                  );
                }

                return normalizeOrder(order);
              } catch (detailError) {
                console.error(
                  "ORDER DETAIL ERROR:",
                  detailError
                );

                return normalizeOrder(order);
              }
            }
          )
        );

      setOrders(detailedOrders);
    } catch (err) {
      console.error(
        "LOAD ADMIN ORDERS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load orders."
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  /*
  ======================================================
  NORMALIZE ORDER
  ======================================================
  */

  const normalizeOrder = (order) => {
    const items = Array.isArray(order.items)
      ? order.items
      : [];

    const paymentMethod = String(
      order.payment_method ||
        order.paymentMethod ||
        "cod"
    ).toLowerCase();

    const paymentStatus =
      order.payment_status ||
      order.paymentStatus ||
      (paymentMethod === "cod"
        ? "Pending"
        : "Paid");

    const paymentId =
      order.payment_id ||
      order.paymentId ||
      "";

    let paymentName = "Pending";

    if (paymentMethod === "cod") {
      paymentName = "COD";
    } else if (
      paymentMethod === "upi"
    ) {
      paymentName = "UPI";
    } else if (
      paymentMethod === "card"
    ) {
      paymentName = "Card";
    } else if (
      paymentMethod === "online"
    ) {
      paymentName = "Online";
    } else if (paymentMethod) {
      paymentName =
        paymentMethod.toUpperCase();
    }

    return {
      ...order,

      id:
        order.order_number ||
        order.orderNumber ||
        order.id,

      databaseId: order.id,

      customer:
        order.full_name ||
        order.fullName ||
        "Customer",

      email:
        order.email || "",

      phone:
        order.phone || "",

      date:
        order.created_at ||
        order.createdAt,

      items: items.length,

      itemDetails: items,

      total: Number(
        order.total || 0
      ),

      payment: paymentName,

      paymentMethod,

      paymentStatus,

      paymentId,

      deliveryMethod:
        order.delivery_method ||
        order.deliveryMethod ||
        "standard",

      status:
        order.status ||
        "Order Placed",

      address:
        order.address || "",

      city:
        order.city || "",

      state:
        order.state || "",

      pincode:
        order.pincode || "",

      subtotal: Number(
        order.subtotal || 0
      ),

      deliveryCharge: Number(
        order.delivery_charge ||
          order.deliveryCharge ||
          0
      ),

      discount: Number(
        order.discount || 0
      ),
    };
  };

  /*
  ======================================================
  RECEIPT
  ======================================================
  */

  const downloadReceipt = (order) => {
    if (!order) return;

    const itemsHtml =
      Array.isArray(order.itemDetails) &&
      order.itemDetails.length > 0
        ? order.itemDetails
            .map(
              (item) => `
                <tr>
                  <td>
                    ${item.product_name || "Product"}
                  </td>

                  <td>
                    ${item.selected_size || "-"}
                  </td>

                  <td>
                    ${item.quantity || 1}
                  </td>

                  <td>
                    ₹${Number(
                      item.price || 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td>
                    ₹${(
                      Number(item.price || 0) *
                      Number(item.quantity || 1)
                    ).toLocaleString("en-IN")}
                  </td>
                </tr>
              `
            )
            .join("")
        : `
          <tr>
            <td colspan="5">
              Product details not available
            </td>
          </tr>
        `;

    const receiptWindow = window.open(
      "",
      "_blank",
      "width=900,height=900"
    );

    if (!receiptWindow) {
      alert(
        "Please allow pop-ups to download the receipt."
      );

      return;
    }

    receiptWindow.document.write(`
      <!DOCTYPE html>

      <html>

      <head>

        <title>
          ShoeMaker Receipt - ${order.id}
        </title>

        <meta charset="UTF-8" />

        <style>

          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 30px;
            color: #111827;
          }

          .receipt {
            max-width: 800px;
            margin: auto;
          }

          .header {
            text-align: center;
            border-bottom: 2px solid #111827;
            padding-bottom: 18px;
            margin-bottom: 25px;
          }

          .header h1 {
            margin-bottom: 5px;
          }

          .info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 25px;
          }

          .box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }

          th,
          td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f3f4f6;
          }

          .total {
            text-align: right;
            margin-top: 20px;
            font-size: 20px;
            font-weight: bold;
          }

          .status {
            margin-top: 15px;
            padding: 12px;
            border-radius: 8px;
            background: #f5f3ff;
          }

          .address {
            margin-top: 25px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
          }

          @media print {
            body {
              padding: 0;
            }

            .receipt {
              max-width: none;
            }
          }

        </style>

      </head>

      <body>

        <div class="receipt">

          <div class="header">

            <h1>
              👟 ShoeMaker
            </h1>

            <div>
              Order Receipt
            </div>

          </div>

          <div class="info">

            <div class="box">
              <strong>Order ID</strong>
              <br />
              ${order.id || "-"}
            </div>

            <div class="box">
              <strong>Date</strong>
              <br />
              ${formatDate(order.date)}
            </div>

            <div class="box">
              <strong>Customer</strong>
              <br />
              ${order.customer || "-"}
              <br />
              ${order.email || "-"}
              <br />
              ${order.phone || "-"}
            </div>

            <div class="box">
              <strong>Payment</strong>
              <br />
              ${getPaymentName(
                order.paymentMethod
              )}
              <br />
              Status:
              ${order.paymentStatus || "Pending"}
            </div>

          </div>

          <div class="status">
            <strong>Order Status:</strong>
            ${order.status || "Order Placed"}
          </div>

          <h3>
            Products
          </h3>

          <table>

            <thead>

              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>

            </thead>

            <tbody>
              ${itemsHtml}
            </tbody>

          </table>

          <div class="total">
            Grand Total:
            ₹${Number(
              order.total || 0
            ).toLocaleString("en-IN")}
          </div>

          <div class="address">

            <strong>
              Delivery Address
            </strong>

            <br />
            <br />

            ${order.address || ""}

            <br />

            ${order.city || ""}

            ${
              order.state
                ? `, ${order.state}`
                : ""
            }

            ${
              order.pincode
                ? ` - ${order.pincode}`
                : ""
            }

          </div>

        </div>

        <script>

          window.onload = function () {
            window.print();
          };

        </script>

      </body>

      </html>
    `);

    receiptWindow.document.close();
  };

  /*
  ======================================================
  UPDATE ORDER STATUS
  ======================================================
  */

  const updateOrderStatus = async (
    id,
    newStatus
  ) => {
    try {
      setUpdatingStatus(true);
      setError("");

      /*
      --------------------------------------------------
      GET ONLY VALID JWT
      --------------------------------------------------
      */

      const token = getAuthToken();

      console.log(
        "STATUS UPDATE TOKEN FOUND:",
        token ? "YES - VALID JWT" : "NO"
      );

      if (!token) {
        /*
          Remove broken admin token.
        */

        const adminToken =
          localStorage.getItem("adminToken");

        if (
          adminToken &&
          !isValidJwt(adminToken)
        ) {
          localStorage.removeItem(
            "adminToken"
          );
        }

        throw new Error(
          "Admin login expired or token is invalid. Please login to Admin again."
        );
      }

      /*
      --------------------------------------------------
      UPDATE STATUS
      --------------------------------------------------
      */

      const response = await fetch(
        `${API_URL}/${encodeURIComponent(
          id
        )}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "STATUS UPDATE RESPONSE:",
        data
      );

      /*
      --------------------------------------------------
      AUTH ERROR
      --------------------------------------------------
      */

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        const adminToken =
          localStorage.getItem("adminToken");

        if (
          adminToken &&
          !isValidJwt(adminToken)
        ) {
          localStorage.removeItem(
            "adminToken"
          );
        }

        throw new Error(
          data.message ||
            "Invalid or expired authentication token. Please login to Admin again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update order status."
        );
      }

      /*
      --------------------------------------------------
      UPDATE LOCAL LIST
      --------------------------------------------------
      */

      setOrders(
        (previousOrders) =>
          previousOrders.map(
            (order) =>
              order.id === id
                ? {
                    ...order,
                    status:
                      newStatus,
                  }
                : order
          )
      );

      /*
      --------------------------------------------------
      UPDATE SELECTED ORDER
      --------------------------------------------------
      */

      setSelectedOrder(
        (previous) =>
          previous
            ? {
                ...previous,
                status:
                  newStatus,
              }
            : null
      );

      /*
      --------------------------------------------------
      SUCCESS MESSAGE
      --------------------------------------------------
      */

      if (
        newStatus === "Confirmed"
      ) {
        alert(
          data.statusEmailSent
            ? "Order confirmed successfully. Confirmation email sent to customer."
            : "Order confirmed successfully."
        );
      } else if (
        newStatus ===
        "Return Requested"
      ) {
        alert(
          "Return request updated successfully."
        );
      } else if (
        newStatus ===
        "Exchange Requested"
      ) {
        alert(
          "Exchange request updated successfully."
        );
      } else {
        alert(
          `Order status changed to "${newStatus}".`
        );
      }
    } catch (err) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to update order status."
      );

      /*
        Agar token invalid hai to clear broken
        admin token so next login fresh token
        save kar sake.
      */

      if (
        String(err.message || "")
          .toLowerCase()
          .includes("token")
      ) {
        const adminToken =
          localStorage.getItem(
            "adminToken"
          );

        if (
          adminToken &&
          !isValidJwt(adminToken)
        ) {
          localStorage.removeItem(
            "adminToken"
          );
        }
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  /*
  ======================================================
  FILTER ORDERS
  ======================================================
  */

  const filteredOrders =
    useMemo(() => {
      return orders.filter(
        (order) => {
          const searchText =
            search
              .toLowerCase()
              .trim();

          const matchesSearch =
            !searchText ||
            String(order.id)
              .toLowerCase()
              .includes(searchText) ||
            String(order.customer)
              .toLowerCase()
              .includes(searchText) ||
            String(order.email)
              .toLowerCase()
              .includes(searchText) ||
            String(order.paymentId || "")
              .toLowerCase()
              .includes(searchText);

          const matchesStatus =
            statusFilter === "All" ||
            order.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      orders,
      search,
      statusFilter,
    ]);

  /*
  ======================================================
  STATS
  ======================================================
  */

  const totalOrders =
    orders.length;

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status ===
          "Pending" ||
        order.status ===
          "Order Placed" ||
        order.status ===
          "Return Requested" ||
        order.status ===
          "Exchange Requested"
    ).length;

  const processingOrders =
    orders.filter(
      (order) =>
        order.status ===
          "Processing" ||
        order.status ===
          "Confirmed" ||
        order.status ===
          "Shipped" ||
        order.status ===
          "Out for Delivery"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Delivered"
    ).length;

  const totalRevenue =
    orders
      .filter(
        (order) =>
          (
            String(
              order.paymentStatus ||
                ""
            ).toLowerCase() ===
              "paid" ||
            order.paymentMethod ===
              "cod"
          ) &&
          order.status !==
            "Cancelled" &&
          order.status !==
            "Refund Completed"
      )
      .reduce(
        (sum, order) =>
          sum +
          Number(
            order.total || 0
          ),
        0
      );

  /*
  ======================================================
  HELPERS
  ======================================================
  */

  const formatCurrency = (
    amount
  ) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getPaymentName = (
    method
  ) => {
    if (method === "cod") {
      return "Cash on Delivery";
    }

    if (method === "upi") {
      return "UPI";
    }

    if (method === "card") {
      return "Credit / Debit Card";
    }

    if (method === "online") {
      return "Online Payment";
    }

    return method || "Pending";
  };

  const getPaymentClass = (
    status
  ) => {
    const value = String(
      status || "Pending"
    )
      .toLowerCase()
      .replace(/\s+/g, "-");

    if (
      value.includes("paid") ||
      value.includes("success")
    ) {
      return "paid";
    }

    if (
      value.includes("fail") ||
      value.includes("cancel")
    ) {
      return "failed";
    }

    return "pending";
  };

  const getStatusClass = (
    status
  ) => {
    return String(
      status || ""
    )
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  /*
  ======================================================
  LOADING
  ======================================================
  */

  if (loading) {
    return (
      <div className="orders-page">

        <div className="orders-header">

          <div>
            <h1>
              Orders
            </h1>

            <p>
              Manage and track all
              customer orders.
            </p>
          </div>

        </div>

        <div className="orders-empty">

          <div>
            ⏳
          </div>

          <h3>
            Loading Orders...
          </h3>

          <p>
            Fetching orders from
            PostgreSQL.
          </p>

        </div>

      </div>
    );
  }

  /*
  ======================================================
  MAIN UI
  ======================================================
  */

  return (
    <div className="orders-page">

      {/* HEADER */}

      <div className="orders-header">

        <div>

          <h1>
            Orders
          </h1>

          <p>
            Manage and track all
            customer orders.
          </p>

        </div>

        <button
          className="refresh-btn"
          onClick={loadOrders}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div
          className="orders-error"
        >
          <strong>
            ⚠️
          </strong>

          <span>
            {error}
          </span>

          {String(error)
            .toLowerCase()
            .includes("token") && (
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(
                  "adminToken"
                );

                localStorage.removeItem(
                  "authToken"
                );

                window.location.href =
                  "/admin/login";
              }}
            >
              Login Again
            </button>
          )}
        </div>
      )}

      {/* STATS */}

      <div className="orders-stats">

        <div className="order-stat-card">

          <div className="order-stat-icon">
            🛒
          </div>

          <div>
            <span>
              Total Orders
            </span>

            <h2>
              {totalOrders}
            </h2>
          </div>

        </div>

        <div className="order-stat-card">

          <div className="order-stat-icon pending">
            ⏳
          </div>

          <div>
            <span>
              Pending
            </span>

            <h2>
              {pendingOrders}
            </h2>
          </div>

        </div>

        <div className="order-stat-card">

          <div className="order-stat-icon processing">
            📦
          </div>

          <div>
            <span>
              Processing
            </span>

            <h2>
              {processingOrders}
            </h2>
          </div>

        </div>

        <div className="order-stat-card">

          <div className="order-stat-icon delivered">
            ✓
          </div>

          <div>
            <span>
              Delivered
            </span>

            <h2>
              {deliveredOrders}
            </h2>
          </div>

        </div>

        <div className="order-stat-card">

          <div className="order-stat-icon revenue">
            ₹
          </div>

          <div>
            <span>
              Revenue
            </span>

            <h2>
              {formatCurrency(
                totalRevenue
              )}
            </h2>
          </div>

        </div>

      </div>

      {/* TOOLBAR */}

      <div className="orders-toolbar">

        <div className="orders-search">

          <span>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search order, customer, email or payment ID..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >

          <option value="All">
            All Status
          </option>

          {STATUS_OPTIONS.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            )
          )}

        </select>

      </div>

      {/* TABLE */}

      <div className="orders-table-card">

        <div className="table-title">

          <div>

            <h3>
              Recent Orders
            </h3>

            <p>
              {filteredOrders.length}{" "}
              orders found
            </p>

          </div>

        </div>

        {filteredOrders.length ===
        0 ? (
          <div className="orders-empty">

            <div>
              📭
            </div>

            <h3>
              No orders found
            </h3>

            <p>
              Try changing your
              search or filter.
            </p>

          </div>
        ) : (
          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>

                <tr>

                  <th>
                    Order ID
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Items
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredOrders.map(
                  (order) => (

                    <tr
                      key={
                        order.databaseId ||
                        order.id
                      }
                    >

                      <td>

                        <strong>
                          {order.id}
                        </strong>

                      </td>

                      <td>

                        <div className="customer-cell">

                          <div className="customer-avatar">

                            {String(
                              order.customer ||
                                "C"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {
                                order.customer
                              }
                            </strong>

                            <small>
                              {
                                order.email
                              }
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>
                        {formatDate(
                          order.date
                        )}
                      </td>

                      <td>
                        {order.items}
                      </td>

                      <td>

                        <strong>
                          {formatCurrency(
                            order.total
                          )}
                        </strong>

                      </td>

                      <td>

                        <div className="payment-cell">

                          <span
                            className={`payment-badge ${getPaymentClass(
                              order.paymentStatus
                            )}`}
                          >
                            {
                              order.payment
                            }
                          </span>

                          <small
                            className={`payment-status-text ${getPaymentClass(
                              order.paymentStatus
                            )}`}
                          >
                            {
                              order.paymentStatus
                            }
                          </small>

                          {order.paymentId && (
                            <small className="payment-id">
                              {
                                order.paymentId
                              }
                            </small>
                          )}

                        </div>

                      </td>

                      <td>

                        <span
                          className={`status-badge ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {
                            order.status
                          }
                        </span>

                      </td>

                      <td>

                        <button
                          className="view-order-btn"
                          onClick={() =>
                            setSelectedOrder(
                              order
                            )
                          }
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ORDER MODAL */}

      {selectedOrder && (

        <div
          className="order-modal-overlay"
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            className="order-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>
                  Order Details
                </h2>

                <p>
                  {selectedOrder.id}
                </p>

              </div>

              <button
                className="close-modal"
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            {/* CUSTOMER */}

            <div className="order-detail-section">

              <h4>
                Customer
              </h4>

              <div className="detail-box">

                <strong>
                  {
                    selectedOrder.customer
                  }
                </strong>

                <span>
                  {
                    selectedOrder.email
                  }
                </span>

                {selectedOrder.phone && (
                  <span>
                    {
                      selectedOrder.phone
                    }
                  </span>
                )}

              </div>

            </div>

            {/* ORDER INFO */}

            <div className="order-detail-grid">

              <div>
                <span>
                  Order Date
                </span>

                <strong>
                  {formatDate(
                    selectedOrder.date
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Items
                </span>

                <strong>
                  {
                    selectedOrder.items
                  }
                </strong>
              </div>

              <div>
                <span>
                  Total
                </span>

                <strong>
                  {formatCurrency(
                    selectedOrder.total
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Payment
                </span>

                <strong>
                  {getPaymentName(
                    selectedOrder.paymentMethod
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Payment Status
                </span>

                <strong
                  className={`payment-status-text ${getPaymentClass(
                    selectedOrder.paymentStatus
                  )}`}
                >
                  {
                    selectedOrder.paymentStatus
                  }
                </strong>
              </div>

              {selectedOrder.paymentId && (
                <div>

                  <span>
                    Payment ID
                  </span>

                  <strong className="payment-id">
                    {
                      selectedOrder.paymentId
                    }
                  </strong>

                </div>
              )}

              <div>

                <span>
                  Delivery
                </span>

                <strong>
                  {
                    selectedOrder.deliveryMethod
                  }
                </strong>

              </div>

            </div>

            {/* ADDRESS */}

            {(selectedOrder.address ||
              selectedOrder.city) && (

              <div className="order-detail-section">

                <h4>
                  Delivery Address
                </h4>

                <div className="detail-box">

                  <span>
                    {
                      selectedOrder.address
                    }
                  </span>

                  <span>

                    {
                      selectedOrder.city
                    }

                    {
                      selectedOrder.state
                        ? `, ${selectedOrder.state}`
                        : ""
                    }

                    {
                      selectedOrder.pincode
                        ? ` - ${selectedOrder.pincode}`
                        : ""
                    }

                  </span>

                </div>

              </div>
            )}

            {/* PRODUCTS */}

            {selectedOrder.itemDetails &&
              selectedOrder.itemDetails.length >
                0 && (

              <div className="order-detail-section">

                <h4>
                  Products
                </h4>

                <div className="admin-product-list">

                  {selectedOrder.itemDetails.map(
                    (item) => (

                      <div
                        key={
                          item.id ||
                          `${item.product_id}-${item.selected_size}`
                        }
                        className="admin-product-row"
                      >

                        {/* PRODUCT IMAGE */}

                        <div className="admin-product-image">

                          {item.image ? (
                            <img
                              src={item.image}
                              alt={
                                item.product_name ||
                                "Product"
                              }
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";

                                if (
                                  e.currentTarget
                                    .nextSibling
                                ) {
                                  e.currentTarget.nextSibling.style.display =
                                    "flex";
                                }
                              }}
                            />
                          ) : null}

                          <div
                            className="admin-product-placeholder"
                            style={{
                              display:
                                item.image
                                  ? "none"
                                  : "flex",
                            }}
                          >
                            👟
                          </div>

                        </div>

                        {/* PRODUCT INFO */}

                        <div className="admin-product-info">

                          <strong>
                            {
                              item.product_name ||
                              "Product"
                            }
                          </strong>

                          <span>
                            Qty:{" "}
                            {
                              item.quantity ||
                              1
                            }

                            {item.selected_size
                              ? ` | Size: ${item.selected_size}`
                              : ""}
                          </span>

                        </div>

                        <strong className="admin-product-price">

                          {formatCurrency(
                            Number(
                              item.price ||
                                0
                            ) *
                              Number(
                                item.quantity ||
                                  1
                              )
                          )}

                        </strong>

                      </div>

                    )
                  )}

                </div>

              </div>
            )}

            {/* RECEIPT */}

            <div
              className="receipt-actions"
            >

              <button
                type="button"
                onClick={() =>
                  downloadReceipt(
                    selectedOrder
                  )
                }
                className="receipt-download-btn"
              >
                📄 Download Receipt
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadReceipt(
                    selectedOrder
                  )
                }
                className="receipt-print-btn"
              >
                🖨️ Print Receipt
              </button>

            </div>

            {/* STATUS UPDATE */}

            <div className="order-detail-section">

              <div className="status-update-heading">

                <div>

                  <h4>
                    Update Order Status
                  </h4>

                  <p>
                    Select the current
                    status of this order.
                  </p>

                </div>

                <span
                  className={`status-badge ${getStatusClass(
                    selectedOrder.status
                  )}`}
                >
                  {
                    selectedOrder.status
                  }
                </span>

              </div>

              <select
                value={
                  selectedOrder.status
                }
                disabled={
                  updatingStatus
                }
                onChange={(e) =>
                  updateOrderStatus(
                    selectedOrder.id,
                    e.target.value
                  )
                }
                className="status-select"
              >

                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}

              </select>

              {updatingStatus && (
                <small className="status-updating">
                  ⏳ Updating status...
                </small>
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminOrders;