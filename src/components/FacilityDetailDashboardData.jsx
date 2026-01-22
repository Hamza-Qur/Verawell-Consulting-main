import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAssignedAssessments } from "../redux/slices/formSlice";
import { addTask } from "../redux/slices/attendanceSlice";
import Toast from "../components/Toast"; // Import the Toast component

const FacilityDetailDashboardData = ({ rows }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [selectedFacility, setSelectedFacility] = useState("All");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  // Toast states
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const buttonRefs = useRef([]);

  // Get assigned assessments from Redux store
  const {
    assignedAssessments,
    isAssignedAssessmentsLoading,
    assignedAssessmentsError,
  } = useSelector((state) => state.form);

  // Get add task state from Redux
  const { isAddingTask, addTaskError, successMessage } = useSelector(
    (state) => state.attendance
  );

  // Fetch assigned assessments on component mount
  useEffect(() => {
    dispatch(getAssignedAssessments(1));
  }, [dispatch]);

  // Show toast when add task succeeds or fails
  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, "success");
    }
    if (addTaskError) {
      showToast(addTaskError, "error");
    }
  }, [successMessage, addTaskError]);

  // Get unique facilities from API data for filter tabs
  const getUniqueFacilities = () => {
    if (!assignedAssessments.data || assignedAssessments.data.length === 0) {
      return ["All"];
    }

    const facilities = ["All"];

    // Use actual facility_name from API
    assignedAssessments.data.forEach((assessment) => {
      const facilityName = assessment.facility_name || "Unknown Facility";
      if (facilityName && !facilities.includes(facilityName)) {
        facilities.push(facilityName);
      }
    });

    // Return unique facilities (limit to first 4 for UI)
    return [...new Set(facilities)].slice(0, 4);
  };

  const facilities = getUniqueFacilities();

  const handleFacilityFilter = (facility) => {
    setSelectedFacility(facility);
  };

  const handleDropdownToggle = (index, e) => {
    e.stopPropagation();

    if (buttonRefs.current[index]) {
      const rect = buttonRefs.current[index].getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }

    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const handleEdit = (row) => {
    showToast(`Edit Employee: ${row.formName} successfully`, "success");
    setDropdownOpen(null);
  };

  const handleDelete = (row) => {
    showToast(`Deleted Employee: ${row.formName} successfully`, "success");
    setDropdownOpen(null);
  };

  const handleClick = (index, e) => {
    handleDropdownToggle(index, e);
    const assessment = filteredData[index];
    navigate(
      `/facility-detail-page/${encodeURIComponent(assessment.category_name)}`
    );
  };

  const handleAddTask = (form) => {
    setSelectedForm(form);
    setShowAddTaskModal(true);
  };

  const handleSaveTask = (taskData) => {
    // Format the task data for API
    const apiTaskData = {
      title: taskData.title,
      description: taskData.description || "",
      start_time: taskData.startDateTime.split("T")[0], // YYYY-MM-DD format
      end_time: taskData.endDateTime.split("T")[0], // YYYY-MM-DD format
      assigned_assessment_id: taskData.assigned_assessment_id || 1, // Default or from selected form
    };

    // Dispatch the addTask action
    dispatch(addTask(apiTaskData)).then((action) => {
      if (action.payload?.success) {
        // Toast will be shown via useEffect when successMessage updates
        setShowAddTaskModal(false);
        setSelectedForm(null);
      }
      // Error toast will be shown via useEffect when addTaskError updates
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Toast helper function
  const showToast = (message, type = "info") => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  // Helper function to determine form status and task button state
  const getFormStatusInfo = (assessment) => {
    const submittedAssessmentId = assessment.submitted_assessment_id;
    const startTime = assessment.start_time;
    const endTime = assessment.end_time;

    // Logic based on your requirements:
    // 1. All null = form not submitted (in process)
    // 2. submitted_assessment_id exists, but times are null = form submitted, can add task
    // 3. submitted_assessment_id exists, and times exist = task already added

    if (submittedAssessmentId === null) {
      // Form not submitted - in process
      return {
        isCompleted: false,
        canShowTaskButton: false,
        taskButtonText: "Form In-Process",
        taskButtonDisabled: true,
        taskButtonStyle: {
          background: "#cccccc",
          cursor: "not-allowed",
          opacity: 0.6,
        },
        fillFormText: "Fill Form",
        fillFormIcon: "material-symbols:edit-document",
      };
    } else if (startTime === null && endTime === null) {
      // Form submitted, but times not set - can add task
      return {
        isCompleted: true,
        canShowTaskButton: true,
        taskButtonText: "Add Task",
        taskButtonDisabled: false,
        taskButtonStyle: {
          background: "#2196F3",
          cursor: "pointer",
        },
        fillFormText: "View Form",
        fillFormIcon: "ic:baseline-remove-red-eye",
      };
    } else {
      // Form submitted and times are set - task already added
      return {
        isCompleted: true,
        canShowTaskButton: true,
        taskButtonText: "Task Already Added",
        taskButtonDisabled: true,
        taskButtonStyle: {
          background: "#28a745",
          cursor: "not-allowed",
          opacity: 0.8,
        },
        fillFormText: "View Form",
        fillFormIcon: "ic:baseline-remove-red-eye",
      };
    }
  };

  // Transform API data to match the UI format
  const transformAssessmentData = () => {
    if (!assignedAssessments.data || assignedAssessments.data.length === 0) {
      return [];
    }

    return assignedAssessments.data.map((assessment) => {
      const formStatusInfo = getFormStatusInfo(assessment);

      // Parse dates if available
      const startTime = assessment.start_time
        ? new Date(assessment.start_time)
        : new Date();
      const endTime = assessment.end_time
        ? new Date(assessment.end_time)
        : new Date();

      // Format time (HH:MM:SS)
      const timeStr = assessment.start_time
        ? startTime.toTimeString().split(" ")[0]
        : "N/A";

      // Format date (e.g., "25 November, 2025")
      const dateStr = assessment.start_time
        ? startTime.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "N/A";

      // Calculate hours worked (difference between end and start time in hours)
      let hoursWorked = "N/A";
      if (assessment.start_time && assessment.end_time) {
        const diffMs = endTime - startTime;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        hoursWorked = diffHours.toString();
      }

      // Use category_name for form name
      const formName = assessment.category_name || "Assessment";

      // Use facility_name from API
      const facility = assessment.facility_name || "Unknown Facility";

      return {
        id: assessment.id,
        formName: formName,
        time: timeStr,
        date: dateStr,
        hoursWorked: hoursWorked,
        formStatus: formStatusInfo.isCompleted,
        facility: facility,
        canShowTaskButton: formStatusInfo.canShowTaskButton,
        taskButtonText: formStatusInfo.taskButtonText,
        taskButtonDisabled: formStatusInfo.taskButtonDisabled,
        taskButtonStyle: formStatusInfo.taskButtonStyle,
        fillFormText: formStatusInfo.fillFormText,
        fillFormIcon: formStatusInfo.fillFormIcon,
        // Original API data for reference (including assigned_assessment_id)
        originalData: assessment,
      };
    });
  };

  // Filter data based on selected facility
  const transformedData = transformAssessmentData();
  const filteredData =
    selectedFacility === "All"
      ? transformedData
      : transformedData.filter((item) => item.facility === selectedFacility);

  const employeeColumns = [
    { name: "formName", label: "Form Name" },
    {
      name: "time",
      label: "Time",
      options: {
        customBodyRender: (value) => (
          <span
            style={{
              color: value === "N/A" ? "#999999" : "#29BF5A",
              fontWeight: value === "N/A" ? 400 : 500,
            }}>
            {value}
          </span>
        ),
      },
    },
    {
      name: "date",
      label: "Date",
      options: {
        customBodyRender: (value) => (
          <span
            style={{
              color: value === "N/A" ? "#999999" : "#8B2885",
              fontWeight: value === "N/A" ? 400 : 500,
            }}>
            {value}
          </span>
        ),
      },
    },
    {
      name: "hoursWorked",
      label: "Hours Worked",
      options: {
        customBodyRender: (value) => (
          <span
            style={{
              color: value === "N/A" ? "#999999" : "#000000",
              fontWeight: value === "N/A" ? 400 : 500,
            }}>
            {value === "N/A" ? "N/A" : `${value} hours`}
          </span>
        ),
      },
    },
    {
      name: "formStatus",
      label: "Form Status",
      options: {
        customBodyRender: (value) => {
          const style = {
            padding: "4px 8px",
            borderRadius: "12px",
            color: value ? "#28a745" : "#FF8104",
            fontWeight: 500,
            fontSize: "0.85rem",
            display: "inline-block",
            textAlign: "center",
            backgroundColor: value ? "#28a74563" : "#ff810430",
            border: value ? "solid 2px #28a745" : "solid 2px #FF8104",
          };
          return (
            <span style={style}>{value ? "Completed" : "In-Process"}</span>
          );
        },
      },
    },
    {
      name: "action",
      label: "Action",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const row = filteredData[dataIndex];

          // Update the handleActionClick function in FacilityDetailDashboardData.jsx
          const handleActionClick = () => {
            const row = filteredData[dataIndex];
            const isCompleted = row.formStatus;

            // Get the correct ID based on form status
            let assessmentId;

            if (isCompleted) {
              // For completed forms, use submitted_assessment_id
              assessmentId = row.originalData?.submitted_assessment_id;
            } else {
              // For incomplete forms, use assigned_assessment_id (which is the id field)
              assessmentId = row.originalData?.id;
            }

            // Validate we have an ID
            if (!assessmentId) {
              showToast("Cannot navigate: No assessment ID found", "error");
              return;
            }

            // Get category_id from the original data
            const categoryId = row.originalData?.category_id;

            // Get category name for form title
            const categoryName =
              row.originalData?.category_name || "Assessment";

            // Navigate to the appropriate route
            if (isCompleted) {
              // For completed forms: /view-form/{assessment_id}
              navigate(`/view-form/${assessmentId}`, {
                state: {
                  form: row,
                  assessmentId: assessmentId,
                  category_id: categoryId,
                  category_name: categoryName,
                  isCompleted: true,
                },
              });
            } else {
              // For incomplete forms: /fill-form/{assigned_assessment_id}
              navigate(`/fill-form/${assessmentId}`, {
                state: {
                  form: row,
                  assessmentId: assessmentId,
                  category_id: categoryId,
                  category_name: categoryName,
                  isCompleted: false,
                },
              });
            }
          };

          // Determine tooltip message
          let tooltipMessage = "Add task to timelogs";
          if (row.taskButtonText === "Task Already Added") {
            tooltipMessage = "Task has already been added to timelogs";
          } else if (row.taskButtonText === "Form In-Process") {
            tooltipMessage = "Cannot add task for forms in process";
          }

          return (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={handleActionClick}
                style={{
                  background: "#8B2885",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px 12px",
                  color: "white",
                  borderRadius: "7px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                <Icon icon={row.fillFormIcon} width="17" height="20" />
                {row.fillFormText}
              </button>

              {/* Show task button based on form status */}
              {row.canShowTaskButton && (
                <button
                  onClick={() =>
                    row.taskButtonDisabled ? null : handleAddTask(row)
                  }
                  style={{
                    border: "none",
                    cursor: row.taskButtonDisabled ? "not-allowed" : "pointer",
                    padding: "5px 12px",
                    color: "white",
                    borderRadius: "7px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    ...row.taskButtonStyle,
                  }}
                  disabled={row.taskButtonDisabled}
                  title={tooltipMessage}>
                  <Icon
                    icon={
                      row.taskButtonText === "Task Already Added"
                        ? "mdi:check-circle-outline"
                        : row.taskButtonText === "Add Task"
                        ? "mdi:plus-circle-outline"
                        : "mdi:clock-outline"
                    }
                    width="17"
                    height="20"
                  />
                  {row.taskButtonText}
                </button>
              )}
            </div>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: "none",
    rowsPerPageOptions: [5, 10, 15, 100],
    rowsPerPage: rows,
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: true,
    search: true,
    textLabels: {
      body: {
        noMatch: isAssignedAssessmentsLoading ? (
          <div>Loading assessments...</div>
        ) : assignedAssessmentsError ? (
          <div>Error: {assignedAssessmentsError}</div>
        ) : (
          "No assessments found"
        ),
      },
    },
  };

  // Add Task Modal Component
  const AddTaskModal = ({ form, onClose, onSave, isAdding }) => {
    const [taskData, setTaskData] = useState({
      title: form ? `${form.formName} - ${form.facility}` : "",
      description: "",
      startDateTime: new Date().toISOString().slice(0, 16),
      endDateTime: new Date(new Date().getTime() + 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16),
      // Get assigned_assessment_id from the form's original data
      assigned_assessment_id: form?.originalData?.id || 1,
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(taskData);
    };

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
        onClick={onClose}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            width: "90%",
            maxWidth: "500px",
            maxHeight: "90vh",
            overflowY: "auto",
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
              Add Task to Timelogs
            </h3>
            <button
              onClick={onClose}
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
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                Task Title
              </label>
              <input
                type="text"
                value={taskData.title}
                onChange={(e) =>
                  setTaskData({ ...taskData, title: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                }}
                required
                disabled={isAdding}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                Facility
              </label>
              <input
                type="text"
                value={form?.facility || "Unknown Facility"}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
                disabled
                readOnly
              />
              <small
                style={{
                  color: "#666",
                  fontSize: "12px",
                  marginTop: "4px",
                  display: "block",
                }}>
                Facility is automatically set from the selected form
              </small>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={taskData.startDateTime.split("T")[0]}
                  onChange={(e) =>
                    setTaskData({
                      ...taskData,
                      startDateTime:
                        e.target.value +
                        "T" +
                        (taskData.startDateTime.split("T")[1] || "00:00"),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                  }}
                  required
                  disabled={isAdding}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={taskData.endDateTime.split("T")[0]}
                  onChange={(e) =>
                    setTaskData({
                      ...taskData,
                      endDateTime:
                        e.target.value +
                        "T" +
                        (taskData.endDateTime.split("T")[1] || "00:00"),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                  }}
                  required
                  disabled={isAdding}
                />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                Description
              </label>
              <textarea
                value={taskData.description}
                onChange={(e) =>
                  setTaskData({ ...taskData, description: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  minHeight: "80px",
                  resize: "vertical",
                }}
                placeholder="Add task details..."
                disabled={isAdding}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  background: "white",
                  cursor: "pointer",
                  color: "#666",
                }}
                disabled={isAdding}>
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#8B2885",
                  cursor: "pointer",
                  color: "white",
                  fontWeight: "500",
                  opacity: isAdding ? 0.7 : 1,
                }}
                disabled={isAdding}>
                {isAdding ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"></span>
                    Adding...
                  </>
                ) : (
                  "Add to Timelogs"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  // Show loading state
  if (isAssignedAssessmentsLoading) {
    return (
      <>
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}>
            {["All", "Loading..."].map((facility) => (
              <button
                key={facility}
                style={{
                  padding: "8px 25px",
                  borderRadius: "0px",
                  borderBottom: "3px solid transparent",
                  backgroundColor: "transparent",
                  color: "#000",
                  fontWeight: "500",
                  fontSize: "16px",
                  cursor: "default",
                  minWidth: "auto",
                  textAlign: "center",
                }}>
                {facility}
              </button>
            ))}
          </div>
        </div>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "200px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading assessments...</span>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (assignedAssessmentsError) {
    return (
      <>
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}>
            {["All"].map((facility) => (
              <button
                key={facility}
                onClick={() => handleFacilityFilter(facility)}
                style={{
                  padding: "8px 25px",
                  borderRadius: "0px",
                  borderBottom: "3px solid",
                  borderColor:
                    selectedFacility === facility ? "#8B2885" : "transparent",
                  backgroundColor: "transparent",
                  color: selectedFacility === facility ? "#8B2885" : "#000",
                  fontWeight: "500",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  minWidth: "auto",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  if (selectedFacility !== facility) {
                    e.currentTarget.style.borderColor = "#8B2885";
                    e.currentTarget.style.color = "#8B2885";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFacility !== facility) {
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.color = "#000";
                  }
                }}>
                {facility}
              </button>
            ))}
          </div>
        </div>
        <div className="alert alert-danger" role="alert">
          Error loading assessments: {assignedAssessmentsError}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => dispatch(getAssignedAssessments(1))}>
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
        duration={3000}
      />

      {/* Facility Filter Tabs */}
      <div
        style={{
          marginBottom: "20px",
          borderBottom: "1px solid #E0E0E0",
          paddingBottom: "0px",
        }}>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}>
          {facilities.map((facility) => (
            <button
              key={facility}
              onClick={() => handleFacilityFilter(facility)}
              style={{
                padding: "8px 25px",
                borderRadius: "0px",
                borderBottom: "3px solid",
                borderColor:
                  selectedFacility === facility ? "#8B2885" : "transparent",
                backgroundColor:
                  selectedFacility === facility ? "transparent" : "transparent",
                color: selectedFacility === facility ? "#8B2885" : "#000",
                fontWeight: "500",
                fontSize: "16px",
                cursor: "pointer",
                transition: "all 0.2s",
                minWidth: "auto",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                if (selectedFacility !== facility) {
                  e.currentTarget.style.borderColor = "#8B2885";
                  e.currentTarget.style.color = "#8B2885";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFacility !== facility) {
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.color = "#000";
                }
              }}>
              {facility}
            </button>
          ))}
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No assessments found
          {selectedFacility !== "All" ? ` for ${selectedFacility}` : ""}.
        </div>
      ) : (
        <div>
          <MUIDataTable
            data={filteredData}
            columns={employeeColumns}
            options={options}
            className="overflow-hidden packageTable"
          />
        </div>
      )}

      {/* Portal dropdown to body */}
      {dropdownOpen !== null &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: buttonPosition.top,
              left: buttonPosition.left - 100,
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              minWidth: "120px",
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onClick={() => handleEdit(filteredData[dropdownOpen])}>
              <Icon icon="line-md:edit" width="16" height="16" /> Edit
            </div>
            <div
              style={{
                padding: "8px 12px",
                color: "#D32F2F",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderTop: "1px solid #eee",
              }}
              onClick={() => handleDelete(filteredData[dropdownOpen])}>
              <Icon
                icon="material-symbols:delete-outline"
                width="16"
                height="16"
                color="#D32F2F"
              />{" "}
              Delete
            </div>
          </div>,
          document.body
        )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <AddTaskModal
          form={selectedForm}
          onClose={() => {
            setShowAddTaskModal(false);
            setSelectedForm(null);
          }}
          onSave={handleSaveTask}
          isAdding={isAddingTask}
        />
      )}
    </>
  );
};

export default FacilityDetailDashboardData;
