import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import UserNavbar from "../../components/common/UserNavbar";

import "./Cart.css";



function Cart() {

  const [cart, setCart] = useState([]);

  const [coupon, setCoupon] = useState("");

  const [couponApplied, setCouponApplied] = useState(false);



  useEffect(() => {

    loadCart();

  }, []);



  const loadCart = () => {

    const savedCart = JSON.parse(

      localStorage.getItem("cart") || "[]"

    );



    setCart(savedCart);

  };



  const saveCart = (updatedCart) => {

    setCart(updatedCart);

    localStorage.setItem(

      "cart",

      JSON.stringify(updatedCart)

    );



    window.dispatchEvent(new Event("cartUpdated"));

  };



  const increaseQuantity = (id) => {

    const updatedCart = cart.map((item) =>

      item.id === id

        ? {

            ...item,

            quantity: (item.quantity || 1) + 1,

          }

        : item

    );



    saveCart(updatedCart);

  };



  const decreaseQuantity = (id) => {

    const updatedCart = cart

      .map((item) =>

        item.id === id

          ? {

              ...item,

              quantity: Math.max(

                1,

                (item.quantity || 1) - 1

              ),

            }

          : item

      );



    saveCart(updatedCart);

  };



  const removeItem = (id) => {

    const updatedCart = cart.filter(

      (item) => item.id !== id

    );



    saveCart(updatedCart);

  };



  const clearCart = () => {

    setCart([]);

    localStorage.removeItem("cart");



    window.dispatchEvent(new Event("cartUpdated"));

  };



  const subtotal = cart.reduce(

    (total, item) =>

      total +

      item.price * (item.quantity || 1),

    0

  );



  const deliveryCharge =

    subtotal === 0

      ? 0

      : subtotal >= 999

      ? 0

      : 49;



  const discount = couponApplied

    ? Math.round(subtotal * 0.2)

    : 0;



  const grandTotal =

    subtotal + deliveryCharge - discount;



  const applyCoupon = () => {

    if (coupon.trim().toUpperCase() === "WELCOME20") {

      setCouponApplied(true);

    } else {

      setCouponApplied(false);

      alert("Invalid coupon. Try WELCOME20");

    }

  };



  return (

    <>

      <UserNavbar />



      <main className="cart-page">



        {/* Header */}



        <section className="cart-header">



          <div>

            <span>SHOPPING CART</span>



            <h1>Your Cart</h1>



            <p>

              Review your items before checkout.

            </p>

          </div>



          <div className="cart-breadcrumb">

            <Link to="/">Home</Link>

            <span>/</span>

            <span>Cart</span>

          </div>



        </section>



        {cart.length === 0 ? (



          /* EMPTY CART */



          <section className="empty-cart">



            <div className="empty-cart-icon">

              🛒

            </div>



            <h2>Your Cart is Empty</h2>



            <p>

              Looks like you haven't added anything

              to your cart yet.

            </p>



            <Link

              to="/products"

              className="continue-shopping-btn"

            >

              Continue Shopping

            </Link>



          </section>



        ) : (



          /* CART */



          <section className="cart-container">



            <div className="cart-left">



              <div className="cart-topbar">



                <strong>

                  {cart.length}{" "}

                  {cart.length === 1

                    ? "Item"

                    : "Items"}

                </strong>



                <button

                  onClick={clearCart}

                  type="button"

                >

                  Clear Cart

                </button>



              </div>



              <div className="cart-items">



                {cart.map((item) => (



                  <article

                    className="cart-item"

                    key={item.id}

                  >



                    {/* Image */}



                    <Link

                      to={`/products/${item.id}`}

                      className="cart-item-image"

                    >

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name || "Product"}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.classList.add("image-fallback");
                          }}
                        />
                      ) : (
                        <span className="image-fallback-icon" aria-hidden="true">
                          👟
                        </span>
                      )}

                    </Link>



                    {/* Info */}



                    <div className="cart-item-info">



                      <span className="cart-item-category">

                        {item.category}

                      </span>



                      <Link

                        to={`/products/${item.id}`}

                        className="cart-item-title"

                      >

                        {item.name}

                      </Link>



                      <div className="cart-item-rating">

                        <span>★★★★★</span>

                        <small>

                          {item.rating}

                        </small>

                      </div>



                      <div className="cart-item-price">

                        <strong>

                          ₹

                          {item.price.toLocaleString()}

                        </strong>



                        {item.oldPrice && (

                          <del>

                            ₹

                            {item.oldPrice.toLocaleString()}

                          </del>

                        )}

                      </div>



                    </div>



                    {/* Quantity */}



                    <div className="cart-quantity">



                      <span>Quantity</span>



                      <div className="quantity-box">



                        <button

                          onClick={() =>

                            decreaseQuantity(item.id)

                          }

                          type="button"

                        >

                          −

                        </button>



                        <strong>

                          {item.quantity || 1}

                        </strong>



                        <button

                          onClick={() =>

                            increaseQuantity(item.id)

                          }

                          type="button"

                        >

                          +

                        </button>



                      </div>



                    </div>



                    {/* Total */}



                    <div className="cart-item-total">



                      <span>Total</span>



                      <strong>

                        ₹

                        {(

                          item.price *

                          (item.quantity || 1)

                        ).toLocaleString()}

                      </strong>



                    </div>



                    {/* Remove */}



                    <button

                      className="remove-item-btn"

                      onClick={() =>

                        removeItem(item.id)

                      }

                      title="Remove"

                      type="button"

                    >

                      ×

                    </button>



                  </article>



                ))}



              </div>



              <Link

                to="/products"

                className="back-shopping"

              >

                ← Continue Shopping

              </Link>



            </div>



            {/* SUMMARY */}



            <aside className="cart-summary">



              <h2>Order Summary</h2>



              <div className="summary-row">

                <span>

                  Subtotal

                </span>



                <strong>

                  ₹{subtotal.toLocaleString()}

                </strong>

              </div>



              <div className="summary-row">

                <span>

                  Delivery

                </span>



                <strong>

                  {deliveryCharge === 0

                    ? "FREE"

                    : `₹${deliveryCharge}`}

                </strong>

              </div>



              {couponApplied && (

                <div className="summary-row discount-row">

                  <span>

                    Coupon Discount

                  </span>



                  <strong>

                    -₹{discount.toLocaleString()}

                  </strong>

                </div>

              )}



              <div className="summary-divider" />



              <div className="coupon-section">



                <label>

                  Have a coupon?

                </label>



                <div className="coupon-input">



                  <input

                    type="text"

                    placeholder="Enter coupon code"

                    value={coupon}

                    onChange={(e) =>

                      setCoupon(e.target.value)

                    }

                  />



                  <button

                    onClick={applyCoupon}

                    type="button"

                  >

                    Apply

                  </button>



                </div>



                <small>

                  Try: <strong>WELCOME20</strong>

                </small>



              </div>



              <div className="summary-divider" />



              <div className="grand-total">



                <span>

                  Grand Total

                </span>



                <strong>

                  ₹{grandTotal.toLocaleString()}

                </strong>



              </div>



              <Link

                to="/checkout"

                className="checkout-btn"

              >

                Proceed to Checkout

                <span>→</span>

              </Link>



              <div className="secure-checkout">

                🔒 Secure & Safe Checkout

              </div>



            </aside>



          </section>



        )}



      </main>

    </>

  );

}



export default Cart;