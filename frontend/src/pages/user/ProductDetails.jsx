import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import UserNavbar from "../../components/common/UserNavbar";
import "./ProductDetails.css";

const API_URL = "http://localhost:5000/api/products";

function normalizeProduct(data) {
  if (!data) return null;

  let sizes = data.sizes || [];

  if (typeof sizes === "string") {
    try {
      const parsed = JSON.parse(sizes);
      sizes = Array.isArray(parsed) ? parsed : sizes.split(",");
    } catch {
      sizes = sizes.split(",");
    }
  }

  if (!Array.isArray(sizes)) {
    sizes = [];
  }

  sizes = sizes
    .map((size) => String(size).trim())
    .filter(Boolean);

  const price = Number(data.price || 0);
  const oldPrice = Number(data.old_price ?? data.oldPrice ?? 0);
  const rating = Number(data.rating || 0);
  const stock = Number(data.stock || 0);

  const calculatedDiscount =
    oldPrice > price && oldPrice > 0
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : Number(data.discount || 0);

  return {
    ...data,

    id: Number(data.id),
    name: data.name || "Product",
    category: data.category || "Footwear",
    gender: data.gender || "",
    price,
    oldPrice,
    discount: calculatedDiscount,
    rating,
    reviews: Number(data.reviews || 0),
    sizes,
    image: data.image || "",
    color: data.color || "",
    description: data.description || "No description available.",
    brand: data.brand || "",
    material: data.material || "",
    soleMaterial: data.sole_material || data.soleMaterial || "",
    weight: data.weight || "",
    stock,
    status: data.status || "Active",
    featured: Boolean(data.featured),
    newArrival: Boolean(data.new_arrival ?? data.newArrival),
    badge:
      data.badge ||
      (calculatedDiscount > 0
        ? `${calculatedDiscount}% OFF`
        : data.new_arrival
        ? "NEW"
        : ""),
    features: [
      data.material ? `Material: ${data.material}` : null,
      data.sole_material
        ? `Sole: ${data.sole_material}`
        : null,
      data.color ? `Color: ${data.color}` : null,
      data.weight ? `Weight: ${data.weight}` : null,
      "Comfortable everyday design",
    ].filter(Boolean),
  };
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // =========================================================
  // FETCH PRODUCT FROM POSTGRESQL API
  // =========================================================
  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/${id}`);

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            "Backend returned an invalid response. Make sure backend is running."
          );
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Product not found.");
        }

        if (mounted) {
          setProduct(normalizeProduct(data));
        }
      } catch (err) {
        console.error("PRODUCT DETAILS ERROR:", err);

        if (mounted) {
          setProduct(null);
          setError(err.message || "Unable to load product.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  // =========================================================
  // CHECK WISHLIST
  // =========================================================
  useEffect(() => {
    if (!product) return;

    try {
      const savedWishlist = JSON.parse(
        localStorage.getItem("wishlist") || "[]"
      );

      setWishlist(
        savedWishlist.some(
          (item) => Number(item.id) === Number(product.id)
        )
      );
    } catch (err) {
      console.error("Wishlist read error:", err);
      setWishlist(false);
    }
  }, [product]);

  // =========================================================
  // DISCOUNT
  // =========================================================
  const discount = useMemo(() => {
    if (!product) return 0;

    if (
      product.oldPrice > product.price &&
      product.oldPrice > 0
    ) {
      return Math.round(
        ((product.oldPrice - product.price) /
          product.oldPrice) *
          100
      );
    }

    return Number(product.discount || 0);
  }, [product]);

  // =========================================================
  // WISHLIST
  // =========================================================
  const toggleWishlist = () => {
    if (!product) return;

    try {
      const savedWishlist = JSON.parse(
        localStorage.getItem("wishlist") || "[]"
      );

      const exists = savedWishlist.some(
        (item) => Number(item.id) === Number(product.id)
      );

      let updatedWishlist;

      if (exists) {
        updatedWishlist = savedWishlist.filter(
          (item) => Number(item.id) !== Number(product.id)
        );
      } else {
        updatedWishlist = [
          ...savedWishlist,
          product,
        ];
      }

      localStorage.setItem(
        "wishlist",
        JSON.stringify(updatedWishlist)
      );

      setWishlist(!exists);

      window.dispatchEvent(
        new Event("wishlistUpdated")
      );
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  // =========================================================
  // ADD TO CART
  // =========================================================
  const addToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      alert("Please select a shoe size first.");
      return;
    }

    if (product.stock <= 0) {
      alert("This product is currently out of stock.");
      return;
    }

    if (quantity > product.stock) {
      alert(`Only ${product.stock} item(s) are available.`);
      return;
    }

    try {
      const cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      const cartProduct = {
        ...product,
        selectedSize,
        quantity,
      };

      const existingItem = cart.find(
        (item) =>
          Number(item.id) === Number(product.id) &&
          String(item.selectedSize) === String(selectedSize)
      );

      let updatedCart;

      if (existingItem) {
        updatedCart = cart.map((item) =>
          Number(item.id) === Number(product.id) &&
          String(item.selectedSize) === String(selectedSize)
            ? {
                ...item,
                quantity:
                  (item.quantity || 1) + quantity,
              }
            : item
        );
      } else {
        updatedCart = [
          ...cart,
          cartProduct,
        ];
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(updatedCart)
      );

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      alert("Shoe added to cart!");
    } catch (error) {
      console.error("Cart error:", error);
    }
  };

  // =========================================================
  // BUY NOW
  // =========================================================
  const buyNow = () => {
    if (!product) return;

    if (!selectedSize) {
      alert("Please select a shoe size first.");
      return;
    }

    if (product.stock <= 0) {
      alert("This product is currently out of stock.");
      return;
    }

    if (quantity > product.stock) {
      alert(`Only ${product.stock} item(s) are available.`);
      return;
    }

    try {
      const cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      const cartProduct = {
        ...product,
        selectedSize,
        quantity,
      };

      const existingItem = cart.find(
        (item) =>
          Number(item.id) === Number(product.id) &&
          String(item.selectedSize) === String(selectedSize)
      );

      let updatedCart;

      if (existingItem) {
        updatedCart = cart.map((item) =>
          Number(item.id) === Number(product.id) &&
          String(item.selectedSize) === String(selectedSize)
            ? {
                ...item,
                quantity:
                  (item.quantity || 1) + quantity,
              }
            : item
        );
      } else {
        updatedCart = [
          ...cart,
          cartProduct,
        ];
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(updatedCart)
      );

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      navigate("/checkout");
    } catch (error) {
      console.error("Buy now error:", error);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="product-not-found">
        <UserNavbar />

        <div className="not-found-content">
          <div>👟</div>
          <h1>Loading Product...</h1>
          <p>Please wait while we load the product details.</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR / NOT FOUND
  // =========================================================
  if (!product) {
    return (
      <div className="product-not-found">
        <UserNavbar />

        <div className="not-found-content">
          <div>👟</div>

          <h1>Product Not Found</h1>

          <p>
            {error ||
              "Sorry, this shoe is not available."}
          </p>

          <Link to="/products">
            Back to Shoes
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================
  return (
    <div className="product-details-page">
      <UserNavbar />

      {/* BREADCRUMB */}
      <div className="product-breadcrumb-container">
        <div className="product-breadcrumb">
          <Link to="/">Home</Link>

          <span>/</span>

          <Link to="/products">
            Shoes
          </Link>

          <span>/</span>

          <span>{product.name}</span>
        </div>
      </div>

      {/* PRODUCT */}
      <main className="product-details-container">
        <section className="product-details-grid">

          {/* IMAGE */}
          <div className="details-image-column">
            <div className="details-image">

              {product.badge && (
                <span className="details-badge">
                  {product.badge}
                </span>
              )}

              <button
                className={`details-wishlist ${
                  wishlist ? "active" : ""
                }`}
                onClick={toggleWishlist}
                type="button"
              >
                {wishlist ? "♥" : "♡"}
              </button>

              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="details-shoe"
                />
              ) : (
                <div
                  className="details-shoe"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "400px",
                    fontSize: "80px",
                  }}
                >
                  👟
                </div>
              )}
            </div>

            <div className="image-info">
              <span>
                100% Quality Checked
              </span>

              <span>
                Secure Packaging
              </span>

              <span>
                Easy Returns
              </span>
            </div>
          </div>

          {/* INFORMATION */}
          <div className="details-info">

            <div className="details-category">
              {product.category}

              {product.gender && (
                <>
                  <span>•</span>
                  {product.gender}
                </>
              )}
            </div>

            <h1>{product.name}</h1>

            <div className="details-rating">
              <span className="rating-box">
                ★ {product.rating.toFixed(1)}
              </span>

              <span>
                {product.reviews > 0
                  ? `${product.reviews} customer reviews`
                  : "No reviews yet"}
              </span>
            </div>

            <div className="details-price">
              <strong>
                ₹
                {product.price.toLocaleString(
                  "en-IN"
                )}
              </strong>

              {product.oldPrice > product.price && (
                <del>
                  ₹
                  {product.oldPrice.toLocaleString(
                    "en-IN"
                  )}
                </del>
              )}

              {discount > 0 && (
                <span>
                  {discount}% OFF
                </span>
              )}
            </div>

            <p className="details-description">
              {product.description}
            </p>

            {/* EXTRA PRODUCT INFO */}
            {(product.brand ||
              product.color ||
              product.material) && (
              <div
                style={{
                  display: "grid",
                  gap: "8px",
                  marginTop: "16px",
                  marginBottom: "16px",
                }}
              >
                {product.brand && (
                  <div>
                    <strong>Brand:</strong>{" "}
                    {product.brand}
                  </div>
                )}

                {product.color && (
                  <div>
                    <strong>Color:</strong>{" "}
                    {product.color}
                  </div>
                )}

                {product.material && (
                  <div>
                    <strong>Material:</strong>{" "}
                    {product.material}
                  </div>
                )}
              </div>
            )}

            <div className="details-divider"></div>

            {/* SIZE */}
            <div className="size-selector">
              <div className="size-title-row">
                <strong>
                  Select Size
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Please choose your usual shoe size. Size availability is shown below."
                    )
                  }
                >
                  Size Guide
                </button>
              </div>

              {product.sizes.length > 0 ? (
                <div className="details-sizes">
                  {product.sizes.map(
                    (size) => (
                      <button
                        key={size}
                        type="button"
                        className={
                          String(selectedSize) ===
                          String(size)
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          setSelectedSize(size)
                        }
                      >
                        {size}
                      </button>
                    )
                  )}
                </div>
              ) : (
                <p>
                  Size information not available.
                </p>
              )}

              {!selectedSize && (
                <small className="size-warning">
                  Please select a size
                </small>
              )}
            </div>

            {/* STOCK */}
            <div style={{ marginTop: "15px" }}>
              {product.stock > 0 ? (
                <span
                  style={{
                    color:
                      product.stock <= 5
                        ? "#d97706"
                        : "#15803d",
                    fontWeight: 600,
                  }}
                >
                  {product.stock <= 5
                    ? `Only ${product.stock} left in stock`
                    : "In Stock"}
                </span>
              ) : (
                <span
                  style={{
                    color: "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  Out of Stock
                </span>
              )}
            </div>

            {/* QUANTITY */}
            <div className="quantity-section">
              <strong>Quantity</strong>

              <div className="quantity-control">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      Math.max(
                        1,
                        quantity - 1
                      )
                    )
                  }
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      product.stock > 0
                        ? Math.min(
                            product.stock,
                            quantity + 1
                          )
                        : quantity + 1
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="details-buttons">
              <button
                className="details-add-cart"
                onClick={addToCart}
                type="button"
                disabled={product.stock <= 0}
              >
                {product.stock <= 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>

              <button
                className="details-buy-now"
                onClick={buyNow}
                type="button"
                disabled={product.stock <= 0}
              >
                Buy Now →
              </button>
            </div>

            {/* DELIVERY */}
            <div className="delivery-box">

              <div className="delivery-item">
                <span>🚚</span>

                <div>
                  <strong>
                    Free Delivery
                  </strong>

                  <small>
                    On orders above ₹999
                  </small>
                </div>
              </div>

              <div className="delivery-item">
                <span>↩</span>

                <div>
                  <strong>
                    Easy Returns
                  </strong>

                  <small>
                    Simple return process
                  </small>
                </div>
              </div>

              <div className="delivery-item">
                <span>🔒</span>

                <div>
                  <strong>
                    Secure Payment
                  </strong>

                  <small>
                    100% secure checkout
                  </small>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* DETAILS TABS */}
        <section className="product-extra-details">

          <div className="details-tabs">

            <button
              className={
                activeTab === "description"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("description")
              }
              type="button"
            >
              Description
            </button>

            <button
              className={
                activeTab === "features"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("features")
              }
              type="button"
            >
              Features
            </button>

            <button
              className={
                activeTab === "shipping"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("shipping")
              }
              type="button"
            >
              Shipping & Returns
            </button>

          </div>

          <div className="details-tab-content">

            {/* DESCRIPTION */}
            {activeTab === "description" && (
              <>
                <h2>
                  About this shoe
                </h2>

                <p>
                  {product.description}
                </p>

                <p>
                  Designed with everyday
                  comfort and modern styling
                  in mind, this{" "}
                  {product.category.toLowerCase()}{" "}
                  is a versatile addition to
                  your footwear collection.
                </p>
              </>
            )}

            {/* FEATURES */}
            {activeTab === "features" && (
              <>
                <h2>
                  Product Features
                </h2>

                <ul className="features-list">
                  {product.features.length > 0 ? (
                    product.features.map(
                      (feature, index) => (
                        <li key={index}>
                          <span>✓</span>
                          {feature}
                        </li>
                      )
                    )
                  ) : (
                    <li>
                      <span>✓</span>
                      Quality footwear
                    </li>
                  )}
                </ul>
              </>
            )}

            {/* SHIPPING */}
            {activeTab === "shipping" && (
              <>
                <h2>
                  Shipping & Returns
                </h2>

                <div className="shipping-details">

                  <div>
                    <strong>
                      Delivery
                    </strong>

                    <p>
                      Orders are prepared
                      for delivery after
                      checkout.
                    </p>
                  </div>

                  <div>
                    <strong>
                      Returns
                    </strong>

                    <p>
                      Eligible products can
                      be returned according
                      to the store's return
                      policy.
                    </p>
                  </div>

                  <div>
                    <strong>
                      Secure Packaging
                    </strong>

                    <p>
                      Your footwear is packed
                      carefully before dispatch.
                    </p>
                  </div>

                </div>
              </>
            )}

          </div>
        </section>
      </main>
    </div>
  );
}

export default ProductDetails;