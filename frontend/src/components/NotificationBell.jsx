import { useCallback, useEffect, useRef, useState } from "react";
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
  const dropdownRef = useRef(null);

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

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
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

      {open && (
        <div className="notification-dropdown" id="notification-dropdown" role="region" aria-label="Notifications" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
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
              <div><Icon name="bell" size={32} /></div>
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
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); handleNotificationClick(notification); } }}
                  aria-label={`Open notification: ${notification.title}`}
                >
                  <div className="notification-item-icon">
                    <Icon name={getNotificationIcon(notification.type)} size={20} />
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
