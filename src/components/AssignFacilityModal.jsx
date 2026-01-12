// src/components/AssignFacilityModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../components/Toast";

// Import slice actions
import { getDashboardUsers } from "../redux/slices/dashboardSlice";
import { getMyFacilities } from "../redux/slices/facilitySlice";
import { getCategories } from "../redux/slices/formSlice";
import { assignAssessment } from "../redux/slices/facilitySlice";

const AssignFacilityModal = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();

  // Get the entire state first
  const fullState = useSelector((state) => state);
  
  // Destructure with fallbacks
  const dashboardState = fullState.dashboard || {};
  const facilityState = fullState.facility || {};
  const formState = fullState.form || {};

  const { 
    users = [], 
    isLoading: isLoadingUsers = false 
  } = dashboardState;

  const { 
    myFacilities = { data: [] }, 
    isLoading: isLoadingFacilities = false,
    isAssigningAssessment = false,
    assignAssessmentError = null,
    successMessage: facilitySuccessMessage = ""
  } = facilityState;

  const { 
    categories = [], 
    isLoading: isLoadingCategories = false 
  } = formState;

  // Local form states
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getDashboardUsers());
    dispatch(getMyFacilities(1));
    dispatch(getCategories());
  }, [dispatch]);

  // Show toast messages - MOVED OUT OF CONDITIONAL
  useEffect(() => {
    if (facilitySuccessMessage) {
      showToast(facilitySuccessMessage, "success");
    }
  }, [facilitySuccessMessage]);

 // Add this debug useEffect
useEffect(() => {
  console.log("=== DEBUG DATA ===");
  console.log("Users:", users);
  console.log("Categories:", categories);
  console.log("Facilities data:", myFacilities.data);
  
  if (myFacilities.data && myFacilities.data.length > 0) {
    console.log("First facility object:", myFacilities.data[0]);
    console.log("First facility available IDs:", {
      id: myFacilities.data[0].id,
      facility_id: myFacilities.data[0].facility_id,
      allKeys: Object.keys(myFacilities.data[0])
    });
  }
}, [users, categories, myFacilities.data]);
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedUser || !selectedCategory || !selectedFacility) {
      showToast("Please select User, Category, and Facility", "error");
      return;
    }

    // Debug log
    console.log("Selected values:", {
      user_id: selectedUser,
      category_id: selectedCategory,
      facility_id: selectedFacility,
      user_id_type: typeof selectedUser,
      category_id_type: typeof selectedCategory,
      facility_id_type: typeof selectedFacility
    });

    // Prepare the assignment data
    const assignmentData = {
      category_id: selectedCategory,
      facility_id: selectedFacility,
      user_id: selectedUser,
    };

    console.log("Dispatching assignment:", assignmentData);

    // Dispatch the new assessment assignment action
    dispatch(assignAssessment(assignmentData)).then((result) => {
      console.log("Dispatch result:", result);
      
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
      }
    });
  };

  // If any slice is missing, show a warning
  if (!fullState.dashboard || !fullState.facility || !fullState.form) {
    return (
      <div className="announcementModal assignedFacilityModal">
        <div style={{ padding: "20px", textAlign: "center", color: "#D32F2F" }}>
          <h4>Missing Redux Slices</h4>
          <p>Please add the following reducers to your store:</p>
          <ul style={{ textAlign: "left", display: "inline-block" }}>
            {!fullState.dashboard && <li>dashboardReducer</li>}
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
          {/* User Selection - Full Width */}
          <div className="col-md-12">
            <div className="form-group mb-20">
              <label htmlFor="userSelect" className="fw-bold mb-2">Assign User *</label>
              <select
                id="userSelect"
                className="form-control"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={isAssigningAssessment || isLoadingUsers}
                required>
                <option value="">Select User</option>
                {isLoadingUsers ? (
                  <option disabled>Loading users...</option>
                ) : users && users.length > 0 ? (
                  users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.role || "User"}
                      {user.facility_name ? ` (${user.facility_name})` : ""}
                    </option>
                  ))
                ) : (
                  <option disabled>No users found</option>
                )}
              </select>
            </div>
          </div>

          {/* Category Selection - Full Width */}
          <div className="col-md-12">
            <div className="form-group mb-20">
              <label htmlFor="categorySelect" className="fw-bold mb-2">Category *</label>
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
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No categories found</option>
                )}
              </select>
            </div>
          </div>

          {/* Facility Selection - Full Width */}
          <div className="col-md-12">
            <div className="form-group mb-20">
              <label htmlFor="facilitySelect" className="fw-bold mb-2">Facility *</label>
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
                ) : myFacilities && myFacilities.data && myFacilities.data.length > 0 ? (
                  myFacilities.data.map((facility) => (
                    <option key={facility.id || facility.facility_id} value={facility.id || facility.facility_id}>
                      {facility.facility_name || facility.name}
                      {facility.facility_address ? ` - ${facility.facility_address}` : ""}
                    </option>
                  ))
                ) : (
                  <option disabled>No facilities found</option>
                )}
              </select>
            </div>
          </div>

          {/* Submit Button - Full Width */}
          <div className="col-md-12 d-flex justify-content-end">
            <button
              type="submit"
              className="btn announceButton mt-10 w-100"
              disabled={isAssigningAssessment}>
              {isAssigningAssessment ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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