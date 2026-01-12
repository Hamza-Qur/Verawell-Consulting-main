import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import DynamicModal from "./DynamicModal";
import { getDashboardUsers } from "../redux/slices/dashboardSlice";
import { updateUserProfile } from "../redux/slices/userSlice";

const EmployeeDataTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    users: dashboardUsers,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useSelector((state) => state.dashboard);

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("team");
  const [selectedFacility, setSelectedFacility] = useState("All");
  const buttonRefs = useRef([]);

  useEffect(() => {
    dispatch(getDashboardUsers());
  }, [dispatch]);

  const handleDropdownToggle = (index, e) => {
    e.stopPropagation();

    if (buttonRefs.current[index]) {
      const rect = buttonRefs.current[index].getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 100,
      });
    }

    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const handleEdit = (rowData) => {
    setSelectedEmployee(rowData);
    setShowEditModal(true);
    setDropdownOpen(null);
  };

  const handleDelete = (rowData) => {
    alert(`Deleted Employee: ${rowData.employeeName} successfully`);
    setDropdownOpen(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  // Function to handle saving employee edits
  const handleSaveEmployee = (updatedData) => {
    console.log("Saving employee data:", updatedData);

    // Prepare data for updateUserProfile
    const profileData = {
      name: updatedData.employeeName,
      email: updatedData.email,
      phone_number: updatedData.phone,
    };

    // If there's a new profile picture, add it
    if (updatedData.profilePicture instanceof File) {
      profileData.profile_picture = updatedData.profilePicture;
    }

    dispatch(updateUserProfile(profileData)).then((result) => {
      if (result.payload?.success) {
        dispatch(getDashboardUsers()); // Refresh the list
        setShowEditModal(false);
        setSelectedEmployee(null);
      }
    });
  };

  // Function to get profile image URL
  const getProfileImage = (user) => {
    if (user.profile_picture) {
      if (user.profile_picture.startsWith("http")) {
        return user.profile_picture;
      }
      return `https://verawell.koderspedia.net${user.profile_picture}`;
    }

    if (user.profile_image_url) {
      return user.profile_image_url;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name || "User"
    )}&background=random&color=fff&size=128`;
  };

  // Filter users based on role and facility
  const filteredUsers =
    dashboardUsers?.filter((user) => {
      if (activeTab === "team" && user.role !== "team") return false;
      if (activeTab === "customer" && user.role !== "customer") return false;

      if (selectedFacility !== "All") {
        if (selectedFacility === "KFC Facility")
          return user.facility_name === "KFC" || user.facility === "KFC";
        if (selectedFacility === "Starbucks Facility")
          return (
            user.facility_name === "Starbucks" || user.facility === "Starbucks"
          );
        if (selectedFacility === "Burger King Facility")
          return (
            user.facility_name === "Burger King" ||
            user.facility === "Burger King"
          );
      }

      return true;
    }) || [];

  // Transform API users to match table structure
  const employeeData = filteredUsers.map((user) => ({
    id: user.id || "N/A",
    employeeName: user.name || "N/A",
    profileImage: getProfileImage(user),
    email: user.email || "N/A",
    phone: user.phone || user.phone_number || "N/A",
    formsUploaded: user.total_assessments || user.forms_count || "0",
    role: user.role || "N/A",
    facility: user.facility_name || user.facility || "N/A",
    originalData: user,
  }));

  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const columns = [
    {
      name: "employeeName",
      label: "Name",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowData = employeeData[tableMeta.rowIndex];
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={rowData.profileImage}
                alt={value}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <span>{value}</span>
            </div>
          );
        },
      },
    },
    {
      name: "id",
      label: "Employee ID",
    },
    {
      name: "email",
      label: "Email",
    },
    {
      name: "phone",
      label: "Phone",
    },
    {
      name: "formsUploaded",
      label: "Forms Uploaded",
    },
    {
      name: "role",
      label: "Role",
      options: {
        customBodyRender: (value) => (
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "12px",
              backgroundColor: value === "team" ? "#E5F4FF" : "#E5FFE5",
              color: value === "team" ? "#1976D2" : "#388E3C",
              fontSize: "0.85rem",
              fontWeight: 500,
              textTransform: "capitalize",
            }}>
            {value}
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
        customBodyRenderLite: (dataIndex) => {
          const rowData = employeeData[dataIndex];
          return (
            <div style={{ position: "relative", display: "inline-block" }}>
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
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 15, 20],
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: false,
    search: true,
    searchPlaceholder: "Search employees...",
    pagination: true,
    tableBodyHeight: "auto",
  };

  const facilityOptions = [
    { value: "All", label: "All Facilities" },
    { value: "KFC Facility", label: "KFC Facility" },
    { value: "Starbucks Facility", label: "Starbucks Facility" },
    { value: "Burger King Facility", label: "Burger King Facility" },
  ];

  // Edit Employee Modal Component
  const EditEmployeeModal = () => {
    const [formData, setFormData] = useState({
      employeeName: selectedEmployee?.employeeName || "",
      email: selectedEmployee?.email || "",
      phone: selectedEmployee?.phone || "",
      profilePicture: null,
      previewImage: selectedEmployee?.profileImage || "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          profilePicture: file,
          previewImage: URL.createObjectURL(file),
        }));
      }
    };

    const handleImageClick = () => {
      fileInputRef.current.click();
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      handleSaveEmployee(formData);
    };

    if (!showEditModal) return null;

    return createPortal(
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
        }}
        onClick={handleCloseEditModal}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            width: "90%",
            maxWidth: "500px",
          }}
          onClick={(e) => e.stopPropagation()}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}>
            <h3 style={{ margin: 0, color: "#8B2885" }}>
              Edit {selectedEmployee?.employeeName}
            </h3>
            <button
              onClick={handleCloseEditModal}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#666",
              }}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Profile Image */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                onClick={handleImageClick}
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  margin: "0 auto",
                  overflow: "hidden",
                  cursor: "pointer",
                  border: "2px dashed #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                {formData.previewImage ? (
                  <img
                    src={formData.previewImage}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Icon icon="mdi:camera" width="40" height="40" color="#666" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              <p style={{ marginTop: "8px", color: "#666", fontSize: "14px" }}>
                Click to change profile picture
              </p>
            </div>

            {/* Employee Name */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                Employee Name
              </label>
              <input
                type="text"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                }}
                required
              />
            </div>

            {/* Employee ID (Read-only) */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                Employee ID
              </label>
              <input
                type="text"
                value={selectedEmployee?.id || "N/A"}
                disabled
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  backgroundColor: "#f5f5f5",
                  color: "#666",
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                }}
                required
              />
            </div>

            {/* Phone Number */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}>
              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={isSubmitting}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  background: "white",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  color: "#666",
                  opacity: isSubmitting ? 0.6 : 1,
                }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#8B2885",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  color: "white",
                  fontWeight: "500",
                  opacity: isSubmitting ? 0.6 : 1,
                }}>
                {isSubmitting ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      {/* Tab and Filter Section */}
      <div
        style={{
          marginBottom: "20px",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}>
        <div
          style={{
            display: "flex",
            marginBottom: "20px",
            borderBottom: "1px solid #e0e0e0",
          }}>
          <button
            onClick={() => setActiveTab("team")}
            style={{
              padding: "10px 20px",
              backgroundColor: activeTab === "team" ? "#8B2885" : "transparent",
              color: activeTab === "team" ? "white" : "#666",
              border: "none",
              borderBottom: activeTab === "team" ? "3px solid #8B2885" : "none",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
              marginRight: "10px",
              borderRadius: "4px 4px 0 0",
              transition: "all 0.3s ease",
            }}>
            Team Members (
            {dashboardUsers?.filter((u) => u.role === "team").length || 0})
          </button>
          <button
            onClick={() => setActiveTab("customer")}
            style={{
              padding: "10px 20px",
              backgroundColor:
                activeTab === "customer" ? "#8B2885" : "transparent",
              color: activeTab === "customer" ? "white" : "#666",
              border: "none",
              borderBottom:
                activeTab === "customer" ? "3px solid #8B2885" : "none",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
              borderRadius: "4px 4px 0 0",
              transition: "all 0.3s ease",
            }}>
            Customers (
            {dashboardUsers?.filter((u) => u.role === "customer").length || 0})
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: "500", color: "#666" }}>
            Filter by Facility:
          </span>
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              minWidth: "200px",
              backgroundColor: "white",
              cursor: "pointer",
            }}>
            {facilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingUsers ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: "10px" }}>Loading users...</p>
        </div>
      ) : usersError ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#D32F2F" }}>
          <Icon icon="material-symbols:error-outline" width="48" height="48" />
          <p style={{ marginTop: "10px" }}>Error: {usersError}</p>
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
      ) : employeeData.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          <Icon icon="mdi:account-multiple" width="48" height="48" />
          <p style={{ marginTop: "10px" }}>
            No {activeTab === "team" ? "team members" : "customers"} found
            {selectedFacility !== "All" ? ` in ${selectedFacility}` : ""}.
          </p>
        </div>
      ) : (
        <div className="basic-data-table">
          <MUIDataTable
            title=""
            data={employeeData}
            columns={columns}
            options={options}
            className="overflow-hidden packageTable"
          />
        </div>
      )}

      {/* Edit Modal */}
      <EditEmployeeModal />

      {/* Dropdown Actions Menu */}
      {dropdownOpen !== null &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: buttonPosition.top,
              left: buttonPosition.left,
              backgroundColor: "white",
              border: "1px solid #E0E0E0",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              minWidth: "140px",
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                color: "#333",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F5F5F5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() => handleEdit(employeeData[dropdownOpen])}>
              <Icon icon="line-md:edit" width="18" height="18" color="#666" />
              <span>Edit</span>
            </div>
            <div
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                color: "#D32F2F",
                borderTop: "1px solid #F0F0F0",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F5F5F5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() => handleDelete(employeeData[dropdownOpen])}>
              <Icon
                icon="material-symbols:delete-outline"
                width="18"
                height="18"
                color="#D32F2F"
              />
              <span>Delete</span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default EmployeeDataTable;
