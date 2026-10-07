import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserNavbar from "../../components/common/UserNavbar";
import "./Orders.css";
const API_URL = "https://ecommerce-dmv8.vercel.app/api/orders";
const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // =====================================================
    // LOAD ORDERS FROM DATABASE
    // =====================================================
    useEffect(() => {
        loadOrders();
    }, []);
    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(API_URL);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load orders."
                );
            }
            // Backend response:
            // {
            //   success: true,
            //   orders: [...]
            // }
            const receivedOrders = Array.isArray(data.orders)
                ? data.orders
                : Array.isArray(data)
                    ? data
                    : [];
            // Normalize DB data for frontend
            const normalizedOrders = receivedOrders.map(
                (order) => ({
                    ...order,
                    id: order.id,
                    orderNumber:
                        order.order_number ||
                        order.orderNumber ||
                        order.id,
                    fullName:
                        order.full_name ||
                        order.fullName ||
                        "",
                    paymentMethod:
                        order.payment_method ||
                        order.paymentMethod ||
                        "cod",
                    deliveryMethod:
                        order.delivery_method ||
                        order.deliveryMethod ||
                        "standard",
                    subtotal: Number(order.subtotal || 0),
                    deliveryCharge: Number(
                        order.delivery_charge ||
                        order.deliveryCharge ||
                        0
                    ),
                    discount: Number(
                        order.discount || 0
                    ),
                    total: Number(order.total || 0),
                    createdAt:
                        order.created_at ||
                        order.createdAt,
                    items: Array.isArray(order.items)
                        ? order.items.map((item) => ({
                            ...item,
                            id: item.id,
                            productId:
                                item.product_id ||
                                item.productId ||
                                null,
                            name:
                                item.product_name ||
                                item.name ||
                                "Product",
                            image:
                                item.image || "",
                            price: Number(
                                item.price || 0
                            ),
                            quantity: Number(
                                item.quantity || 1
                            ),
                            selectedSize:
                                item.selected_size ||
                                item.selectedSize ||
                                "",
                        }))
                        : [],
                })
            );
            setOrders(normalizedOrders);
        } catch (err) {
            console.error(
                "LOAD ORDERS ERROR:",
                err
            );
            setError(
                err.message ||
                "Unable to load your orders."
            );
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };
    // =====================================================
    // PAYMENT NAME
    // =====================================================
    const getPaymentName = (method) => {
        if (method === "cod") {
            return "Cash on Delivery";
        }
        if (method === "upi") {
            return "UPI";
        }
        return "Credit / Debit Card";
    };
    // =====================================================
    // DELIVERY NAME
    // =====================================================
    const getDeliveryName = (method) => {
        return method === "express"
            ? "Express Delivery"
            : "Standard Delivery";
    };
    // =====================================================
    // DATE FORMAT
    // =====================================================
    const getOrderDate = (date) => {
        if (!date) {
            return "Date unavailable";
        }
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) {
            return "Date unavailable";
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
    // =====================================================
    // IMAGE ERROR
    // =====================================================
    const handleImageError = (event) => {
        event.currentTarget.style.display = "none";
        const parent =
            event.currentTarget.parentElement;
        if (parent) {
            parent.classList.add(
                "order-image-fallback"
            );
        }
    };
    // =====================================================
    // LOADING
    // =====================================================
    if (loading) {
        return (
            <>
                <UserNavbar />
                <main className="orders-page">
                    <div className="orders-container">
                        <div className="orders-header">
                            <div>
                                <span>
                                    SHOEMAKER ACCOUNT
                                </span>
                                <h1>My Orders</h1>
                                <p>
                                    View and manage all your
                                    orders.
                                </p>
                            </div>
                        </div>
                        <section className="empty-orders">
                            <div className="empty-orders-icon">
                                ⏳
                            </div>
                            <h2>Loading Orders...</h2>
                            <p>
                                Please wait while we load
                                your orders.
                            </p>
                        </section>
                    </div>
                </main>
            </>
        );
    }
    // =====================================================
    // ERROR
    // =====================================================
    if (error) {
        return (
            <>
                <UserNavbar />
                <main className="orders-page">
                    <div className="orders-container">
                        <div className="orders-header">
                            <div>
                                <span>
                                    SHOEMAKER ACCOUNT
                                </span>
                                <h1>My Orders</h1>
                                <p>
                                    View and manage all your
                                    orders.
                                </p>
                            </div>
                            <Link
                                to="/products"
                                className="orders-shop-btn"
                            >
                                Continue Shopping →
                            </Link>
                        </div>
                        <section className="empty-orders">
                            <div className="empty-orders-icon">
                                ⚠️
                            </div>
                            <h2>
                                Unable to Load Orders
                            </h2>
                            <p>
                                {error}
                            </p>
                            <button
                                type="button"
                                className="browse-orders-btn"
                                onClick={loadOrders}
                            >
                                Try Again →
                            </button>
                        </section>
                    </div>
                </main>
            </>
        );
    }
    // =====================================================
    // MAIN PAGE
    // =====================================================
    return (
        <>
            <UserNavbar />
            <main className="orders-page">
                <div className="orders-container">
                    {/* HEADER */}
                    <div className="orders-header">
                        <div>
                            <span>
                                SHOEMAKER ACCOUNT
                            </span>
                            <h1>
                                My Orders
                            </h1>
                            <p>
                                View and manage all your
                                ShoeMaker orders.
                            </p>
                        </div>
                        <Link
                            to="/products"
                            className="orders-shop-btn"
                        >
                            Continue Shopping →
                        </Link>
                    </div>
                    {/* EMPTY */}
                    {orders.length === 0 ? (
                        <section className="empty-orders">
                            <div className="empty-orders-icon">
                                📦
                            </div>
                            <h2>
                                No Orders Yet
                            </h2>
                            <p>
                                You haven't placed any
                                orders yet. Start shopping
                                and your orders will appear
                                here.
                            </p>
                            <Link
                                to="/products"
                                className="browse-orders-btn"
                            >
                                Start Shopping →
                            </Link>
                        </section>
                    ) : (
                        /* =================================================
                           ORDERS LIST
                        ================================================= */
                        <section className="orders-list">
                            {orders.map((order) => {
                                const orderDate =
                                    getOrderDate(
                                        order.createdAt
                                    );
                                return (
                                    <article
                                        className="order-card"
                                        key={
                                            order.id ||
                                            order.orderNumber
                                        }
                                    >
                                        {/* =====================================
                       ORDER TOP
                    ====================================== */}
                                        <div className="order-card-top">
                                            <div className="order-main-info">
                                                <div className="order-box">
                                                    <span>
                                                        Order ID
                                                    </span>
                                                    <strong>
                                                        {order.orderNumber}
                                                    </strong>
                                                </div>
                                                <div className="order-box">
                                                    <span>
                                                        Order Date
                                                    </span>
                                                    <strong>
                                                        {orderDate}
                                                    </strong>
                                                </div>
                                                <div className="order-box">
                                                    <span>
                                                        Payment
                                                    </span>
                                                    <strong>
                                                        {getPaymentName(
                                                            order.paymentMethod
                                                        )}
                                                    </strong>
                                                </div>
                                            </div>
                                            <span className="order-status-badge">
                                                ✓{" "}
                                                {order.status ||
                                                    "Order Placed"}
                                            </span>
                                        </div>
                                        {/* =====================================
                       PRODUCTS
                    ====================================== */}
                                        <div className="order-products">
                                            {order.items &&
                                                order.items.length > 0 ? (
                                                order.items.map(
                                                    (item) => (
                                                        <div
                                                            className="order-product"
                                                            key={item.id}
                                                        >
                                                            {/* IMAGE */}
                                                            <div className="order-product-image">
                                                                {item.image ? (
                                                                    <img
                                                                        src={
                                                                            item.image
                                                                        }
                                                                        alt={
                                                                            item.name ||
                                                                            "Product"
                                                                        }
                                                                        loading="lazy"
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
                                                            {/* PRODUCT INFO */}
                                                            <div className="order-product-info">
                                                                <h3>
                                                                    {item.name}
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
                                                                    Quantity:{" "}
                                                                    {item.quantity ||
                                                                        1}
                                                                </p>
                                                                <span>
                                                                    ₹
                                                                    {Number(
                                                                        item.price ||
                                                                        0
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )}{" "}
                                                                    each
                                                                </span>
                                                            </div>
                                                            {/* ITEM TOTAL */}
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
                                                )
                                            ) : (
                                                <div className="order-product">
                                                    <div className="order-product-image">
                                                        👟
                                                    </div>
                                                    <div className="order-product-info">
                                                        <h3>
                                                            Product details
                                                        </h3>
                                                        <p>
                                                            Product information
                                                            unavailable.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* =====================================
                       ORDER BOTTOM
                    ====================================== */}
                                        <div className="order-card-bottom">
                                            <div className="order-delivery-info">
                                                <span>
                                                    Delivery
                                                </span>
                                                <strong>
                                                    🚚{" "}
                                                    {getDeliveryName(
                                                        order.deliveryMethod
                                                    )}
                                                </strong>
                                            </div>
                                            <div className="order-total-info">
                                                <span>
                                                    Total Amount
                                                </span>
                                                <strong>
                                                    ₹
                                                    {Number(
                                                        order.total || 0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>
                                            </div>
                                            <Link
                                                to={`/order-success/${order.orderNumber ||
                                                    order.id
                                                    }`}
                                                className="view-order-btn"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>
                    )}
                </div>
            </main>
        </>
    );
};
export default Orders;