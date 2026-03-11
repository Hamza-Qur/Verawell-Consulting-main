// src/components/AddDailyAttendanceModal.jsx (fixed)
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyFacilities } from "../redux/slices/facilitySlice";
import { Icon } from "@iconify/react";

const AddDailyAttendanceModal = ({ onClose, onSave, isSaving }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    startDateTime: "",
    endDateTime: "",
    facility_id: "", // This will store the actual facility_id (e.g., 3)
  });

  const [dateError, setDateError] = useState("");

  // Get facilities from facility slice
  const {
    myFacilities = { data: [] },
    isLoading: isLoadingFacilities = false,
  } = useSelector((state) => state.facility || {});

  const [facilities, setFacilities] = useState([]);

  // Get current date and time in local format for max attribute
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const maxDateTime = getCurrentDateTimeLocal();

  // Fetch facilities on component mount
  useEffect(() => {
    dispatch(getMyFacilities(1));
  }, [dispatch]);

  // Process facilities when they load - IMPORTANT: Use facility_id, not the assignment id
  useEffect(() => {
    if (myFacilities.data && myFacilities.data.length > 0) {
      const facilityList = myFacilities.data.map((facility) => ({
        assignmentId: facility.id, // This is the assignment ID (e.g., 24)
        facility_id: facility.facility_id, // This is the actual facility ID (e.g., 3)
        name: facility.facility_name || facility.name,
        address: facility.facility_address,
      }));
      setFacilities(facilityList);
    }
  }, [myFacilities]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear date error when user changes dates
    if (name === "startDateTime" || name === "endDateTime") {
      setDateError("");
    }
  };

  const validateDates = () => {
    const now = new Date();
    const startDate = new Date(formData.startDateTime);
    const endDate = new Date(formData.endDateTime);

    // Check if start date is in the future
    if (startDate > now) {
      setDateError("Start date cannot be in the future");
      return false;
    }

    // Check if end date is in the future
    if (endDate > now) {
      setDateError("End date cannot be in the future");
      return false;
    }

    // Check if end date is before start date
    if (endDate < startDate) {
      setDateError("End date cannot be before start date");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateDates()) {
      return;
    }

    // The formData.facility_id already contains the actual facility_id (e.g., 3)
    onSave(formData);
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #E0E0E0",
    fontSize: "14px",
    backgroundColor: "#fff",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "16px",
  };

  const errorStyle = {
    color: "#D32F2F",
    fontSize: "12px",
    marginTop: "5px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: "20px" }}>
        {/* Facility Dropdown */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              fontSize: "14px",
              color: "#333",
            }}>
            Facility <span style={{ color: "#D32F2F" }}>*</span>
          </label>
          <select
            name="facility_id"
            value={formData.facility_id}
            onChange={handleChange}
            required
            disabled={isLoadingFacilities || isSaving}
            style={selectStyle}>
            <option value="">
              {isLoadingFacilities
                ? "Loading facilities..."
                : "Select a facility"}
            </option>
            {facilities.map((facility) => (
              <option key={facility.assignmentId} value={facility.facility_id}>
                {facility.name}{" "}
                {facility.address ? `- ${facility.address}` : ""}
              </option>
            ))}
          </select>
          {isLoadingFacilities && (
            <div style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
              <Icon
                icon="mdi:loading"
                style={{
                  animation: "spin 1s linear infinite",
                  marginRight: "5px",
                }}
              />
              Loading facilities...
            </div>
          )}
        </div>

        {/* Start Date Time */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              fontSize: "14px",
              color: "#333",
            }}>
            Start Date & Time <span style={{ color: "#D32F2F" }}>*</span>
          </label>
          <input
            type="datetime-local"
            name="startDateTime"
            value={formData.startDateTime}
            onChange={handleChange}
            max={maxDateTime}
            required
            disabled={isSaving}
            style={{
              ...inputStyle,
              borderColor: dateError ? "#D32F2F" : "#E0E0E0",
            }}
          />
          <small
            style={{
              display: "block",
              fontSize: "11px",
              color: "#666",
              marginTop: "4px",
            }}>
            Cannot select future dates
          </small>
        </div>

        {/* End Date Time */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              fontSize: "14px",
              color: "#333",
            }}>
            End Date & Time <span style={{ color: "#D32F2F" }}>*</span>
          </label>
          <input
            type="datetime-local"
            name="endDateTime"
            value={formData.endDateTime}
            onChange={handleChange}
            max={maxDateTime}
            required
            disabled={isSaving}
            style={{
              ...inputStyle,
              borderColor: dateError ? "#D32F2F" : "#E0E0E0",
            }}
          />
          <small
            style={{
              display: "block",
              fontSize: "11px",
              color: "#666",
              marginTop: "4px",
            }}>
            Cannot select future dates
          </small>
        </div>

        {/* Date Error Message */}
        {dateError && (
          <div style={errorStyle}>
            <Icon icon="mdi:alert-circle" width="16" height="16" />
            {dateError}
          </div>
        )}

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "30px",
          }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: "8px 16px",
              border: "1px solid #E0E0E0",
              backgroundColor: "white",
              color: "#333",
              borderRadius: "6px",
              cursor: isSaving ? "not-allowed" : "pointer",
              fontSize: "14px",
            }}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || isLoadingFacilities}
            style={{
              padding: "8px 16px",
              border: "none",
              backgroundColor:
                isSaving || isLoadingFacilities ? "#cccccc" : "#8B2885",
              color: "white",
              borderRadius: "6px",
              cursor:
                isSaving || isLoadingFacilities ? "not-allowed" : "pointer",
              fontSize: "14px",
              opacity: isSaving || isLoadingFacilities ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
            {isSaving ? (
              <>
                <Icon
                  icon="mdi:loading"
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Adding...
              </>
            ) : (
              "Add Attendance"
            )}
          </button>
        </div>
      </div>

      {/* CSS for spinner animation */}
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
    </form>
  );
};

export default AddDailyAttendanceModal;
