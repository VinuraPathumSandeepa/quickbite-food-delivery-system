import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function NotificationBell() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (currentUser?.id) {
      loadNotifications();

      const interval = setInterval(() => {
        loadNotifications();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const notificationResponse = await api.get(
        `/notifications/user/${currentUser.id}`
      );

      const countResponse = await api.get(
        `/notifications/user/${currentUser.id}/unread-count`
      );

      setNotifications(notificationResponse.data);
      setUnreadCount(countResponse.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

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

  const getNotificationIcon = (type) => {
    if (type === "NEW_ORDER") return "📦";
    if (type === "DELIVERY_ASSIGNED") return "🚚";
    return "🔔";
  };

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

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        className="notification-bell-btn"
        onClick={() => setOpen((previous) => !previous)}
        title="Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <div>
              <h3>Notifications</h3>
              <p>{unreadCount} unread notification(s)</p>
            </div>

            {unreadCount > 0 && (
              <button onClick={markAllAsRead}>Mark all read</button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">
              <div>🔕</div>
              <strong>No notifications</strong>
              <p>New updates will appear here.</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.slice(0, 8).map((notification) => (
                <div
                  className={
                    notification.readStatus
                      ? "notification-item notification-clickable"
                      : "notification-item unread-notification notification-clickable"
                  }
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-item-icon">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="notification-item-content">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <span>
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>

                    <div className="notification-actions">
                      {!notification.readStatus && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          Mark Read
                        </button>
                      )}

                      <button
                        className="notification-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
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
      )}
    </div>
  );
}

export default NotificationBell;