// src/components/EditDailyAttendanceModal.jsx
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
  const [durationInfo, setDurationInfo] = useState({
    text: "",
    isValid: true,
    isOverMax: false,
    isUnderMin: false,
    isZero: false,
  });

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

      const start = formatDateForInput(attendanceData.originalData?.start_time);
      const end = formatDateForInput(attendanceData.originalData?.end_time);

      setFormData({
        startDateTime: start,
        endDateTime: end,
        facility_id: attendanceData.facility_id || "",
      });

      // Calculate initial duration
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        // Check if dates are the same
        if (startDate.getTime() === endDate.getTime()) {
          setDurationInfo({
            text: "0h 0m",
            isValid: false,
            isOverMax: false,
            isUnderMin: false,
            isZero: true,
          });
        } else {
          const duration = calculateDuration(start, end);
          if (duration) {
            const validation = validateDuration(duration);
            setDurationInfo({
              text: duration.formatted,
              ...validation,
            });
          }
        }
      }
    }
  }, [attendanceData, isEditMode]);

  const calculateDuration = (start, end) => {
    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffHours = (endDate - startDate) / (1000 * 60 * 60);

    if (diffHours <= 0) return null;

    const hours = Math.floor(diffHours);
    const minutes = Math.floor((diffHours - hours) * 60);

    return {
      hours,
      minutes,
      totalHours: diffHours,
      formatted: `${hours}h ${minutes}m`,
    };
  };

  const validateDuration = (duration) => {
    if (!duration)
      return {
        isValid: true,
        isOverMax: false,
        isUnderMin: false,
        isZero: false,
      };

    const isOverMax = duration.totalHours > 24;
    const isUnderMin = duration.totalHours < 0.5 && duration.totalHours > 0;
    const isZero = duration.totalHours === 0;
    const isValid = !isOverMax && !isUnderMin && !isZero;

    return { isValid, isOverMax, isUnderMin, isZero };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // Calculate and validate duration when both dates are set
      if (newData.startDateTime && newData.endDateTime) {
        const startDate = new Date(newData.startDateTime);
        const endDate = new Date(newData.endDateTime);

        // Check if dates are the same
        if (startDate.getTime() === endDate.getTime()) {
          setDurationInfo({
            text: "0h 0m",
            isValid: false,
            isOverMax: false,
            isUnderMin: false,
            isZero: true,
          });
        } else {
          const duration = calculateDuration(
            newData.startDateTime,
            newData.endDateTime,
          );
          if (duration) {
            const validation = validateDuration(duration);
            setDurationInfo({
              text: duration.formatted,
              ...validation,
            });
          } else {
            setDurationInfo({
              text: "",
              isValid: true,
              isOverMax: false,
              isUnderMin: false,
              isZero: false,
            });
          }
        }
      } else {
        setDurationInfo({
          text: "",
          isValid: true,
          isOverMax: false,
          isUnderMin: false,
          isZero: false,
        });
      }

      return newData;
    });

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

    // Check if dates are the same (zero duration)
    if (startDate.getTime() === endDate.getTime()) {
      setDateError("Start and end times cannot be the same");
      return false;
    }

    // Check duration limits
    if (durationInfo.isOverMax) {
      setDateError("Attendance period cannot exceed 24 hours");
      return false;
    }

    if (durationInfo.isUnderMin) {
      setDateError("Attendance period must be at least 30 minutes");
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

  const getDurationColor = () => {
    if (durationInfo.isZero) return "#D32F2F";
    if (durationInfo.isOverMax || durationInfo.isUnderMin) return "#D32F2F";
    return "#28a745";
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

          {/* Duration display with color coding */}
          {durationInfo.text && (
            <div
              style={{
                fontSize: "13px",
                color: getDurationColor(),
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight:
                  durationInfo.isZero ||
                  durationInfo.isOverMax ||
                  durationInfo.isUnderMin
                    ? "500"
                    : "400",
                padding: "4px 8px",
                backgroundColor:
                  durationInfo.isZero ||
                  durationInfo.isOverMax ||
                  durationInfo.isUnderMin
                    ? "#ffebee"
                    : "#f0f9f0",
                borderRadius: "4px",
              }}>
              <Icon
                icon={
                  durationInfo.isZero ||
                  durationInfo.isOverMax ||
                  durationInfo.isUnderMin
                    ? "mdi:alert-circle"
                    : "mdi:clock-check"
                }
                width="16"
                height="16"
              />
              <span>
                Duration: {durationInfo.text}
                {durationInfo.isZero &&
                  " (Start and end times cannot be the same)"}
                {durationInfo.isOverMax && " (Exceeds 24h limit)"}
                {durationInfo.isUnderMin && " (Below 30min minimum)"}
              </span>
            </div>
          )}

          {/* Time limit helper text */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "12px",
              fontSize: "11px",
              color: "#666",
              borderTop: "1px dashed #E0E0E0",
              paddingTop: "8px",
            }}>
            <span>• Max: 24 hours</span>
            <span>• Min: 30 minutes</span>
            <span>• Cannot be same time</span>
          </div>
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
            disabled={
              isSaving ||
              isLoadingFacilities ||
              !durationInfo.isValid ||
              durationInfo.isZero
            }
            style={{
              padding: "8px 16px",
              border: "none",
              backgroundColor:
                isSaving ||
                isLoadingFacilities ||
                !durationInfo.isValid ||
                durationInfo.isZero
                  ? "#cccccc"
                  : "#8B2885",
              color: "white",
              borderRadius: "6px",
              cursor:
                isSaving ||
                isLoadingFacilities ||
                !durationInfo.isValid ||
                durationInfo.isZero
                  ? "not-allowed"
                  : "pointer",
              fontSize: "14px",
              opacity:
                isSaving ||
                isLoadingFacilities ||
                !durationInfo.isValid ||
                durationInfo.isZero
                  ? 0.7
                  : 1,
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
