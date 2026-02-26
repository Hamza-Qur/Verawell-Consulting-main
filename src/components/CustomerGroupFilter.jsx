// src/components/CustomerGroupFilter.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../redux/slices/userSlice";

const CustomerGroupFilter = ({
  selectedGroup = "",
  onGroupChange,
  size = "md",
}) => {
  const dispatch = useDispatch();
  const { usersList = { data: [] }, isLoadingUsers = false } = useSelector(
    (state) => state.user || {},
  );

  const [inputValue, setInputValue] = useState(selectedGroup || "");
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch users once
  useEffect(() => {
    dispatch(getAllUsers({ page: 1, perPage: 100 }));
  }, [dispatch]);

  // Sync external value into input
  useEffect(() => {
    setInputValue(selectedGroup || "");
  }, [selectedGroup]);

  // Unique customer groups
  const uniqueGroups = useMemo(() => {
    if (!usersList.data?.length) return [];

    return [
      ...new Set(
        usersList.data
          .map((user) => user.user_group_name)
          .filter((g) => g && g.trim() !== ""),
      ),
    ].sort();
  }, [usersList.data]);

  // Filter suggestions
  const filteredGroups = useMemo(() => {
    if (!inputValue) return uniqueGroups;

    return uniqueGroups.filter((group) =>
      group.toLowerCase().includes(inputValue.toLowerCase()),
    );
  }, [uniqueGroups, inputValue]);

  // Typing = local only (NO API CALLS)
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Enter = commit
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && typeof onGroupChange === "function") {
      onGroupChange(inputValue);
      setShowDropdown(false);
    }
  };

  // Click suggestion = commit
  const handleGroupSelect = (group) => {
    setInputValue(group);
    if (typeof onGroupChange === "function") {
      onGroupChange(group);
    }
    setShowDropdown(false);
  };

  const sizeClass = size === "sm" ? "form-control-sm" : "";

  return (
    <div className="d-flex align-items-center">
      <div
        className="position-relative"
        style={{ width: "100%", maxWidth: "300px" }}>
        <div className="d-flex align-items-center">
          <i className="fas fa-tag me-2 text-muted"></i>
          <input
            type="text"
            className={`form-control ${sizeClass}`}
            placeholder="Filter by customer group..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => {
              // delay so click can register
              setTimeout(() => setShowDropdown(false), 200);
            }}
            disabled={isLoadingUsers}
            style={{ flex: 1 }}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && !isLoadingUsers && filteredGroups.length > 0 && (
          <div
            className="position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
            style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}>
            {filteredGroups.map((group) => (
              <div
                key={group}
                className="px-3 py-2"
                onMouseDown={() => handleGroupSelect(group)}
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    group === inputValue ? "#f0f0f0" : "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f8f9fa")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    group === inputValue ? "#f0f0f0" : "transparent")
                }>
                <i className="fas fa-users me-2 text-muted"></i>
                {group}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerGroupFilter;
