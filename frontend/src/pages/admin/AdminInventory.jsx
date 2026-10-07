import React, { useMemo, useState } from "react";
import "./AdminInventory.css";

const initialInventory = [
  {
    id: 1,
    name: "Wireless Headphones",
    sku: "WH-001",
    category: "Electronics",
    price: 1499,
    stock: 45,
    threshold: 10,
    status: "In Stock",
  },
  {
    id: 2,
    name: "Smart Watch",
    sku: "SW-002",
    category: "Electronics",
    price: 2499,
    stock: 8,
    threshold: 10,
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Running Shoes",
    sku: "RS-003",
    category: "Fashion",
    price: 1999,
    stock: 0,
    threshold: 5,
    status: "Out of Stock",
  },
  {
    id: 4,
    name: "Cotton T-Shirt",
    sku: "TS-004",
    category: "Fashion",
    price: 699,
    stock: 32,
    threshold: 10,
    status: "In Stock",
  },
  {
    id: 5,
    name: "Laptop Backpack",
    sku: "LB-005",
    category: "Accessories",
    price: 1199,
    stock: 6,
    threshold: 10,
    status: "Low Stock",
  },
  {
    id: 6,
    name: "Bluetooth Speaker",
    sku: "BS-006",
    category: "Electronics",
    price: 899,
    stock: 27,
    threshold: 10,
    status: "In Stock",
  },
];

function AdminInventory() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("adminInventory");

    if (saved) {
      return JSON.parse(saved);
    }

    localStorage.setItem(
      "adminInventory",
      JSON.stringify(initialInventory)
    );

    return initialInventory;
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockAmount, setStockAmount] = useState("");

  const getStatus = (stock, threshold) => {
    if (stock === 0) {
      return "Out of Stock";
    }

    if (stock <= threshold) {
      return "Low Stock";
    }

    return "In Stock";
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter((product) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        product.sku.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        product.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventory, search, statusFilter]);

  const totalProducts = inventory.length;

  const inStock = inventory.filter(
    (product) => product.status === "In Stock"
  ).length;

  const lowStock = inventory.filter(
    (product) => product.status === "Low Stock"
  ).length;

  const outOfStock = inventory.filter(
    (product) => product.status === "Out of Stock"
  ).length;

  const totalUnits = inventory.reduce(
    (sum, product) => sum + product.stock,
    0
  );

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const saveInventory = (updatedInventory) => {
    setInventory(updatedInventory);
    localStorage.setItem(
      "adminInventory",
      JSON.stringify(updatedInventory)
    );
  };

  const updateStock = () => {
    const amount = Number(stockAmount);

    if (!stockAmount || amount < 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    const updatedInventory = inventory.map((product) => {
      if (product.id !== selectedProduct.id) {
        return product;
      }

      const newStock = amount;

      return {
        ...product,
        stock: newStock,
        status: getStatus(newStock, product.threshold),
      };
    });

    saveInventory(updatedInventory);

    const updatedProduct = updatedInventory.find(
      (product) => product.id === selectedProduct.id
    );

    setSelectedProduct(updatedProduct);
    setStockAmount("");
  };

  const quickAddStock = (amount) => {
    const updatedInventory = inventory.map((product) => {
      if (product.id !== selectedProduct.id) {
        return product;
      }

      const newStock = product.stock + amount;

      return {
        ...product,
        stock: newStock,
        status: getStatus(newStock, product.threshold),
      };
    });

    saveInventory(updatedInventory);

    const updatedProduct = updatedInventory.find(
      (product) => product.id === selectedProduct.id
    );

    setSelectedProduct(updatedProduct);
  };

  return (
    <div className="inventory-page">

      {/* Header */}
      <div className="inventory-header">
        <div>
          <h1>Inventory</h1>
          <p>Monitor product stock and inventory levels.</p>
        </div>

        <button
          className="inventory-refresh-btn"
          onClick={() => window.location.reload()}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="inventory-stats">

        <div className="inventory-stat-card">
          <div className="inventory-stat-icon">
            📦
          </div>

          <div>
            <span>Total Products</span>
            <h2>{totalProducts}</h2>
          </div>
        </div>

        <div className="inventory-stat-card">
          <div className="inventory-stat-icon in-stock">
            ✓
          </div>

          <div>
            <span>In Stock</span>
            <h2>{inStock}</h2>
          </div>
        </div>

        <div className="inventory-stat-card">
          <div className="inventory-stat-icon low-stock">
            ⚠
          </div>

          <div>
            <span>Low Stock</span>
            <h2>{lowStock}</h2>
          </div>
        </div>

        <div className="inventory-stat-card">
          <div className="inventory-stat-icon out-stock">
            !
          </div>

          <div>
            <span>Out of Stock</span>
            <h2>{outOfStock}</h2>
          </div>
        </div>

        <div className="inventory-stat-card">
          <div className="inventory-stat-icon units">
            🔢
          </div>

          <div>
            <span>Total Units</span>
            <h2>{totalUnits}</h2>
          </div>
        </div>

      </div>

      {/* Toolbar */}
      <div className="inventory-toolbar">

        <div className="inventory-search">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search product, SKU or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Stock</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

      </div>

      {/* Inventory Table */}
      <div className="inventory-table-card">

        <div className="inventory-table-title">
          <div>
            <h3>Product Inventory</h3>
            <p>
              {filteredInventory.length} products found
            </p>
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="inventory-empty">
            <div>📦</div>
            <h3>No products found</h3>
            <p>Try changing your search or filter.</p>
          </div>
        ) : (
          <div className="inventory-table-wrapper">

            <table className="inventory-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredInventory.map((product) => {
                  const stockPercentage =
                    Math.min(
                      (product.stock /
                        Math.max(product.threshold * 5, 1)) *
                        100,
                      100
                    );

                  return (
                    <tr key={product.id}>

                      <td>
                        <strong>{product.name}</strong>
                      </td>

                      <td>
                        <span className="sku-text">
                          {product.sku}
                        </span>
                      </td>

                      <td>{product.category}</td>

                      <td>
                        <strong>
                          {formatCurrency(product.price)}
                        </strong>
                      </td>

                      <td>
                        <strong>{product.stock}</strong>
                      </td>

                      <td>
                        <div className="stock-level">
                          <div className="stock-bar">
                            <div
                              className={`stock-bar-fill ${product.status
                                .toLowerCase()
                                .replaceAll(" ", "-")}`}
                              style={{
                                width: `${stockPercentage}%`,
                              }}
                            />
                          </div>

                          <small>
                            {product.threshold} min
                          </small>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`inventory-status ${product.status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {product.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="manage-stock-btn"
                          onClick={() => {
                            setSelectedProduct(product);
                            setStockAmount(product.stock);
                          }}
                        >
                          Manage
                        </button>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Manage Stock Modal */}
      {selectedProduct && (
        <div
          className="inventory-modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="inventory-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="inventory-modal-header">

              <div>
                <h2>Manage Stock</h2>
                <p>{selectedProduct.name}</p>
              </div>

              <button
                className="inventory-close-btn"
                onClick={() => setSelectedProduct(null)}
              >
                ×
              </button>

            </div>

            <div className="inventory-product-info">

              <div className="inventory-product-icon">
                📦
              </div>

              <div>
                <strong>{selectedProduct.name}</strong>
                <span>{selectedProduct.sku}</span>
              </div>

            </div>

            <div className="current-stock">

              <span>Current Stock</span>

              <strong>
                {selectedProduct.stock} units
              </strong>

              <small>
                Status: {selectedProduct.status}
              </small>

            </div>

            <div className="stock-input-group">

              <label>Set Stock Quantity</label>

              <input
                type="number"
                min="0"
                value={stockAmount}
                onChange={(e) =>
                  setStockAmount(e.target.value)
                }
                placeholder="Enter quantity"
              />

              <button
                className="update-stock-btn"
                onClick={updateStock}
              >
                Update Stock
              </button>

            </div>

            <div className="quick-stock">

              <span>Quick Add</span>

              <div>
                <button onClick={() => quickAddStock(5)}>
                  +5
                </button>

                <button onClick={() => quickAddStock(10)}>
                  +10
                </button>

                <button onClick={() => quickAddStock(25)}>
                  +25
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminInventory;