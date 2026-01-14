import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import NotificationTab from "./NotificationTab";

const NotificationDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null); 
  
  // Get unread count from Redux
  const { unreadCount } = useSelector((state) => state.notification);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false); 
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); 

  return (
    <div className="dropdown position-relative" ref={dropdownRef}>
      <button
        className="d-flex justify-content-center align-items-center rounded-circle position-relative"
        type="button"
        onClick={toggleDropdown} 
        ref={buttonRef}
        style={{ border: 'none', background: 'transparent' }}
      >
        <div className="notifyButton p-10 rounded-10">
          <Icon icon="material-symbols:notifications-outline" width="24" height="24" />
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                  style={{ 
                    fontSize: '10px', 
                    padding: '3px 6px',
                    minWidth: '18px',
                    height: '18px'
                  }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`notifyMain dropdown-menu ${isDropdownOpen ? "show" : ""}`}
        style={{
          position: "absolute",
          right: 0,
          left: "auto",
          marginTop: "10px",
          width: "367px",
          maxHeight: "80vh",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
        }}
      >
        <NotificationTab />
      </div>
    </div>
  );
};

export default NotificationDropdown;