import React, { useEffect, useMemo, useState } from "react";



import { Link, useSearchParams } from "react-router-dom";



import UserNavbar from "../../components/common/UserNavbar";



import "./Products.css";







const API_URL = "https://ecommerce-dmv8.vercel.app/api/products";



const categories = ["All", "Footwear", "Sneakers", "Running", "Formal", "Boots", "Casual", "Kids"];



const parseSizes = (value) => {

  if (Array.isArray(value)) return value.map(Number).filter(Boolean);

  if (!value) return [];

  return String(value).split(",").map((x) => Number(x.trim())).filter(Boolean);

};



const getBadge = (product) => {

  const discount = Number(product.discount || 0);

  if (product.new_arrival) return "NEW";

  if (product.featured) return "FEATURED";

  if (discount > 0) return `${Math.round(discount)}% OFF`;

  if (Number(product.rating || 0) >= 4.8) return "TOP RATED";

  return "";

};



const normalizeProduct = (product) => {

  const price = Number(product.price || 0);

  const oldPrice = Number(product.old_price || 0);

  const discount = Number(product.discount || (oldPrice > price ? ((oldPrice - price) / oldPrice) * 100 : 0));

  return { ...product, price, oldPrice, discount, rating: Number(product.rating || 0), reviews: Number(product.sold || 0), sizes: parseSizes(product.sizes), image: product.image || "", description: product.description || "Premium footwear designed for everyday comfort.", badge: getBadge(product), stock: Number(product.stock || 0), featured: Boolean(product.featured), newArrival: Boolean(product.new_arrival) };

};



const genders = ["All", "Men", "Women", "Kids"];







const sizeOptions = [5, 6, 7, 8, 9, 10, 11];







function Products() {



  const [searchParams, setSearchParams] =



    useSearchParams();







  const [search, setSearch] = useState(



    searchParams.get("search") || ""



  );







  const [category, setCategory] = useState(



    searchParams.get("category") || "All"



  );







  const [gender, setGender] = useState("All");







  const [selectedSizes, setSelectedSizes] =



    useState([]);







  const [maxPrice, setMaxPrice] =



    useState(5000);







  const [minRating, setMinRating] =



    useState(0);







  const [sortBy, setSortBy] =



    useState("featured");

  const [products, setProducts] = useState([]);







  const [wishlist, setWishlist] =



    useState([]);







  const [mobileFilters, setMobileFilters] =



    useState(false);







  const [loading, setLoading] = useState(true);

  const [apiError, setApiError] = useState("");



  /* LOAD PRODUCTS FROM POSTGRESQL */

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        setLoading(true);

        setApiError("");

        const response = await fetch(API_URL);

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) throw new Error(`Backend returned non-JSON response (${response.status})`);

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to load products");

        setProducts(Array.isArray(data) ? data.map(normalizeProduct) : []);

      } catch (error) {

        console.error("PRODUCT API ERROR:", error);

        setProducts([]);

        setApiError("Products load nahi ho pa rahe. Backend aur PostgreSQL connection check karein.");

      } finally {

        setLoading(false);

      }

    };

    fetchProducts();

  }, []);



  /* LOAD WISHLIST */



  useEffect(() => {



    try {



      const savedWishlist = JSON.parse(



        localStorage.getItem("wishlist") || "[]"



      );







      setWishlist(savedWishlist);



    } catch {



      setWishlist([]);



    }



  }, []);







  /* URL SEARCH / CATEGORY SYNC */



  useEffect(() => {



    const querySearch =



      searchParams.get("search") || "";







    const queryCategory =



      searchParams.get("category") || "All";







    setSearch(querySearch);



    setCategory(queryCategory);



  }, [searchParams]);







  /* CATEGORY */



  const updateCategory = (value) => {



    setCategory(value);







    const params = new URLSearchParams(



      searchParams



    );







    if (value === "All") {



      params.delete("category");



    } else {



      params.set("category", value);



    }







    setSearchParams(params);



  };







  /* SEARCH */



  const handleSearch = (e) => {



    const value = e.target.value;







    setSearch(value);







    const params = new URLSearchParams(



      searchParams



    );







    if (value.trim()) {



      params.set("search", value);



    } else {



      params.delete("search");



    }







    setSearchParams(params);



  };







  /* SIZE */



  const toggleSize = (size) => {



    setSelectedSizes((prev) =>



      prev.includes(size)



        ? prev.filter(



            (item) => item !== size



          )



        : [...prev, size]



    );



  };







  /* WISHLIST */



  const toggleWishlist = (product) => {



    const exists = wishlist.some(



      (item) => item.id === product.id



    );







    let updatedWishlist;







    if (exists) {



      updatedWishlist = wishlist.filter(



        (item) => item.id !== product.id



      );



    } else {



      updatedWishlist = [



        ...wishlist,



        product,



      ];



    }







    setWishlist(updatedWishlist);







    localStorage.setItem(



      "wishlist",



      JSON.stringify(updatedWishlist)



    );







    window.dispatchEvent(



      new Event("wishlistUpdated")



    );



  };







  /* ADD TO CART */



  const addToCart = (product) => {



    try {

      if (Number(product.stock) <= 0) {

        alert("This product is currently out of stock.");

        return;

      }



      const cart = JSON.parse(



        localStorage.getItem("cart") || "[]"



      );







      const existingItem = cart.find(



        (item) => item.id === product.id



      );







      let updatedCart;







      if (existingItem) {



        updatedCart = cart.map((item) =>



          item.id === product.id



            ? {



                ...item,



                quantity:



                  (item.quantity || 1) + 1,



              }



            : item



        );



      } else {



        updatedCart = [



          ...cart,



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







      window.dispatchEvent(



        new Event("cartUpdated")



      );







      alert(



        `${product.name} added to cart.`



      );



    } catch (error) {



      console.error(



        "Cart error:",



        error



      );



    }



  };







  /* CLEAR FILTERS */



  const clearFilters = () => {



    setCategory("All");



    setGender("All");



    setSelectedSizes([]);



    setMaxPrice(5000);



    setMinRating(0);



    setSearch("");



    setSortBy("featured");







    setSearchParams({});



  };







  /* FILTER PRODUCTS */



  const filteredProducts = useMemo(() => {



    let result = [...products];







    const searchText =



      search.trim().toLowerCase();







    if (searchText) {



      result = result.filter((product) =>



        `${product.name} ${product.category} ${product.gender}`



          .toLowerCase()



          .includes(searchText)



      );



    }







    if (category !== "All") {



      result = result.filter(



        (product) =>



          product.category === category



      );



    }







    if (gender !== "All") {



      result = result.filter(



        (product) =>



          product.gender === gender



      );



    }







    if (selectedSizes.length > 0) {



      result = result.filter((product) =>



        selectedSizes.some((size) =>



          product.sizes.includes(size)



        )



      );



    }







    result = result.filter(



      (product) =>



        product.price <= maxPrice



    );







    result = result.filter(



      (product) =>



        product.rating >= minRating



    );







    if (sortBy === "price-low") {



      result.sort(



        (a, b) => a.price - b.price



      );



    }







    if (sortBy === "price-high") {



      result.sort(



        (a, b) => b.price - a.price



      );



    }







    if (sortBy === "rating") {



      result.sort(



        (a, b) => b.rating - a.rating



      );



    }







    if (sortBy === "newest") {



      result.sort(



        (a, b) => b.id - a.id



      );



    }







    return result;



  }, [



    search,



    category,



    gender,



    selectedSizes,



    maxPrice,



    minRating,



    sortBy,



  ]);







  return (



    <div className="products-page">



      <UserNavbar />







      {/* PAGE HERO */}



      <section className="products-hero">



        <div className="products-container">



          <div>



            <span>



              SHOEMAKER COLLECTION



            </span>







            <h1>



              Find Your



              <br />



              Perfect Pair.



            </h1>







            <p>



              Explore premium sneakers,



              running shoes, formal footwear,



              boots and more.



            </p>



          </div>







          <div className="products-hero-shoe">



            <img



              src={products[0]?.image || ""}



              alt="Featured shoe"



            />



          </div>



        </div>



      </section>







      {/* CONTENT */}



      <main className="products-container products-main">

        {apiError && (

          <div style={{ marginBottom: 20, padding: "14px 18px", borderRadius: 12, background: "#fff5f5", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13 }}>

            {apiError}

          </div>

        )}



        <div className="products-topbar">



          <div>



            <span className="products-count-label">



              OUR COLLECTION



            </span>







            <h2>



              {category === "All"



                ? "All Footwear"



                : category}



            </h2>







            <p>



              {filteredProducts.length} products found



            </p>



          </div>







          <button



            className="mobile-filter-button"



            onClick={() =>



              setMobileFilters(



                !mobileFilters



              )



            }



          >



            ☰ Filters



          </button>







          <div className="sort-wrapper">



            <label>Sort by</label>







            <select



              value={sortBy}



              onChange={(e) =>



                setSortBy(e.target.value)



              }



            >



              <option value="featured">



                Featured



              </option>







              <option value="newest">



                Newest



              </option>







              <option value="price-low">



                Price: Low to High



              </option>







              <option value="price-high">



                Price: High to Low



              </option>







              <option value="rating">



                Customer Rating



              </option>



            </select>



          </div>



        </div>







        <div className="products-layout">







          {/* FILTER SIDEBAR */}



          <aside



            className={`products-sidebar ${



              mobileFilters



                ? "mobile-open"



                : ""



            }`}



          >



            <div className="filter-header">



              <h3>Filters</h3>







              <button



                onClick={clearFilters}



              >



                Clear All



              </button>



            </div>







            {/* SEARCH */}



            <div className="filter-group">



              <label>Search</label>







              <div className="filter-search">



                <span>⌕</span>







                <input



                  type="text"



                  placeholder="Search shoes..."



                  value={search}



                  onChange={handleSearch}



                />



              </div>



            </div>







            {/* CATEGORY */}



            <div className="filter-group">



              <label>Category</label>







              <div className="filter-options">



                {categories.map(



                  (item) => (



                    <button



                      key={item}



                      className={



                        category === item



                          ? "filter-option active"



                          : "filter-option"



                      }



                      onClick={() =>



                        updateCategory(



                          item



                        )



                      }



                    >



                      <span>



                        {item}



                      </span>







                      {category ===



                        item && (



                        <b>✓</b>



                      )}



                    </button>



                  )



                )}



              </div>



            </div>







            {/* GENDER */}



            <div className="filter-group">



              <label>Shop For</label>







              <div className="gender-buttons">



                {genders.map(



                  (item) => (



                    <button



                      key={item}



                      className={



                        gender === item



                          ? "gender-button active"



                          : "gender-button"



                      }



                      onClick={() =>



                        setGender(item)



                      }



                    >



                      {item}



                    </button>



                  )



                )}



              </div>



            </div>







            {/* SIZE */}



            <div className="filter-group">



              <label>Size</label>







              <div className="size-options">



                {sizeOptions.map(



                  (size) => (



                    <button



                      key={size}



                      className={



                        selectedSizes.includes(



                          size



                        )



                          ? "size-button active"



                          : "size-button"



                      }



                      onClick={() =>



                        toggleSize(size)



                      }



                    >



                      {size}



                    </button>



                  )



                )}



              </div>



            </div>







            {/* PRICE */}



            <div className="filter-group">



              <div className="filter-label-row">



                <label>



                  Maximum Price



                </label>







                <strong>



                  ₹



                  {maxPrice.toLocaleString(



                    "en-IN"



                  )}



                </strong>



              </div>







              <input



                className="price-range"



                type="range"



                min="500"



                max="5000"



                step="100"



                value={maxPrice}



                onChange={(e) =>



                  setMaxPrice(



                    Number(



                      e.target.value



                    )



                  )



                }



              />







              <div className="price-range-labels">



                <span>₹500</span>



                <span>₹5,000+</span>



              </div>



            </div>







            {/* RATING */}



            <div className="filter-group">



              <label>



                Minimum Rating



              </label>







              <div className="rating-options">



                {[4.5, 4, 3.5, 3].map(



                  (rating) => (



                    <button



                      key={rating}



                      className={



                        minRating ===



                        rating



                          ? "rating-option active"



                          : "rating-option"



                      }



                      onClick={() =>



                        setMinRating(



                          minRating ===



                            rating



                            ? 0



                            : rating



                        )



                      }



                    >



                      <span>★</span>



                      {rating} & above



                    </button>



                  )



                )}



              </div>



            </div>







            <button



              className="mobile-apply-button"



              onClick={() =>



                setMobileFilters(false)



              }



            >



              Apply Filters



            </button>



          </aside>







          {/* PRODUCT AREA */}



          <section className="products-result">



            {loading ? (

              <div className="no-products">

                <div>⌛</div>

                <h3>Loading our collection...</h3>

                <p>Please wait while we fetch the latest products.</p>

              </div>

            ) : filteredProducts.length === 0 ? (



              <div className="no-products">



                <div>👟</div>







                <h3>



                  No shoes found



                </h3>







                <p>



                  Try changing your



                  filters or search for



                  another product.



                </p>







                <button



                  onClick={



                    clearFilters



                  }



                >



                  Clear Filters



                </button>



              </div>



            ) : (



              <div className="products-grid">



                {filteredProducts.map(



                  (product) => {



                    const isWishlisted =



                      wishlist.some(



                        (item) =>



                          item.id ===



                          product.id



                      );







                    return (



                      <article



                        className="product-card"



                        key={product.id}



                      >



                        {/* PRODUCT IMAGE */}



                        <Link



                          to={`/products/${product.id}`}



                          className="product-card-image"



                        >



                          <span className="product-badge">



                            {product.badge}



                          </span>







                          <span



                            className="wishlist-button"



                            onClick={(e) => {



                              e.preventDefault();



                              e.stopPropagation();







                              toggleWishlist(



                                product



                              );



                            }}



                            title="Wishlist"



                          >



                            {isWishlisted



                              ? "♥"



                              : "♡"}



                          </span>







                          <img



                            src={



                              product.image



                            }



                            alt={



                              product.name



                            }



                            className="product-shoe"



                          />







                          <span className="product-view">



                            Quick View →



                          </span>



                        </Link>







                        {/* PRODUCT INFO */}



                        <div className="product-card-body">



                          <div className="product-meta">



                            <span>



                              {



                                product.category



                              }



                            </span>







                            <span>



                              {



                                product.gender



                              }



                            </span>



                          </div>







                          <div className="product-rating-row">



                            <span className="rating-stars">



                              ★



                            </span>







                            <strong>



                              {



                                product.rating



                              }



                            </strong>







                            <span>



                              (



                              {



                                product.reviews



                              }



                              )



                            </span>



                          </div>







                          <Link



                            to={`/products/${product.id}`}



                            className="product-name"



                          >



                            {



                              product.name



                            }



                          </Link>







                          <p className="product-description">



                            {



                              product.description



                            }



                          </p>







                          <div className="product-card-price">



                            <strong>



                              ₹



                              {product.price.toLocaleString(



                                "en-IN"



                              )}



                            </strong>







                            <del>



                              ₹



                              {product.oldPrice.toLocaleString(



                                "en-IN"



                              )}



                            </del>







                            <span>



                              {Math.round(



                                ((product.oldPrice -



                                  product.price) /



                                  product.oldPrice) *



                                  100



                              )}



                              % OFF



                            </span>



                          </div>







                          <div className="product-card-sizes">



                            <span>



                              Sizes



                            </span>







                            {product.sizes



                              .slice(



                                0,



                                5



                              )



                              .map(



                                (size) => (



                                  <small



                                    key={



                                      size



                                    }



                                  >



                                    {



                                      size



                                    }



                                  </small>



                                )



                              )}



                          </div>







                          <button

                            className="product-cart-button"

                            onClick={() => addToCart(product)}

                            disabled={Number(product.stock) <= 0}

                          >



                            {Number(product.stock) <= 0 ? "Out of Stock" : "Add to Cart"}



                            <span>



                              →



                            </span>



                          </button>



                        </div>



                      </article>



                    );



                  }



                )}



              </div>



            )}



          </section>



        </div>



      </main>



    </div>



  );



}







export default Products;