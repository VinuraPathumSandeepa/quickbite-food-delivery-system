import { useEffect, useState } from "react";
import api from "../api/api";
import AdminLayout from "../components/AdminLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import {
  getBackendFieldErrors,
  validateCollectionForm,
} from "../utils/validation";

function AdminCollections() {
  const [collections, setCollections] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    displayOrder: "1",
    active: "true",
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await api.get("/collections/admin/all");
      setCollections(response.data);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load collections.");
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
    setEditingId(null);
    setErrors({});

    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      displayOrder: "1",
      active: "true",
    });
  };

  const preparePayload = () => {
    return {
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl,
      displayOrder: Number(formData.displayOrder),
      active: formData.active === "true",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const validationErrors = validateCollectionForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const payload = preparePayload();

      if (editingId) {
        await api.put(`/collections/${editingId}`, payload);
        setMessage("Collection updated successfully.");
      } else {
        await api.post("/collections", payload);
        setMessage("Collection added successfully.");
      }

      setMessageType("success");
      clearForm();
      loadCollections();
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

  const editCollection = (collection) => {
    setEditingId(collection.id);

    setFormData({
      title: collection.title || "",
      description: collection.description || "",
      imageUrl: collection.imageUrl || "",
      displayOrder: String(collection.displayOrder ?? 0),
      active: String(collection.active),
    });

    setErrors({});
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteCollection = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this collection?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/collections/${id}`);
      loadCollections();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete collection.");
    }
  };

  return (
    <AdminLayout
      title="Manage Collections"
      subtitle="Add, update, hide or delete Home page Top Collections."
    >
      <div className="admin-section">
        <div className="admin-form-card">
          <h2>{editingId ? "Update Collection" : "Add Collection"}</h2>

          {message && (
            <div
              className={messageType === "success" ? "success-box" : "error-box"}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label>Collection Title</label>
            <input
              className={errors.title ? "input-error" : ""}
              type="text"
              name="title"
              placeholder="Example: Healthy Picks"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && (
              <span className="field-error">{errors.title}</span>
            )}

            <label>Description</label>
            <textarea
              className={errors.description ? "input-error" : ""}
              name="description"
              placeholder="Example: Fresh and healthy food options"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}

            <label>Image URL</label>
            <input
              className={errors.imageUrl ? "input-error" : ""}
              type="text"
              name="imageUrl"
              placeholder="Paste collection image URL"
              value={formData.imageUrl}
              onChange={handleChange}
            />
            {errors.imageUrl && (
              <span className="field-error">{errors.imageUrl}</span>
            )}

            <label>Display Order</label>
            <input
              className={errors.displayOrder ? "input-error" : ""}
              type="number"
              name="displayOrder"
              placeholder="Example: 1"
              value={formData.displayOrder}
              onChange={handleChange}
            />
            {errors.displayOrder && (
              <span className="field-error">{errors.displayOrder}</span>
            )}

            <label>Status</label>
            <select
              name="active"
              value={formData.active}
              onChange={handleChange}
            >
              <option value="true">Active - Show on Home Page</option>
              <option value="false">Inactive - Hide from Home Page</option>
            </select>

            <button type="submit" className="full-btn">
              {editingId ? "Update Collection" : "Add Collection"}
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
          <h2>Collection List</h2>

          {loading ? (
            <LoadingSpinner text="Loading collections..." />
          ) : collections.length === 0 ? (
            <EmptyState
              icon="🖼️"
              title="No collections found"
              text="Add your first Home page collection using the form."
            />
          ) : (
            <div className="admin-food-grid">
              {collections.map((collection) => (
                <div className="admin-food-card" key={collection.id}>
                  <img
                    src={collection.imageUrl}
                    alt={collection.title}
                    className="admin-food-image"
                  />

                  <div className="admin-food-info">
                    <h3>{collection.title}</h3>
                    <p>{collection.description || "No description"}</p>
                    <p>Display Order: {collection.displayOrder}</p>

                    <StatusBadge
                      status={collection.active ? "Active" : "Inactive"}
                    />

                    <div className="admin-card-actions">
                      <button
                        className="table-edit-btn"
                        onClick={() => editCollection(collection)}
                      >
                        Edit
                      </button>

                      <button
                        className="table-delete-btn"
                        onClick={() => deleteCollection(collection.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminCollections;