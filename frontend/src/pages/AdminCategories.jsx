import { useEffect, useState } from "react";
import api from "../api/api";
import AdminLayout from "../components/AdminLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  getBackendFieldErrors,
  validateCategoryForm,
} from "../utils/validation";

function AdminCategories() {
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load categories.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setErrors((previous) => ({
      ...previous,
      [e.target.name]: "",
    }));

    setMessage("");
  };

  const clearForm = () => {
    setFormData({
      name: "",
      description: "",
    });

    setEditingId(null);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const validationErrors = validateCategoryForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
        setMessage("Category updated successfully.");
      } else {
        await api.post("/categories", formData);
        setMessage("Category added successfully.");
      }

      setMessageType("success");
      clearForm();
      loadCategories();
    } catch (error) {
      const backendErrors = getBackendFieldErrors(error);

      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      } else {
        setMessage(error.response?.data?.message || "Operation failed.");
        setMessageType("error");
      }
    }
  };

  const editCategory = (category) => {
    setEditingId(category.id);

    setFormData({
      name: category.name || "",
      description: category.description || "",
    });

    setErrors({});
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteCategory = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete category. It may already be used by food items."
      );
    }
  };

  return (
    <AdminLayout
      title="Manage Categories"
      subtitle="Add, update, and delete food categories."
    >
      <div className="admin-section">
        <div className="admin-form-card">
          <h2>{editingId ? "Update Category" : "Add Category"}</h2>

          {message && (
            <div
              className={messageType === "success" ? "success-box" : "error-box"}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label>Category Name</label>
            <input
              className={errors.name ? "input-error" : ""}
              type="text"
              name="name"
              placeholder="Example: Pizza"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}

            <label>Description</label>
            <textarea
              className={errors.description ? "input-error" : ""}
              name="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}

            <button type="submit" className="full-btn">
              {editingId ? "Update Category" : "Add Category"}
            </button>

            {editingId && (
              <button
                type="button"
                className="outline-full-btn"
                onClick={clearForm}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="admin-table-card">
          <h2>Category List</h2>

          {loading ? (
            <LoadingSpinner text="Loading categories..." />
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td>{category.name}</td>
                      <td>{category.description}</td>
                      <td>
                        <button
                          className="table-edit-btn"
                          onClick={() => editCategory(category)}
                        >
                          Edit
                        </button>

                        <button
                          className="table-delete-btn"
                          onClick={() => deleteCategory(category.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="4">No categories found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminCategories;