import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserNavbar from "../../components/common/UserNavbar";
import "./Wishlist.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = () => {
    const savedWishlist = JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

    setWishlist(savedWishlist);
  };

  const removeFromWishlist = (id) => {
    const updatedWishlist = wishlist.filter(
      (item) => item.id !== id
    );

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "wishlist",
      JSON.stringify(updatedWishlist)
    );

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const addToCart = (product) => {
    const existingCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    const existingProduct = existingCart.find(
      (item) => item.id === product.id
    );

    let updatedCart;

    if (existingProduct) {
      updatedCart = existingCart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: (item.quantity || 1) + 1,
            }
          : item
      );
    } else {
      updatedCart = [
        ...existingCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(new Event("cartUpdated"));

    alert(`${product.name} added to cart!`);
  };

  const clearWishlist = () => {
    setWishlist([]);

    localStorage.removeItem("wishlist");

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  return (
    <>
      <UserNavbar />

      <main className="wishlist-page">
        <div className="wishlist-container">

          {/* HEADER */}

          <div className="wishlist-header">

            <div>
              <span className="wishlist-label">
                YOUR COLLECTION
              </span>

              <h1>My Wishlist</h1>

              <p>
                Save your favorite products and shop them
                whenever you're ready.
              </p>
            </div>

            {wishlist.length > 0 && (
              <button
                className="clear-wishlist-btn"
                onClick={clearWishlist}
              >
                Clear Wishlist
              </button>
            )}

          </div>

          {/* EMPTY */}

          {wishlist.length === 0 ? (
            <section className="empty-wishlist">

              <div className="empty-wishlist-icon">
                ♡
              </div>

              <h2>Your Wishlist is Empty</h2>

              <p>
                You haven't added anything to your wishlist yet.
                Explore our products and save your favorites here.
              </p>

              <Link
                to="/products"
                className="browse-products-btn"
              >
                Browse Products →
              </Link>

            </section>
          ) : (
            <section className="wishlist-grid">

              {wishlist.map((product) => (
                <article
                  className="wishlist-card"
                  key={product.id}
                >

                  {/* DISCOUNT */}

                  {product.badge && (
                    <span className="wishlist-badge">
                      {product.badge}
                    </span>
                  )}

                  {/* REMOVE */}

                  <button
                    className="wishlist-remove"
                    onClick={() =>
                      removeFromWishlist(product.id)
                    }
                    aria-label="Remove from wishlist"
                  >
                    ♥
                  </button>

                  {/* IMAGE */}

                  <Link
                    to={`/products/${product.id}`}
                    className="wishlist-image"
                  >
                    {product.image || "🛍️"}
                  </Link>

                  {/* CONTENT */}

                  <div className="wishlist-content">

                    <span className="wishlist-category">
                      {product.category}
                    </span>

                    <Link
                      to={`/products/${product.id}`}
                      className="wishlist-product-name"
                    >
                      {product.name}
                    </Link>

                    <div className="wishlist-rating">
                      <span>★</span>
                      {product.rating}
                      <small>
                        ({product.reviews} reviews)
                      </small>
                    </div>

                    <div className="wishlist-price-row">

                      <div>
                        <strong>
                          ₹{product.price.toLocaleString("en-IN")}
                        </strong>

                        {product.oldPrice && (
                          <del>
                            ₹
                            {product.oldPrice.toLocaleString(
                              "en-IN"
                            )}
                          </del>
                        )}
                      </div>

                    </div>

                    <button
                      className="wishlist-cart-btn"
                      onClick={() => addToCart(product)}
                    >
                      🛒 Add to Cart
                    </button>

                  </div>

                </article>
              ))}

            </section>
          )}

        </div>
      </main>
    </>
  );
};

export default Wishlist;