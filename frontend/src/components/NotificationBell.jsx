import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

function NotificationBell() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [mobileTop, setMobileTop] = useState(68);
  const [mobileMaxHeight, setMobileMaxHeight] = useState(520);
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia("(max-width: 900px)").matches
  );
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);
  const closeRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const [notificationResponse, countResponse] = await Promise.all([
        api.get(`/notifications/user/${userId}`),
        api.get(`/notifications/user/${userId}/unread-count`),
      ]);
      setNotifications(notificationResponse.data);
      setUnreadCount(countResponse.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;
    void Promise.resolve().then(loadNotifications);
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [userId, loadNotifications]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const updateMobile = () => setIsMobile(media.matches);
    media.addEventListener("change", updateMobile);
    return () => media.removeEventListener("change", updateMobile);
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const visualViewport = window.visualViewport;
      const viewportBottom = visualViewport
        ? visualViewport.offsetTop + visualViewport.height
        : window.innerHeight;
      const bellBottom = bellRef.current?.getBoundingClientRect().bottom || 60;
      const top = Math.min(Math.max(12, bellBottom + 8), Math.max(12, viewportBottom - 168));
      setMobileTop(Math.round(top));
      setMobileMaxHeight(Math.max(120, Math.floor(viewportBottom - top - 12)));
    };
    const handlePointerDown = (event) => {
      if (
        !wrapperRef.current?.contains(event.target) &&
        !dropdownRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        bellRef.current?.focus();
      }
    };

    updatePosition();
    closeRef.current?.focus();
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    window.visualViewport?.addEventListener("resize", updatePosition);
    window.visualViewport?.addEventListener("scroll", updatePosition);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      window.visualViewport?.removeEventListener("resize", updatePosition);
      window.visualViewport?.removeEventListener("scroll", updatePosition);
    };
  }, [open, isMobile]);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(`/notifications/user/${currentUser.id}/read-all`);
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      loadNotifications();
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const getNotificationIcon = (type) => type === "NEW_ORDER" ? "orders" : type === "DELIVERY_ASSIGNED" ? "delivery" : "bell";

  const getRedirectPath = (notification) => {
    if (notification.type === "NEW_ORDER") {
      return `/admin/orders?orderId=${notification.relatedOrderId}`;
    }

    if (notification.type === "DELIVERY_ASSIGNED") {
      return `/delivery/assigned-orders?orderId=${notification.relatedOrderId}`;
    }

    if (currentUser?.role === "ADMIN") {
      return "/admin/dashboard";
    }

    if (currentUser?.role === "DELIVERY") {
      return "/delivery/dashboard";
    }

    return "/";
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.readStatus) {
        await api.put(`/notifications/${notification.id}/read`);
      }

      setOpen(false);
      loadNotifications();

      navigate(getRedirectPath(notification));
    } catch (error) {
      console.error("Failed to open notification", error);
    }
  };

  const renderNotification = (notification) => (
    <div
      className={notification.readStatus ? "notification-item" : "notification-item unread-notification"}
      key={notification.id}
    >
      <button
        className="notification-open"
        onClick={() => handleNotificationClick(notification)}
        aria-label={`Open notification: ${notification.title}`}
      >
        <span className="notification-item-icon">
          <Icon name={getNotificationIcon(notification.type)} size={20} />
        </span>
        <span className="notification-item-content">
          <strong>{notification.title}</strong>
          <span className="notification-message">{notification.message}</span>
          <span>{new Date(notification.createdAt).toLocaleString()}</span>
        </span>
      </button>
      <div className="notification-actions">
        {!notification.readStatus && (
          <button onClick={() => markAsRead(notification.id)}>Mark Read</button>
        )}
        <button
          className="notification-delete-btn"
          onClick={() => deleteNotification(notification.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );

  const panel = (
    <div
      className="notification-dropdown"
      id="notification-dropdown"
      ref={dropdownRef}
      role="region"
      aria-label="Notifications"
      style={{
        "--notification-mobile-top": `${mobileTop}px`,
        "--notification-mobile-max-height": `${mobileMaxHeight}px`,
      }}
    >
      <div className="notification-dropdown-header">
        <div>
          <h3>Notifications</h3>
          <p>{unreadCount} unread notification(s)</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead}>Mark all read</button>
        )}
        <button
          ref={closeRef}
          className="notification-close-btn"
          aria-label="Close notifications"
          onClick={() => { setOpen(false); bellRef.current?.focus(); }}
        >
          ✕
        </button>
      </div>
      {notifications.length === 0 ? (
        <div className="notification-empty">
          <div><Icon name="bell" size={32} /></div>
          <strong>No notifications</strong>
          <p>New updates will appear here.</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map(renderNotification)}
        </div>
      )}
    </div>
  );

  return (
    <div className="notification-wrapper" ref={wrapperRef}>
      <button
        ref={bellRef}
        className="notification-bell-btn"
        onClick={() => setOpen((previous) => !previous)}
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        aria-controls="notification-dropdown"
      >
        <Icon name="bell" size={22} />
        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (isMobile ? createPortal(panel, document.body) : panel)}
    </div>
  );
}

export default NotificationBell;
