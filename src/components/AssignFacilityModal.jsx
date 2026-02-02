// src/components/AssignFacilityModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../components/Toast";

// Import slice actions
import { getAllUsers } from "../redux/slices/userSlice"; // CHANGED: using userSlice instead
import { getMyFacilities } from "../redux/slices/facilitySlice";
import { getCategories } from "../redux/slices/formSlice";
import { assignAssessment } from "../redux/slices/facilitySlice";

const AssignFacilityModal = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();

  // Get the entire state first
  const fullState = useSelector((state) => state);

  // Destructure with fallbacks
  const userState = fullState.user || {}; // CHANGED: using user state instead of dashboard
  const facilityState = fullState.facility || {};
  const formState = fullState.form || {};

  const { usersList: { data: users = [] } = {}, isLoadingUsers = false } =
    userState;

  const {
    myFacilities = { data: [] },
    isLoading: isLoadingFacilities = false,
    isAssigningAssessment = false,
    successMessage: facilitySuccessMessage = "",
    error: facilityError = null,
  } = facilityState;

  const { categories = [], isLoading: isLoadingCategories = false } = formState;

  // Local form states
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Fetch facilities and categories on component mount
  useEffect(() => {
    dispatch(getMyFacilities(1));
    dispatch(getCategories());
  }, [dispatch]);

  // Fetch users when facility is selected
  useEffect(() => {
    if (selectedFacility) {
      // Clear previous user selection
      setSelectedUser("");

      // Fetch users with facility_id parameter
      dispatch(
        getAllUsers({
          page: 1,
          perPage: 100, // Get more users since it's filtered by facility
          facility_id: selectedFacility, // ADDED: facility filter parameter
        }),
      );
    } else {
      // Clear users list when no facility is selected
      setSelectedUser("");
    }
  }, [selectedFacility, dispatch]);

  // Show success toast messages
  useEffect(() => {
    if (facilitySuccessMessage) {
      showToast(facilitySuccessMessage, "success");
    }
  }, [facilitySuccessMessage]);

  // Show error toast messages from facility state
  useEffect(() => {
    if (facilityError) {
      showToast(facilityError, "error");
    }
  }, [facilityError]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedFacility || !selectedUser || !selectedCategory) {
      showToast("Please select Facility, User, and Category", "error");
      return;
    }

    // Prepare the assignment data
    const assignmentData = {
      category_id: selectedCategory,
      facility_id: selectedFacility,
      user_id: selectedUser,
    };

    // Dispatch the new assessment assignment action
    dispatch(assignAssessment(assignmentData))
      .then((result) => {
        if (result.payload?.success) {
          showToast("Assessment assigned successfully!", "success");

          // Call onSuccess callback if provided
          if (onSuccess) {
            onSuccess(assignmentData);
          }

          // Close modal after success
          if (onClose) {
            setTimeout(() => {
              onClose();
            }, 1500);
          }
        } else if (result.error) {
          // Show error from the rejected action
          const errorMessage = result.payload || "Failed to assign assessment";
          showToast(errorMessage, "error");
        }
      })
      .catch((error) => {
        // Catch any unexpected errors
        showToast("An unexpected error occurred", "error");
        console.error("Assignment error:", error);
      });
  };

  // Reset form when modal closes
  const handleClose = () => {
    setSelectedFacility("");
    setSelectedUser("");
    setSelectedCategory("");
    if (onClose) onClose();
  };

  // If any slice is missing, show a warning
  if (!fullState.user || !fullState.facility || !fullState.form) {
    return (
      <div className="announcementModal assignedFacilityModal">
        <div style={{ padding: "20px", textAlign: "center", color: "#D32F2F" }}>
          <h4>Missing Redux Slices</h4>
          <p>Please add the following reducers to your store:</p>
          <ul style={{ textAlign: "left", display: "inline-block" }}>
            {!fullState.user && <li>userReducer</li>}
            {!fullState.facility && <li>facilityReducer</li>}
            {!fullState.form && <li>formReducer</li>}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="announcementModal assignedFacilityModal">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />

      <form onSubmit={handleSubmit}>
        <div className="row position-relative">
          {/* Facility Selection - First and Full Width */}
          <div className="col-md-12">
            <div className="form-group mb-20">
              <label htmlFor="facilitySelect" className="fw-bold mb-2">
                Facility *
              </label>
              <select
                id="facilitySelect"
                className="form-control"
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                disabled={isAssigningAssessment || isLoadingFacilities}
                required>
                <option value="">Select Facility</option>
                {isLoadingFacilities ? (
                  <option disabled>Loading facilities...</option>
                ) : myFacilities &&
                  myFacilities.data &&
                  myFacilities.data.length > 0 ? (
                  myFacilities.data.map((facility) => (
                    <option
                      key={facility.id || facility.facility_id}
                      value={facility.id || facility.facility_id}>
                      {facility.facility_name || facility.name}
                      {facility.facility_address
                        ? ` - ${facility.facility_address}`
                        : ""}
                    </option>
                  ))
                ) : (
                  <option disabled>No facilities found</option>
                )}
              </select>
            </div>
          </div>

          {/* User Selection - Full Width (depends on facility) */}
          <div className="col-md-12">
            <div className="form-group mb-20">
              <label htmlFor="userSelect" className="fw-bold mb-2">
                Assign User *
              </label>
              <select
                id="userSelect"
                className="form-control"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={
                  isAssigningAssessment || isLoadingUsers || !selectedFacility
                }
                required>
                <option value="">
                  {!selectedFacility
                    ? "Select a facility first"
                    : "Select User"}
                </option>
                {isLoadingUsers && selectedFacility ? (
                  <option disabled>Loading users for this facility...</option>
                ) : users && users.length > 0 && selectedFacility ? (
                  users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.role || "User"}
                      {user.email ? ` (${user.email})` : ""}
                    </option>
                  ))
                ) : selectedFacility && !isLoadingUsers ? (
                  <option disabled>No users found for this facility</option>
                ) : null}
              </select>
              {selectedFacility && !isLoadingUsers && users.length === 0 && (
                <small className="text-muted d-block mt-1">
                  No users available for the selected facility
                </small>
              )}
            </div>
          </div>

          {/* Category Selection - Full Width */}
          <div className="col-md-12">
            <div className="form-group mb-20">
              <label htmlFor="categorySelect" className="fw-bold mb-2">
                Category *
              </label>
              <select
                id="categorySelect"
                className="form-control"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={isAssigningAssessment || isLoadingCategories}
                required>
                <option value="">Select Category</option>
                {isLoadingCategories ? (
                  <option disabled>Loading categories...</option>
                ) : categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No categories found</option>
                )}
              </select>
            </div>
          </div>

          {/* Submit Button - Full Width */}
          <div className="col-md-12 d-flex justify-content-end">
            <button
              type="submit"
              className="btn announceButton mt-10 w-100"
              disabled={
                isAssigningAssessment ||
                !selectedFacility ||
                !selectedUser ||
                !selectedCategory
              }>
              {isAssigningAssessment ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"></span>
                  Assigning...
                </>
              ) : (
                "Assign Assessment"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssignFacilityModal;
