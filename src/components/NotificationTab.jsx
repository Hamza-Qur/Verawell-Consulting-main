
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";

const NotificationTab = () => {
  const [activeTab, setActiveTab] = useState("all");

  const notifications = [
        {
        id: 1,
        title: "Employee is on Off",
        description: "Message",
        time: "08:15",
        type: "today",
        status: "unread",
        },
        {
        id: 2,
        title: "Team Work Completed",
        description: "Update your Platform",
        time: "08:15",
        type: "today",
        status: "unread",
        },
        {
        id: 3,
        title: "Check in Miss",
        description: "Please check your",
        time: "08:15",
        type: "today",
        status: "read",
        },
        {
        id: 4,
        title: "Your Form reviewed",
        description: "Please check your",
        time: "08:15",
        type: "today",
        status: "read",
        },
        {
        id: 5,
        title: "System updates",
        description: "Please check new version...",
        time: "08:15",
        type: "yesterday",
        status: "read",
        },
        {
        id: 6,
        title: "New Facility Form Submitted",
        description: "Please check your...",
        time: "08:15",
        type: "yesterday",
        status: "read",
        },
  ];

  const filteredNotifications = notifications.filter(
    (notification) =>
      activeTab === "all" || notification.status === activeTab
  );

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h3>Notification</h3>
        <div className="tabs">
          <button
            onClick={() => setActiveTab("all")}
            className={activeTab === "all" ? "active" : ""}
          >
            All Notification
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={activeTab === "unread" ? "active" : ""}
          >
            Unread
          </button>
        </div>
      </div>

      {filteredNotifications.length > 0 ? (
        filteredNotifications.map((notification) => (
          <div key={notification.id} className={`notification-item ${notification.status}`}>
            <div className="notification-body">
              <div className="icon">
                <span className="bell-icon"><Icon icon="mdi:bell-outline" width="24" height="24" /></span>
              </div>
              <div className="text">
                <h4>{notification.title}</h4>
                <p>{notification.description}</p>
              </div>
              <div className="time">{notification.time}</div>
            </div>
          </div>
        ))
      ) : (
        <p>No notifications</p>
      )}

      {/* {filteredNotifications.some((n) => n.type === "today") && (
        <div className="date-section">
          <h5>TODAY</h5>
        </div>
      )}

      {filteredNotifications.some((n) => n.type === "yesterday") && (
        <div className="date-section">
          <h5>YESTERDAY</h5>
        </div>
      )} */}
    </div>
  );
};

export default NotificationTab;
