import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import MUIDataTable from "mui-datatables";
import MasterLayout from "../otherImages/MasterLayout";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../components/Toast";
import {
  getAssignedUsers,
  assignUserToFacility,
  unassignUserFromFacility,
  updateFacility,
  deleteFacility,
} from "../redux/slices/facilitySlice";
import { getDashboardUsers } from "../redux/slices/dashboardSlice";

const AdminFacilityDetailPage = () => {
  const navigate = useNavigate();
  const { facilityId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  // Facility slice states
  const {
    assignedUsers,
    isFetchingAssignedUsers,
    assignedUsersError,
    isAssigning,
    isUnassigning,
    isUpdating,
    isDeleting,
    assignError,
    unassignError,
    updateError,
    deleteError,
    successMessage,
  } = useSelector((state) => state.facility);

  // Dashboard slice states
  const {
    users: dashboardUsers,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useSelector((state) => state.dashboard);

  const [facility, setFacility] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Initialize facility data from location state
  useEffect(() => {
    if (location.state?.facility) {
      const apiFacility = location.state.facility;
      setFacility(apiFacility);
      setEditForm({
        facilityName: apiFacility.facility_name || "N/A",
        address: apiFacility.facility_address || "No address",
        total_tasks: apiFacility.total_tasks || "0",
        total_assessments: apiFacility.total_assessments || "0",
        total_hours: apiFacility.total_hours || "0",
      });
    }
  }, [location.state]);

  // Fetch assigned users for this facility AND all users for display
  useEffect(() => {
    if (facility?.id) {
      dispatch(getAssignedUsers({ facilityId: facility.id, page: 1 }));
      // Fetch all users immediately when page loads
      dispatch(getDashboardUsers());
    }
  }, [dispatch, facility]);

  // Show toast messages
  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, "success");
    }
    if (assignError) {
      showToast(assignError, "error");
    }
    if (unassignError) {
      showToast(unassignError, "error");
    }
    if (updateError) {
      showToast(updateError, "error");
    }
    if (deleteError) {
      showToast(deleteError, "error");
    }
    if (usersError) {
      showToast(usersError, "error");
    }
  }, [
    successMessage,
    assignError,
    unassignError,
    updateError,
    deleteError,
    usersError,
  ]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      const actualFacilityId = facility.facility_id || facility.id;

      dispatch(
        updateFacility({
          facilityId: actualFacilityId,
          facilityData: {
            name: editForm.facilityName || "",
            address: editForm.address || "",
          },
        })
      ).then((result) => {
        if (result.payload?.success) {
          setFacility((prev) => ({
            ...prev,
            facility_name: editForm.facilityName,
            facility_address: editForm.address,
          }));
          showToast("Facility information updated successfully!", "success");
          setIsEditing(false);
        }
      });
    } else {
      setIsEditing(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveUser = (userId) => {
    const numericUserId = parseInt(userId.replace("U", ""));
    const actualFacilityId = facility.facility_id || facility.id;

    if (
      window.confirm(
        "Are you sure you want to remove this user from this facility?"
      )
    ) {
      dispatch(
        unassignUserFromFacility({
          facility_id: actualFacilityId,
          user_id: numericUserId,
        })
      ).then((result) => {
        if (result.payload?.success) {
          dispatch(getAssignedUsers({ facilityId: facility.id, page: 1 }));
        }
      });
    }
  };

  const handleAddUser = () => {
    if (!selectedUserId.trim()) {
      showToast("Please select a user", "error");
      return;
    }

    const actualFacilityId = facility.facility_id || facility.id;

    dispatch(
      assignUserToFacility({
        facility_id: actualFacilityId,
        user_id: parseInt(selectedUserId),
      })
    ).then((result) => {
      if (result.payload?.success) {
        dispatch(getAssignedUsers({ facilityId: facility.id, page: 1 }));
        setSelectedUserId("");
        setShowAddUserModal(false);
      }
    });
  };

  const handleDeleteFacility = () => {
    const actualFacilityId = facility.facility_id || facility.id;

    if (
      window.confirm(
        `Are you sure you want to delete ${facility?.facility_name}? This action cannot be undone.`
      )
    ) {
      dispatch(deleteFacility(actualFacilityId)).then((result) => {
        if (result.payload?.success) {
          showToast("Facility deleted successfully!", "success");
          navigate("/facilities");
        }
      });
    }
  };

  // Get already assigned user IDs to filter them out from dropdown
  const assignedUserIds = assignedUsers.data?.map((user) => user.user_id) || [];

  // Filter users to show only those not already assigned
  const availableUsers =
    dashboardUsers?.filter((user) => !assignedUserIds.includes(user.id)) || [];

  if (!facility) {
    return (
      <MasterLayout>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h3>Facility not found</h3>
          <button
            onClick={() => navigate("/facilities")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#8B2885",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}>
            Back to Facilities
          </button>
        </div>
      </MasterLayout>
    );
  }

  // Transform assigned users data for table
  const assignedEmployees =
    assignedUsers.data?.map((assignment) => {
      // Find user details from dashboard users
      const userDetails = dashboardUsers?.find(
        (user) => user.id === assignment.user_id
      );

      return {
        id: `${assignment.user_id}`,
        userId: assignment.user_id,
        name: assignment.name,
        role: assignment.role,
        email: assignment.email,
        assignmentDate: new Date(assignment.created_at).toLocaleDateString(),
        originalData: assignment,
      };
    }) || [];

  // Columns for users table
  const userColumns = [
    {
      name: "id",
      label: "User ID",
      options: {
        customBodyRender: (value) => (
          <span style={{ color: "#8B2885", fontWeight: 500 }}>{value}</span>
        ),
      },
    },
    {
      name: "name",
      label: "User Name",
    },
    {
      name: "role",
      label: "Role",
      options: {
        customBodyRender: (value) => (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "12px",
              backgroundColor:
                value === "admin"
                  ? "#FFE5E5"
                  : value === "team"
                  ? "#E5F4FF"
                  : value === "customer"
                  ? "#E5FFE5"
                  : "#F5F5F5",
              color:
                value === "admin"
                  ? "#D32F2F"
                  : value === "team"
                  ? "#1976D2"
                  : value === "customer"
                  ? "#388E3C"
                  : "#666",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}>
            {value?.charAt(0).toUpperCase() + value?.slice(1) || "Assigned"}
          </span>
        ),
      },
    },
    {
      name: "email",
      label: "Email",
    },
    {
      name: "assignmentDate",
      label: "Assigned Date",
    },
    {
      name: "actions",
      label: "Actions",
      options: {
        sort: false,
        filter: false,
        customBodyRender: (value, tableMeta) => {
          const user = assignedEmployees[tableMeta.rowIndex];
          return (
            <button
              onClick={() => handleRemoveUser(user.id)}
              disabled={isUnassigning}
              style={{
                background: "none",
                border: "1px solid #D32F2F",
                color: "#D32F2F",
                padding: "4px 12px",
                borderRadius: "4px",
                cursor: isUnassigning ? "not-allowed" : "pointer",
                opacity: isUnassigning ? 0.6 : 1,
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
              {isUnassigning ? (
                <>
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Removing...
                </>
              ) : (
                <>
                  <Icon
                    icon="material-symbols:delete-outline"
                    width="16"
                    height="16"
                  />
                  Remove
                </>
              )}
            </button>
          );
        },
      },
    },
  ];

  const userTableOptions = {
    selectableRows: "none",
    rowsPerPage: 10,
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: false,
    search: true,
    searchPlaceholder: "Search assigned users...",
    count: assignedUsers.total || 0,
    page: (assignedUsers.current_page || 1) - 1,
    onChangePage: (page) => {
      dispatch(getAssignedUsers({ facilityId: facility.id, page: page + 1 }));
    },
    // FIXED: Reduced padding from 16px to 8px
    setCellProps: () => ({
      style: {
        padding: "8px 16px",
      },
    }),
    setHeadCellProps: () => ({
      style: {
        padding: "12px 16px",
        fontWeight: "600",
        backgroundColor: "#f8f9fa",
      },
    }),
  };

  const getFacilityStatus = () => {
    const assessments = parseInt(facility.total_assessments) || 0;
    return assessments > 0;
  };

  const isCompleted = getFacilityStatus();

  return (
    <MasterLayout>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />

      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <div>
              <button
                onClick={() => navigate("/facilities")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8B2885",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  fontSize: "14px",
                }}>
                <Icon icon="mdi:arrow-left" width="20" height="20" />
                Back to Facilities
              </button>
              <h1 style={{ margin: "0", color: "#333" }}>
                {facility.facility_name || "N/A"}
              </h1>
              <p style={{ margin: "8px 0 0 0", color: "#666" }}>
                Facility ID: {facility.facility_id || facility.id || "N/A"} •
                Status:{" "}
                <span
                  style={{
                    color: isCompleted ? "#28a745" : "#FF8104",
                    fontWeight: 500,
                  }}>
                  {isCompleted ? "Has Assessments" : "No Assessments"}
                </span>
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleEditToggle}
                disabled={isUpdating}
                style={{
                  background: isEditing ? "#28a745" : "#2196F3",
                  border: "none",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: isUpdating ? "not-allowed" : "pointer",
                  opacity: isUpdating ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                }}>
                {isUpdating ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <Icon icon="material-symbols:save" width="18" height="18" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Icon icon="line-md:edit" width="18" height="18" />
                    Edit Facility
                  </>
                )}
              </button>
              <button
                onClick={handleDeleteFacility}
                disabled={isDeleting}
                style={{
                  background: "white",
                  border: "1px solid #D32F2F",
                  color: "#D32F2F",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                }}>
                {isDeleting ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Icon
                      icon="material-symbols:delete-outline"
                      width="18"
                      height="18"
                    />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "32px",
          }}>
          {/* Facility Information */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}>
            <h3 style={{ marginTop: "0", marginBottom: "20px", color: "#333" }}>
              Facility Information
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                    fontSize: "14px",
                  }}>
                  Facility Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="facilityName"
                    value={editForm.facilityName || ""}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                    }}
                  />
                ) : (
                  <p style={{ margin: "0", fontWeight: 500 }}>
                    {facility.facility_name || "N/A"}
                  </p>
                )}
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                    fontSize: "14px",
                  }}>
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={editForm.address || ""}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      minHeight: "80px",
                      resize: "vertical",
                    }}
                  />
                ) : (
                  <p style={{ margin: "0", fontWeight: 500 }}>
                    {facility.facility_address || "No address"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}>
            <h3 style={{ marginTop: "0", marginBottom: "20px", color: "#333" }}>
              Statistics
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                    fontSize: "14px",
                  }}>
                  Total Hours
                </label>
                <p
                  style={{
                    margin: "0",
                    fontWeight: "500",
                    color: facility.total_hours > 0 ? "#29BF5A" : "#999",
                  }}>
                  {facility.total_hours || "0"} hours
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                    fontSize: "14px",
                  }}>
                  Forms Submitted
                </label>
                <p style={{ margin: "0", fontWeight: 500, color: "#333" }}>
                  {facility.total_assessments || "0"}
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                    fontSize: "14px",
                  }}>
                  Total Tasks
                </label>
                <p
                  style={{
                    margin: "0",
                    fontWeight: 500,
                    color: "#333",
                    fontSize: "1.5rem",
                  }}>
                  {facility.total_tasks || "0"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Users Section */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "32px",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}>
            <h3 style={{ margin: "0", color: "#333" }}>Assigned Users</h3>
            <button
              onClick={() => setShowAddUserModal(true)}
              style={{
                background: "#8B2885",
                border: "none",
                color: "white",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
              }}>
              <Icon icon="mdi:account-plus" width="18" height="18" />
              Add User
            </button>
          </div>

          {isFetchingAssignedUsers ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p style={{ marginTop: "10px" }}>Loading assigned users...</p>
            </div>
          ) : assignedUsersError ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#D32F2F",
              }}>
              <p>Error loading assigned users: {assignedUsersError}</p>
            </div>
          ) : (
            <MUIDataTable
              data={assignedEmployees}
              columns={userColumns}
              options={userTableOptions}
            />
          )}
        </div>

        {/* Add User Modal */}
        {showAddUserModal && (
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
            onClick={() => !isAssigning && setShowAddUserModal(false)}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                width: "90%",
                maxWidth: "500px",
              }}
              onClick={(e) => e.stopPropagation()}>
              <h3
                style={{
                  marginTop: "0",
                  marginBottom: "20px",
                  color: "#333",
                }}>
                Add User to Facility
              </h3>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}>
                  Select User
                </label>
                <select
                  className="form-control"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={isAssigning || isLoadingUsers}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                  }}>
                  <option value="">Select User</option>
                  {isLoadingUsers ? (
                    <option disabled>Loading users...</option>
                  ) : availableUsers.length > 0 ? (
                    availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.role}
                        {user.facility_name ? ` (${user.facility_name})` : ""}
                      </option>
                    ))
                  ) : (
                    <option disabled>
                      {dashboardUsers?.length > 0
                        ? "All users are already assigned to this facility"
                        : "No users found"}
                    </option>
                  )}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  disabled={isAssigning}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    background: "white",
                    cursor: isAssigning ? "not-allowed" : "pointer",
                    color: "#666",
                    opacity: isAssigning ? 0.6 : 1,
                  }}>
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={
                    isAssigning ||
                    !selectedUserId.trim() ||
                    availableUsers.length === 0
                  }
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#8B2885",
                    cursor:
                      isAssigning ||
                      !selectedUserId.trim() ||
                      availableUsers.length === 0
                        ? "not-allowed"
                        : "pointer",
                    color: "white",
                    fontWeight: "500",
                    opacity:
                      isAssigning ||
                      !selectedUserId.trim() ||
                      availableUsers.length === 0
                        ? 0.6
                        : 1,
                  }}>
                  {isAssigning ? (
                    <>
                      <div
                        className="spinner-border spinner-border-sm me-2"
                        role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Adding...
                    </>
                  ) : (
                    "Add User"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MasterLayout>
  );
};

export default AdminFacilityDetailPage;
