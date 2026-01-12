import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createFacility,
  clearFacilityState,
} from "../redux/slices/facilitySlice";
import {
  getDashboardUsers,
  clearDashboardErrors,
} from "../redux/slices/dashboardSlice";
import Toast from "../components/Toast"; // <-- import the component

const CreateFacilityModal = () => {
  const dispatch = useDispatch();

  // Facility form state
  const [facilityName, setFacilityName] = useState("");
  const [location, setLocation] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  // Get dashboard users data
  const { users, isLoading: isLoadingUsers } = useSelector(
    (state) => state.dashboard
  );

  // Get facility creation state - This will now work!
  const { isCreating, error, successMessage } = useSelector(
    (state) => state.facility
  );

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

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
      dispatch(clearFacilityState());
      dispatch(getDashboardUsers());
    }

    if (error) {
      showToast(error, "error");
      dispatch(clearFacilityState());
    }
  }, [successMessage, error, dispatch]);

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
      })
    );
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
          />
        </div>

        {/* Assign User */}
        <div className="form-group mb-30">
          <label className="fw-bold mb-2">Assign User</label>
          <select
            className="form-control"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={isCreating || isLoadingUsers}>
            <option value="">Select User</option>
            {isLoadingUsers ? (
              <option disabled>Loading users...</option>
            ) : users.length > 0 ? (
              users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.role}
                  {user.facility_name ? ` (${user.facility_name})` : ""}
                </option>
              ))
            ) : (
              <option disabled>No users found</option>
            )}
          </select>
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
