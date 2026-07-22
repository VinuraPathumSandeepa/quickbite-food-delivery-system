function StatusBadge({ status, type = "order" }) {
  const formatStatus = (value) => {
    if (!value) return "Not Available";
    return value.replaceAll("_", " ");
  };

  const getClassName = () => {
    if (!status) return "badge neutral-badge";

    if (
      status === "DELIVERED" ||
      status === "PAID" ||
      status === "Active" ||
      status === "AVAILABLE" ||
      status === "Available"
    ) {
      return "badge success-badge";
    }

    if (
      status === "CANCELLED" ||
      status === "FAILED" ||
      status === "Inactive" ||
      status === "NOT_AVAILABLE" ||
      status === "Not Available"
    ) {
      return "badge danger-badge";
    }

    if (
      status === "PENDING" ||
      status === "CASH_ON_DELIVERY_PENDING"
    ) {
      return "badge warning-badge";
    }

    if (
      status === "ON_THE_WAY" ||
      status === "PICKED_UP" ||
      status === "ASSIGNED_TO_DELIVERY" ||
      status === "ACCEPTED_BY_DELIVERY"
    ) {
      return "badge info-badge";
    }

    return type === "payment" ? "badge payment-badge" : "badge primary-badge";
  };

  return <span className={getClassName()}>{formatStatus(status)}</span>;
}

export default StatusBadge;