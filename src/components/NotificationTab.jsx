// src/components/NotificationTab.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../redux/slices/notificationSlice";

const NotificationTab = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, isFetching } = useSelector(
    (state) => state.notification,
  );

  const [activeTab, setActiveTab] = useState("all");

  // Fetch notifications when component mounts
  useEffect(() => {
    dispatch(getMyNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const parseNotificationBody = (body) => {
    try {
      const parsed = JSON.parse(body);
      return {
        title: parsed.title || "Notification",
        message: parsed.body || parsed.message || "",
        userName: parsed.user_name,
        image: parsed.image,
        detail: parsed.detail,
      };
    } catch (error) {
      return {
        title: "Notification",
        message: body,
        userName: null,
        image: null,
        detail: null,
      };
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const getProfileImage = (notification) => {
    const parsed = parseNotificationBody(notification.body);
    if (parsed.image) {
      return parsed.image;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      parsed.userName || "User",
    )}&background=8B2885&color=fff&size=40`;
  };

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => !n.viewed);

  const refreshNotifications = () => {
    dispatch(getMyNotifications());
  };

  return (
    <div className="notification-tab" style={{ width: "350px", padding: "0" }}>
      {/* Header with title, refresh button, and mark all read */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e0e0e0",
        }}>
        {/* Left: Notifications title */}
        <h5 className="mb-0 fw-bold" style={{ margin: 0, color: "#333" }}>
          Notifications
        </h5>

        {/* Right: Refresh and Mark all read */}
        <div className="d-flex align-items-center gap-2">
          {/* Refresh button - icon only */}
          <button
            onClick={refreshNotifications}
            disabled={isFetching}
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: isFetching ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isFetching ? "#999" : "#666",
              transition: "all 0.2s",
              padding: "0",
            }}
            onMouseEnter={(e) =>
              !isFetching && (e.currentTarget.style.backgroundColor = "#f5f5f5")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            title="Refresh notifications">
            {isFetching ? (
              <Icon
                icon="mdi:loading"
                width="18"
                height="18"
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Icon icon="mdi:refresh" width="18" height="18" />
            )}
          </button>

          {/* Mark all read button */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn btn-sm"
              style={{
                fontSize: "14px",
                color: "#8B2885",
                background: "transparent",
                border: "none",
                padding: "4px 8px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f5f5f5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }>
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List - HIDE SCROLLBAR */}
      <div
        style={{
          maxHeight: "calc(80vh - 120px)",
          overflowY: "auto",
          /* Hide scrollbar for Chrome, Safari and Opera */
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* IE and Edge */,
        }}>
        {/* Hide scrollbar for Chrome, Safari and Opera */}
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {isFetching && notifications.length === 0 ? (
          <div className="text-center py-4">
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 small text-muted">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-4">
            <Icon
              icon="mdi:bell-off-outline"
              width="32"
              height="32"
              className="text-muted mb-2"
            />
            <p className="text-muted small mb-0">No notifications</p>
            {activeTab === "unread" && (
              <p className="text-muted small">All caught up!</p>
            )}
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const parsed = parseNotificationBody(notification.body);
            const isUnread = !notification.viewed;

            return (
              <div
                key={notification.id}
                className={`p-3 border-bottom ${isUnread ? "bg-light" : ""}`}
                style={{
                  cursor: "pointer",
                  borderLeft: isUnread ? "3px solid #8B2885" : "none",
                }}
                onClick={() => handleMarkAsRead(notification.id)}>
                <div className="d-flex align-items-start gap-2">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={getProfileImage(notification)}
                      alt={parsed.userName || "User"}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6
                        className="mb-0"
                        style={{
                          fontSize: "14px",
                          fontWeight: isUnread ? "600" : "500",
                          color: isUnread ? "#333" : "#666",
                        }}>
                        {parsed.title}
                      </h6>
                      <div className="d-flex align-items-center gap-1">
                        <small
                          className="text-muted"
                          style={{ fontSize: "11px" }}>
                          {formatTimeAgo(notification.created_at)}
                        </small>
                        {isUnread && (
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "#8B2885",
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <p
                      className="mb-1"
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: "1.4",
                      }}>
                      {parsed.message}
                    </p>

                    {parsed.userName && (
                      <small
                        className="text-primary"
                        style={{ fontSize: "12px", fontWeight: "500" }}>
                        From: {parsed.userName}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationTab;
