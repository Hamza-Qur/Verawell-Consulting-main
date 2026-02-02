import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MUIDataTable from "mui-datatables";
import { createPortal } from "react-dom";
import DynamicModal from "./DynamicModal";
import CreateEmployeeModal from "./CreateEmployeeModal";
import { getDashboardUsers } from "../redux/slices/dashboardSlice";
import { adminUpdateUserProfile, deleteUser } from "../redux/slices/userSlice";

const EmployeeDashboardData = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get users from Redux store
  const { users, isLoading, error } = useSelector((state) => state.dashboard);

  const { isDeleting, isAdminUpdating } = useSelector((state) => state.user);

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone_number: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const buttonRefs = useRef([]);
  const deleteConfirmRef = useRef(null);
  const editModalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch users on component mount
  useEffect(() => {
    dispatch(getDashboardUsers());
  }, [dispatch]);

  useEffect(() => {
    const close = () => setDropdownOpen(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        deleteConfirmRef.current &&
        !deleteConfirmRef.current.contains(event.target)
      ) {
        setDeleteConfirmOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownToggle = (index, e) => {
    e.stopPropagation();
    const rect = buttonRefs.current[index]?.getBoundingClientRect();
    if (rect) {
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 120,
      });
    }
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const handleEditClick = (userId, index, e) => {
    e.stopPropagation();
    const user = users.find((u) => u.id === userId);
    if (user) {
      setEditUserId(userId);
      setEditFormData({
        name: user.name || "",
        phone_number: user.phone || user.phone_number || "",
      });
      // Set profile image preview from existing image
      if (user.profile_picture) {
        setProfileImagePreview(
          user.profile_picture.startsWith("http")
            ? user.profile_picture
            : `https://verawell.koderspedia.net${user.profile_picture}`,
        );
      } else {
        setProfileImagePreview(
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.name || "User",
          )}&background=random&color=fff&size=200`,
        );
      }
      setProfileImage(null);
      setSelectedEmployee(user);
      setShowEditModal(true);
      setDropdownOpen(null);
    }
  };

  const handleDeleteClick = (userId, index, e) => {
    e.stopPropagation();
    setDeleteUserId(userId);
    setDeleteConfirmOpen(index);
    setDropdownOpen(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    const user = users.find((u) => u.id === editUserId);
    if (user) {
      // Reset to original profile picture or default avatar
      if (user.profile_picture) {
        setProfileImagePreview(
          user.profile_picture.startsWith("http")
            ? user.profile_picture
            : `https://verawell.koderspedia.net${user.profile_picture}`,
        );
      } else {
        setProfileImagePreview(
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.name || "User",
          )}&background=random&color=fff&size=200`,
        );
      }
    }
  };

  const handleSaveEdit = () => {
    if (editUserId) {
      const updateData = {
        ...editFormData,
        ...(profileImage && { profile_picture: profileImage }),
      };

      dispatch(
        adminUpdateUserProfile({
          userId: editUserId,
          profileData: updateData,
        }),
      )
        .then((action) => {
          if (action.payload?.success) {
            // Refresh the user list
            dispatch(getDashboardUsers());
            // Close modal
            setShowEditModal(false);
            setEditUserId(null);
            setProfileImage(null);
            setSelectedEmployee(null);
          }
        })
        .catch(() => {
          // Error handling is already done in the slice
        });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteUserId) {
      dispatch(deleteUser(deleteUserId))
        .then((action) => {
          if (action.payload?.success) {
            // Refresh the user list
            dispatch(getDashboardUsers());
            setDeleteConfirmOpen(null);
            setDeleteUserId(null);
          }
        })
        .catch(() => {
          // Error handling is already done in the slice
        });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(null);
    setDeleteUserId(null);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditUserId(null);
    setSelectedEmployee(null);
    setEditFormData({
      name: "",
      phone_number: "",
    });
    setProfileImage(null);
    setProfileImagePreview("");
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Transform API data to match table structure
  const transformUserData = (apiData) => {
    // Sort by created_at (most recent first) and take first 5
    const sortedData = [...apiData]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return sortedData.map((user) => ({
      id: user.id || "N/A",
      employeeName: user.name || "N/A",
      employeeID: user.id || "N/A",
      facility: user.facility_name || "No Facility",
      hoursWorked: user.total_hours_worked || "0",
      formsSubmitted: user.total_assessments || "0",
      role: user.role || "N/A",
      email: user.email || "N/A",
      phone: user.phone_number || "N/A",
      originalData: user,
    }));
  };

  const employeeData = isLoading ? [] : transformUserData(users);

  const employeeColumns = [
    {
      name: "employeeName",
      label: "Employee Name",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowData = employeeData[tableMeta.rowIndex];
          return (
            <div>
              <div style={{ fontWeight: "500", color: "#1A1A1A" }}>{value}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {rowData.role}
              </div>
            </div>
          );
        },
      },
    },
    {
      name: "employeeID",
      label: "Employee ID",
      options: {
        customBodyRender: (value) => (
          <div style={{ color: "#666", fontFamily: "monospace" }}>{value}</div>
        ),
      },
    },
    {
      name: "facility",
      label: "Facility",
    },
    {
      name: "hoursWorked",
      label: "Hours Worked",
    },
    {
      name: "formsSubmitted",
      label: "Forms Submitted",
    },
    {
      name: "action",
      label: "Action",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          return (
            <div style={{ position: "relative" }}>
              <button
                ref={(el) => (buttonRefs.current[dataIndex] = el)}
                onClick={(e) => handleDropdownToggle(dataIndex, e)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                }}>
                <Icon icon="mdi:dots-horizontal" width="25" height="25" />
              </button>
            </div>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: "none",
    rowsPerPageOptions: [5, 10, 15, 100],
    rowsPerPage: 5,
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: false,
    search: true,
    pagination: false, // Add this line to disable pagination
    rowsPerPageOptions: [], // Remove rowsPerPageOptions
    rowsPerPage: employeeData.length,
  };

  return (
    <>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: "10px" }}>Loading employee data...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#D32F2F" }}>
          <Icon icon="material-symbols:error-outline" width="48" height="48" />
          <p style={{ marginTop: "10px" }}>Error: {error}</p>
          <button
            onClick={() => dispatch(getDashboardUsers())}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#8B2885",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}>
            Retry
          </button>
        </div>
      ) : (
        <div>
          <h2 className="fs-2 mt-24">Users</h2>
          {employeeData.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              <Icon icon="mdi:account-group" width="48" height="48" />
              <p style={{ marginTop: "10px" }}>No employee data found.</p>
            </div>
          ) : (
            <MUIDataTable
              data={employeeData}
              columns={employeeColumns}
              options={options}
              className="overflow-hidden packageTable"
            />
          )}
        </div>
      )}

      {/* Custom Edit Modal (replaces DynamicModal) */}
      {showEditModal &&
        selectedEmployee &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
            }}>
            <div
              ref={editModalRef}
              style={{
                backgroundColor: "white",
                padding: "24px",
                borderRadius: "12px",
                minWidth: "400px",
                maxWidth: "500px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}>
              <h3
                style={{
                  marginTop: 0,
                  color: "#333",
                  fontSize: "20px",
                  marginBottom: "24px",
                }}>
                Edit User
              </h3>

              {/* Profile Picture Section */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "24px",
                }}>
                <div style={{ position: "relative", marginBottom: "16px" }}>
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #8B2885",
                    }}
                  />
                  {profileImage && (
                    <button
                      onClick={handleRemoveImage}
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        background: "#D32F2F",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                      <Icon icon="mdi:close" width={16} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleTriggerFileInput}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f5f5f5",
                    color: "#333",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                  <Icon icon="mdi:image-edit" width={16} />
                  {profileImage ? "Change Image" : "Upload Image"}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />

                <p
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "8px",
                    textAlign: "center",
                  }}>
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 500,
                      color: "#555",
                    }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 500,
                      color: "#555",
                    }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={editFormData.phone_number}
                    onChange={handleEditInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "24px",
                  borderTop: "1px solid #eee",
                  paddingTop: "24px",
                }}>
                <button
                  onClick={handleCancelEdit}
                  disabled={isAdminUpdating}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#f5f5f5",
                    color: "#333",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    minWidth: "80px",
                  }}>
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isAdminUpdating}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#8B2885",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    minWidth: "80px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                  {isAdminUpdating ? (
                    <>
                      <Icon
                        icon="mdi:loading"
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:content-save" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen !== null &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
            }}>
            <div
              ref={deleteConfirmRef}
              style={{
                backgroundColor: "white",
                padding: "24px",
                borderRadius: "12px",
                minWidth: "400px",
                maxWidth: "500px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}>
              <h3 style={{ marginTop: 0, color: "#333", fontSize: "20px" }}>
                Confirm Delete
              </h3>

              <p
                style={{
                  color: "#666",
                  marginBottom: "24px",
                  lineHeight: "1.5",
                }}>
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "24px",
                }}>
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#f5f5f5",
                    color: "#333",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    minWidth: "80px",
                  }}>
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#D32F2F",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    minWidth: "80px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                  {isDeleting ? (
                    <>
                      <Icon
                        icon="mdi:loading"
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Icon icon="material-symbols:delete-outline" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {dropdownOpen !== null &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: buttonPosition.top,
              left: buttonPosition.left,
              backgroundColor: "white",
              border: "1px solid #E0E0E0",
              borderRadius: 8,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              minWidth: 140,
              zIndex: 9999,
            }}>
            <div
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
              onClick={(e) =>
                handleEditClick(employeeData[dropdownOpen]?.id, dropdownOpen, e)
              }>
              <Icon icon="line-md:edit" width={18} />
              Edit
            </div>
            <div
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                display: "flex",
                gap: 10,
                alignItems: "center",
                color: "#D32F2F",
                borderTop: "1px solid #F0F0F0",
              }}
              onClick={(e) =>
                handleDeleteClick(
                  employeeData[dropdownOpen]?.id,
                  dropdownOpen,
                  e,
                )
              }>
              <Icon icon="material-symbols:delete-outline" width={18} />
              Delete
            </div>
          </div>,
          document.body,
        )}

      {/* Add CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default EmployeeDashboardData;
