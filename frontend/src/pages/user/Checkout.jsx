import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserNavbar from "../../components/common/UserNavbar";
import "./Checkout.css";

const API_URL = "http://localhost:5000/api/orders";
const PAYMENT_API_URL = "http://localhost:5000/api/payment";

const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || "";

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [deliveryMethod, setDeliveryMethod] =
    useState("standard");

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] =
    useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  /* =========================================================
     LOAD CART
  ========================================================= */

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      if (
        !Array.isArray(savedCart) ||
        savedCart.length === 0
      ) {
        navigate("/cart");
        return;
      }

      setCart(savedCart);
    } catch (error) {
      console.error("Cart loading error:", error);
      navigate("/cart");
    }
  }, [navigate]);

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     PRICE CALCULATIONS
  ========================================================= */

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  const discount = couponApplied
    ? Math.round(subtotal * 0.2)
    : 0;

  const standardDelivery =
    subtotal >= 999 ? 0 : 49;

  const expressDelivery = 99;

  const deliveryCharge =
    deliveryMethod === "express"
      ? expressDelivery
      : standardDelivery;

  const grandTotal =
    subtotal +
    deliveryCharge -
    discount;

  /* =========================================================
     COUPON
  ========================================================= */

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (code === "WELCOME20") {
      setCouponApplied(true);
      alert(
        "WELCOME20 coupon applied successfully!"
      );
    } else {
      setCouponApplied(false);
      alert(
        "Invalid coupon. Try WELCOME20"
      );
    }
  };

  /* =========================================================
     LOAD RAZORPAY
  ========================================================= */

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => {
            if (window.Razorpay) {
              resolve(true);
            } else {
              reject(
                new Error(
                  "Razorpay loaded but is unavailable."
                )
              );
            }
          },
          { once: true }
        );

        existingScript.addEventListener(
          "error",
          () => {
            reject(
              new Error(
                "Razorpay Checkout failed to load."
              )
            );
          },
          { once: true }
        );

        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => {
        if (window.Razorpay) {
          resolve(true);
        } else {
          reject(
            new Error(
              "Razorpay loaded but window.Razorpay is unavailable."
            )
          );
        }
      };

      script.onerror = () => {
        reject(
          new Error(
            "Unable to load Razorpay Checkout. Check your internet connection."
          )
        );
      };

      document.body.appendChild(script);
    });
  };

  /* =========================================================
     CREATE STORE ORDER
     Guest + Logged-in user both allowed
  ========================================================= */

  const createOrder = async (
    token = null,
    onlinePaymentId = null
  ) => {
    const orderPayload = {
      customer: formData,
      items: cart,

      subtotal,
      deliveryCharge,
      discount,
      total: grandTotal,

      deliveryMethod,

      paymentMethod: onlinePaymentId
        ? "online"
        : "cod",

      paymentStatus: onlinePaymentId
        ? "Paid"
        : "Pending",

      paymentId:
        onlinePaymentId || null,
    };

    console.log(
      "Creating store order:",
      orderPayload
    );

    const headers = {
      "Content-Type": "application/json",
    };

    /*
    Optional authentication.
    Guest checkout does NOT require token.
    */

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    const response = await fetch(
      API_URL,
      {
        method: "POST",
        headers,
        body: JSON.stringify(
          orderPayload
        ),
      }
    );

    const text =
      await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        "Order server returned an invalid response."
      );
    }

    console.log(
      "Create order response:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to create order."
      );
    }

    return data.order || data;
  };

  /* =========================================================
     RAZORPAY PAYMENT

     IMPORTANT:
     Guest user is allowed.
  ========================================================= */

  const handleRazorpayPayment = async (
    token = null
  ) => {
    /*
    ==============================================
    RAZORPAY KEY
    ==============================================
    */

    if (!RAZORPAY_KEY_ID) {
      throw new Error(
        "Razorpay Key ID is missing. Add VITE_RAZORPAY_KEY_ID to frontend/.env and restart Vite."
      );
    }

    if (
      !RAZORPAY_KEY_ID.startsWith(
        "rzp_test_"
      ) &&
      !RAZORPAY_KEY_ID.startsWith(
        "rzp_live_"
      )
    ) {
      throw new Error(
        "Invalid Razorpay Key ID. It must start with rzp_test_ or rzp_live_."
      );
    }

    console.log(
      "Razorpay Key:",
      RAZORPAY_KEY_ID
    );

    /*
    ==============================================
    LOAD RAZORPAY
    ==============================================
    */

    await loadRazorpayScript();

    if (!window.Razorpay) {
      throw new Error(
        "Razorpay Checkout is not available."
      );
    }

    /*
    ==============================================
    CREATE RAZORPAY ORDER
    ==============================================
    */

    const paymentHeaders = {
      "Content-Type":
        "application/json",
    };

    /*
    Token optional.
    Guest payment also allowed.
    */

    if (token) {
      paymentHeaders.Authorization =
        `Bearer ${token}`;
    }

    const createResponse =
      await fetch(
        `${PAYMENT_API_URL}/create-order`,
        {
          method: "POST",
          headers: paymentHeaders,
          body: JSON.stringify({
            amount:
              Number(grandTotal),
          }),
        }
      );

    const createText =
      await createResponse.text();

    let createData;

    try {
      createData =
        JSON.parse(createText);
    } catch {
      throw new Error(
        "Payment server returned an invalid response."
      );
    }

    console.log(
      "Razorpay create-order response:",
      createData
    );

    if (
      !createResponse.ok ||
      !createData.success
    ) {
      throw new Error(
        createData.message ||
          "Unable to create Razorpay payment order."
      );
    }

    const paymentOrder =
      createData.order;

    if (!paymentOrder?.id) {
      throw new Error(
        "Razorpay order ID was not received."
      );
    }

    /*
    ==============================================
    OPEN RAZORPAY
    ==============================================
    */

    return new Promise(
      (resolve, reject) => {
        let completed = false;

        const success = (order) => {
          if (completed) return;

          completed = true;
          resolve(order);
        };

        const failure = (message) => {
          if (completed) return;

          completed = true;

          reject(
            new Error(message)
          );
        };

        const options = {
          key: RAZORPAY_KEY_ID,

          amount:
            paymentOrder.amount,

          currency:
            paymentOrder.currency ||
            "INR",

          name: "ShoeMaker",

          description:
            "ShoeMaker Order Payment",

          order_id:
            paymentOrder.id,

          prefill: {
            name:
              formData.fullName ||
              "",

            email:
              formData.email ||
              "",

            contact:
              formData.phone ||
              "",
          },

          notes: {
            customer_name:
              formData.fullName ||
              "",

            customer_email:
              formData.email ||
              "",

            customer_phone:
              formData.phone ||
              "",
          },

          theme: {
            color: "#4f46e5",
          },

          /*
          =========================================
          PAYMENT SUCCESS
          =========================================
          */

          handler: async (
            payment
          ) => {
            try {
              console.log(
                "Razorpay payment successful:",
                payment
              );

              /*
              VERIFY PAYMENT
              */

              const verifyHeaders = {
                "Content-Type":
                  "application/json",
              };

              if (token) {
                verifyHeaders.Authorization =
                  `Bearer ${token}`;
              }

              const verifyResponse =
                await fetch(
                  `${PAYMENT_API_URL}/verify`,
                  {
                    method: "POST",

                    headers:
                      verifyHeaders,

                    body: JSON.stringify({
                      razorpay_order_id:
                        payment.razorpay_order_id,

                      razorpay_payment_id:
                        payment.razorpay_payment_id,

                      razorpay_signature:
                        payment.razorpay_signature,
                    }),
                  }
                );

              const verifyText =
                await verifyResponse.text();

              let verifyData;

              try {
                verifyData =
                  JSON.parse(
                    verifyText
                  );
              } catch {
                throw new Error(
                  "Payment verification server returned invalid response."
                );
              }

              console.log(
                "Payment verification:",
                verifyData
              );

              if (
                !verifyResponse.ok ||
                !verifyData.success
              ) {
                throw new Error(
                  verifyData.message ||
                    "Payment verification failed."
                );
              }

              /*
              =====================================
              CREATE ACTUAL STORE ORDER
              =====================================
              */

              const order =
                await createOrder(
                  token,
                  payment.razorpay_payment_id
                );

              console.log(
                "Store order created:",
                order
              );

              success(order);
            } catch (error) {
              console.error(
                "Payment verification error:",
                error
              );

              failure(
                error.message ||
                  "Payment verification failed."
              );
            }
          },

          /*
          =========================================
          MODAL CLOSED
          =========================================
          */

          modal: {
            ondismiss: () => {
              failure(
                "Payment was cancelled."
              );
            },
          },
        };

        try {
          console.log(
            "Opening Razorpay..."
          );

          const razorpay =
            new window.Razorpay(
              options
            );

          razorpay.on(
            "payment.failed",
            (response) => {
              console.error(
                "Razorpay payment failed:",
                response
              );

              failure(
                response?.error
                  ?.description ||
                  "Payment failed."
              );
            }
          );

          razorpay.open();
        } catch (error) {
          console.error(
            "Razorpay open error:",
            error
          );

          failure(
            error.message ||
              "Unable to open Razorpay Checkout."
          );
        }
      }
    );
  };

  /* =========================================================
     PLACE ORDER
  ========================================================= */

  const handlePlaceOrder = async (
    e
  ) => {
    e.preventDefault();

    if (placingOrder) return;

    /*
    ==============================================
    VALIDATION
    ==============================================
    */

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      alert(
        "Please fill all delivery details."
      );
      return;
    }

    if (
      !/^\d{10}$/.test(
        formData.phone
      )
    ) {
      alert(
        "Please enter a valid 10 digit phone number."
      );
      return;
    }

    if (
      !/^\d{6}$/.test(
        formData.pincode
      )
    ) {
      alert(
        "Please enter a valid 6 digit PIN code."
      );
      return;
    }

    if (!cart.length) {
      alert(
        "Your cart is empty."
      );
      navigate("/cart");
      return;
    }

    /*
    ==============================================
    OPTIONAL LOGIN TOKEN
    Guest user is allowed.
    ==============================================
    */

    const token =
      localStorage.getItem(
        "userToken"
      ) ||
      localStorage.getItem(
        "token"
      ) ||
      localStorage.getItem(
        "authToken"
      ) ||
      null;

    try {
      setPlacingOrder(true);

      let order;

      /*
      ============================================
      COD
      ============================================
      */

      if (
        paymentMethod === "cod"
      ) {
        order =
          await createOrder(
            token
          );
      }

      /*
      ============================================
      UPI / CARD
      ============================================
      */

      else {
        order =
          await handleRazorpayPayment(
            token
          );
      }

      console.log(
        "FINAL ORDER:",
        order
      );

      /*
      ============================================
      CLEAR CART
      ============================================
      */

      localStorage.removeItem(
        "cart"
      );

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      /*
      ============================================
      SAVE ORDER
      ============================================
      */

      localStorage.setItem(
        "lastOrder",
        JSON.stringify(order)
      );

      /*
      ============================================
      ORDER REFERENCE
      ============================================
      */

      const orderReference =
        order.orderNumber ||
        order.order_number ||
        order.id;

      if (!orderReference) {
        throw new Error(
          "Order created but order ID was not received."
        );
      }

      /*
      ============================================
      GO TO ORDER SUCCESS
      ============================================
      */

      navigate(
        `/order-success/${orderReference}`
      );
    } catch (error) {
      console.error(
        "Order/payment error:",
        error
      );

      alert(
        error.message ||
          "Unable to place order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  /* =========================================================
     IMAGE ERROR
  ========================================================= */

  const handleImageError = (
    e
  ) => {
    e.currentTarget.style.display =
      "none";

    const parent =
      e.currentTarget.parentElement;

    if (parent) {
      parent.classList.add(
        "image-fallback"
      );

      parent.innerHTML =
        "<span>👟</span>";
    }
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <>
      <UserNavbar />

      <main className="checkout-page">
        <div className="checkout-container">

          {/* HEADER */}

          <div className="checkout-header">
            <div>
              <span className="checkout-small-title">
                ShoeMaker
              </span>

              <h1>
                Checkout
              </h1>

              <p>
                Complete your order securely
                and easily.
              </p>
            </div>

            <Link
              to="/cart"
              className="back-cart-btn"
            >
              ← Back to Cart
            </Link>
          </div>

          {/* MAIN FORM */}

          <form
            className="checkout-layout"
            onSubmit={
              handlePlaceOrder
            }
          >

            {/* ======================================
                LEFT SIDE
            ====================================== */}

            <div className="checkout-left">

              {/* DELIVERY INFORMATION */}

              <section className="checkout-card">

                <div className="section-title">

                  <div className="section-number">
                    1
                  </div>

                  <div>
                    <h2>
                      Delivery Information
                    </h2>

                    <p>
                      Enter your delivery details
                    </p>
                  </div>

                </div>

                <div className="checkout-form-grid">

                  {/* FULL NAME */}

                  <div className="form-group full-width">
                    <label>
                      Full Name *
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={
                        formData.fullName
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  {/* EMAIL */}

                  <div className="form-group">
                    <label>
                      Email Address *
                    </label>

                    <input
                      type="email"
                      name="email"
                      placeholder="example@email.com"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  {/* PHONE */}

                  <div className="form-group">
                    <label>
                      Phone Number *
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="10 digit phone number"
                      maxLength="10"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  {/* ADDRESS */}

                  <div className="form-group full-width">
                    <label>
                      Complete Address *
                    </label>

                    <textarea
                      name="address"
                      placeholder="House no, street, area..."
                      rows="4"
                      value={
                        formData.address
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  {/* CITY */}

                  <div className="form-group">
                    <label>
                      City *
                    </label>

                    <input
                      type="text"
                      name="city"
                      placeholder="Enter city"
                      value={
                        formData.city
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  {/* STATE */}

                  <div className="form-group">
                    <label>
                      State *
                    </label>

                    <input
                      type="text"
                      name="state"
                      placeholder="Enter state"
                      value={
                        formData.state
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  {/* PIN */}

                  <div className="form-group">
                    <label>
                      PIN Code *
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      placeholder="6 digit PIN"
                      maxLength="6"
                      value={
                        formData.pincode
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                </div>
              </section>

              {/* DELIVERY METHOD */}

              <section className="checkout-card">

                <div className="section-title">

                  <div className="section-number">
                    2
                  </div>

                  <div>
                    <h2>
                      Delivery Method
                    </h2>

                    <p>
                      Select your preferred
                      delivery option
                    </p>
                  </div>

                </div>

                <div className="delivery-options">

                  {/* STANDARD */}

                  <label
                    className={`delivery-option ${
                      deliveryMethod ===
                      "standard"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="standard"
                      checked={
                        deliveryMethod ===
                        "standard"
                      }
                      onChange={(e) =>
                        setDeliveryMethod(
                          e.target.value
                        )
                      }
                    />

                    <div className="delivery-icon">
                      🚚
                    </div>

                    <div className="delivery-info">
                      <strong>
                        Standard Delivery
                      </strong>

                      <span>
                        Delivery within 4–7
                        business days
                      </span>
                    </div>

                    <div className="delivery-price">
                      {standardDelivery ===
                      0
                        ? "FREE"
                        : "₹49"}
                    </div>
                  </label>

                  {/* EXPRESS */}

                  <label
                    className={`delivery-option ${
                      deliveryMethod ===
                      "express"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="express"
                      checked={
                        deliveryMethod ===
                        "express"
                      }
                      onChange={(e) =>
                        setDeliveryMethod(
                          e.target.value
                        )
                      }
                    />

                    <div className="delivery-icon">
                      ⚡
                    </div>

                    <div className="delivery-info">
                      <strong>
                        Express Delivery
                      </strong>

                      <span>
                        Delivery within 1–3
                        business days
                      </span>
                    </div>

                    <div className="delivery-price">
                      ₹99
                    </div>
                  </label>

                </div>
              </section>

              {/* PAYMENT METHOD */}

              <section className="checkout-card">

                <div className="section-title">

                  <div className="section-number">
                    3
                  </div>

                  <div>
                    <h2>
                      Payment Method
                    </h2>

                    <p>
                      Select your preferred
                      payment method
                    </p>
                  </div>

                </div>

                <div className="payment-options">

                  {/* COD */}

                  <label
                    className={`payment-option ${
                      paymentMethod ===
                      "cod"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={
                        paymentMethod ===
                        "cod"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                    />

                    <div className="payment-icon">
                      💵
                    </div>

                    <div>
                      <strong>
                        Cash on Delivery
                      </strong>

                      <span>
                        Pay when your order arrives
                      </span>
                    </div>
                  </label>

                  {/* UPI */}

                  <label
                    className={`payment-option ${
                      paymentMethod ===
                      "upi"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={
                        paymentMethod ===
                        "upi"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                    />

                    <div className="payment-icon">
                      📱
                    </div>

                    <div>
                      <strong>
                        UPI
                      </strong>

                      <span>
                        Google Pay, PhonePe,
                        Paytm etc.
                      </span>
                    </div>
                  </label>

                  {/* CARD */}

                  <label
                    className={`payment-option ${
                      paymentMethod ===
                      "card"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={
                        paymentMethod ===
                        "card"
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                    />

                    <div className="payment-icon">
                      💳
                    </div>

                    <div>
                      <strong>
                        Credit / Debit Card
                      </strong>

                      <span>
                        Secure card payment
                      </span>
                    </div>
                  </label>

                </div>

                <div className="payment-note">
                  🔒 Secure payment via
                  Razorpay. UPI, cards and
                  other supported payment
                  methods are available.
                </div>

              </section>
            </div>

            {/* ======================================
                RIGHT SIDE
            ====================================== */}

            <aside className="checkout-right">

              <section className="order-summary-card">

                <h2>
                  Order Summary
                </h2>

                {/* PRODUCTS */}

                <div className="summary-items">

                  {cart.map(
                    (item, index) => (
                      <div
                        className="summary-item"
                        key={`${item.id}-${item.selectedSize || "size"}-${index}`}
                      >

                        <div className="summary-product-image">

                          {item.image ? (
                            <img
                              src={
                                item.image
                              }
                              alt={
                                item.name ||
                                "Product"
                              }
                              onError={
                                handleImageError
                              }
                            />
                          ) : (
                            <span>
                              👟
                            </span>
                          )}

                        </div>

                        <div className="summary-product-info">

                          <h3>
                            {item.name ||
                              "Product"}
                          </h3>

                          {item.selectedSize && (
                            <p>
                              Size:{" "}
                              {
                                item.selectedSize
                              }
                            </p>
                          )}

                          <p>
                            Qty:{" "}
                            {item.quantity ||
                              1}
                          </p>

                        </div>

                        <strong>
                          ₹
                          {(
                            Number(
                              item.price ||
                                0
                            ) *
                            Number(
                              item.quantity ||
                                1
                            )
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>
                    )
                  )}

                </div>

                {/* COUPON */}

                <div className="coupon-box">

                  <label>
                    Have a coupon?
                  </label>

                  <div className="coupon-input">

                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={coupon}
                      onChange={(e) =>
                        setCoupon(
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={
                        applyCoupon
                      }
                    >
                      Apply
                    </button>

                  </div>

                  {couponApplied && (
                    <p className="coupon-success">
                      ✓ WELCOME20 applied —
                      20% discount
                    </p>
                  )}

                </div>

                <div className="summary-divider" />

                {/* SUBTOTAL */}

                <div className="summary-row">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                {/* DELIVERY */}

                <div className="summary-row">
                  <span>
                    Delivery
                  </span>

                  <strong>
                    {deliveryCharge ===
                    0
                      ? "FREE"
                      : `₹${deliveryCharge}`}
                  </strong>
                </div>

                {/* DISCOUNT */}

                {discount > 0 && (
                  <div className="summary-row discount-row">

                    <span>
                      Discount
                    </span>

                    <strong>
                      -₹
                      {discount.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>
                )}

                <div className="summary-divider" />

                {/* TOTAL */}

                <div className="grand-total">

                  <span>
                    Total
                  </span>

                  <strong>
                    ₹
                    {grandTotal.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

                {/* PLACE ORDER */}

                <button
                  type="submit"
                  className="place-order-btn"
                  disabled={
                    placingOrder
                  }
                >
                  {placingOrder
                    ? "Processing..."
                    : paymentMethod ===
                      "cod"
                    ? "Place Order"
                    : `Pay ₹${grandTotal.toLocaleString(
                        "en-IN"
                      )}`}

                  <span>
                    →
                  </span>
                </button>

                <div className="secure-checkout">
                  🔒 Secure Checkout
                </div>

              </section>

              {/* BENEFITS */}

              <div className="checkout-benefits">

                <div>
                  <span>
                    🚚
                  </span>

                  <p>
                    <strong>
                      Fast Delivery
                    </strong>

                    <small>
                      Reliable doorstep
                      delivery
                    </small>
                  </p>
                </div>

                <div>
                  <span>
                    ↩️
                  </span>

                  <p>
                    <strong>
                      Easy Returns
                    </strong>

                    <small>
                      Simple return process
                    </small>
                  </p>
                </div>

                <div>
                  <span>
                    🛡️
                  </span>

                  <p>
                    <strong>
                      Secure Shopping
                    </strong>

                    <small>
                      Your data stays
                      protected
                    </small>
                  </p>
                </div>

              </div>

            </aside>

          </form>

        </div>
      </main>
    </>
  );
};

export default Checkout;