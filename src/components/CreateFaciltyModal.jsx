import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createFacility,
  clearFacilityState,
} from "../redux/slices/facilitySlice";
import {
  getDashboardUsers,
  clearDashboardErrors,
} from "../redux/slices/dashboardSlice";
import Toast from "../components/Toast";

const CreateFacilityModal = () => {
  const dispatch = useDispatch();

  // Facility form state
  const [facilityName, setFacilityName] = useState("");
  const [location, setLocation] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Get dashboard users data
  const { users, isLoading: isLoadingUsers } = useSelector(
    (state) => state.dashboard,
  );

  // Get facility creation state
  const { isCreating, error, successMessage } = useSelector(
    (state) => state.facility,
  );

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        // Reset search query when closing dropdown
        if (selectedUser) {
          const user = users.find((u) => u.id === selectedUser);
          setSearchQuery(user ? user.name : "");
        } else {
          setSearchQuery("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedUser, users]);

  useEffect(() => {
    dispatch(getDashboardUsers());
    return () => dispatch(clearDashboardErrors());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, "success");
      setFacilityName("");
      setLocation("");
      setSelectedUser("");
      setIsDropdownOpen(false);
      setSearchQuery("");
      dispatch(clearFacilityState());
      dispatch(getDashboardUsers());
    }

    if (error) {
      showToast(error, "error");
      dispatch(clearFacilityState());
    }
  }, [successMessage, error, dispatch]);

  // Update search query when selected user changes (to show their name in input)
  useEffect(() => {
    if (selectedUser) {
      const user = users.find((u) => u.id === selectedUser);
      setSearchQuery(user ? user.name : "");
    }
  }, [selectedUser, users]);

  const handleSubmit = () => {
    if (!facilityName.trim()) {
      showToast("Facility name is required", "error");
      return;
    }

    if (!location.trim()) {
      showToast("Location is required", "error");
      return;
    }

    dispatch(
      createFacility({
        name: facilityName,
        address: location,
        assign_to_user_id: selectedUser ? [selectedUser] : [],
      }),
    );
  };

  const handleSelectUser = (userId) => {
    setSelectedUser(userId);
    setIsDropdownOpen(false);
    // Don't clear search query - keep showing the selected user's name
  };

  const handleInputClick = () => {
    if (!isCreating && !isLoadingUsers) {
      setIsDropdownOpen(true);
      // When opening dropdown, if we have a selected user, start with their name as search
      if (selectedUser) {
        const user = users.find((u) => u.id === selectedUser);
        setSearchQuery(user ? user.name : "");
      }
      // Focus on input after a brief delay to ensure dropdown is rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 10);
    }
  };

  const handleInputChange = (e) => {
    if (isDropdownOpen) {
      // When dropdown is open, treat input as search
      setSearchQuery(e.target.value);
      // Clear selection if user starts typing
      if (selectedUser) {
        const user = users.find((u) => u.id === selectedUser);
        if (!e.target.value.includes(user?.name || "")) {
          setSelectedUser("");
        }
      }
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      if (isDropdownOpen) {
        // If dropdown is open and Enter is pressed, try to select first matching user
        if (filteredUsers.length > 0) {
          handleSelectUser(filteredUsers[0].id);
        }
      } else {
        // If dropdown is closed, open it
        handleInputClick();
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedUser("");
    setSearchQuery("");
    if (isDropdownOpen && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="announcementModal">
      {/* Toast Component */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      <div className="row">
        {/* Facility Name */}
        <div className="form-group mb-20">
          <label className="fw-bold mb-2">Facility Name</label>
          <input
            type="text"
            className="form-control"
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            disabled={isCreating}
            placeholder="Enter facility name"
          />
        </div>

        {/* Location */}
        <div className="form-group mb-20">
          <label className="fw-bold mb-2">Location</label>
          <input
            type="text"
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isCreating}
            placeholder="Enter facility location"
          />
        </div>

        {/* Assign User - Right-side Dropdown */}
        <div className="form-group mb-30 position-relative" ref={dropdownRef}>
          <label className="fw-bold mb-2">Assign User</label>

          {/* Input field that acts as both display and search */}
          <div className="d-flex align-items-center position-relative">
            <input
              ref={inputRef}
              type="text"
              className="form-control"
              value={searchQuery}
              placeholder={
                isDropdownOpen
                  ? "Search users..."
                  : "Click to search/select user"
              }
              onChange={handleInputChange}
              onClick={handleInputClick}
              onKeyDown={handleInputKeyDown}
              disabled={isCreating || isLoadingUsers}
              style={{ cursor: "pointer" }}
            />
          </div>

          {/* Right-side dropdown */}
          {isDropdownOpen && !isCreating && !isLoadingUsers && (
            <div
              className="position-absolute bg-white border rounded shadow-sm"
              style={{
                zIndex: 1060,
                width: "100%",
                maxHeight: "350px",
                overflow: "hidden",
              }}>
              {/* Users List */}
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-3 small text-muted">
                    {searchQuery
                      ? "No users found"
                      : "Start typing to search users"}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="px-3 py-2 border-bottom"
                      style={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedUser === user.id ? "#e7f1ff" : "transparent",
                      }}
                      onClick={() => handleSelectUser(user.id)}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-medium">{user.name}</div>
                          <div className="text-muted small">
                            {user.role}
                            {user.facility_name && ` • ${user.facility_name}`}
                          </div>
                        </div>
                        {selectedUser === user.id && (
                          <i className="fas fa-check text-primary"></i>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          className="btn announceButton facilityButton"
          onClick={handleSubmit}
          disabled={isCreating}>
          {isCreating ? "Creating..." : "Add Facility"}
        </button>
      </div>
    </div>
  );
};

export default CreateFacilityModal;
