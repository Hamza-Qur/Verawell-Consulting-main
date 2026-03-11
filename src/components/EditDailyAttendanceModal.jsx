// src/components/EditDailyAttendanceModal.jsx - CLEANED
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

const EditDailyAttendanceModal = ({
  attendanceData,
  isEditMode,
  onClose,
  onSave,
  isSaving,
  facilities = [],
  isLoadingFacilities = false,
}) => {
  const [formData, setFormData] = useState({
    startDateTime: "",
    endDateTime: "",
    facility_id: "",
  });

  const [dateError, setDateError] = useState("");

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

  useEffect(() => {
    if (attendanceData && isEditMode) {
      const formatDateForInput = (dateTimeStr) => {
        if (!dateTimeStr) return "";
        try {
          const [datePart, timePart] = dateTimeStr.split(" ");
          const [hours, minutes] = timePart.split(":");
          return `${datePart}T${hours}:${minutes}`;
        } catch (error) {
          return "";
        }
      };

      setFormData({
        startDateTime: formatDateForInput(
          attendanceData.originalData?.start_time,
        ),
        endDateTime: formatDateForInput(attendanceData.originalData?.end_time),
        facility_id: attendanceData.facility_id || "",
      });
    }
  }, [attendanceData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "startDateTime" || name === "endDateTime") {
      setDateError("");
    }
  };

  const validateDates = () => {
    const now = new Date();
    const startDate = new Date(formData.startDateTime);
    const endDate = new Date(formData.endDateTime);

    if (startDate > now) {
      setDateError("Start date cannot be in the future");
      return false;
    }

    if (endDate > now) {
      setDateError("End date cannot be in the future");
      return false;
    }

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

    const formatDateForAPI = (dateTimeStr) => {
      const [datePart, timePart] = dateTimeStr.split("T");
      const [year, month, day] = datePart.split("-");
      const [hours, minutes] = timePart.split(":");
      return `${year}-${month}-${day} ${hours}:${minutes}:13.000000`;
    };

    const apiData = {
      id: attendanceData.id,
      start_time: formatDateForAPI(formData.startDateTime),
      end_time: formatDateForAPI(formData.endDateTime),
      facility_id: parseInt(formData.facility_id, 10),
    };

    onSave(apiData);
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
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>

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
        </div>

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
        </div>

        {dateError && (
          <div style={errorStyle}>
            <Icon icon="mdi:alert-circle" width="16" height="16" />
            {dateError}
          </div>
        )}

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
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
};

export default EditDailyAttendanceModal;
