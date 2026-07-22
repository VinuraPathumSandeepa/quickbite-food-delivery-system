import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

function CustomerCart() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [itemToRemove, setItemToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/cart/${currentUser.id}`);
      setCartItems(response.data);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  const cartData = useMemo(() => {
    const totalAmount = cartItems.reduce((total, item) => {
      return (
        total +
        Number(item.foodItem?.price || 0) * Number(item.quantity || 0)
      );
    }, 0);

    const totalQuantity = cartItems.reduce((total, item) => {
      return total + Number(item.quantity || 0);
    }, 0);

    return {
      foodTypes: cartItems.length,
      totalQuantity,
      totalAmount,
    };
  }, [cartItems]);

  const showToast = (toastData) => {
    setToast(toastData);

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (Number(quantity) < 1) return;

    try {
      await api.put(`/cart/item/${cartItemId}`, {
        quantity: Number(quantity),
      });

      loadCart();
    } catch (error) {
      showToast({
        type: "error",
        title: "Update Failed",
        message: error.response?.data?.message || "Failed to update quantity.",
      });
    }
  };

  const openRemoveModal = (item) => {
    setItemToRemove(item);
  };

  const closeRemoveModal = () => {
    if (removing) return;
    setItemToRemove(null);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;

    try {
      setRemoving(true);

      await api.delete(`/cart/item/${itemToRemove.id}`);

      setCartItems((previous) =>
        previous.filter((item) => item.id !== itemToRemove.id)
      );

      showToast({
        type: "success",
        title: "Item Removed",
        message: `${
          itemToRemove.foodItem?.name || "Food item"
        } removed from your cart.`,
      });

      setItemToRemove(null);
    } catch (error) {
      showToast({
        type: "error",
        title: "Remove Failed",
        message: error.response?.data?.message || "Failed to remove item.",
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="app-page">
      <Navbar />

      <PageHeader
        title="My Cart"
        subtitle="Review your selected food items before checkout."
      />

      <section className="cart-section">
        {message && <div className="error-box">{message}</div>}

        {loading ? (
          <LoadingSpinner text="Loading cart..." />
        ) : cartItems.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            text="Add some delicious food items from the menu."
            linkText="Browse Menu"
            linkTo="/menu"
          />
        ) : (
          <div className="cart-content-grid">
            <div className="cart-list">
              {cartItems.map((item) => (
                <div className="cart-item-card" key={item.id}>
                  <div className="cart-food-left">
                    <img
                      src={
                        item.foodItem?.imageUrl ||
                        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
                      }
                      alt={item.foodItem?.name}
                      className="cart-food-image"
                    />

                    <div className="cart-food-details">
                      <span className="cart-item-badge">Cart Item</span>

                      <h2>{item.foodItem?.name}</h2>

                      <p className="cart-item-price">
                        Rs. {Number(item.foodItem?.price || 0).toFixed(2)}
                      </p>

                      <p className="cart-item-description">
                        {item.foodItem?.description || "No description available"}
                      </p>
                    </div>
                  </div>

                  <div className="cart-food-actions">
                    <label>Quantity</label>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, e.target.value)}
                    />

                    <button
                      className="cart-remove-btn"
                      onClick={() => openRemoveModal(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="cart-summary-card">
              <div className="cart-summary-title-row">
                <div>
                  <h2>Cart Summary</h2>
                  <p>Check your cart details before checkout.</p>
                </div>

                <div className="cart-summary-icon">🧾</div>
              </div>

              <div className="cart-summary-row">
                <span>Food Types</span>
                <strong>{cartData.foodTypes}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Total Quantity</span>
                <strong>{cartData.totalQuantity}</strong>
              </div>

              <div className="cart-summary-row total-row">
                <span>Total Amount</span>
                <strong>Rs. {cartData.totalAmount.toFixed(2)}</strong>
              </div>

              <div className="cart-summary-actions">
                <button
                  className="full-btn"
                  onClick={() => navigate("/customer/checkout")}
                >
                  Proceed to Checkout
                </button>

                <Link to="/menu" className="outline-full-btn">
                  Continue Shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </section>

      {itemToRemove && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card">
            <button
              className="confirm-modal-close"
              onClick={closeRemoveModal}
              disabled={removing}
            >
              ✕
            </button>

            <div className="confirm-modal-icon">🗑️</div>

            <h2>Remove Item?</h2>

            <p>
              Are you sure you want to remove{" "}
              <strong>{itemToRemove.foodItem?.name}</strong> from your cart?
            </p>

            <div className="confirm-modal-actions">
              <button
                className="confirm-cancel-btn"
                onClick={closeRemoveModal}
                disabled={removing}
              >
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={confirmRemoveItem}
                disabled={removing}
              >
                {removing ? "Removing..." : "Remove Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={
            toast.type === "success"
              ? "cart-toast cart-toast-success"
              : "cart-toast cart-toast-error"
          }
        >
          <button className="cart-toast-close" onClick={() => setToast(null)}>
            ✕
          </button>

          <div className="cart-toast-icon">
            {toast.type === "success" ? "✅" : "⚠️"}
          </div>

          <div className="cart-toast-content">
            <h3>{toast.title}</h3>
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerCart;