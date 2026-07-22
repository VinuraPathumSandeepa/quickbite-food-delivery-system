import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";

function OrderTracking() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const trackingSteps = [
    {
      key: "PENDING",
      title: "Order Placed",
      description: "Your order has been placed successfully.",
    },
    {
      key: "CONFIRMED",
      title: "Order Confirmed",
      description: "Restaurant confirmed your order.",
    },
    {
      key: "PREPARING",
      title: "Preparing Food",
      description: "Your food is being prepared.",
    },
    {
      key: "READY_FOR_PICKUP",
      title: "Ready for Pickup",
      description: "Food is ready and waiting for delivery.",
    },
    {
      key: "ASSIGNED_TO_DELIVERY",
      title: "Delivery Assigned",
      description: "A delivery person has been assigned.",
    },
    {
      key: "PICKED_UP",
      title: "Picked Up",
      description: "Delivery person picked up your food.",
    },
    {
      key: "ON_THE_WAY",
      title: "On the Way",
      description: "Your order is on the way.",
    },
    {
      key: "DELIVERED",
      title: "Delivered",
      description: "Your order has been delivered.",
    },
  ];

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load order.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return -1;

    if (order.status === "ACCEPTED_BY_DELIVERY") {
      return trackingSteps.findIndex(
        (step) => step.key === "ASSIGNED_TO_DELIVERY"
      );
    }

    return trackingSteps.findIndex((step) => step.key === order.status);
  };

  const getStepClass = (index) => {
    const currentIndex = getCurrentStepIndex();

    if (order?.status === "CANCELLED") {
      return "tracking-step cancelled-step";
    }

    if (index < currentIndex) {
      return "tracking-step completed-step";
    }

    if (index === currentIndex) {
      return "tracking-step active-step";
    }

    return "tracking-step";
  };

  const getReadableStatus = (status) => {
    if (!status) return "";
    return status.replaceAll("_", " ");
  };

  return (
    <div className="app-page">
      <Navbar />

      <PageHeader
        title={`Track Order #${orderId}`}
        subtitle="Follow your food delivery progress."
      />

      <section className="tracking-section">
        {message && <div className="error-box">{message}</div>}

        {loading ? (
          <LoadingSpinner text="Loading order tracking..." />
        ) : order ? (
          <>
            <div className="tracking-summary-card">
              <div>
                <h2>Current Status</h2>
                <StatusBadge status={order.status} />
              </div>

              <div>
                <h2>Payment</h2>
                <StatusBadge status={order.paymentStatus} type="payment" />
              </div>

              <div>
                <h2>Total</h2>
                <p className="big-total">
                  Rs. {Number(order.totalAmount).toFixed(2)}
                </p>
              </div>
            </div>

            {order.status === "CANCELLED" ? (
              <div className="cancelled-box">
                <h2>Order Cancelled</h2>
                <p>This order has been cancelled and will not be delivered.</p>
              </div>
            ) : (
              <div className="tracking-card">
                <h2>Delivery Progress</h2>

                <div className="tracking-timeline">
                  {trackingSteps.map((step, index) => (
                    <div className={getStepClass(index)} key={step.key}>
                      <div className="tracking-circle">
                        {index < getCurrentStepIndex() ? "✓" : index + 1}
                      </div>

                      <div className="tracking-content">
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="tracking-details-grid">
              <div className="tracking-info-card">
                <h2>Delivery Details</h2>

                <div className="tracking-info-row">
                  <strong>Delivery Address</strong>
                  <p>{order.deliveryAddress}</p>
                </div>

                <div className="tracking-info-row">
                  <strong>Order Notes</strong>
                  <p>{order.notes || "No notes"}</p>
                </div>

                <div className="tracking-info-row">
                  <strong>Delivery Person</strong>
                  <p>{order.deliveryPerson?.fullName || "Not assigned yet"}</p>
                </div>

                <div className="tracking-info-row">
                  <strong>Delivery Phone</strong>
                  <p>{order.deliveryPerson?.phone || "Not available yet"}</p>
                </div>
              </div>

              <div className="tracking-info-card">
                <h2>Payment Details</h2>

                <div className="tracking-info-row">
                  <strong>Payment Method</strong>
                  <p>{getReadableStatus(order.paymentMethod)}</p>
                </div>

                <div className="tracking-info-row">
                  <strong>Payment Status</strong>
                  <p>{getReadableStatus(order.paymentStatus)}</p>
                </div>

                <div className="tracking-info-row">
                  <strong>Payment Reference</strong>
                  <p>{order.paymentReference || "Not available"}</p>
                </div>

                <div className="tracking-info-row">
                  <strong>Order Date</strong>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="tracking-info-card">
              <h2>Ordered Items</h2>

              <div className="tracking-items-list">
                {order.orderItems.map((item) => (
                  <div className="tracking-item-row" key={item.id}>
                    <img
                      src={
                        item.foodItem.imageUrl ||
                        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
                      }
                      alt={item.foodItem.name}
                      className="tracking-item-image"
                    />

                    <div>
                      <h3>{item.foodItem.name}</h3>
                      <p>Qty: {item.quantity}</p>
                    </div>

                    <strong>Rs. {Number(item.price).toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="error-box">Order not found.</div>
        )}
      </section>
    </div>
  );
}

export default OrderTracking;