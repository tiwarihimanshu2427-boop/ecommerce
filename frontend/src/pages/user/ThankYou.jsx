import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import UserNavbar from "../../components/common/UserNavbar";
import "./ThankYou.css";

const API_URL = "http://localhost:5000/api/orders";

const getOrderReference = (order) =>
  order?.orderNumber ||
  order?.order_number ||
  order?.id ||
  "";

const normalizeOrder = (raw = {}) => ({
  ...raw,

  id: getOrderReference(raw),

  createdAt:
    raw.createdAt ||
    raw.created_at ||
    new Date().toISOString(),

  status: raw.status || "Confirmed",

  paymentMethod:
    raw.paymentMethod ||
    raw.payment_method ||
    "cod",

  paymentStatus:
    raw.paymentStatus ||
    raw.payment_status ||
    "Pending",

  paymentId:
    raw.paymentId ||
    raw.payment_id ||
    "",

  customer:
    raw.customer || {
      fullName: raw.full_name || "",
      email: raw.email || "",
      phone: raw.phone || "",
      address: raw.address || "",
      city: raw.city || "",
      state: raw.state || "",
      pincode: raw.pincode || "",
    },

  items: (
    raw.items ||
    raw.order_items ||
    []
  ).map((item) => ({
    ...item,

    name:
      item.name ||
      item.product_name ||
      "Product",

    price: Number(item.price || 0),

    quantity: Number(
      item.quantity || 1
    ),

    selectedSize:
      item.selectedSize ||
      item.selected_size ||
      "",
  })),

  subtotal: Number(
    raw.subtotal || 0
  ),

  deliveryCharge: Number(
    raw.deliveryCharge ??
      raw.delivery_charge ??
      0
  ),

  discount: Number(
    raw.discount || 0
  ),

  total: Number(
    raw.total || 0
  ),
});

const ThankYou = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD ORDER
  ===================================================== */

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/${encodeURIComponent(id)}`
        );

        if (response.ok) {
          const data =
            await response.json();

          const serverOrder =
            data?.order ||
            data?.data ||
            data;

          if (serverOrder) {
            const normalized =
              normalizeOrder(
                serverOrder
              );

            setOrder(normalized);

            localStorage.setItem(
              "lastOrder",
              JSON.stringify(normalized)
            );

            return;
          }
        }

        /* Local storage fallback */

        const saved =
          localStorage.getItem(
            "lastOrder"
          );

        if (saved) {
          const savedOrder =
            normalizeOrder(
              JSON.parse(saved)
            );

          if (
            String(savedOrder.id) ===
            String(id)
          ) {
            setOrder(savedOrder);
            return;
          }
        }

        setError(
          "Unable to load your order."
        );
      } catch (err) {
        console.error(
          "Thank You order error:",
          err
        );

        setError(
          "Unable to load your order."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadOrder();
    }
  }, [id]);

  /* =====================================================
     DOWNLOAD RECEIPT
  ===================================================== */

  const downloadReceipt = () => {
    if (!order) return;

    const doc = new jsPDF();

    const customer =
      order.customer || {};

    doc.setFontSize(22);
    doc.setTextColor(
      100,
      65,
      235
    );

    doc.text(
      "ShoeMaker",
      105,
      20,
      {
        align: "center",
      }
    );

    doc.setFontSize(16);
    doc.setTextColor(
      35,
      35,
      45
    );

    doc.text(
      "ORDER RECEIPT",
      105,
      30,
      {
        align: "center",
      }
    );

    doc.setFontSize(11);

    doc.text(
      `Order ID: ${order.id}`,
      15,
      45
    );

    doc.text(
      `Customer: ${
        customer.fullName ||
        "Customer"
      }`,
      15,
      53
    );

    doc.text(
      `Email: ${
        customer.email || "-"
      }`,
      15,
      61
    );

    doc.text(
      `Phone: ${
        customer.phone || "-"
      }`,
      15,
      69
    );

    doc.text(
      `Payment: ${
        order.paymentMethod ===
        "cod"
          ? "Cash on Delivery"
          : order.paymentMethod ===
            "upi"
          ? "UPI"
          : "Credit / Debit Card"
      }`,
      15,
      77
    );

    const rows =
      order.items.map(
        (item) => [
          item.name ||
            "Product",

          item.selectedSize ||
            "-",

          item.quantity || 1,

          `₹${Number(
            item.price || 0
          ).toLocaleString(
            "en-IN"
          )}`,

          `₹${(
            Number(
              item.price || 0
            ) *
            Number(
              item.quantity || 1
            )
          ).toLocaleString(
            "en-IN"
          )}`,
        ]
      );

    autoTable(doc, {
      startY: 88,

      head: [
        [
          "Product",
          "Size",
          "Qty",
          "Price",
          "Total",
        ],
      ],

      body: rows,

      theme: "grid",

      headStyles: {
        fillColor: [
          100,
          65,
          235,
        ],
      },
    });

    const finalY =
      doc.lastAutoTable?.finalY ||
      100;

    doc.setFontSize(11);

    doc.text(
      `Subtotal: ₹${Number(
        order.subtotal || 0
      ).toLocaleString(
        "en-IN"
      )}`,
      140,
      finalY + 15
    );

    doc.text(
      `Delivery: ₹${Number(
        order.deliveryCharge || 0
      ).toLocaleString(
        "en-IN"
      )}`,
      140,
      finalY + 23
    );

    doc.text(
      `Discount: ₹${Number(
        order.discount || 0
      ).toLocaleString(
        "en-IN"
      )}`,
      140,
      finalY + 31
    );

    doc.setFontSize(14);

    doc.text(
      `TOTAL: ₹${Number(
        order.total || 0
      ).toLocaleString(
        "en-IN"
      )}`,
      140,
      finalY + 42
    );

    doc.setFontSize(11);

    doc.text(
      "Thank you for shopping with ShoeMaker!",
      105,
      finalY + 60,
      {
        align: "center",
      }
    );

    doc.save(
      `ShoeMaker-Receipt-${order.id}.pdf`
    );
  };

  /* =====================================================
     PRINT RECEIPT
  ===================================================== */

  const printReceipt = () => {
    if (!order) return;

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=900,height=700"
      );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print the receipt."
      );
      return;
    }

    const customer =
      order.customer || {};

    const rows = order.items
      .map(
        (item) => `
          <tr>
            <td>
              ${
                item.name ||
                "Product"
              }
            </td>

            <td>
              ${
                item.selectedSize ||
                "-"
              }
            </td>

            <td>
              ${item.quantity || 1}
            </td>

            <td>
              ₹${Number(
                item.price || 0
              ).toLocaleString(
                "en-IN"
              )}
            </td>

            <td>
              ₹${(
                Number(
                  item.price || 0
                ) *
                Number(
                  item.quantity || 1
                )
              ).toLocaleString(
                "en-IN"
              )}
            </td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>
        <head>
          <title>
            ShoeMaker Receipt
          </title>

          <style>
            body {
              font-family:
                Arial, sans-serif;

              padding: 30px;

              color: #111827;
            }

            .receipt {
              max-width: 800px;
              margin: auto;
            }

            h1,
            h2 {
              text-align: center;
            }

            h1 {
              color: #6d45e8;
            }

            .info {
              margin: 25px 0;
              line-height: 1.8;
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 10px;
            }

            table {
              width: 100%;
              border-collapse:
                collapse;
              margin-top: 20px;
            }

            th,
            td {
              border:
                1px solid #ddd;
              padding: 10px;
              text-align: left;
            }

            th {
              background:
                #f3efff;
              color:
                #5532c8;
            }

            .summary {
              text-align: right;
              margin-top: 20px;
              line-height: 1.8;
            }

            .total {
              font-size: 20px;
              font-weight: bold;
              color: #6d45e8;
            }

            .thanks {
              text-align: center;
              margin-top: 40px;
            }
          </style>
        </head>

        <body>
          <div class="receipt">

            <h1>
              ShoeMaker 👟
            </h1>

            <h2>
              Order Receipt
            </h2>

            <div class="info">

              <strong>
                Order ID:
              </strong>
              ${order.id}

              <br />

              <strong>
                Customer:
              </strong>
              ${
                customer.fullName ||
                "Customer"
              }

              <br />

              <strong>
                Email:
              </strong>
              ${
                customer.email ||
                "-"
              }

              <br />

              <strong>
                Phone:
              </strong>
              ${
                customer.phone ||
                "-"
              }

            </div>

            <table>
              <thead>
                <tr>
                  <th>
                    Product
                  </th>

                  <th>
                    Size
                  </th>

                  <th>
                    Qty
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                ${rows}
              </tbody>
            </table>

            <div class="summary">

              <div>
                Subtotal:
                ₹${Number(
                  order.subtotal || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </div>

              <div>
                Delivery:
                ₹${Number(
                  order.deliveryCharge ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}
              </div>

              <div>
                Discount:
                ₹${Number(
                  order.discount || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </div>

              <div class="total">
                Total:
                ₹${Number(
                  order.total || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </div>

            </div>

            <div class="thanks">
              Thank you for shopping
              with ShoeMaker! ❤️
            </div>

          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <>
        <UserNavbar />

        <main className="thank-you-page">

          <div className="thank-bg-circle circle-one" />
          <div className="thank-bg-circle circle-two" />

          <div className="thank-you-container">

            <div className="thank-you-card loading-card">

              <div className="thank-loading-icon">
                <span>✓</span>
              </div>

              <div className="loading-dots">
                <span />
                <span />
                <span />
              </div>

              <h1>
                Preparing Your Order
              </h1>

              <p>
                Please wait while we
                load your order details...
              </p>

            </div>

          </div>

        </main>
      </>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (!order) {
    return (
      <>
        <UserNavbar />

        <main className="thank-you-page">

          <div className="thank-bg-circle circle-one" />

          <div className="thank-you-container">

            <div className="thank-you-card">

              <div className="thank-icon error-icon">
                📦
              </div>

              <h1>
                Order Not Found
              </h1>

              <p className="thank-message">
                {error ||
                  "We couldn't load your order."}
              </p>

              <div className="thank-buttons">

                <Link
                  to="/orders"
                  className="thank-primary-btn"
                >
                  📦 View My Orders
                </Link>

                <Link
                  to="/products"
                  className="thank-secondary-btn"
                >
                  🛍️ Continue Shopping
                </Link>

              </div>

            </div>

          </div>

        </main>
      </>
    );
  }

  /* =====================================================
     MAIN PAGE
  ===================================================== */

  const customer =
    order.customer || {};

  const paymentLabel =
    order.paymentMethod === "cod"
      ? "Cash on Delivery"
      : order.paymentMethod === "upi"
      ? "UPI"
      : "Credit / Debit Card";

  return (
    <>
      <UserNavbar />

      <main className="thank-you-page">

        {/* BACKGROUND */}

        <div className="thank-bg-circle circle-one" />
        <div className="thank-bg-circle circle-two" />
        <div className="thank-bg-circle circle-three" />

        <div className="thank-you-container">

          {/* =================================================
              PREMIUM SUCCESS HEADER
          ================================================= */}

          <section className="thank-you-card">

            <div className="success-particles">
              <span>✦</span>
              <span>✧</span>
              <span>✦</span>
              <span>✧</span>
            </div>

            <div className="thank-icon">
              <span>✓</span>
            </div>

            <div className="confirmed-badge">
              <span>●</span>
              ORDER CONFIRMED
            </div>

            <h1>
              Thank You! 🎉
            </h1>

            <h2>
              Your Order Has Been Confirmed
            </h2>

            <p className="thank-message">
              Thank you for shopping with
              <strong> ShoeMaker</strong>.
              Your order has been successfully
              confirmed and is now being prepared
              for you.
            </p>

            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <div className="thank-order-box">

              <div className="thank-order-item">

                <div className="order-mini-icon">
                  #
                </div>

                <div>
                  <span>
                    ORDER ID
                  </span>

                  <strong>
                    {order.id}
                  </strong>
                </div>

              </div>

              <div className="thank-order-item">

                <div className="order-mini-icon green">
                  ✓
                </div>

                <div>
                  <span>
                    ORDER STATUS
                  </span>

                  <strong className="confirmed-text">
                    Confirmed
                  </strong>
                </div>

              </div>

              <div className="thank-order-item">

                <div className="order-mini-icon purple">
                  ₹
                </div>

                <div>
                  <span>
                    TOTAL AMOUNT
                  </span>

                  <strong className="total-text">
                    ₹
                    {order.total.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

              </div>

            </div>

            {/* =================================================
                PAYMENT INFO
            ================================================= */}

            <div className="payment-info-strip">

              <div className="payment-info-item">
                <span className="payment-icon">
                  💳
                </span>

                <div>
                  <small>
                    PAYMENT METHOD
                  </small>

                  <strong>
                    {paymentLabel}
                  </strong>
                </div>
              </div>

              <div className="payment-info-item">
                <span className="payment-icon">
                  🔒
                </span>

                <div>
                  <small>
                    PAYMENT STATUS
                  </small>

                  <strong className="paid-text">
                    {order.paymentStatus ||
                      "Pending"}
                  </strong>
                </div>
              </div>

            </div>

            {/* =================================================
                DELIVERY
            ================================================= */}

            <div className="delivery-card">

              <div className="delivery-icon">
                🚚
              </div>

              <div className="delivery-content">

                <div className="delivery-title-row">

                  <strong>
                    Your order is on its way
                    to preparation
                  </strong>

                  <span>
                    ✓
                  </span>

                </div>

                <p>
                  We'll carefully pack your
                  products and get them ready
                  for delivery.
                </p>

              </div>

            </div>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="thank-buttons">

              <button
                type="button"
                onClick={downloadReceipt}
                className="thank-primary-btn"
              >
                📥 Download Receipt
              </button>

              <button
                type="button"
                onClick={printReceipt}
                className="thank-secondary-btn"
              >
                🖨️ Print Receipt
              </button>

            </div>

            <div className="thank-buttons second-row">

              <Link
                to="/orders"
                className="thank-secondary-btn"
              >
                📦 View My Orders
              </Link>

              <Link
                to="/products"
                className="thank-primary-btn"
              >
                🛍️ Continue Shopping
              </Link>

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="thank-footer">

              <div className="heart-icon">
                💜
              </div>

              <div>

                <strong>
                  We appreciate your order!
                </strong>

                <p>
                  Thank you for choosing
                  ShoeMaker. We hope you love
                  your new pair.
                </p>

              </div>

            </div>

          </section>

          {/* BRAND FOOTER */}

          <div className="premium-brand-footer">
            <span>
              SHOE
            </span>
            <strong>
              MAKER
            </strong>

            <small>
              Step into something better.
            </small>
          </div>

        </div>

      </main>
    </>
  );
};

export default ThankYou;