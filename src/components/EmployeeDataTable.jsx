import React, { useState, useEffect, useRef, useMemo } from "react";
import MUIDataTable from "mui-datatables";
import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardUsers } from "../redux/slices/dashboardSlice";
import { adminUpdateUserProfile, deleteUser } from "../redux/slices/userSlice";
import { getMyFacilities } from "../redux/slices/facilitySlice";
import Toast from "../components/Toast"; // Import the Toast component

const EmployeeDataTable = () => {
  const dispatch = useDispatch();

  const {
    users: dashboardUsers,
    isLoading,
    error,
  } = useSelector((state) => state.dashboard);

  const { myFacilities, isFetching } = useSelector((state) => state.facility);

  const {
    isDeleting,
    deleteError,
    isAdminUpdating,
    adminUpdateError,
    adminUpdateSuccess,
  } = useSelector((state) => state.user);

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [activeTab, setActiveTab] = useState("team");
  const [selectedFacility, setSelectedFacility] = useState("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone_number: "",
    user_group_name: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  // Toast states
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const buttonRefs = useRef([]);
  const deleteConfirmRef = useRef(null);
  const editModalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(getDashboardUsers());
    dispatch(getMyFacilities());
  }, [dispatch]);

  // Show toast for delete success
  useEffect(() => {
    if (deleteError) {
      showToast("Failed to delete user", "error");
    }
  }, [deleteError]);

  // Show toast for admin update success
  useEffect(() => {
    if (adminUpdateSuccess) {
      showToast(adminUpdateSuccess, "success");
    }
    if (adminUpdateError) {
      showToast(adminUpdateError, "error");
    }
  }, [adminUpdateSuccess, adminUpdateError]);

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
      if (
        editModalRef.current &&
        !editModalRef.current.contains(event.target)
      ) {
        setEditModalOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (message, type = "info") => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  const hideToast = () => {
    setToast({
      show: false,
      message: "",
      type: "info",
    });
  };

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
    const user = filteredUsers.find((u) => u.id === userId);
    if (user) {
      setEditUserId(userId);
      setEditFormData({
        name: user.name || "",
        phone_number: user.phone || user.phone_number || "",
        user_group_name: user.user_group_name || "",
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
      setEditModalOpen(index);
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
    const user = filteredUsers.find((u) => u.id === editUserId);
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
        name: editFormData.name,
        phone_number: editFormData.phone_number,
        ...(profileImage && { profile_picture: profileImage }),
      };

      // Add user_group_name only for customers
      const user = filteredUsers.find((u) => u.id === editUserId);
      if (user?.role === "customer" && editFormData.user_group_name) {
        updateData.user_group_name = editFormData.user_group_name;
      }

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
            // Close modal immediately
            setEditModalOpen(null);
            setEditUserId(null);
            setProfileImage(null);
          }
        })
        .catch(() => {
          // Error handling is done via toast
        });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteUserId) {
      dispatch(deleteUser(deleteUserId))
        .then((action) => {
          if (action.payload?.success) {
            // Show success toast
            showToast("User deleted successfully!", "success");
            // Refresh the user list
            dispatch(getDashboardUsers());
            setDeleteConfirmOpen(null);
            setDeleteUserId(null);
          }
        })
        .catch(() => {
          // Error handling is done via toast
        });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(null);
    setDeleteUserId(null);
  };

  const handleCancelEdit = () => {
    setEditModalOpen(null);
    setEditUserId(null);
    setEditFormData({
      name: "",
      phone_number: "",
      user_group_name: "",
    });
    setProfileImage(null);
    setProfileImagePreview("");
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current.click();
  };

  const facilities = useMemo(() => {
    return myFacilities?.data?.data || [];
  }, [myFacilities]);

  const filteredUsers = useMemo(() => {
    return (dashboardUsers || []).filter((u) => {
      if (activeTab === "team" && u.role !== "team") return false;
      if (activeTab === "customer" && u.role !== "customer") return false;

      if (selectedFacility !== "all") {
        return Number(u.facility_id) === Number(selectedFacility);
      }

      return true;
    });
  }, [dashboardUsers, activeTab, selectedFacility]);

  const getProfileImage = (u) => {
    if (u.profile_picture) {
      return u.profile_picture.startsWith("http")
        ? u.profile_picture
        : `https://verawell.koderspedia.net${u.profile_picture}`;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      u.name || "User",
    )}&background=random&color=fff&size=128`;
  };

  const tableData = filteredUsers.map((u) => ({
    id: u.id,
    employeeName: u.name,
    email: u.email,
    phone: u.phone || u.phone_number,
    formsUploaded: u.total_assessments || 0,
    role: u.role,
    profileImage: getProfileImage(u),
  }));

  const columns = [
    {
      name: "employeeName",
      label: "Name",
      options: {
        customBodyRender: (_, meta) => {
          const row = tableData[meta.rowIndex];
          return (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <img
                src={row.profileImage}
                alt=""
                width={32}
                height={32}
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
              <span>{row.employeeName}</span>
            </div>
          );
        },
      },
    },
    { name: "id", label: "Employee ID" },
    { name: "email", label: "Email" },
    { name: "phone", label: "Phone" },
    { name: "formsUploaded", label: "Forms Uploaded" },
    {
      name: "role",
      label: "Role",
      options: {
        customBodyRender: (v) => (
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "12px",
              backgroundColor: v === "team" ? "#E5F4FF" : "#E5FFE5",
              color: v === "team" ? "#1976D2" : "#388E3C",
              fontSize: "0.85rem",
              fontWeight: 500,
              textTransform: "capitalize",
            }}>
            {v}
          </span>
        ),
      },
    },
    {
      name: "action",
      label: "Action",
      options: {
        sort: false,
        filter: false,
        customBodyRenderLite: (i) => (
          <button
            ref={(el) => (buttonRefs.current[i] = el)}
            onClick={(e) => handleDropdownToggle(i, e)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}>
            <Icon icon="mdi:dots-horizontal" width={22} />
          </button>
        ),
      },
    },
  ];

  return (
    <>
      {/* Toast Component */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        duration={3000}
      />

      {/* Tabs + Filter */}
      <div
        style={{
          borderRadius: 8,
        }}>
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e0e0e0",
          }}>
          {["team", "customer"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                backgroundColor: activeTab === tab ? "#8B2885" : "transparent",
                color: activeTab === tab ? "white" : "#666",
                border: "none",
                borderBottom: activeTab === tab ? "3px solid #8B2885" : "none",
                cursor: "pointer",
                fontWeight: 500,
              }}>
              {tab === "team" ? "Team Members" : "Customers"} (
              {dashboardUsers?.filter((u) => u.role === tab).length || 0})
            </button>
          ))}
        </div>
      </div>

      <div className="basic-data-table">
        <MUIDataTable
          title=""
          data={tableData}
          columns={columns}
          options={{
            selectableRows: "none",
            responsive: "standard",
            elevation: 0,
            print: false,
            download: false,
            viewColumns: false,
            filter: false,
            search: true,
            searchPlaceholder: "Search employees...",
            pagination: false, // REMOVED PAGINATION
          }}
          className="overflow-hidden packageTable"
        />
      </div>

      {/* Dropdown */}
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
                handleEditClick(tableData[dropdownOpen].id, dropdownOpen, e)
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
                handleDeleteClick(tableData[dropdownOpen].id, dropdownOpen, e)
              }>
              <Icon icon="material-symbols:delete-outline" width={18} />
              Delete
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

              {deleteError && (
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#FFEBEE",
                    color: "#D32F2F",
                    borderRadius: "6px",
                    marginBottom: "16px",
                    fontSize: "14px",
                  }}>
                  <Icon
                    icon="mdi:alert-circle"
                    style={{ marginRight: "8px" }}
                  />
                  {deleteError}
                </div>
              )}

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

      {/* Edit User Modal - SIMPLIFIED VERSION */}
      {editModalOpen !== null &&
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

              {/* Removed inline success/error messages - now using Toast */}

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

              {/* Customer Group Field - Only for customers */}
              {(() => {
                const user = filteredUsers.find((u) => u.id === editUserId);
                return (
                  user?.role === "customer" && (
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 500,
                          color: "#555",
                        }}>
                        Customer Group
                      </label>
                      <input
                        type="text"
                        name="user_group_name"
                        value={editFormData.user_group_name}
                        onChange={handleEditInputChange}
                        placeholder="Enter customer group"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  )
                );
              })()}

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

      {/* Add CSS for spinner animation */}
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
    </>
  );
};

export default EmployeeDataTable;
