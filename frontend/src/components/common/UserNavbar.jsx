import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./UserNavbar.css";

function UserNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  /* =====================================================
     LOAD CART + WISHLIST COUNTS
  ===================================================== */

  const loadCounts = () => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      const wishlist = JSON.parse(
        localStorage.getItem("wishlist") || "[]"
      );

      const totalCartItems = cart.reduce(
        (total, item) =>
          total + (Number(item.quantity) || 1),
        0
      );

      setCartCount(totalCartItems);
      setWishlistCount(wishlist.length);
    } catch (error) {
      console.error("Navbar storage error:", error);

      setCartCount(0);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    loadCounts();

    window.addEventListener(
      "cartUpdated",
      loadCounts
    );

    window.addEventListener(
      "wishlistUpdated",
      loadCounts
    );

    window.addEventListener(
      "storage",
      loadCounts
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        loadCounts
      );

      window.removeEventListener(
        "wishlistUpdated",
        loadCounts
      );

      window.removeEventListener(
        "storage",
        loadCounts
      );
    };
  }, []);

  /* =====================================================
     SEARCH
  ===================================================== */

  const handleSearch = (e) => {
    e.preventDefault();

    const query = search.trim();

    if (!query) {
      navigate("/products");
      setMenuOpen(false);
      return;
    }

    navigate(
      `/products?search=${encodeURIComponent(query)}`
    );

    setMenuOpen(false);
  };

  /* =====================================================
     ACTIVE NAVIGATION
  ===================================================== */

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  /* =====================================================
     CLOSE MOBILE MENU
  ===================================================== */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="user-navbar">

      <div className="user-navbar-container">

        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/"
          className="store-logo"
          onClick={closeMenu}
        >
          <span className="store-logo-icon">
            🛍️
          </span>

          <span className="store-logo-content">

            <span className="store-logo-name">
              Shop<span>Nest</span>
            </span>

            <small>
              Shop More, Live Better
            </small>

          </span>
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav className="user-nav-links">

          <Link
            to="/"
            className={
              isActive("/")
                ? "active"
                : ""
            }
          >
            Home
          </Link>

          <Link
            to="/products"
            className={
              isActive("/products")
                ? "active"
                : ""
            }
          >
            Products
          </Link>

          <Link
            to="/categories"
            className={
              isActive("/categories")
                ? "active"
                : ""
            }
          >
            Categories
          </Link>

          <Link
            to="/offers"
            className={
              isActive("/offers")
                ? "active"
                : ""
            }
          >
            Offers
          </Link>

        </nav>

        {/* =================================================
            SEARCH BAR
        ================================================= */}

        <form
          className="navbar-search"
          onSubmit={handleSearch}
        >

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button
            type="submit"
            aria-label="Search"
          >
            🔍
          </button>

        </form>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="user-nav-actions">

          {/* WISHLIST */}

          <Link
            to="/wishlist"
            className="navbar-icon-btn"
            title="Wishlist"
            onClick={closeMenu}
          >
            <span className="nav-action-icon">
              ♡
            </span>

            {wishlistCount > 0 && (
              <span className="wishlist-count">
                {wishlistCount > 99
                  ? "99+"
                  : wishlistCount}
              </span>
            )}
          </Link>

          {/* CART */}

          <Link
            to="/cart"
            className="navbar-icon-btn cart-btn"
            title="Cart"
            onClick={closeMenu}
          >
            <span className="nav-action-icon">
              🛒
            </span>

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount > 99
                  ? "99+"
                  : cartCount}
              </span>
            )}
          </Link>

          {/* ACCOUNT */}

          <Link
            to="/account"
            className={`navbar-account-btn ${
              isActive("/account")
                ? "account-active"
                : ""
            }`}
            onClick={closeMenu}
          >
            <span className="account-icon">
              👤
            </span>

            <span className="account-text">
              Account
            </span>

            <span className="account-arrow">
              ⌄
            </span>
          </Link>

          {/* LOGIN */}

          <Link
            to="/login"
            className="navbar-login-btn"
            onClick={closeMenu}
          >
            <span>↪</span>
            Login
          </Link>

          {/* MOBILE MENU BUTTON */}

          <button
            className="mobile-menu-btn"
            type="button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Open menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

        </div>

      </div>

      {/* ===================================================
          MOBILE MENU
      ==================================================== */}

      {menuOpen && (
        <div className="mobile-nav-menu">

          <Link
            to="/"
            onClick={closeMenu}
          >
            🏠 Home
          </Link>

          <Link
            to="/products"
            onClick={closeMenu}
          >
            🛍️ Products
          </Link>

          <Link
            to="/categories"
            onClick={closeMenu}
          >
            📂 Categories
          </Link>

          <Link
            to="/offers"
            onClick={closeMenu}
          >
            🎁 Offers
          </Link>

          <Link
            to="/wishlist"
            onClick={closeMenu}
          >
            ❤️ Wishlist

            {wishlistCount > 0 && (
              <span className="mobile-count">
                ({wishlistCount})
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            onClick={closeMenu}
          >
            🛒 Cart

            {cartCount > 0 && (
              <span className="mobile-count">
                ({cartCount})
              </span>
            )}
          </Link>

          <Link
            to="/account"
            onClick={closeMenu}
          >
            👤 My Account
          </Link>

          <Link
            to="/login"
            className="mobile-login-link"
            onClick={closeMenu}
          >
            🔐 Login
          </Link>

        </div>
      )}

    </header>
  );
}

export default UserNavbar;