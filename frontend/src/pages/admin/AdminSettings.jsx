import React, { useState } from "react";
import "./AdminSettings.css";

const defaultSettings = {
  storeName: "My E-Commerce Store",
  storeEmail: "support@mystore.com",
  phone: "9876543210",
  address: "Katihar, Bihar, India",

  currency: "INR",
  tax: "18",
  shippingCharge: "50",
  freeShippingAbove: "999",

  orderEmail: true,
  newCustomerEmail: true,
  reviewEmail: true,
  lowStockAlert: true,

  maintenanceMode: false,
};

function AdminSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("adminSettings");

    if (saved) {
      return JSON.parse(saved);
    }

    localStorage.setItem(
      "adminSettings",
      JSON.stringify(defaultSettings)
    );

    return defaultSettings;
  });

  const [activeTab, setActiveTab] = useState("store");
  const [savedMessage, setSavedMessage] = useState("");

  const updateSetting = (name, value) => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveSettings = () => {
    localStorage.setItem(
      "adminSettings",
      JSON.stringify(settings)
    );

    setSavedMessage("Settings saved successfully.");

    setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  };

  const resetSettings = () => {
    const confirmed = window.confirm(
      "Reset all settings to default values?"
    );

    if (!confirmed) {
      return;
    }

    setSettings(defaultSettings);

    localStorage.setItem(
      "adminSettings",
      JSON.stringify(defaultSettings)
    );

    setSavedMessage("Settings reset successfully.");

    setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  };

  return (
    <div className="settings-page">

      {/* Header */}
      <div className="settings-header">

        <div>
          <h1>Settings</h1>
          <p>
            Manage your store configuration and preferences.
          </p>
        </div>

        <div className="settings-header-actions">

          <button
            className="settings-reset-btn"
            onClick={resetSettings}
          >
            Reset
          </button>

          <button
            className="settings-save-btn"
            onClick={saveSettings}
          >
            Save Changes
          </button>

        </div>

      </div>

      {savedMessage && (
        <div className="settings-success">
          ✓ {savedMessage}
        </div>
      )}

      <div className="settings-layout">

        {/* Sidebar */}
        <div className="settings-sidebar">

          <button
            className={
              activeTab === "store"
                ? "settings-tab active"
                : "settings-tab"
            }
            onClick={() => setActiveTab("store")}
          >
            🏪 Store
          </button>

          <button
            className={
              activeTab === "shipping"
                ? "settings-tab active"
                : "settings-tab"
            }
            onClick={() => setActiveTab("shipping")}
          >
            🚚 Shipping
          </button>

          <button
            className={
              activeTab === "notifications"
                ? "settings-tab active"
                : "settings-tab"
            }
            onClick={() => setActiveTab("notifications")}
          >
            🔔 Notifications
          </button>

          <button
            className={
              activeTab === "system"
                ? "settings-tab active"
                : "settings-tab"
            }
            onClick={() => setActiveTab("system")}
          >
            ⚙️ System
          </button>

        </div>

        {/* Content */}
        <div className="settings-content">

          {/* Store */}
          {activeTab === "store" && (
            <div className="settings-section">

              <div className="settings-section-header">
                <h2>Store Information</h2>
                <p>
                  Basic information about your online store.
                </p>
              </div>

              <div className="settings-form">

                <div className="settings-field">

                  <label>Store Name</label>

                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) =>
                      updateSetting(
                        "storeName",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="settings-field">

                  <label>Store Email</label>

                  <input
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) =>
                      updateSetting(
                        "storeEmail",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="settings-field">

                  <label>Phone Number</label>

                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) =>
                      updateSetting(
                        "phone",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="settings-field full">

                  <label>Store Address</label>

                  <textarea
                    value={settings.address}
                    onChange={(e) =>
                      updateSetting(
                        "address",
                        e.target.value
                      )
                    }
                    rows="4"
                  />

                </div>

                <div className="settings-field">

                  <label>Currency</label>

                  <select
                    value={settings.currency}
                    onChange={(e) =>
                      updateSetting(
                        "currency",
                        e.target.value
                      )
                    }
                  >
                    <option value="INR">
                      INR - Indian Rupee
                    </option>

                    <option value="USD">
                      USD - US Dollar
                    </option>

                    <option value="EUR">
                      EUR - Euro
                    </option>
                  </select>

                </div>

                <div className="settings-field">

                  <label>Tax (%)</label>

                  <input
                    type="number"
                    min="0"
                    value={settings.tax}
                    onChange={(e) =>
                      updateSetting(
                        "tax",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            </div>
          )}

          {/* Shipping */}
          {activeTab === "shipping" && (
            <div className="settings-section">

              <div className="settings-section-header">
                <h2>Shipping Settings</h2>
                <p>
                  Configure shipping charges for your customers.
                </p>
              </div>

              <div className="settings-form">

                <div className="settings-field">

                  <label>Standard Shipping Charge</label>

                  <div className="input-prefix">
                    <span>₹</span>

                    <input
                      type="number"
                      min="0"
                      value={settings.shippingCharge}
                      onChange={(e) =>
                        updateSetting(
                          "shippingCharge",
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

                <div className="settings-field">

                  <label>Free Shipping Above</label>

                  <div className="input-prefix">
                    <span>₹</span>

                    <input
                      type="number"
                      min="0"
                      value={settings.freeShippingAbove}
                      onChange={(e) =>
                        updateSetting(
                          "freeShippingAbove",
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

              </div>

              <div className="shipping-info">

                <div>🚚</div>

                <div>
                  <strong>
                    Free Shipping
                  </strong>

                  <p>
                    Orders above ₹
                    {settings.freeShippingAbove}
                    {" "}
                    will receive free shipping.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="settings-section">

              <div className="settings-section-header">
                <h2>Notifications</h2>
                <p>
                  Choose which notifications you want to receive.
                </p>
              </div>

              <div className="notification-list">

                <div className="notification-item">

                  <div>
                    <strong>
                      New Order
                    </strong>

                    <p>
                      Receive a notification when a new order is placed.
                    </p>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={settings.orderEmail}
                      onChange={(e) =>
                        updateSetting(
                          "orderEmail",
                          e.target.checked
                        )
                      }
                    />

                    <span className="slider"></span>

                  </label>

                </div>

                <div className="notification-item">

                  <div>
                    <strong>
                      New Customer
                    </strong>

                    <p>
                      Receive a notification when a new customer registers.
                    </p>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={settings.newCustomerEmail}
                      onChange={(e) =>
                        updateSetting(
                          "newCustomerEmail",
                          e.target.checked
                        )
                      }
                    />

                    <span className="slider"></span>

                  </label>

                </div>

                <div className="notification-item">

                  <div>
                    <strong>
                      New Review
                    </strong>

                    <p>
                      Receive a notification when a customer submits a review.
                    </p>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={settings.reviewEmail}
                      onChange={(e) =>
                        updateSetting(
                          "reviewEmail",
                          e.target.checked
                        )
                      }
                    />

                    <span className="slider"></span>

                  </label>

                </div>

                <div className="notification-item">

                  <div>
                    <strong>
                      Low Stock Alert
                    </strong>

                    <p>
                      Receive an alert when a product stock becomes low.
                    </p>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={settings.lowStockAlert}
                      onChange={(e) =>
                        updateSetting(
                          "lowStockAlert",
                          e.target.checked
                        )
                      }
                    />

                    <span className="slider"></span>

                  </label>

                </div>

              </div>

            </div>
          )}

          {/* System */}
          {activeTab === "system" && (
            <div className="settings-section">

              <div className="settings-section-header">
                <h2>System Settings</h2>
                <p>
                  Manage general system behavior.
                </p>
              </div>

              <div className="system-setting-card">

                <div className="system-setting-info">

                  <div className="system-icon">
                    🔧
                  </div>

                  <div>
                    <strong>
                      Maintenance Mode
                    </strong>

                    <p>
                      Temporarily disable the customer-facing store
                      while you perform maintenance.
                    </p>
                  </div>

                </div>

                <label className="switch">

                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      updateSetting(
                        "maintenanceMode",
                        e.target.checked
                      )
                    }
                  />

                  <span className="slider"></span>

                </label>

              </div>

              <div className="system-warning">
                <strong>⚠️ Maintenance Mode</strong>

                <p>
                  When enabled, customers should see a maintenance
                  message instead of the normal store.
                </p>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default AdminSettings;