import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

const EditAttendanceModal = ({
  attendanceData,
  isEditMode = false,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeID: "",
    facility: "",
    month: "",
    status: "",
    hoursWorked: "",
    checkInTime: "",
    checkOutTime: "",
    notes: "",
  });

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (isEditMode && attendanceData) {
      setFormData({
        employeeName: attendanceData.employeeName || "",
        employeeID: attendanceData.id || "",
        facility: attendanceData.facility || "",
        month: attendanceData.month || "",
        status: attendanceData.status || "",
        hoursWorked: attendanceData.hoursWorked || "",
        checkInTime: attendanceData.checkInTime || "09:00",
        checkOutTime: attendanceData.checkOutTime || "17:00",
        notes: attendanceData.notes || "",
      });
    } else {
      // Reset form for create mode
      setFormData({
        employeeName: "",
        employeeID: "",
        facility: "",
        month: "",
        status: "",
        hoursWorked: "",
        checkInTime: "09:00",
        checkOutTime: "17:00",
        notes: "",
      });
    }
  }, [isEditMode, attendanceData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (isEditMode) {
      alert(
        `Attendance record for ${formData.employeeName} updated successfully!`
      );
    } else {
      alert(
        `Attendance record for ${formData.employeeName} added successfully!`
      );
    }

    if (onClose) onClose();
  };

  // Generate months for dropdown (last 12 months)
  const getMonthOptions = () => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      months.push(`${monthName} ${year}`);
    }

    return months;
  };

  const calculateHours = () => {
    if (formData.checkInTime && formData.checkOutTime) {
      const [inHour, inMin] = formData.checkInTime.split(":").map(Number);
      const [outHour, outMin] = formData.checkOutTime.split(":").map(Number);

      let totalHours = outHour - inHour;
      let totalMinutes = outMin - inMin;

      if (totalMinutes < 0) {
        totalHours -= 1;
        totalMinutes += 60;
      }

      // Convert to decimal (e.g., 8.5 hours)
      const decimalHours = totalHours + totalMinutes / 60;

      // Update hours worked
      handleChange("hoursWorked", decimalHours.toFixed(1));
    }
  };

  // Auto-calculate hours when check-in/out times change
  useEffect(() => {
    if (formData.checkInTime && formData.checkOutTime) {
      calculateHours();
    }
  }, [formData.checkInTime, formData.checkOutTime]);

  return (
    <div className="announcementModal">
      <div className="row">
        <div className="col-md-12 mt-10 position-relative">
          <h4 style={{ marginBottom: "20px", color: "#8B2885" }}>
            {isEditMode ? "Edit Attendance Record" : "Add Attendance Record"}
          </h4>

          <div className="form-group">
            <label>Employee Name</label>
            <input
              type="text"
              className="form-control mb-10"
              placeholder="Enter employee name"
              value={formData.employeeName}
              onChange={(e) => handleChange("employeeName", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              className="form-control mb-10"
              placeholder="Employee ID"
              value={formData.employeeID}
              onChange={(e) => handleChange("employeeID", e.target.value)}
              readOnly={isEditMode}
            />
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Facility</label>
                <select
                  value={formData.facility}
                  onChange={(e) => handleChange("facility", e.target.value)}
                  className="form-control mb-10">
                  <option value="">Select Facility</option>
                  <option value="KFC">KFC</option>
                  <option value="Starbucks">Starbucks</option>
                  <option value="Burger King">Burger King</option>
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label>Month</label>
                <select
                  value={formData.month}
                  onChange={(e) => handleChange("month", e.target.value)}
                  className="form-control mb-10">
                  <option value="">Select Month</option>
                  {getMonthOptions().map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="form-control mb-10">
                  <option value="">Select Status</option>
                  <option value="On Site">On Site</option>
                  <option value="Leave">Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label>Hours Worked</label>
                <input
                  type="text"
                  className="form-control mb-10"
                  placeholder="Hours worked"
                  value={formData.hoursWorked}
                  onChange={(e) => handleChange("hoursWorked", e.target.value)}
                  readOnly // Auto-calculated from times
                />
              </div>
            </div>
          </div>

          <div className="d-flex gap-10 mt-20">
            <button
              className="btn announceButton flex-grow-1"
              onClick={handleSubmit}
              style={{ backgroundColor: "#8B2885", borderColor: "#8B2885" }}>
              <Icon
                icon={isEditMode ? "line-md:edit" : "line-md:plus"}
                width="20"
                height="20"
                style={{ marginRight: "8px" }}
              />
              {isEditMode ? "Update Attendance" : "Add Attendance"}
            </button>

            <button className="btn btn-secondary flex-grow-1" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAttendanceModal;
