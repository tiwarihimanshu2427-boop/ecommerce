import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserNavbar from "../../components/common/UserNavbar";
import "./Addresses.css";

const emptyAddress = {
  id: null,
  type: "Home",
  name: "",
  mobile: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyAddress);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    const savedAddresses = JSON.parse(
      localStorage.getItem("addresses") || "[]"
    );

    setAddresses(savedAddresses);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      ...emptyAddress,
      id: Date.now(),
    });
    setShowForm(true);
  };

  const openEditForm = (address) => {
    setEditingId(address.id);
    setFormData(address);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveAddress = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.mobile.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      alert("Please fill all address fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^[0-9]{6}$/.test(formData.pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    let updatedAddresses;

    if (editingId) {
      updatedAddresses = addresses.map((item) =>
        item.id === editingId
          ? { ...formData }
          : item
      );
    } else {
      updatedAddresses = [
        ...addresses,
        {
          ...formData,
          id: Date.now(),
        },
      ];
    }

    // If this is the default address,
    // remove default status from all others.
    if (formData.isDefault) {
      updatedAddresses = updatedAddresses.map(
        (item) => ({
          ...item,
          isDefault:
            item.id === formData.id,
        })
      );
    }

    localStorage.setItem(
      "addresses",
      JSON.stringify(updatedAddresses)
    );

    setAddresses(updatedAddresses);
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyAddress);

    alert(
      editingId
        ? "Address updated successfully!"
        : "Address added successfully!"
    );
  };

  const deleteAddress = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmDelete) return;

    const updatedAddresses = addresses.filter(
      (item) => item.id !== id
    );

    // If default address was deleted,
    // make the first remaining address default.
    if (
      updatedAddresses.length > 0 &&
      !updatedAddresses.some(
        (item) => item.isDefault
      )
    ) {
      updatedAddresses[0].isDefault = true;
    }

    localStorage.setItem(
      "addresses",
      JSON.stringify(updatedAddresses)
    );

    setAddresses(updatedAddresses);
  };

  const setDefaultAddress = (id) => {
    const updatedAddresses = addresses.map(
      (item) => ({
        ...item,
        isDefault: item.id === id,
      })
    );

    localStorage.setItem(
      "addresses",
      JSON.stringify(updatedAddresses)
    );

    setAddresses(updatedAddresses);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyAddress);
  };

  return (
    <>
      <UserNavbar />

      <main className="addresses-page">

        {/* HEADER */}

        <section className="addresses-header">

          <div>
            <span className="addresses-label">
              DELIVERY INFORMATION
            </span>

            <h1>My Addresses</h1>

            <p>
              Save your delivery addresses for a
              faster and easier checkout.
            </p>
          </div>

          <Link
            to="/account"
            className="back-account-btn"
          >
            ← My Account
          </Link>

        </section>

        <div className="addresses-container">

          {/* TOP BAR */}

          <div className="addresses-toolbar">

            <div>
              <span>
                ADDRESS BOOK
              </span>

              <h2>
                Saved Addresses
              </h2>
            </div>

            {!showForm && (
              <button
                className="add-address-btn"
                onClick={openAddForm}
                type="button"
              >
                + Add New Address
              </button>
            )}

          </div>

          {/* FORM */}

          {showForm && (

            <section className="address-form-card">

              <div className="form-card-header">

                <div>
                  <span>
                    {editingId
                      ? "EDIT ADDRESS"
                      : "NEW ADDRESS"}
                  </span>

                  <h2>
                    {editingId
                      ? "Update Address"
                      : "Add Delivery Address"}
                  </h2>
                </div>

                <button
                  className="close-form-btn"
                  onClick={cancelForm}
                  type="button"
                >
                  ×
                </button>

              </div>

              <form onSubmit={saveAddress}>

                {/* ADDRESS TYPE */}

                <div className="address-type-section">

                  <label>
                    Address Type
                  </label>

                  <div className="address-type-options">

                    {["Home", "Office", "Other"].map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          className={
                            formData.type === type
                              ? "type-selected"
                              : ""
                          }
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              type,
                            }))
                          }
                        >
                          {type === "Home" && "🏠"}
                          {type === "Office" && "🏢"}
                          {type === "Other" && "📍"}

                          <span>
                            {type}
                          </span>
                        </button>
                      )
                    )}

                  </div>

                </div>

                {/* FORM GRID */}

                <div className="address-form-grid">

                  <div className="address-form-group">

                    <label>
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="address-form-group">

                    <label>
                      Mobile Number
                    </label>

                    <input
                      type="tel"
                      name="mobile"
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      value={formData.mobile}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="address-form-group full-width">

                    <label>
                      Full Address
                    </label>

                    <textarea
                      name="address"
                      placeholder="House no., street, area, landmark..."
                      rows="3"
                      value={formData.address}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="address-form-group">

                    <label>
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="address-form-group">

                    <label>
                      State
                    </label>

                    <input
                      type="text"
                      name="state"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="address-form-group">

                    <label>
                      Pincode
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      placeholder="6-digit pincode"
                      maxLength="6"
                      value={formData.pincode}
                      onChange={handleChange}
                    />

                  </div>

                </div>

                {/* DEFAULT */}

                <label className="default-address-check">

                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                  />

                  <span>
                    Make this my default delivery address
                  </span>

                </label>

                {/* ACTIONS */}

                <div className="address-form-actions">

                  <button
                    type="button"
                    className="cancel-address-btn"
                    onClick={cancelForm}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-address-btn"
                  >
                    {editingId
                      ? "Update Address"
                      : "Save Address"}
                  </button>

                </div>

              </form>

            </section>

          )}

          {/* ADDRESS LIST */}

          {!showForm && addresses.length === 0 ? (

            <section className="empty-addresses">

              <div className="empty-address-icon">
                📍
              </div>

              <h2>
                No Saved Addresses
              </h2>

              <p>
                Add a delivery address to make your
                checkout process faster.
              </p>

              <button
                className="empty-add-btn"
                onClick={openAddForm}
                type="button"
              >
                + Add Your First Address
              </button>

            </section>

          ) : !showForm ? (

            <section className="addresses-grid">

              {addresses.map((address) => (

                <article
                  className={`address-card ${
                    address.isDefault
                      ? "default-card"
                      : ""
                  }`}
                  key={address.id}
                >

                  {address.isDefault && (
                    <span className="default-badge">
                      ✓ DEFAULT
                    </span>
                  )}

                  <div className="address-card-top">

                    <div className="address-type">

                      <div className="address-type-icon">
                        {address.type === "Home"
                          ? "🏠"
                          : address.type === "Office"
                          ? "🏢"
                          : "📍"}
                      </div>

                      <div>
                        <span>
                          ADDRESS TYPE
                        </span>

                        <h3>
                          {address.type}
                        </h3>
                      </div>

                    </div>

                    <div className="address-actions">

                      <button
                        onClick={() =>
                          openEditForm(address)
                        }
                        type="button"
                        title="Edit address"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() =>
                          deleteAddress(address.id)
                        }
                        type="button"
                        title="Delete address"
                      >
                        🗑️
                      </button>

                    </div>

                  </div>

                  <div className="address-details">

                    <h3>
                      {address.name}
                    </h3>

                    <p>
                      📱 {address.mobile}
                    </p>

                    <p>
                      📍 {address.address}
                    </p>

                    <p>
                      {address.city},{" "}
                      {address.state} -{" "}
                      <strong>
                        {address.pincode}
                      </strong>
                    </p>

                  </div>

                  {!address.isDefault && (
                    <button
                      className="default-address-btn"
                      onClick={() =>
                        setDefaultAddress(
                          address.id
                        )
                      }
                      type="button"
                    >
                      Set as Default
                    </button>
                  )}

                </article>

              ))}

            </section>

          ) : null}

        </div>

      </main>
    </>
  );
};

export default Addresses;