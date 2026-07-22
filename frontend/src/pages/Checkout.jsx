import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import {
  getBackendFieldErrors,
  validateCheckoutForm,
} from "../utils/validation";

function Checkout() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [formData, setFormData] = useState({
    deliveryAddress: currentUser?.address || "",
    paymentMethod: "COD",
    notes: "",
  });

  const [cardData, setCardData] = useState({
    cardHolderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoadingCart(true);

      const response = await api.get(`/cart/${currentUser.id}`);
      setCartItems(response.data);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to load cart.");
    } finally {
      setLoadingCart(false);
    }
  };

  const checkoutData = useMemo(() => {
    const subtotal = cartItems.reduce((total, item) => {
      return (
        total +
        Number(item.foodItem?.price || 0) * Number(item.quantity || 0)
      );
    }, 0);

    const totalQuantity = cartItems.reduce((total, item) => {
      return total + Number(item.quantity || 0);
    }, 0);

    return {
      subtotal,
      totalQuantity,
      foodTypes: cartItems.length,
      totalAmount: subtotal,
    };
  }, [cartItems]);

  const formatCardNumber = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 16);
    return digitsOnly.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiryDate = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 4);

    if (digitsOnly.length >= 3) {
      return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
    }

    return digitsOnly;
  };

  const formatCvv = (value) => {
    return value.replace(/\D/g, "").slice(0, 3);
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

    setErrorMessage("");
  };

  const handlePaymentMethodChange = (method) => {
    setFormData((previous) => ({
      ...previous,
      paymentMethod: method,
    }));

    setErrors((previous) => ({
      ...previous,
      paymentMethod: "",
    }));

    setErrorMessage("");
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = formatCardNumber(value);
    }

    if (name === "expiryDate") {
      formattedValue = formatExpiryDate(value);
    }

    if (name === "cvv") {
      formattedValue = formatCvv(value);
    }

    setCardData((previous) => ({
      ...previous,
      [name]: formattedValue,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    const validationErrors = validateCheckoutForm(formData, cardData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty. Please add food items first.");
      return;
    }

    try {
      setPlacingOrder(true);

      const orderResponse = await api.post(`/orders/place/${currentUser.id}`, {
        deliveryAddress: formData.deliveryAddress,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      });

      const order = orderResponse.data;

      const paymentResponse = await api.post(`/payments/order/${order.id}/pay`, {
        paymentMethod: formData.paymentMethod,
        provider: formData.paymentMethod === "CARD" ? "MOCK_CARD" : "COD",
      });

      const paidOrder = paymentResponse.data;

      setSuccessOrder({
        ...order,
        paymentReference:
          paidOrder?.paymentReference || order.paymentReference,
        paymentStatus: paidOrder?.paymentStatus || order.paymentStatus,
        status: paidOrder?.status || order.status,
      });
    } catch (error) {
      const backendErrors = getBackendFieldErrors(error);

      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
      } else {
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to place order. Please try again."
        );
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="app-page">
      <Navbar />

      <PageHeader
        title="Checkout"
        subtitle="Confirm delivery details, review your order, and complete checkout."
      />

      <section className="pro-checkout-section">
        {errorMessage && <div className="error-box">{errorMessage}</div>}

        {loadingCart ? (
          <LoadingSpinner text="Loading checkout..." />
        ) : cartItems.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Please add food items before checkout.</p>

            <button className="solid-btn" onClick={() => navigate("/menu")}>
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="pro-checkout-grid">
            <form className="pro-checkout-main-card" onSubmit={handleSubmit}>
              <div className="checkout-step-header">
                <div className="checkout-step-icon">📍</div>
                <div>
                  <span>Step 1</span>
                  <h2>Delivery Details</h2>
                  <p>Tell us where your food should be delivered.</p>
                </div>
              </div>

              <div className="checkout-field-group">
                <label>Delivery Address</label>
                <input
                  className={errors.deliveryAddress ? "input-error" : ""}
                  type="text"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  placeholder="Enter delivery address"
                />
                {errors.deliveryAddress && (
                  <span className="field-error">{errors.deliveryAddress}</span>
                )}
              </div>

              <div className="checkout-field-group">
                <label>Order Notes</label>
                <textarea
                  className={errors.notes ? "input-error" : ""}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Example: Please call before delivery"
                ></textarea>
                {errors.notes && (
                  <span className="field-error">{errors.notes}</span>
                )}
              </div>

              <div className="checkout-divider"></div>

              <div className="checkout-step-header">
                <div className="checkout-step-icon">💳</div>
                <div>
                  <span>Step 2</span>
                  <h2>Payment Method</h2>
                  <p>Choose how you want to complete the payment.</p>
                </div>
              </div>

              <div className="payment-method-grid">
                <button
                  type="button"
                  className={
                    formData.paymentMethod === "COD"
                      ? "payment-method-card active-payment-method"
                      : "payment-method-card"
                  }
                  onClick={() => handlePaymentMethodChange("COD")}
                >
                  <div className="payment-method-icon">💵</div>
                  <div>
                    <strong>Cash on Delivery</strong>
                    <span>Pay when the food is delivered</span>
                  </div>
                  <div className="payment-checkmark">✓</div>
                </button>

                <button
                  type="button"
                  className={
                    formData.paymentMethod === "CARD"
                      ? "payment-method-card active-payment-method"
                      : "payment-method-card"
                  }
                  onClick={() => handlePaymentMethodChange("CARD")}
                >
                  <div className="payment-method-icon">💳</div>
                  <div>
                    <strong>Card Payment Mock</strong>
                    <span>Use fake card details for demo</span>
                  </div>
                  <div className="payment-checkmark">✓</div>
                </button>
              </div>

              {errors.paymentMethod && (
                <span className="field-error">{errors.paymentMethod}</span>
              )}

              {formData.paymentMethod === "CARD" && (
                <div className="pro-card-payment-box">
                  <div className="mock-card-top">
                    <div>
                      <h3>Mock Card Details</h3>
                      <p>
                        This is only for demonstration. Real card details are
                        not stored.
                      </p>
                    </div>

                    <span>🔐</span>
                  </div>

                  <div className="checkout-field-group">
                    <label>Card Holder Name</label>
                    <input
                      className={errors.cardHolderName ? "input-error" : ""}
                      type="text"
                      name="cardHolderName"
                      value={cardData.cardHolderName}
                      onChange={handleCardChange}
                      placeholder="Example: Nimal Perera"
                    />
                    {errors.cardHolderName && (
                      <span className="field-error">
                        {errors.cardHolderName}
                      </span>
                    )}
                  </div>

                  <div className="checkout-field-group">
                    <label>Card Number</label>
                    <input
                      className={errors.cardNumber ? "input-error" : ""}
                      type="text"
                      name="cardNumber"
                      value={cardData.cardNumber}
                      onChange={handleCardChange}
                      placeholder="1111 2222 3333 4444"
                      maxLength="19"
                      inputMode="numeric"
                    />
                    {errors.cardNumber && (
                      <span className="field-error">{errors.cardNumber}</span>
                    )}
                  </div>

                  <div className="card-field-row">
                    <div className="checkout-field-group">
                      <label>Expiry Date</label>
                      <input
                        className={errors.expiryDate ? "input-error" : ""}
                        type="text"
                        name="expiryDate"
                        value={cardData.expiryDate}
                        onChange={handleCardChange}
                        placeholder="12/30"
                        maxLength="5"
                        inputMode="numeric"
                      />
                      {errors.expiryDate && (
                        <span className="field-error">
                          {errors.expiryDate}
                        </span>
                      )}
                    </div>

                    <div className="checkout-field-group">
                      <label>CVV</label>
                      <input
                        className={errors.cvv ? "input-error" : ""}
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleCardChange}
                        placeholder="123"
                        maxLength="3"
                        inputMode="numeric"
                      />
                      {errors.cvv && (
                        <span className="field-error">{errors.cvv}</span>
                      )}
                    </div>
                  </div>

                  <div className="sample-card-helper">
                    <strong>Sample Fake Card:</strong>
                    <span>1111 2222 3333 4444</span>
                    <span>12/30</span>
                    <span>123</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="checkout-place-order-btn"
                disabled={placingOrder}
              >
                {placingOrder ? "Processing Order..." : "Place Order"}
              </button>
            </form>

            <aside className="pro-checkout-summary-card">
              <div className="checkout-summary-header">
                <div>
                  <h2>Order Summary</h2>
                  <p>Review your food items before placing the order.</p>
                </div>

                <span>🧾</span>
              </div>

              <div className="checkout-item-list">
                {cartItems.map((item) => (
                  <div className="checkout-item" key={item.id}>
                    <img
                      src={
                        item.foodItem?.imageUrl ||
                        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
                      }
                      alt={item.foodItem?.name}
                    />

                    <div>
                      <strong>{item.foodItem?.name}</strong>
                      <p>
                        Qty: {item.quantity} × Rs.{" "}
                        {Number(item.foodItem?.price || 0).toFixed(2)}
                      </p>
                    </div>

                    <span>
                      Rs.{" "}
                      {(
                        Number(item.foodItem?.price || 0) *
                        Number(item.quantity || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-lines">
                <div>
                  <span>Food Types</span>
                  <strong>{checkoutData.foodTypes}</strong>
                </div>

                <div>
                  <span>Total Quantity</span>
                  <strong>{checkoutData.totalQuantity}</strong>
                </div>

                <div>
                  <span>Subtotal</span>
                  <strong>Rs. {checkoutData.subtotal.toFixed(2)}</strong>
                </div>

                <div className="checkout-total-line">
                  <span>Total Amount</span>
                  <strong>Rs. {checkoutData.totalAmount.toFixed(2)}</strong>
                </div>
              </div>

              <div className="checkout-safe-note">
                <span>🔒</span>
                <p>
                  Your order is processed securely. This project uses mock
                  payment only.
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>

      {successOrder && (
        <div className="order-success-overlay">
          <div className="order-success-card">
            <div className="order-success-icon">✅</div>

            <h2>Order Placed Successfully!</h2>

            <p>
              Your order has been created and the payment has been processed
              successfully.
            </p>

            <div className="order-success-details">
              <div>
                <span>Order ID</span>
                <strong>#{successOrder.id}</strong>
              </div>

              <div>
                <span>Total Amount</span>
                <strong>
                  Rs.{" "}
                  {Number(
                    successOrder.totalAmount || checkoutData.totalAmount
                  ).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Payment Method</span>
                <strong>
                  {formData.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : "Card Payment"}
                </strong>
              </div>

              <div>
                <span>Payment Reference</span>
                <strong>{successOrder.paymentReference || "Processing"}</strong>
              </div>
            </div>

            <div className="order-success-actions">
              <button
                className="solid-btn"
                onClick={() =>
                  navigate(`/customer/orders/${successOrder.id}/track`)
                }
              >
                Track Order
              </button>

              <button
                className="outline-btn"
                onClick={() => navigate("/customer/orders")}
              >
                View My Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;