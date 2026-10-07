import React, { useMemo, useState } from "react";
import "./AdminCustomers.css";

const initialCustomers = [
  {
    id: 1,
    name: "Rahul Kumar",
    email: "rahul@gmail.com",
    phone: "9876543210",
    orders: 8,
    spent: 12450,
    status: "Active",
    joined: "2026-08-12",
  },
  {
    id: 2,
    name: "Priya Singh",
    email: "priya@gmail.com",
    phone: "9876543211",
    orders: 5,
    spent: 7890,
    status: "Active",
    joined: "2026-08-20",
  },
  {
    id: 3,
    name: "Amit Kumar",
    email: "amit@gmail.com",
    phone: "9876543212",
    orders: 3,
    spent: 4599,
    status: "Active",
    joined: "2026-08-25",
  },
  {
    id: 4,
    name: "Neha Sharma",
    email: "neha@gmail.com",
    phone: "9876543213",
    orders: 11,
    spent: 18999,
    status: "Active",
    joined: "2026-07-15",
  },
  {
    id: 5,
    name: "Vikas Gupta",
    email: "vikas@gmail.com",
    phone: "9876543214",
    orders: 1,
    spent: 899,
    status: "Inactive",
    joined: "2026-09-01",
  },
];

function AdminCustomers() {
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem("adminCustomers");

    if (saved) {
      return JSON.parse(saved);
    }

    localStorage.setItem(
      "adminCustomers",
      JSON.stringify(initialCustomers)
    );

    return initialCustomers;
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        customer.name.toLowerCase().includes(searchText) ||
        customer.email.toLowerCase().includes(searchText) ||
        customer.phone.includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => customer.status === "Inactive"
  ).length;

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.orders,
    0
  );

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.spent,
    0
  );

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const toggleStatus = (id) => {
    const updatedCustomers = customers.map((customer) =>
      customer.id === id
        ? {
            ...customer,
            status:
              customer.status === "Active"
                ? "Inactive"
                : "Active",
          }
        : customer
    );

    setCustomers(updatedCustomers);

    localStorage.setItem(
      "adminCustomers",
      JSON.stringify(updatedCustomers)
    );

    if (selectedCustomer?.id === id) {
      const updatedCustomer = updatedCustomers.find(
        (customer) => customer.id === id
      );

      setSelectedCustomer(updatedCustomer);
    }
  };

  return (
    <div className="customers-page">

      {/* Header */}
      <div className="customers-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your registered customers.</p>
        </div>

        <button
          className="customer-refresh-btn"
          onClick={() => window.location.reload()}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="customers-stats">

        <div className="customer-stat-card">
          <div className="customer-stat-icon">
            👥
          </div>

          <div>
            <span>Total Customers</span>
            <h2>{customers.length}</h2>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon active">
            ✓
          </div>

          <div>
            <span>Active Customers</span>
            <h2>{activeCustomers}</h2>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon inactive">
            ○
          </div>

          <div>
            <span>Inactive Customers</span>
            <h2>{inactiveCustomers}</h2>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon orders">
            🛒
          </div>

          <div>
            <span>Total Orders</span>
            <h2>{totalOrders}</h2>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon revenue">
            ₹
          </div>

          <div>
            <span>Total Spent</span>
            <h2>{formatCurrency(totalRevenue)}</h2>
          </div>
        </div>

      </div>

      {/* Toolbar */}
      <div className="customers-toolbar">

        <div className="customers-search">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search customer, email or phone..."
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
          <option value="All">All Customers</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

      </div>

      {/* Table */}
      <div className="customers-table-card">

        <div className="customers-table-title">
          <div>
            <h3>Customer List</h3>
            <p>
              {filteredCustomers.length} customers found
            </p>
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="customers-empty">
            <div>👥</div>
            <h3>No customers found</h3>
            <p>
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <div className="customers-table-wrapper">

            <table className="customers-table">

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>

                    <td>
                      <div className="customer-info">

                        <div className="customer-avatar">
                          {customer.name.charAt(0)}
                        </div>

                        <div>
                          <strong>
                            {customer.name}
                          </strong>

                          <small>
                            {customer.email}
                          </small>
                        </div>

                      </div>
                    </td>

                    <td>{customer.phone}</td>

                    <td>
                      <strong>
                        {customer.orders}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(customer.spent)}
                      </strong>
                    </td>

                    <td>
                      {new Date(
                        customer.joined
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={`customer-status ${customer.status.toLowerCase()}`}
                      >
                        {customer.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="customer-view-btn"
                        onClick={() =>
                          setSelectedCustomer(customer)
                        }
                      >
                        View
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Customer Modal */}
      {selectedCustomer && (
        <div
          className="customer-modal-overlay"
          onClick={() =>
            setSelectedCustomer(null)
          }
        >
          <div
            className="customer-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="customer-modal-header">

              <div>
                <h2>Customer Details</h2>
                <p>
                  Customer #{selectedCustomer.id}
                </p>
              </div>

              <button
                className="customer-close-btn"
                onClick={() =>
                  setSelectedCustomer(null)
                }
              >
                ×
              </button>

            </div>

            <div className="customer-profile">

              <div className="large-customer-avatar">
                {selectedCustomer.name.charAt(0)}
              </div>

              <div>
                <h3>
                  {selectedCustomer.name}
                </h3>

                <p>
                  {selectedCustomer.email}
                </p>
              </div>

            </div>

            <div className="customer-detail-grid">

              <div>
                <span>Phone</span>
                <strong>
                  {selectedCustomer.phone}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedCustomer.status}
                </strong>
              </div>

              <div>
                <span>Total Orders</span>
                <strong>
                  {selectedCustomer.orders}
                </strong>
              </div>

              <div>
                <span>Total Spent</span>
                <strong>
                  {formatCurrency(
                    selectedCustomer.spent
                  )}
                </strong>
              </div>

              <div>
                <span>Joined</span>
                <strong>
                  {new Date(
                    selectedCustomer.joined
                  ).toLocaleDateString("en-IN")}
                </strong>
              </div>

            </div>

            <button
              className="toggle-customer-btn"
              onClick={() =>
                toggleStatus(selectedCustomer.id)
              }
            >
              {selectedCustomer.status === "Active"
                ? "Deactivate Customer"
                : "Activate Customer"}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminCustomers;