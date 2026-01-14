import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateAttendance } from "../redux/slices/attendanceSlice";

const EditAttendanceModal = ({ attendanceData, isEditMode, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    user_id: "",
    assigned_assessment_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      return "";
    }
  };

  const formatDateForAPI = (dateTimeLocalString) => {
    if (!dateTimeLocalString) return "";
    
    try {
      const [datePart, timePart] = dateTimeLocalString.split('T');
      return `${datePart} ${timePart}:00`;
    } catch (error) {
      return "";
    }
  };

  useEffect(() => {
    if (attendanceData && isEditMode) {
      setFormData({
        id: attendanceData.id || "",
        title: attendanceData.title || "",
        description: attendanceData.description || "",
        start_time: formatDateForInput(attendanceData.originalData?.start_time),
        end_time: formatDateForInput(attendanceData.originalData?.end_time),
        user_id: attendanceData.originalData?.user_id || "",
        assigned_assessment_id: attendanceData.originalData?.assigned_assessment_id || "",
      });
    }
  }, [attendanceData, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const apiData = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      start_time: formatDateForAPI(formData.start_time),
      end_time: formatDateForAPI(formData.end_time),
      user_id: formData.user_id,
      assigned_assessment_id: formData.assigned_assessment_id,
    };

    dispatch(updateAttendance(apiData)).then((result) => {
      setIsSubmitting(false);
      
      if (result.payload?.success) {
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          // Fallback to old behavior
          onClose();
        }
      }
    }).catch((error) => {
      setIsSubmitting(false);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
          Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
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

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            fontSize: "14px",
            minHeight: "80px",
            resize: "vertical",
          }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
          Start Time
        </label>
        <input
          type="datetime-local"
          name="start_time"
          value={formData.start_time}
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

      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
          End Time
        </label>
        <input
          type="datetime-local"
          name="end_time"
          value={formData.end_time}
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

      <input type="hidden" name="user_id" value={formData.user_id} />
      <input type="hidden" name="assigned_assessment_id" value={formData.assigned_assessment_id} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={onClose}
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
              Updating...
            </>
          ) : (
            "Update Attendance"
          )}
        </button>
      </div>
    </form>
  );
};

export default EditAttendanceModal;