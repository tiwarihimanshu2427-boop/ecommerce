import { useEffect, useState } from "react";
import "./AdminCategories.css";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("categories")) || [];

    setCategories(saved);
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveCategory = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Category name is required");
      return;
    }

    if (editingId) {
      const updated = categories.map((category) =>
        category.id === editingId
          ? {
              ...category,
              name: form.name,
              description: form.description,
            }
          : category
      );

      setCategories(updated);

      localStorage.setItem(
        "categories",
        JSON.stringify(updated)
      );
    } else {
      const newCategory = {
        id: Date.now(),
        name: form.name,
        description: form.description,
        status: "Active",
      };

      const updated = [
        ...categories,
        newCategory,
      ];

      setCategories(updated);

      localStorage.setItem(
        "categories",
        JSON.stringify(updated)
      );
    }

    resetForm();
  };

  const editCategory = (category) => {
    setForm({
      name: category.name,
      description: category.description,
    });

    setEditingId(category.id);
    setShowForm(true);
  };

  const deleteCategory = (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category?"
      )
    ) {
      return;
    }

    const updated = categories.filter(
      (category) => category.id !== id
    );

    setCategories(updated);

    localStorage.setItem(
      "categories",
      JSON.stringify(updated)
    );
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="categories-page">

      <div className="categories-header">
        <div>
          <h1>Categories</h1>
          <p>Manage product categories</p>
        </div>

        <button
          className="add-category-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Category
        </button>
      </div>

      <div className="category-toolbar">
        <input
          type="text"
          placeholder="🔍 Search categories..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <span>
          {filteredCategories.length} Categories
        </span>
      </div>

      {showForm && (
        <div className="category-form-card">

          <div className="category-form-header">
            <h2>
              {editingId
                ? "Edit Category"
                : "Add Category"}
            </h2>

            <button onClick={resetForm}>
              ✕
            </button>
          </div>

          <form onSubmit={saveCategory}>

            <div className="category-input">
              <label>Category Name *</label>

              <input
                type="text"
                name="name"
                placeholder="Example: Electronics"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="category-input">
              <label>Description</label>

              <textarea
                name="description"
                rows="4"
                placeholder="Category description..."
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="category-actions">

              <button
                type="button"
                className="category-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="category-save"
              >
                {editingId
                  ? "Update Category"
                  : "Save Category"}
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="categories-card">

        <table>

          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredCategories.length === 0 ? (

              <tr>
                <td
                  colSpan="4"
                  className="empty-category"
                >
                  <div className="category-empty-icon">
                    🗂️
                  </div>

                  <h3>
                    No Categories Found
                  </h3>

                  <p>
                    Add your first category.
                  </p>
                </td>
              </tr>

            ) : (

              filteredCategories.map(
                (category) => (
                  <tr key={category.id}>

                    <td>
                      <div className="category-name">
                        <div className="category-icon">
                          🗂️
                        </div>

                        <div>
                          <strong>
                            {category.name}
                          </strong>

                          <small>
                            #{category.id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      {category.description ||
                        "No description"}
                    </td>

                    <td>
                      <span className="category-status">
                        {category.status}
                      </span>
                    </td>

                    <td>
                      <div className="category-buttons">

                        <button
                          className="category-edit"
                          onClick={() =>
                            editCategory(category)
                          }
                        >
                          ✏️
                        </button>

                        <button
                          className="category-delete"
                          onClick={() =>
                            deleteCategory(
                              category.id
                            )
                          }
                        >
                          🗑️
                        </button>

                      </div>
                    </td>

                  </tr>
                )
              )

            )}

          </tbody>

        </table>

      </div>
    </div>
  );
}

export default AdminCategories;