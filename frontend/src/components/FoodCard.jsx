import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function FoodCard({ food }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const imageUrl =
    food.imageUrl ||
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38";

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (toastData, autoClose = true) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast(toastData);

    if (autoClose) {
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
      }, 3500);
    }
  };

  const addToCart = async () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }

    if (currentUser.role !== "CUSTOMER") {
      showToast(
        {
          type: "error",
          title: "Customer Only",
          message: "Only customers can add food items to the cart.",
        },
        false
      );
      return;
    }

    try {
      await api.post(`/cart/${currentUser.id}/add`, {
        foodItemId: food.id,
        quantity: 1,
      });

      showToast({
        type: "success",
        title: "Added to Cart",
        message: `${food.name} was added to your cart successfully.`,
      });
    } catch (error) {
      showToast(
        {
          type: "error",
          title: "Cart Error",
          message:
            error.response?.data?.message || "Failed to add item to cart.",
        },
        false
      );
    }
  };

  return (
    <>
      <div className="food-card">
        <div className="food-image-wrap">
          <img src={imageUrl} alt={food.name} className="food-image" />
        </div>

        <div className="food-info">
          <p className="food-price">Rs. {Number(food.price).toFixed(2)}</p>
          <h3>{food.name}</h3>

          <p className="food-description">
            {food.description || "Restaurant recommended meal"}
          </p>

          <div className="food-meta">
            <span>⭐ {food.rating || 4.5}</span>
            <span>{food.preparationTimeMinutes || 20} mins</span>
          </div>

          <button className="small-order-btn" onClick={addToCart}>
            {currentUser ? "Add to Cart" : "Add to Cart"}
          </button>
        </div>
      </div>

      {showLoginPrompt && (
        <div className="login-prompt-overlay">
          <div className="login-prompt-card">
            <button
              className="login-prompt-close"
              onClick={() => setShowLoginPrompt(false)}
            >
              ✕
            </button>

            <div className="login-prompt-icon">🛒</div>

            <h2>Login Required</h2>

            <p>
              Please login or create an account to add food items to your cart
              and place an order.
            </p>

            <div className="login-prompt-actions">
              <button className="solid-btn" onClick={() => navigate("/login")}>
                Login
              </button>

              <button
                className="outline-btn"
                onClick={() => navigate("/register")}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`cart-toast ${toast.type === "success" ? "cart-toast-success" : "cart-toast-error"}`}>
          <button className="cart-toast-close" onClick={() => setToast(null)}>
            ✕
          </button>

          <div className="cart-toast-icon">
            {toast.type === "success" ? "✅" : "⚠️"}
          </div>

          <div className="cart-toast-content">
            <h3>{toast.title}</h3>
            <p>{toast.message}</p>

            {toast.type === "success" && (
              <div className="cart-toast-actions">
                <button onClick={() => setToast(null)}>Continue Shopping</button>

                <button
                  className="cart-toast-primary-btn"
                  onClick={() => navigate("/customer/cart")}
                >
                  View Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FoodCard;