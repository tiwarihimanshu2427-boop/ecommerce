import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import UserNavbar from "../../components/common/UserNavbar";
import "./OrderSuccess.css";

const API_URL = "http://localhost:5000/api/orders";

const OrderSuccess = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     LOAD ORDER
  ===================================================== */

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/${encodeURIComponent(id)}`
        );

        if (!response.ok) {
          throw new Error("Order not found");
        }

        const data = await response.json();

        const loadedOrder =
          data.order ||
          data.data ||
          data;

        setOrder(loadedOrder);
      } catch (error) {
        console.error(
          "ORDER SUCCESS LOAD ERROR:",
          error
        );

        /*
          Fallback to locally stored order
        */

        try {
          const savedOrder =
            JSON.parse(
              localStorage.getItem("lastOrder")
            );

          if (
            savedOrder &&
            String(
              savedOrder.id ||
              savedOrder.order_number ||
              savedOrder.orderNumber
            ) === String(id)
          ) {
            setOrder(savedOrder);
          }
        } catch (localError) {
          console.error(
            "LOCAL ORDER ERROR:",
            localError
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadOrder();
    }
  }, [id]);

  /* =====================================================
     HELPERS
  ===================================================== */

  const getOrderNumber = () => {
    return (
      order?.order_number ||
      order?.orderNumber ||
      order?.id ||
      id
    );
  };

  const getItems = () => {
    return (
      order?.items ||
      order?.order_items ||
      order?.orderItems ||
      []
    );
  };

  const getTotal = () => {
    return Number(
      order?.total ||
      order?.grand_total ||
      order?.amount ||
      0
    );
  };

  const getSubtotal = () => {
    return Number(
      order?.subtotal ||
      getTotal()
    );
  };

  const getDiscount = () => {
    return Number(
      order?.discount || 0
    );
  };

  const getDeliveryCharge = () => {
    return Number(
      order?.delivery_charge ||
      order?.deliveryCharge ||
      0
    );
  };

  const getCustomerName = () => {
    return (
      order?.full_name ||
      order?.fullName ||
      order?.name ||
      "Customer"
    );
  };

  const getPaymentMethod = () => {
    return (
      order?.payment_method ||
      order?.paymentMethod ||
      "Cash on Delivery"
    );
  };

  const getPaymentStatus = () => {
    return (
      order?.payment_status ||
      order?.paymentStatus ||
      "Pending"
    );
  };

  const formatPrice = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  /* =====================================================
     DOWNLOAD RECEIPT
  ===================================================== */

  const downloadReceipt = () => {
    if (!order) return;

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(98, 64, 238);
    doc.text(
      "SHOPNEST",
      20,
      25
    );

    doc.setFontSize(10);
    doc.setTextColor(110, 110, 125);
    doc.text(
      "Premium Shopping Experience",
      20,
      32
    );

    doc.setFontSize(18);
    doc.setTextColor(35, 35, 50);
    doc.text(
      "Order Receipt",
      20,
      48
    );

    doc.setFontSize(10);
    doc.setTextColor(90, 90, 100);

    doc.text(
      `Order ID: ${getOrderNumber()}`,
      20,
      58
    );

    doc.text(
      `Customer: ${getCustomerName()}`,
      20,
      65
    );

    doc.text(
      `Payment: ${getPaymentMethod()}`,
      20,
      72
    );

    const rows = getItems().map(
      (item, index) => [
        index + 1,
        item.product_name ||
          item.productName ||
          item.name ||
          "Product",
        item.selected_size ||
          item.size ||
          "-",
        item.quantity || 1,
        formatPrice(
          item.price || 0
        ),
      ]
    );

    autoTable(doc, {
      startY: 82,
      head: [
        [
          "#",
          "Product",
          "Size",
          "Qty",
          "Price",
        ],
      ],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [98, 64, 238],
      },
    });

    const finalY =
      doc.lastAutoTable?.finalY || 100;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 70);

    doc.text(
      `Subtotal: ${formatPrice(
        getSubtotal()
      )}`,
      140,
      finalY + 15
    );

    doc.text(
      `Delivery: ${formatPrice(
        getDeliveryCharge()
      )}`,
      140,
      finalY + 22
    );

    doc.text(
      `Discount: -${formatPrice(
        getDiscount()
      )}`,
      140,
      finalY + 29
    );

    doc.setFontSize(15);
    doc.setTextColor(
      98,
      64,
      238
    );

    doc.text(
      `Total: ${formatPrice(
        getTotal()
      )}`,
      140,
      finalY + 40
    );

    doc.setFontSize(9);
    doc.setTextColor(
      130,
      130,
      140
    );

    doc.text(
      "Thank you for shopping with ShopNest.",
      20,
      finalY + 55
    );

    doc.save(
      `ShopNest-Receipt-${getOrderNumber()}.pdf`
    );
  };

  /* =====================================================
     PRINT RECEIPT
  ===================================================== */

  const printReceipt = () => {
    window.print();
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <>
        <UserNavbar />

        <main className="order-success-page">
          <div className="success-loading-card">

            <div className="loading-spinner">
              ✓
            </div>

            <h2>
              Preparing Your Order
            </h2>

            <p>
              Please wait while we load your
              order details...
            </p>

          </div>
        </main>
      </>
    );
  }

  /* =====================================================
     ORDER NOT FOUND
  ===================================================== */

  if (!order) {
    return (
      <>
        <UserNavbar />

        <main className="order-success-page">

          <div className="order-not-found">

            <div className="not-found-icon">
              📦
            </div>

            <h1>
              Order Not Found
            </h1>

            <p>
              We couldn't find the order details
              right now.
            </p>

            <Link
              to="/orders"
              className="success-primary-btn"
            >
              View My Orders →
            </Link>

          </div>

        </main>
      </>
    );
  }

  const items = getItems();

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <>
      <UserNavbar />

      <main className="order-success-page">

        <div className="order-success-container">

          {/* =================================================
              PREMIUM SUCCESS HEADER
          ================================================= */}

          <section className="success-header-card">

            <div className="success-glow glow-one" />
            <div className="success-glow glow-two" />

            <div className="success-icon-wrap">

              <div className="success-icon">
                ✓
              </div>

            </div>

            <div className="success-badge">
              ORDER CONFIRMED
            </div>

            <h1>
              Your Order Is Confirmed! 🎉
            </h1>

            <p>
              Thank you, {getCustomerName()}.
              Your order has been successfully
              placed and is now being prepared.
            </p>

            <div className="success-order-id">

              <span>
                ORDER ID
              </span>

              <strong>
                {getOrderNumber()}
              </strong>

              <button
                type="button"
                onClick={() =>
                  navigator.clipboard?.writeText(
                    String(getOrderNumber())
                  )
                }
                title="Copy Order ID"
              >
                ⧉
              </button>

            </div>

          </section>

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="success-content">

            <div className="success-left">

              {/* ORDER DETAILS */}

              <section className="success-card">

                <div className="success-card-header">

                  <div>
                    <h2>
                      Order Details
                    </h2>

                    <p>
                      Your purchase summary
                    </p>
                  </div>

                  <span className="order-status">
                    ✓ Order Placed
                  </span>

                </div>

                <div className="order-info-grid">

                  <div className="order-info-box">
                    <span>
                      ORDER NUMBER
                    </span>

                    <strong>
                      {getOrderNumber()}
                    </strong>
                  </div>

                  <div className="order-info-box">
                    <span>
                      PAYMENT METHOD
                    </span>

                    <strong>
                      {getPaymentMethod()}
                    </strong>
                  </div>

                  <div className="order-info-box">
                    <span>
                      PAYMENT STATUS
                    </span>

                    <strong className="payment-success">
                      {getPaymentStatus()}
                    </strong>
                  </div>

                  <div className="order-info-box">
                    <span>
                      DELIVERY
                    </span>

                    <strong>
                      Standard Delivery
                    </strong>
                  </div>

                </div>

              </section>

              {/* PRODUCTS */}

              <section className="success-card">

                <div className="success-card-header">

                  <div>
                    <h2>
                      Items in Your Order
                    </h2>

                    <p>
                      {items.length} item
                      {items.length !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                </div>

                <div className="success-products">

                  {items.length > 0 ? (
                    items.map(
                      (item, index) => (
                        <div
                          className="success-product"
                          key={
                            item.id ||
                            item.product_id ||
                            index
                          }
                        >

                          <div className="success-product-image">

                            {item.image ? (
                              <img
                                src={item.image}
                                alt={
                                  item.product_name ||
                                  item.name ||
                                  "Product"
                                }
                              />
                            ) : (
                              <span>
                                👟
                              </span>
                            )}

                          </div>

                          <div className="success-product-info">

                            <h3>
                              {item.product_name ||
                                item.productName ||
                                item.name ||
                                "Product"}
                            </h3>

                            <p>
                              Size:{" "}
                              {item.selected_size ||
                                item.size ||
                                "Standard"}
                            </p>

                            <span>
                              Quantity:{" "}
                              {item.quantity || 1}
                            </span>

                          </div>

                          <strong>
                            {formatPrice(
                              Number(
                                item.price || 0
                              ) *
                                Number(
                                  item.quantity || 1
                                )
                            )}
                          </strong>

                        </div>
                      )
                    )
                  ) : (
                    <div className="empty-products">
                      <span>
                        📦
                      </span>

                      <p>
                        Order items are being
                        prepared.
                      </p>
                    </div>
                  )}

                </div>

              </section>

              {/* ADDRESS */}

              <section className="success-card">

                <div className="success-card-header">

                  <div>
                    <h2>
                      Delivery Address
                    </h2>

                    <p>
                      Your order will be delivered here
                    </p>
                  </div>

                </div>

                <div className="address-box">

                  <div className="address-icon">
                    📍
                  </div>

                  <div>

                    <strong>
                      {getCustomerName()}
                    </strong>

                    <p>
                      {order.address ||
                        "Delivery address unavailable"}
                    </p>

                    <p>
                      {order.city || ""}
                      {order.city && order.state
                        ? ", "
                        : ""}
                      {order.state || ""}
                      {order.pincode
                        ? ` - ${order.pincode}`
                        : ""}
                    </p>

                    {order.phone && (
                      <span>
                        📞 {order.phone}
                      </span>
                    )}

                  </div>

                </div>

              </section>

            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="success-right">

              {/* SUMMARY */}

              <section className="success-summary-card">

                <div className="summary-top">

                  <div className="summary-icon">
                    ₹
                  </div>

                  <div>
                    <span>
                      PAYMENT SUMMARY
                    </span>

                    <h2>
                      Order Total
                    </h2>
                  </div>

                </div>

                <div className="success-summary-row">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatPrice(
                      getSubtotal()
                    )}
                  </strong>
                </div>

                <div className="success-summary-row">
                  <span>
                    Delivery
                  </span>

                  <strong>
                    {formatPrice(
                      getDeliveryCharge()
                    )}
                  </strong>
                </div>

                {getDiscount() > 0 && (
                  <div className="success-summary-row success-discount">
                    <span>
                      Discount
                    </span>

                    <strong>
                      -{formatPrice(
                        getDiscount()
                      )}
                    </strong>
                  </div>
                )}

                <div className="success-summary-divider" />

                <div className="success-total">

                  <span>
                    Total Paid
                  </span>

                  <strong>
                    {formatPrice(
                      getTotal()
                    )}
                  </strong>

                </div>

                <div className="secure-payment">
                  <span>
                    🔒
                  </span>

                  Secure payment & encrypted checkout
                </div>

              </section>

              {/* TIMELINE */}

              <section className="delivery-timeline-card">

                <h2>
                  Order Journey
                </h2>

                <div className="timeline">

                  <div className="timeline-item active">

                    <div className="timeline-dot">
                      ✓
                    </div>

                    <div>
                      <strong>
                        Order Placed
                      </strong>

                      <span>
                        Your order has been received
                      </span>
                    </div>

                  </div>

                  <div className="timeline-line" />

                  <div className="timeline-item">

                    <div className="timeline-dot">
                      2
                    </div>

                    <div>
                      <strong>
                        Preparing
                      </strong>

                      <span>
                        Your items will be packed
                      </span>
                    </div>

                  </div>

                  <div className="timeline-line" />

                  <div className="timeline-item">

                    <div className="timeline-dot">
                      3
                    </div>

                    <div>
                      <strong>
                        Shipped
                      </strong>

                      <span>
                        Your order will be on its way
                      </span>
                    </div>

                  </div>

                  <div className="timeline-line" />

                  <div className="timeline-item">

                    <div className="timeline-dot">
                      4
                    </div>

                    <div>
                      <strong>
                        Delivered
                      </strong>

                      <span>
                        Delivered to your doorstep
                      </span>
                    </div>

                  </div>

                </div>

              </section>

            </div>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="success-actions">

            <button
              type="button"
              className="success-primary-btn"
              onClick={downloadReceipt}
            >
              ↓ Download Receipt
            </button>

            <button
              type="button"
              className="success-secondary-btn"
              onClick={printReceipt}
            >
              🖨 Print Receipt
            </button>

            <Link
              to="/orders"
              className="success-secondary-btn"
            >
              View My Orders
            </Link>

            <Link
              to="/products"
              className="success-secondary-btn"
            >
              Continue Shopping
            </Link>

          </div>

          {/* FOOTER MESSAGE */}

          <div className="success-footer-message">

            <span>
              ✨
            </span>

            <div>

              <strong>
                Thank you for choosing ShopNest
              </strong>

              <p>
                Your order has been placed successfully.
                We'll take care of the rest.
              </p>

            </div>

          </div>

        </div>

      </main>
    </>
  );
};

export default OrderSuccess;