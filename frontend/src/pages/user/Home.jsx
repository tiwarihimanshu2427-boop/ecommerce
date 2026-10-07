import React from "react";
import { Link } from "react-router-dom";
import UserNavbar from "../../components/common/UserNavbar";
import "./Home.css";

const categories = [
  {
    icon: "👟",
    name: "Sneakers",
    subtitle: "Everyday Style",
  },
  {
    icon: "🏃",
    name: "Running Shoes",
    subtitle: "Built to Move",
  },
  {
    icon: "👞",
    name: "Formal Shoes",
    subtitle: "Classic & Smart",
  },
  {
    icon: "🥾",
    name: "Boots",
    subtitle: "Strong & Durable",
  },
  {
    icon: "🩴",
    name: "Casual Shoes",
    subtitle: "Easy Comfort",
  },
  {
    icon: "👟",
    name: "Kids Shoes",
    subtitle: "Fun & Comfortable",
  },
];

const products = [
  {
    id: 1,
    name: "Urban Street Sneakers",
    price: 1999,
    oldPrice: 2999,
    rating: 4.8,
    reviews: 128,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85",
    badge: "BEST SELLER",
  },
  {
    id: 2,
    name: "AirFlex Running Shoes",
    price: 2299,
    oldPrice: 3499,
    rating: 4.7,
    reviews: 214,
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1000&q=85",
    badge: "37% OFF",
  },
  {
    id: 3,
    name: "Classic Leather Formal",
    price: 2499,
    oldPrice: 3499,
    rating: 4.9,
    reviews: 87,
    image:
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1000&q=85",
    badge: "PREMIUM",
  },
  {
    id: 4,
    name: "Mountain Trek Boots",
    price: 2899,
    oldPrice: 3999,
    rating: 4.6,
    reviews: 76,
    image:
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1000&q=85",
    badge: "NEW",
  },
];

function Home() {
  return (
    <div className="home-page">
      <UserNavbar />

      {/* HERO */}
      <section className="shoe-hero">
        <div className="home-container hero-content">
          <div className="hero-text">
            <span className="hero-tag">✦ NEW COLLECTION 2026</span>

            <h1>
              Step Into
              <br />
              <span>Your Style.</span>
            </h1>

            <p>
              Discover premium footwear designed for comfort,
              confidence and everyday style. Find the perfect
              pair for every step.
            </p>

            <div className="hero-buttons">
              <Link to="/products" className="hero-primary-btn">
                Shop Shoes →
              </Link>

              <Link
                to="/categories"
                className="hero-secondary-btn"
              >
                Explore Collection
              </Link>
            </div>

            <div className="hero-mini-info">
              <div>
                <strong>500+</strong>
                <span>Styles</span>
              </div>

              <div>
                <strong>50K+</strong>
                <span>Happy Customers</span>
              </div>

              <div>
                <strong>4.8★</strong>
                <span>Customer Rating</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-glow"></div>

            <div className="hero-shoe">
              <img
                src={products[0].image}
                alt={products[0].name}
              />
            </div>

            <div className="hero-floating-card hero-card-one">
              <span className="floating-icon">✓</span>

              <div>
                <strong>Premium Quality</strong>
                <small>Made for comfort</small>
              </div>
            </div>

            <div className="hero-floating-card hero-card-two">
              <span className="floating-icon">★</span>

              <div>
                <strong>4.8 Rating</strong>
                <small>10K+ Reviews</small>
              </div>
            </div>

            <div className="hero-circle-text">
              STEP
              <br />
              INTO
              <br />
              STYLE
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits-section">
        <div className="home-container benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon">🚚</div>

            <div>
              <strong>Free Delivery</strong>
              <span>On orders above ₹999</span>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">✓</div>

            <div>
              <strong>Premium Quality</strong>
              <span>Quality footwear guaranteed</span>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">↩</div>

            <div>
              <strong>Easy Returns</strong>
              <span>Simple return process</span>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">🔒</div>

            <div>
              <strong>Secure Payment</strong>
              <span>100% secure checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="home-section">
        <div className="home-container">
          <div className="section-heading">
            <div>
              <span>FIND YOUR PAIR</span>
              <h2>Shop by Category</h2>
            </div>

            <Link to="/categories">View All →</Link>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                to={`/products?category=${encodeURIComponent(
                  category.name
                )}`}
                className="category-card"
                key={category.name}
              >
                <div className="category-icon">
                  {category.icon}
                </div>

                <h3>{category.name}</h3>

                <span>{category.subtitle}</span>

                <div className="category-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="home-section products-section">
        <div className="home-container">
          <div className="section-heading">
            <div>
              <span>OUR PICKS</span>
              <h2>Trending Footwear</h2>
            </div>

            <Link to="/products">View All →</Link>
          </div>

          <div className="home-products-grid">
            {products.map((product) => (
              <div
                className="home-product-card"
                key={product.id}
              >
                <Link
                  to={`/products/${product.id}`}
                  className="product-image"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="shoe-product-image"
                  />

                  <span className="product-discount">
                    {product.badge}
                  </span>

                  <span className="quick-view">
                    View →
                  </span>
                </Link>

                <div className="home-product-info">
                  <div className="product-rating">
                    ★ {product.rating}

                    <span>
                      ({product.reviews})
                    </span>
                  </div>

                  <h3>{product.name}</h3>

                  <div className="product-price">
                    <strong>
                      ₹{product.price.toLocaleString("en-IN")}
                    </strong>

                    <del>
                      ₹{product.oldPrice.toLocaleString("en-IN")}
                    </del>
                  </div>

                  <div className="shoe-size-row">
                    <span>Sizes:</span>

                    <small>6</small>
                    <small>7</small>
                    <small>8</small>
                    <small>9</small>
                    <small>10</small>
                  </div>

                  <Link
                    to={`/products/${product.id}`}
                    className="add-cart-btn"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND BANNER */}
      <section className="brand-section">
        <div className="home-container">
          <div className="brand-banner">
            <div className="brand-banner-content">
              <span>MADE FOR EVERY STEP</span>

              <h2>
                Comfort Meets
                <br />
                <strong>Confidence.</strong>
              </h2>

              <p>
                From morning runs to evening plans,
                discover footwear designed to keep you
                moving in style.
              </p>

              <Link to="/products">
                Discover Shoes →
              </Link>
            </div>

            <div className="brand-shoe">
              <img
                src={products[1].image}
                alt="Running shoes"
              />
            </div>

            <div className="brand-shape shape-one"></div>
            <div className="brand-shape shape-two"></div>
          </div>
        </div>
      </section>

      {/* OFFER */}
      <section className="offer-section">
        <div className="home-container">
          <div className="offer-banner">
            <div className="offer-content">
              <span>WELCOME TO SHOEMAKER</span>

              <h2>
                Get 20% OFF
                <br />
                Your First Pair
              </h2>

              <p>
                Use coupon code:
                <strong> WELCOME20</strong>
              </p>

              <Link to="/products">
                Shop Now →
              </Link>
            </div>

            <div className="offer-shoe">
              <img
                src={products[2].image}
                alt="Formal shoe"
              />
            </div>

            <div className="offer-circle">
              -20%
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-container footer-grid">
          <div className="footer-brand">
            <Link
              to="/"
              className="store-logo footer-logo"
            >
              <span className="store-logo-icon">
                👟
              </span>

              <span>
                Shoe<span>Maker</span>
              </span>
            </Link>

            <p>
              Premium footwear made for every step.
              Discover shoes that combine comfort,
              quality and modern style.
            </p>

            <div className="footer-socials">
              <span>f</span>
              <span>◎</span>
              <span>𝕏</span>
              <span>▶</span>
            </div>
          </div>

          <div className="footer-column">
            <h4>Shop</h4>

            <Link to="/products">
              All Shoes
            </Link>

            <Link to="/categories">
              Categories
            </Link>

            <Link to="/offers">
              Offers
            </Link>

            <Link to="/wishlist">
              Wishlist
            </Link>
          </div>

          <div className="footer-column">
            <h4>Categories</h4>

            <Link to="/products?category=Sneakers">
              Sneakers
            </Link>

            <Link to="/products?category=Running%20Shoes">
              Running Shoes
            </Link>

            <Link to="/products?category=Formal%20Shoes">
              Formal Shoes
            </Link>

            <Link to="/products?category=Boots">
              Boots
            </Link>
          </div>

          <div className="footer-column">
            <h4>Account</h4>

            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>

            <Link to="/orders">
              My Orders
            </Link>

            <Link to="/account">
              My Account
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 ShoeMaker. All rights reserved.
          </span>

          <span>
            Step Into Your Style.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Home;