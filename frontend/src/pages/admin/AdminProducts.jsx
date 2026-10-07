import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AdminProducts.css";

const API_URL = "http://localhost:5000/api/products";

const emptyForm = {
  name: "",
  description: "",
  category: "Footwear",
  subCategory: "",
  brand: "ShoeMaker",
  gender: "Unisex",
  price: "",
  oldPrice: "",
  discount: "",
  stock: "",
  sku: "",
  sizes: "",
  color: "",
  material: "",
  soleMaterial: "",
  weight: "",
  image: "",
  status: "Active",
  featured: false,
  newArrival: false,
};

const categories = [
  "All",
  "Footwear",
  "Sneakers",
  "Running",
  "Formal",
  "Boots",
  "Casual",
  "Kids",
];

function AdminProducts() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [form, setForm] = useState(emptyForm);

  const [admin, setAdmin] = useState({
    name: "ShoeMaker Admin",
    email: "admin@shoemaker.com",
  });

  useEffect(() => {
    fetchProducts();

    try {
      const savedAdmin = JSON.parse(
        localStorage.getItem("admin") || "null"
      );

      if (savedAdmin) {
        setAdmin(savedAdmin);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("FETCH PRODUCTS ERROR:", error);

      alert(
        "Products load nahi ho paaye.\n\n" +
          "Backend check karo:\n" +
          "http://localhost:5000"
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  const isActive = (path) => {
    if (path === "/admin/products") {
      return location.pathname === path;
    }

    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    navigate("/login");
  };

  const openAddModal = () => {
    setEditingProduct(null);

    setForm({
      ...emptyForm,
      sku: `SM-${Date.now()}`,
    });

    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "Footwear",
      subCategory: product.sub_category || "",
      brand: product.brand || "ShoeMaker",
      gender: product.gender || "Unisex",
      price: product.price ?? "",
      oldPrice: product.old_price ?? "",
      discount: product.discount ?? "",
      stock: product.stock ?? "",
      sku: product.sku || "",
      sizes: product.sizes || "",
      color: product.color || "",
      material: product.material || "",
      soleMaterial: product.sole_material || "",
      weight: product.weight || "",
      image: product.image || "",
      status: product.status || "Active",
      featured: Boolean(product.featured),
      newArrival: Boolean(product.new_arrival),
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (loading) return;

    setShowModal(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((previous) => ({
        ...previous,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const calculateDiscount = () => {
    const price = Number(form.price);
    const oldPrice = Number(form.oldPrice);

    if (!price || !oldPrice || oldPrice <= price) {
      return 0;
    }

    return Math.round(
      ((oldPrice - price) / oldPrice) * 100
    );
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter product name.");
      return;
    }

    if (!form.category) {
      alert("Please select category.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      alert("Please enter a valid selling price.");
      return;
    }

    if (form.oldPrice === "") {
      alert("Please enter original/MRP price.");
      return;
    }

    if (Number(form.oldPrice) < Number(form.price)) {
      alert(
        "Original price cannot be lower than selling price."
      );
      return;
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      alert("Please enter valid stock.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      sub_category: form.subCategory.trim(),
      brand: form.brand.trim() || "ShoeMaker",
      gender: form.gender,
      price: Number(form.price),
      old_price: Number(form.oldPrice),

      discount:
        form.discount !== ""
          ? Number(form.discount)
          : calculateDiscount(),

      stock: Number(form.stock),

      sku:
        form.sku.trim() ||
        `SM-${Date.now()}`,

      sizes: form.sizes.trim(),
      color: form.color.trim(),
      material: form.material.trim(),
      sole_material: form.soleMaterial.trim(),
      weight: form.weight.trim(),

      image: form.image,

      status: form.status,
      featured: Boolean(form.featured),
      new_arrival: Boolean(form.newArrival),
    };

    try {
      setLoading(true);

      const url = editingProduct
        ? `${API_URL}/${editingProduct.id}`
        : API_URL;

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save product"
        );
      }

      await fetchProducts();

      alert(
        editingProduct
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      closeModal();
    } catch (error) {
      console.error("SAVE PRODUCT ERROR:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const product = products.find(
      (item) => item.id === id
    );

    if (!product) return;

    const confirmDelete = window.confirm(
      `Delete "${product.name}"?`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete product"
        );
      }

      await fetchProducts();

      alert("Product deleted successfully!");
    } catch (error) {
      console.error("DELETE PRODUCT ERROR:", error);
      alert(error.message);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !searchText ||
        (product.name || "")
          .toLowerCase()
          .includes(searchText) ||
        (product.category || "")
          .toLowerCase()
          .includes(searchText) ||
        (product.brand || "")
          .toLowerCase()
          .includes(searchText) ||
        (product.sku || "")
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All" ||
        product.category === category;

      const stock = Number(product.stock || 0);

      let matchesStock = true;

      if (stockFilter === "In Stock") {
        matchesStock = stock > 10;
      }

      if (stockFilter === "Low Stock") {
        matchesStock =
          stock > 0 && stock <= 10;
      }

      if (stockFilter === "Out of Stock") {
        matchesStock = stock === 0;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock
      );
    });
  }, [products, search, category, stockFilter]);

  const formatCurrency = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  const getDiscount = (price, oldPrice) => {
    if (
      !oldPrice ||
      Number(oldPrice) <= Number(price)
    ) {
      return 0;
    }

    return Math.round(
      ((Number(oldPrice) - Number(price)) /
        Number(oldPrice)) *
        100
    );
  };

  const getStockClass = (stock) => {
    if (Number(stock) === 0) {
      return "stock-out";
    }

    if (Number(stock) <= 10) {
      return "stock-low";
    }

    return "stock-good";
  };

  const getStockText = (stock) => {
    if (Number(stock) === 0) {
      return "Out of Stock";
    }

    if (Number(stock) <= 10) {
      return "Low Stock";
    }

    return "In Stock";
  };

  const menuItems = [
    ["/admin/dashboard", "⌂", "Dashboard"],
    ["/admin/products", "▣", "Products"],
    ["/admin/categories", "◫", "Categories"],
    ["/admin/orders", "🛒", "Orders"],
    ["/admin/customers", "♙", "Customers"],
    ["/admin/inventory", "▥", "Inventory"],
    ["/admin/coupons", "◇", "Coupons"],
    ["/admin/reviews", "★", "Reviews"],
    ["/admin/settings", "⚙", "Settings"],
  ];

  return (
    <div className="admin-layout premium-admin">

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        <div className="admin-sidebar-logo">

          <div className="admin-logo-icon">
            S
          </div>

          <div>
            <strong>
              SHOE<span>MAKER</span>
            </strong>

            <small>
              ADMIN CONSOLE
            </small>
          </div>

        </div>

        <div className="sidebar-section-title">
          STORE MANAGEMENT
        </div>

        <nav className="admin-sidebar-nav">

          {menuItems.map(
            ([path, icon, label]) => (
              <Link
                key={path}
                to={path}
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={`admin-nav-link ${
                  isActive(path)
                    ? "active"
                    : ""
                }`}
              >

                <span className="admin-nav-icon">
                  {icon}
                </span>

                <span>
                  {label}
                </span>

                {label === "Products" && (
                  <em>
                    {products.length}
                  </em>
                )}

              </Link>
            )
          )}

        </nav>

        <div className="admin-sidebar-bottom">

          <Link
            to="/"
            className="admin-store-link"
          >
            ↗
            <span>
              View Store
            </span>
          </Link>

          <button
            className="admin-sidebar-logout"
            onClick={handleLogout}
          >
            ⇥
            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      <div className="admin-main">

        <header className="admin-topbar">

          <button
            className="admin-mobile-menu"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            ☰
          </button>

          <div className="admin-breadcrumb">

            <span>
              Admin
            </span>

            <b>/</b>

            <strong>
              Products
            </strong>

          </div>

          <div className="admin-topbar-right">

            <button className="admin-notification-btn">
              ♢
              <i>3</i>
            </button>

            <div className="admin-topbar-user">

              <div className="admin-topbar-avatar">
                {admin.name
                  ?.charAt(0)
                  .toUpperCase() || "A"}
              </div>

              <div>
                <strong>
                  {admin.name}
                </strong>

                <small>
                  Administrator
                </small>
              </div>

            </div>

          </div>

        </header>

        <main className="admin-products-content">

          <section className="products-page-header premium-header">

            <div>

              <div className="eyebrow">
                CATALOG • STORE MANAGEMENT
              </div>

              <h1>
                Products{" "}
                <span>
                  ({products.length})
                </span>
              </h1>

              <p>
                Manage your footwear catalog,
                pricing, inventory and visibility.
              </p>

            </div>

            <button
              className="add-product-btn"
              onClick={openAddModal}
            >
              ＋ Add New Product
            </button>

          </section>

          <section className="product-summary-grid">

            <div className="product-summary-card">

              <div className="summary-icon purple">
                ▣
              </div>

              <div>
                <span>Total Products</span>

                <strong>
                  {products.length}
                </strong>

                <small>
                  Catalog items
                </small>
              </div>

            </div>

            <div className="product-summary-card">

              <div className="summary-icon green">
                ✓
              </div>

              <div>
                <span>In Stock</span>

                <strong>
                  {
                    products.filter(
                      (p) =>
                        Number(p.stock) > 10
                    ).length
                  }
                </strong>

                <small>
                  Healthy inventory
                </small>
              </div>

            </div>

            <div className="product-summary-card">

              <div className="summary-icon orange">
                !
              </div>

              <div>
                <span>Low Stock</span>

                <strong>
                  {
                    products.filter(
                      (p) =>
                        Number(p.stock) > 0 &&
                        Number(p.stock) <= 10
                    ).length
                  }
                </strong>

                <small>
                  Needs attention
                </small>
              </div>

            </div>

            <div className="product-summary-card">

              <div className="summary-icon red">
                ×
              </div>

              <div>
                <span>Out of Stock</span>

                <strong>
                  {
                    products.filter(
                      (p) =>
                        Number(p.stock) === 0
                    ).length
                  }
                </strong>

                <small>
                  Unavailable now
                </small>
              </div>

            </div>

          </section>

          <section className="products-panel">

            <div className="products-filter-bar">

              <div className="product-search">

                <span>
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search name, brand or SKU..."
                />

              </div>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              >
                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>

              <select
                value={stockFilter}
                onChange={(e) =>
                  setStockFilter(
                    e.target.value
                  )
                }
              >
                <option value="All">
                  All Stock
                </option>

                <option value="In Stock">
                  In Stock
                </option>

                <option value="Low Stock">
                  Low Stock
                </option>

                <option value="Out of Stock">
                  Out of Stock
                </option>
              </select>

            </div>

            <div className="table-heading">

              <div>

                <h2>
                  Product Catalog
                </h2>

                <p>
                  Showing{" "}
                  {filteredProducts.length}
                  {" "}of{" "}
                  {products.length}
                  {" "}products
                </p>

              </div>

              <span className="live-dot">
                ● LIVE DATABASE
              </span>

            </div>

            <div className="products-table-wrapper">

              <table className="products-table">

                <thead>

                  <tr>

                    <th>
                      PRODUCT
                    </th>

                    <th>
                      CATEGORY
                    </th>

                    <th>
                      PRICE
                    </th>

                    <th>
                      STOCK
                    </th>

                    <th>
                      RATING
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      ACTION
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loadingProducts ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="no-products"
                      >

                        <div>
                          <span>
                            ◌
                          </span>

                          <strong>
                            Loading products...
                          </strong>
                        </div>

                      </td>

                    </tr>

                  ) : filteredProducts.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="no-products"
                      >

                        <div>

                          <span>
                            👟
                          </span>

                          <strong>
                            No products found
                          </strong>

                          <p>
                            Try changing your
                            search or filters.
                          </p>

                        </div>

                      </td>

                    </tr>

                  ) : (

                    filteredProducts.map(
                      (product) => {

                        const discount =
                          getDiscount(
                            product.price,
                            product.old_price
                          );

                        return (
                          <tr
                            key={product.id}
                          >

                            <td>

                              <div className="product-name-cell">

                                <div className="product-table-image">

                                  {product.image ? (

                                    <img
                                      src={
                                        product.image
                                      }
                                      alt={
                                        product.name
                                      }
                                      onError={(e) => {
                                        e.currentTarget.style.display =
                                          "none";
                                      }}
                                    />

                                  ) : (

                                    <span>
                                      👟
                                    </span>

                                  )}

                                </div>

                                <div>

                                  <strong>
                                    {
                                      product.name
                                    }
                                  </strong>

                                  <small>
                                    SKU:{" "}
                                    {
                                      product.sku ||
                                      "—"
                                    }
                                  </small>

                                  {product.new_arrival && (
                                    <b className="mini-badge new">
                                      NEW
                                    </b>
                                  )}

                                  {product.featured && (
                                    <b className="mini-badge">
                                      FEATURED
                                    </b>
                                  )}

                                </div>

                              </div>

                            </td>

                            <td>
                              <span className="category-badge">
                                {
                                  product.category
                                }
                              </span>
                            </td>

                            <td>

                              <div className="price-cell">

                                <strong>
                                  {formatCurrency(
                                    product.price
                                  )}
                                </strong>

                                {Number(
                                  product.old_price
                                ) >
                                  Number(
                                    product.price
                                  ) && (
                                  <del>
                                    {formatCurrency(
                                      product.old_price
                                    )}
                                  </del>
                                )}

                                {discount > 0 && (
                                  <small>
                                    {discount}% OFF
                                  </small>
                                )}

                              </div>

                            </td>

                            <td>

                              <div className="stock-cell">

                                <strong>
                                  {
                                    product.stock
                                  }
                                </strong>

                                <span
                                  className={getStockClass(
                                    product.stock
                                  )}
                                >
                                  {getStockText(
                                    product.stock
                                  )}
                                </span>

                              </div>

                            </td>

                            <td>

                              <div className="rating-cell">

                                <span>
                                  ★
                                </span>

                                <strong>
                                  {
                                    product.rating ||
                                    "—"
                                  }
                                </strong>

                                <small>
                                  {product.sold
                                    ? `(${product.sold})`
                                    : ""}
                                </small>

                              </div>

                            </td>

                            <td>

                              <span
                                className={`status-badge ${
                                  String(
                                    product.status
                                  )
                                    .toLowerCase()
                                    .replace(
                                      /\s/g,
                                      "-"
                                    )
                                }`}
                              >
                                <i />

                                {product.status ||
                                  "Active"}
                              </span>

                            </td>

                            <td>

                              <div className="product-actions">

                                <button
                                  type="button"
                                  title="Edit"
                                  onClick={() =>
                                    openEditModal(
                                      product
                                    )
                                  }
                                >
                                  ✎
                                </button>

                                <button
                                  type="button"
                                  title="Delete"
                                  className="delete"
                                  onClick={() =>
                                    handleDelete(
                                      product.id
                                    )
                                  }
                                >
                                  ⌫
                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )

                  )}

                </tbody>

              </table>

            </div>

          </section>

        </main>

      </div>

      {showModal && (

        <div
          className="product-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="product-modal premium-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="product-modal-header">

              <div>

                <span>
                  {editingProduct
                    ? "PRODUCT MANAGEMENT"
                    : "NEW PRODUCT"}
                </span>

                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p>
                  Enter the details below to
                  update your catalog.
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              className="product-form"
              onSubmit={handleSaveProduct}
            >

              <div className="form-section-title">
                <span>01</span>
                Basic Information
              </div>

              <div className="product-form-group full">

                <label>
                  Product Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Urban Street Sneakers"
                />

              </div>

              <div className="product-form-group full">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Write a clear product description..."
                />

              </div>

              <div className="product-form-row">

                <div className="product-form-group">

                  <label>
                    Category *
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                  >
                    {categories
                      .filter(
                        (item) =>
                          item !== "All"
                      )
                      .map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}
                  </select>

                </div>

                <div className="product-form-group">

                  <label>
                    Sub Category
                  </label>

                  <input
                    name="subCategory"
                    value={form.subCategory}
                    onChange={handleFormChange}
                    placeholder="e.g. Lifestyle"
                  />

                </div>

              </div>

              <div className="product-form-row">

                <div className="product-form-group">

                  <label>
                    Brand
                  </label>

                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleFormChange}
                    placeholder="ShoeMaker"
                  />

                </div>

                <div className="product-form-group">

                  <label>
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleFormChange}
                  >
                    <option>
                      Unisex
                    </option>

                    <option>
                      Men
                    </option>

                    <option>
                      Women
                    </option>

                    <option>
                      Kids
                    </option>

                  </select>

                </div>

              </div>

              <div className="form-section-title">
                <span>02</span>
                Pricing & Inventory
              </div>

              <div className="product-form-row three">

                <div className="product-form-group">

                  <label>
                    Selling Price *
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="price"
                    value={form.price}
                    onChange={handleFormChange}
                    placeholder="1499"
                  />

                </div>

                <div className="product-form-group">

                  <label>
                    Original / MRP *
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="oldPrice"
                    value={form.oldPrice}
                    onChange={handleFormChange}
                    placeholder="2499"
                  />

                </div>

                <div className="product-form-group">

                  <label>
                    Stock *
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={form.stock}
                    onChange={handleFormChange}
                    placeholder="50"
                  />

                </div>

              </div>

              <div className="product-form-row">

                <div className="product-form-group">

                  <label>
                    Discount %
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="discount"
                    value={form.discount}
                    onChange={handleFormChange}
                    placeholder={
                      calculateDiscount()
                    }
                  />

                </div>

                <div className="product-form-group">

                  <label>
                    SKU
                  </label>

                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleFormChange}
                    placeholder="SM-SHOE-001"
                  />

                </div>

              </div>

              <div className="form-section-title">
                <span>03</span>
                Product Details
              </div>

              <div className="product-form-row">

                <div className="product-form-group">

                  <label>
                    Sizes
                  </label>

                  <input
                    name="sizes"
                    value={form.sizes}
                    onChange={handleFormChange}
                    placeholder="6, 7, 8, 9, 10"
                  />

                </div>

                <div className="product-form-group">

                  <label>
                    Color
                  </label>

                  <input
                    name="color"
                    value={form.color}
                    onChange={handleFormChange}
                    placeholder="Black / White"
                  />

                </div>

              </div>

              <div className="product-form-row">

                <div className="product-form-group">

                  <label>
                    Material
                  </label>

                  <input
                    name="material"
                    value={form.material}
                    onChange={handleFormChange}
                    placeholder="Mesh / Leather"
                  />

                </div>

                <div className="product-form-group">

                  <label>
                    Sole Material
                  </label>

                  <input
                    name="soleMaterial"
                    value={form.soleMaterial}
                    onChange={handleFormChange}
                    placeholder="Rubber"
                  />

                </div>

              </div>

              <div className="product-form-row">

                <div className="product-form-group">

                  <label>
                    Weight
                  </label>

                  <input
                    name="weight"
                    value={form.weight}
                    onChange={handleFormChange}
                    placeholder="700g"
                  />

                </div>

                <div className="product-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    <option>
                      Active
                    </option>

                    <option>
                      Draft
                    </option>

                    <option>
                      Inactive
                    </option>

                    <option>
                      Out of Stock
                    </option>

                  </select>

                </div>

              </div>

              <div className="form-section-title">
                <span>04</span>
                Product Media
              </div>

              <div className="product-form-group full">

                <label>
                  Product Image
                </label>

                <div className="image-source-grid">

                  <div>

                    <span className="field-hint">
                      IMAGE URL
                    </span>

                    <input
                      type="url"
                      name="image"
                      value={
                        form.image.startsWith(
                          "data:"
                        )
                          ? ""
                          : form.image
                      }
                      onChange={handleFormChange}
                      placeholder="https://images.unsplash.com/..."
                    />

                  </div>

                  <div className="upload-divider">
                    OR
                  </div>

                  <label className="upload-box">

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={
                        handleImageUpload
                      }
                    />

                    <span>
                      ＋
                    </span>

                    <strong>
                      Upload Photo
                    </strong>

                    <small>
                      PNG, JPG, WEBP • Max 5MB
                    </small>

                  </label>

                </div>

                {form.image && (

                  <div className="premium-image-preview">

                    <img
                      src={form.image}
                      alt="Product Preview"
                    />

                    <div>

                      <strong>
                        Image preview
                      </strong>

                      <small>
                        Ready to save with
                        this product
                      </small>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          image: "",
                        }))
                      }
                    >
                      Remove
                    </button>

                  </div>

                )}

              </div>

              <div className="product-form-options">

                <label className="product-checkbox">

                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={handleFormChange}
                  />

                  <span>
                    <b>
                      Featured Product
                    </b>

                    <small>
                      Show in featured sections
                    </small>
                  </span>

                </label>

                <label className="product-checkbox">

                  <input
                    type="checkbox"
                    name="newArrival"
                    checked={form.newArrival}
                    onChange={handleFormChange}
                  />

                  <span>
                    <b>
                      New Arrival
                    </b>

                    <small>
                      Mark as recently added
                    </small>
                  </span>

                </label>

              </div>

              <div className="product-form-actions">

                <button
                  type="button"
                  className="cancel-product-btn"
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-product-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingProduct
                    ? "Save Changes →"
                    : "Add Product →"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminProducts;