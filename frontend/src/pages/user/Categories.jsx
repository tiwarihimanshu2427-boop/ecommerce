import React from "react";
import { Link } from "react-router-dom";
import UserNavbar from "../../components/common/UserNavbar";
import "./Categories.css";

const categories = [
  {
    name: "Sneakers",
    subtitle: "Street Style & Everyday",
    tag: "TRENDING",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90",
  },
  {
    name: "Running Shoes",
    subtitle: "Built for Every Run",
    tag: "PERFORMANCE",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=90",
  },
  {
    name: "Formal Shoes",
    subtitle: "Classic & Sophisticated",
    tag: "PREMIUM",
    image:
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1200&q=90",
  },
  {
    name: "Boots",
    subtitle: "Strong & Durable",
    tag: "ICONIC",
    image:
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1200&q=90",
  },
  {
    name: "Casual Shoes",
    subtitle: "Relaxed Everyday Comfort",
    tag: "EVERYDAY",
    image:
      "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=1200&q=90",
  },
  {
    name: "Kids Shoes",
    subtitle: "Comfort for Little Steps",
    tag: "KIDS",
    image:
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=90",
  },
];

const brands = [
  {
    name: "NIKE",
    subtitle: "Sport & Lifestyle",
    category: "Sneakers",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=90",
  },
  {
    name: "adidas",
    subtitle: "Performance & Originals",
    category: "Sneakers",
    image:
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=90",
  },
  {
    name: "PUMA",
    subtitle: "Sport & Streetwear",
    category: "Sneakers",
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=90",
  },
  {
    name: "NEW BALANCE",
    subtitle: "Running & Comfort",
    category: "Running Shoes",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=90",
  },
  {
    name: "Reebok",
    subtitle: "Training & Classics",
    category: "Casual Shoes",
    image:
      "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=900&q=90",
  },
  {
    name: "SKECHERS",
    subtitle: "Comfort & Everyday",
    category: "Casual Shoes",
    image:
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=90",
  },
];
const collections = [
  {
    title: "Men's Collection",
    text: "Smart, sporty and everyday footwear for men.",
    category: "Men",
    image:
      "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=1400&q=90",
  },
  {
    title: "Women's Collection",
    text: "Modern footwear designed for every occasion.",
    category: "Women",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1400&q=90",
  },
];

function Categories() {
  return (
    <div className="categories-page">

      <UserNavbar />

      {/* =====================================================
          PREMIUM HERO
      ===================================================== */}

      <section className="categories-hero">

        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />

        <div className="categories-container categories-hero-content">

          <div className="categories-hero-copy">

            <div className="hero-eyebrow">
              <span />
              SHOEMAKER PREMIUM COLLECTION
            </div>

            <h1>
              Find Your
              <br />
              <em>Perfect</em> Style.
            </h1>

            <p>
              Discover premium footwear designed for
              comfort, confidence and every step of
              your journey.
            </p>

            <div className="hero-buttons">

              <Link
                to="/products"
                className="hero-primary-btn"
              >
                Shop All Shoes
                <span>→</span>
              </Link>

              <Link
                to="/offers"
                className="hero-secondary-btn"
              >
                View Offers
              </Link>

            </div>

            <div className="hero-mini-stats">

              <div>
                <strong>500+</strong>
                <span>Styles</span>
              </div>

              <div>
                <strong>50+</strong>
                <span>Brands</span>
              </div>

              <div>
                <strong>4.8★</strong>
                <span>Rated</span>
              </div>

            </div>

          </div>


          <div className="categories-hero-visual">

            <div className="hero-image-frame">

              <img
                src={categories[0].image}
                alt="Premium sneaker collection"
              />

              <div className="hero-image-gradient" />

              <div className="hero-image-label">
                <span>FEATURED</span>
                <strong>Premium Sneakers</strong>
              </div>

            </div>

            <div className="hero-floating-badge">
              <span>✦</span>
              <div>
                <strong>Premium Quality</strong>
                <small>Made for every step</small>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          BRAND SECTION
      ===================================================== */}

      <section className="brands-section">

        <div className="categories-container">

          <div className="brands-heading">

            <div>
              <span>SHOP BY BRAND</span>
              <h2>World-Class Footwear</h2>
            </div>

            <p>
              Explore popular footwear brands and
              find your perfect pair.
            </p>

          </div>


          <div className="brands-grid">
            {brands.map((brand) => (
              <Link
                key={brand.name}
                to={`/products?category=${encodeURIComponent(
                  brand.category
                )}`}
                className="brand-card"
              >
                <div className="brand-image">
                  <img
                    src={brand.image}
                    alt={`${brand.name} shoes`}
                    loading="lazy"
                  />

                  <div className="brand-image-overlay" />

                  <span className="brand-photo-label">
                    OFFICIAL STYLE
                  </span>
                </div>

                <div className="brand-card-content">
                  <div>
                    <h3>{brand.name}</h3>
                    <p>{brand.subtitle}</p>
                  </div>

                  <span className="brand-arrow">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>

      </section>


      {/* =====================================================
          CATEGORY SECTION
      ===================================================== */}

      <section className="categories-section">

        <div className="categories-container">

          <div className="categories-heading">

            <div>
              <span>EXPLORE COLLECTIONS</span>
              <h2>Shop by Category</h2>
            </div>

            <p>
              From everyday comfort to premium
              occasions, find the right pair for
              every moment.
            </p>

          </div>


          <div className="category-main-grid">

            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(
                  category.name
                )}`}
                className="category-large-card"
              >

                <div className="category-large-image">

                  <img
                    src={category.image}
                    alt={category.name}
                    loading={index > 1 ? "lazy" : "eager"}
                  />

                  <div className="category-overlay" />

                  <div className="category-top-info">
                    {category.tag}
                  </div>

                  <div className="category-shop-arrow">
                    →
                  </div>

                  <div className="category-image-title">
                    {category.name}
                  </div>

                </div>

                <div className="category-large-info">

                  <div>
                    <h3>{category.name}</h3>
                    <p>{category.subtitle}</p>
                  </div>

                  <span>
                    Explore →
                  </span>

                </div>

              </Link>
            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          COLLECTIONS
      ===================================================== */}

      <section className="collections-section">

        <div className="categories-container">

          <div className="center-heading">

            <span>SHOP YOUR WAY</span>

            <h2>
              Explore Collections
            </h2>

            <p>
              Carefully selected styles for
              every personality.
            </p>

          </div>


          <div className="collections-grid">

            {collections.map((collection) => (
              <Link
                key={collection.title}
                to={`/products?category=${encodeURIComponent(
                  collection.category
                )}`}
                className="collection-card"
              >

                <img
                  src={collection.image}
                  alt={collection.title}
                  loading="lazy"
                />

                <div className="collection-overlay" />

                <div className="collection-content">

                  <span>
                    {collection.category}
                  </span>

                  <h3>
                    {collection.title}
                  </h3>

                  <p>
                    {collection.text}
                  </p>

                  <strong>
                    Shop Collection
                    <span>→</span>
                  </strong>

                </div>

              </Link>
            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          PREMIUM BRAND STRIP
      ===================================================== */}

      <section className="brand-strip-section">

        <div className="categories-container">

          <div className="brand-strip">

            <div className="brand-strip-title">
              <span>BRANDS YOU LOVE</span>
              <strong>
                Step into quality.
              </strong>
            </div>

            <div className="brand-strip-items">

              <span>NIKE</span>
              <span>adidas</span>
              <span>PUMA</span>
              <span>NEW BALANCE</span>
              <span>Reebok</span>
              <span>SKECHERS</span>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          BRAND MESSAGE
      ===================================================== */}


{/* =====================================================
    PREMIUM FOOTER
===================================================== */}

<footer className="categories-footer">

  {/* Premium shoe image area */}
  <div className="footer-shoe-visual">

    <img
      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=90"
      alt="Premium Shoe"
    />

    <div className="footer-shoe-overlay" />

    <div className="footer-visual-content">

      <span>STEP INTO STYLE</span>

      <h2>
        Your Style.
        <br />
        Your <em>Step.</em>
      </h2>

      <p>
        Discover premium footwear made for
        comfort, confidence and everyday life.
      </p>

      <Link to="/products">
        Explore Collection
        <span>→</span>
      </Link>

    </div>

  </div>


  {/* Main Footer */}
  <div className="categories-container footer-content">

    <div className="footer-brand">

      <Link
        to="/"
        className="category-footer-logo"
      >
        <span className="footer-logo-icon">
          👟
        </span>

        Shoe<span>Maker</span>
      </Link>

      <p>
        Premium footwear made for every step.
      </p>

      <div className="footer-rating">
        <span>★★★★★</span>
        <small>
          Loved by shoe lovers
        </small>
      </div>

    </div>


    {/* SHOP */}
    <div className="footer-column">

      <h3>SHOP</h3>

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


    {/* COLLECTIONS */}
    <div className="footer-column">

      <h3>COLLECTIONS</h3>

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


    {/* ACCOUNT */}
    <div className="footer-column">

      <h3>ACCOUNT</h3>

      <Link to="/account">
        My Account
      </Link>

      <Link to="/orders">
        My Orders
      </Link>

      <Link to="/wishlist">
        My Wishlist
      </Link>

      <Link to="/login">
        Login
      </Link>

    </div>


    {/* SUPPORT */}
    <div className="footer-column">

      <h3>SUPPORT</h3>

      <Link to="/account">
        Help Center
      </Link>

      <Link to="/orders">
        Track Order
      </Link>

      <Link to="/offers">
        Offers
      </Link>

      <Link to="/account">
        Contact Us
      </Link>

    </div>

  </div>


  {/* Footer bottom */}

  <div className="category-footer-bottom">

    <div className="categories-container footer-bottom-inner">

      <span>
        © 2026 ShoeMaker. All rights reserved.
      </span>

      <div className="footer-bottom-links">
        <span>Premium Footwear</span>
        <span>•</span>
        <span>Secure Shopping</span>
        <span>•</span>
        <span>Easy Returns</span>
      </div>

    </div>

  </div>

</footer>

    </div>
  );
}

export default Categories;
