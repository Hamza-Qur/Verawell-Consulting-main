import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import NotificationTab from "./NotificationTab";

const NotificationDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null); 


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
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="d-flex justify-content-center align-items-center rounded-circle"
        type="button"
        onClick={toggleDropdown} 
        ref={buttonRef}
      >
        <div className="notifyButton p-10 rounded-10">
          <Icon icon="material-symbols:notifications-outline" width="24" height="24" />
        </div>
      </button>

      <div
        className={`notifyMain dropdown-menu to-top dropdown-menu-sm ${isDropdownOpen ? "show" : ""}`}
        style={{
          position: "absolute",
          inset: "0px 0px auto auto",
          margin: "0px",
          transform: "translate3d(0px, 42.4px, 0px)",
          height: "80vh",
          overflowY: "scroll",
          boxShadow: "1px 1px 10px #00000057",
        }}
      >
        {isDropdownOpen && <NotificationTab />}
      </div>
    </div>
  );
};

export default NotificationDropdown;
