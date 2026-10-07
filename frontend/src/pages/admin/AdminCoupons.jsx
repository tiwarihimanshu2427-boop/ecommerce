import React, { useMemo, useState } from "react";
import "./AdminCoupons.css";

const initialCoupons = [
  {
    id: 1,
    code: "WELCOME10",
    type: "Percentage",
    value: 10,
    minOrder: 999,
    expiry: "2026-12-31",
    usage: 45,
    status: "Active",
  },
  {
    id: 2,
    code: "SAVE200",
    type: "Fixed",
    value: 200,
    minOrder: 1499,
    expiry: "2026-11-30",
    usage: 28,
    status: "Active",
  },
  {
    id: 3,
    code: "FESTIVE20",
    type: "Percentage",
    value: 20,
    minOrder: 1999,
    expiry: "2026-10-31",
    usage: 72,
    status: "Active",
  },
  {
    id: 4,
    code: "OLD50",
    type: "Fixed",
    value: 50,
    minOrder: 499,
    expiry: "2026-08-31",
    usage: 19,
    status: "Expired",
  },
];

function AdminCoupons() {
  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem("adminCoupons");

    if (saved) {
      return JSON.parse(saved);
    }

    localStorage.setItem(
      "adminCoupons",
      JSON.stringify(initialCoupons)
    );

    return initialCoupons;
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const emptyForm = {
    code: "",
    type: "Percentage",
    value: "",
    minOrder: "",
    expiry: "",
    usage: 0,
    status: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  const saveCoupons = (updatedCoupons) => {
    setCoupons(updatedCoupons);
    localStorage.setItem(
      "adminCoupons",
      JSON.stringify(updatedCoupons)
    );
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesSearch = coupon.code
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        coupon.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [coupons, search, statusFilter]);

  const activeCoupons = coupons.filter(
    (coupon) => coupon.status === "Active"
  ).length;

  const expiredCoupons = coupons.filter(
    (coupon) => coupon.status === "Expired"
  ).length;

  const totalUsage = coupons.reduce(
    (sum, coupon) => sum + Number(coupon.usage),
    0
  );

  const openAddModal = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      expiry: coupon.expiry,
      usage: coupon.usage,
      status: coupon.status,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.code ||
      !form.value ||
      !form.minOrder ||
      !form.expiry
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const couponData = {
      id: editingCoupon
        ? editingCoupon.id
        : Date.now(),
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder),
      expiry: form.expiry,
      usage: Number(form.usage) || 0,
      status: form.status,
    };

    if (editingCoupon) {
      const updatedCoupons = coupons.map((coupon) =>
        coupon.id === editingCoupon.id
          ? couponData
          : coupon
      );

      saveCoupons(updatedCoupons);
    } else {
      saveCoupons([couponData, ...coupons]);
    }

    closeModal();
  };

  const deleteCoupon = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmed) {
      return;
    }

    const updatedCoupons = coupons.filter(
      (coupon) => coupon.id !== id
    );

    saveCoupons(updatedCoupons);
  };

  const toggleStatus = (id) => {
    const updatedCoupons = coupons.map((coupon) =>
      coupon.id === id
        ? {
            ...coupon,
            status:
              coupon.status === "Active"
                ? "Inactive"
                : "Active",
          }
        : coupon
    );

    saveCoupons(updatedCoupons);
  };

  const formatDiscount = (coupon) => {
    if (coupon.type === "Percentage") {
      return `${coupon.value}%`;
    }

    return `₹${coupon.value}`;
  };

  return (
    <div className="coupons-page">

      {/* Header */}
      <div className="coupons-header">
        <div>
          <h1>Coupons</h1>
          <p>Create and manage discount coupons.</p>
        </div>

        <button
          className="add-coupon-btn"
          onClick={openAddModal}
        >
          + Add Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="coupons-stats">

        <div className="coupon-stat-card">
          <div className="coupon-stat-icon">
            🎟️
          </div>
          <div>
            <span>Total Coupons</span>
            <h2>{coupons.length}</h2>
          </div>
        </div>

        <div className="coupon-stat-card">
          <div className="coupon-stat-icon active">
            ✓
          </div>
          <div>
            <span>Active Coupons</span>
            <h2>{activeCoupons}</h2>
          </div>
        </div>

        <div className="coupon-stat-card">
          <div className="coupon-stat-icon expired">
            !
          </div>
          <div>
            <span>Expired</span>
            <h2>{expiredCoupons}</h2>
          </div>
        </div>

        <div className="coupon-stat-card">
          <div className="coupon-stat-icon usage">
            📊
          </div>
          <div>
            <span>Total Usage</span>
            <h2>{totalUsage}</h2>
          </div>
        </div>

      </div>

      {/* Toolbar */}
      <div className="coupons-toolbar">

        <div className="coupon-search">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Expired">Expired</option>
        </select>

      </div>

      {/* Table */}
      <div className="coupons-table-card">

        <div className="coupons-table-title">
          <div>
            <h3>Coupon List</h3>
            <p>
              {filteredCoupons.length} coupons found
            </p>
          </div>
        </div>

        {filteredCoupons.length === 0 ? (
          <div className="coupons-empty">
            <div>🎟️</div>
            <h3>No coupons found</h3>
            <p>Create a new coupon or change your filter.</p>
          </div>
        ) : (
          <div className="coupons-table-wrapper">

            <table className="coupons-table">

              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min. Order</th>
                  <th>Expiry</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id}>

                    <td>
                      <span className="coupon-code">
                        {coupon.code}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {formatDiscount(coupon)}
                      </strong>
                    </td>

                    <td>
                      ₹
                      {coupon.minOrder.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td>
                      {new Date(
                        coupon.expiry
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      <strong>{coupon.usage}</strong>
                    </td>

                    <td>
                      <span
                        className={`coupon-status ${coupon.status.toLowerCase()}`}
                      >
                        {coupon.status}
                      </span>
                    </td>

                    <td>
                      <div className="coupon-actions">

                        <button
                          className="edit-coupon-btn"
                          onClick={() =>
                            openEditModal(coupon)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="toggle-coupon-btn"
                          onClick={() =>
                            toggleStatus(coupon.id)
                          }
                        >
                          {coupon.status === "Active"
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          className="delete-coupon-btn"
                          onClick={() =>
                            deleteCoupon(coupon.id)
                          }
                        >
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="coupon-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="coupon-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="coupon-modal-header">

              <div>
                <h2>
                  {editingCoupon
                    ? "Edit Coupon"
                    : "Add Coupon"}
                </h2>

                <p>
                  {editingCoupon
                    ? "Update coupon details."
                    : "Create a new discount coupon."}
                </p>
              </div>

              <button
                className="coupon-close-btn"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              className="coupon-form"
              onSubmit={handleSubmit}
            >

              <div className="coupon-form-group">
                <label>Coupon Code *</label>

                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. SAVE20"
                />
              </div>

              <div className="coupon-form-row">

                <div className="coupon-form-group">
                  <label>Discount Type *</label>

                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="Percentage">
                      Percentage
                    </option>

                    <option value="Fixed">
                      Fixed Amount
                    </option>
                  </select>
                </div>

                <div className="coupon-form-group">
                  <label>Discount Value *</label>

                  <input
                    type="number"
                    min="0"
                    name="value"
                    value={form.value}
                    onChange={handleChange}
                    placeholder={
                      form.type === "Percentage"
                        ? "10"
                        : "200"
                    }
                  />
                </div>

              </div>

              <div className="coupon-form-row">

                <div className="coupon-form-group">
                  <label>Minimum Order *</label>

                  <input
                    type="number"
                    min="0"
                    name="minOrder"
                    value={form.minOrder}
                    onChange={handleChange}
                    placeholder="999"
                  />
                </div>

                <div className="coupon-form-group">
                  <label>Expiry Date *</label>

                  <input
                    type="date"
                    name="expiry"
                    value={form.expiry}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="coupon-form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>

                  <option value="Expired">
                    Expired
                  </option>
                </select>
              </div>

              <div className="coupon-form-actions">

                <button
                  type="button"
                  className="cancel-coupon-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-coupon-btn"
                >
                  {editingCoupon
                    ? "Update Coupon"
                    : "Create Coupon"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminCoupons;