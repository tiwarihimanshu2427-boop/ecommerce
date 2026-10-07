import React from "react";
import { Link } from "react-router-dom";
import UserNavbar from "../../components/common/UserNavbar";
import "./Offers.css";

const offers = [
  {
    id: 1,
    badge: "UP TO 50% OFF",
    title: "Electronics Sale",
    description:
      "Grab amazing deals on gadgets and electronics.",
    icon: "💻",
    button: "Shop Electronics",
    category: "Electronics",
    theme: "purple",
  },
  {
    id: 2,
    badge: "UP TO 40% OFF",
    title: "Fashion Deals",
    description:
      "Refresh your wardrobe with exciting discounts.",
    icon: "👕",
    button: "Shop Fashion",
    category: "Fashion",
    theme: "pink",
  },
  {
    id: 3,
    badge: "UP TO 45% OFF",
    title: "Footwear Sale",
    description:
      "Step into style with special footwear offers.",
    icon: "👟",
    button: "Shop Footwear",
    category: "Footwear",
    theme: "blue",
  },
  {
    id: 4,
    badge: "UP TO 35% OFF",
    title: "Home & Living",
    description:
      "Give your home a fresh new look for less.",
    icon: "🏠",
    button: "Shop Home",
    category: "Home & Living",
    theme: "orange",
  },
];

const Offers = () => {
  return (
    <>
      <UserNavbar />

      <main className="offers-page">

        {/* Decorative background */}
        <div className="offers-bg offers-bg-one" />
        <div className="offers-bg offers-bg-two" />
        <div className="offers-bg offers-bg-three" />

        <div className="offers-container">

          {/* =================================================
              PREMIUM HERO
          ================================================= */}

          <section className="offers-hero">

            <div className="hero-glow hero-glow-one" />
            <div className="hero-glow hero-glow-two" />

            <div className="offers-hero-content">

              <div className="offers-label">
                <span className="label-dot" />
                LIMITED TIME OFFERS
              </div>

              <h1>
                Big Savings.
                <br />
                <span>Bigger Smiles.</span>
              </h1>

              <p>
                Discover exclusive deals, special discounts
                and exciting offers across your favorite
                categories.
              </p>

              <div className="hero-actions">

                <Link
                  to="/products"
                  className="offers-shop-btn"
                >
                  <span>Shop All Products</span>
                  <span className="btn-arrow">→</span>
                </Link>

                <div className="hero-trust">
                  <span className="trust-icon">
                    ✓
                  </span>

                  <span>
                    Best prices guaranteed
                  </span>
                </div>

              </div>

            </div>

            {/* Hero visual */}

            <div className="offers-hero-visual">

              <div className="hero-ring ring-one" />
              <div className="hero-ring ring-two" />

              <div className="hero-floating-card card-top">
                <span>🔥</span>
                <div>
                  <strong>Hot Deals</strong>
                  <small>Limited time</small>
                </div>
              </div>

              <div className="offers-hero-icon">
                🛍️
              </div>

              <div className="hero-floating-card card-bottom">
                <span>💜</span>
                <div>
                  <strong>Save More</strong>
                  <small>Shop today</small>
                </div>
              </div>

            </div>

          </section>


          {/* =================================================
              OFFER SECTION HEADING
          ================================================= */}

          <section className="offers-section">

            <div className="offers-section-heading">

              <div>
                <span className="section-eyebrow">
                  DEALS FOR YOU
                </span>

                <h2>
                  Today's Top Offers
                </h2>

                <p>
                  Premium deals picked specially for you.
                </p>
              </div>

              <Link
                to="/products"
                className="view-all-link"
              >
                View All Products
                <span>→</span>
              </Link>

            </div>


            {/* =================================================
                OFFER CARDS
            ================================================= */}

            <div className="offers-grid">

              {offers.map((offer) => (
                <article
                  className={`offer-card ${offer.theme}`}
                  key={offer.id}
                >

                  <div className="offer-card-top">

                    <div className="offer-discount">
                      {offer.badge}
                    </div>

                    <div className="offer-card-shine" />

                    <div className="offer-icon">
                      {offer.icon}
                    </div>

                    <span className="offer-star star-one">
                      ✦
                    </span>

                    <span className="offer-star star-two">
                      ✧
                    </span>

                  </div>

                  <div className="offer-card-content">

                    <span className="offer-small-label">
                      SPECIAL OFFER
                    </span>

                    <h3>
                      {offer.title}
                    </h3>

                    <p>
                      {offer.description}
                    </p>

                    <Link
                      to={`/products?category=${encodeURIComponent(
                        offer.category
                      )}`}
                      className="offer-shop-link"
                    >
                      <span>
                        {offer.button}
                      </span>

                      <span className="offer-link-arrow">
                        →
                      </span>
                    </Link>

                  </div>

                </article>
              ))}

            </div>

          </section>


          {/* =================================================
              PREMIUM COUPON
          ================================================= */}

          <section className="coupon-banner">

            <div className="coupon-glow" />

            <div className="coupon-banner-icon">
              🎁
            </div>

            <div className="coupon-banner-content">

              <span>
                EXTRA SAVINGS
              </span>

              <h2>
                Get 20% OFF Your Order
              </h2>

              <p>
                Use our exclusive welcome coupon at
                checkout and unlock extra savings.
              </p>

              <div className="coupon-note">
                ✓ Valid on selected products
              </div>

            </div>

            <div className="coupon-code">

              <span>
                COUPON CODE
              </span>

              <strong>
                WELCOME20
              </strong>

              <small>
                Copy & use at checkout
              </small>

            </div>

          </section>


          {/* =================================================
              SHOPPING BENEFITS
          ================================================= */}

          <section className="offer-benefits">

            <div className="benefits-heading">

              <span>
                WHY SHOP WITH US
              </span>

              <h2>
                Shopping Made Better
              </h2>

            </div>

            <div className="benefits-grid">

              <div className="offer-benefit">

                <div className="benefit-icon">
                  🚚
                </div>

                <div>
                  <h3>
                    Free Delivery
                  </h3>

                  <p>
                    On orders above ₹999
                  </p>
                </div>

              </div>


              <div className="offer-benefit">

                <div className="benefit-icon">
                  💳
                </div>

                <div>
                  <h3>
                    Easy Payments
                  </h3>

                  <p>
                    Multiple payment options
                  </p>
                </div>

              </div>


              <div className="offer-benefit">

                <div className="benefit-icon">
                  ↩️
                </div>

                <div>
                  <h3>
                    Easy Returns
                  </h3>

                  <p>
                    Simple return experience
                  </p>
                </div>

              </div>


              <div className="offer-benefit">

                <div className="benefit-icon">
                  🛡️
                </div>

                <div>
                  <h3>
                    Secure Shopping
                  </h3>

                  <p>
                    Safe & trusted checkout
                  </p>
                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              BOTTOM CTA
          ================================================= */}

          <section className="offers-bottom-cta">

            <div className="cta-icon">
              👟
            </div>

            <div>
              <span>
                READY TO SHOP?
              </span>

              <h2>
                Find Your Perfect Pair
              </h2>

              <p>
                Explore our collection and grab
                today's best deals.
              </p>
            </div>

            <Link
              to="/products"
              className="cta-shop-btn"
            >
              Explore Collection →
            </Link>

          </section>

        </div>
      </main>
    </>
  );
};

export default Offers;