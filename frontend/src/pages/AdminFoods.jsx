import { useEffect, useState } from "react";
import api from "../api/api";
import AdminLayout from "../components/AdminLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import {
  getBackendFieldErrors,
  validateFoodForm,
} from "../utils/validation";

function AdminFoods() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    rating: "4.5",
    preparationTimeMinutes: "",
    available: "true",
    categoryId: "",
  });

  useEffect(() => {
    loadFoods();
    loadCategories();
  }, []);

  const loadFoods = async () => {
    try {
      setLoading(true);
      const response = await api.get("/foods");
      setFoods(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load foods.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to load categories", error);
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
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      rating: "4.5",
      preparationTimeMinutes: "",
      available: "true",
      categoryId: "",
    });
  };

  const preparePayload = () => {
    return {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      imageUrl: formData.imageUrl,
      rating: Number(formData.rating),
      preparationTimeMinutes: Number(formData.preparationTimeMinutes),
      available: formData.available === "true",
      categoryId: Number(formData.categoryId),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const validationErrors = validateFoodForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const payload = preparePayload();

      if (editingId) {
        await api.put(`/foods/${editingId}`, payload);
        setMessage("Food item updated successfully.");
      } else {
        await api.post("/foods", payload);
        setMessage("Food item added successfully.");
      }

      setMessageType("success");
      clearForm();
      loadFoods();
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

  const editFood = (food) => {
    setEditingId(food.id);

    setFormData({
      name: food.name || "",
      description: food.description || "",
      price: food.price || "",
      imageUrl: food.imageUrl || "",
      rating: food.rating || "4.5",
      preparationTimeMinutes: food.preparationTimeMinutes || "",
      available: String(food.available),
      categoryId: food.category?.id || "",
    });

    setErrors({});
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteFood = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this food item?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/foods/${id}`);
      loadFoods();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete food item.");
    }
  };

  return (
    <AdminLayout
      title="Manage Foods"
      subtitle="Add, update, delete and control food availability."
    >
      <div className="admin-section">
        <div className="admin-form-card">
          <h2>{editingId ? "Update Food Item" : "Add Food Item"}</h2>

          {message && (
            <div
              className={messageType === "success" ? "success-box" : "error-box"}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label>Food Name</label>
            <input
              className={errors.name ? "input-error" : ""}
              type="text"
              name="name"
              placeholder="Example: Chicken Burger"
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

            <label>Price</label>
            <input
              className={errors.price ? "input-error" : ""}
              type="number"
              name="price"
              placeholder="Example: 950"
              value={formData.price}
              onChange={handleChange}
            />
            {errors.price && (
              <span className="field-error">{errors.price}</span>
            )}

            <label>Image URL</label>
            <input
              type="text"
              name="imageUrl"
              placeholder="Paste food image URL"
              value={formData.imageUrl}
              onChange={handleChange}
            />

            <label>Rating</label>
            <input
              className={errors.rating ? "input-error" : ""}
              type="number"
              step="0.1"
              min="1"
              max="5"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
            />
            {errors.rating && (
              <span className="field-error">{errors.rating}</span>
            )}

            <label>Preparation Time Minutes</label>
            <input
              className={errors.preparationTimeMinutes ? "input-error" : ""}
              type="number"
              name="preparationTimeMinutes"
              placeholder="Example: 20"
              value={formData.preparationTimeMinutes}
              onChange={handleChange}
            />
            {errors.preparationTimeMinutes && (
              <span className="field-error">
                {errors.preparationTimeMinutes}
              </span>
            )}

            <label>Available</label>
            <select
              name="available"
              value={formData.available}
              onChange={handleChange}
            >
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>

            <label>Category</label>
            <select
              className={errors.categoryId ? "input-error" : ""}
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="field-error">{errors.categoryId}</span>
            )}

            <button type="submit" className="full-btn">
              {editingId ? "Update Food" : "Add Food"}
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
          <h2>Food List</h2>

          {loading ? (
            <LoadingSpinner text="Loading food items..." />
          ) : foods.length === 0 ? (
            <EmptyState
              icon="🍔"
              title="No food items found"
              text="Add your first food item using the form."
            />
          ) : (
            <div className="admin-food-grid">
              {foods.map((food) => (
                <div className="admin-food-card" key={food.id}>
                  <img
                    src={
                      food.imageUrl ||
                      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
                    }
                    alt={food.name}
                    className="admin-food-image"
                  />

                  <div className="admin-food-info">
                    <h3>{food.name}</h3>
                    <p className="food-price">
                      Rs. {Number(food.price).toFixed(2)}
                    </p>
                    <p>{food.category?.name || "No category"}</p>

                    <StatusBadge
                      status={food.available ? "Available" : "Not Available"}
                    />

                    <div className="admin-card-actions">
                      <button
                        className="table-edit-btn"
                        onClick={() => editFood(food)}
                      >
                        Edit
                      </button>

                      <button
                        className="table-delete-btn"
                        onClick={() => deleteFood(food.id)}
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

export default AdminFoods;