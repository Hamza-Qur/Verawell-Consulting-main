import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAssignedAssessments } from "../redux/slices/formSlice";
import { addTask } from "../redux/slices/attendanceSlice";
import Toast from "../components/Toast";

const FacilityDetailDashboardData = ({ rows }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [selectedFacility, setSelectedFacility] = useState("All");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Toast states - track action types separately
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Track if this is the initial load
  const [initialLoad, setInitialLoad] = useState(true);

  const buttonRefs = useRef([]);

  // Get user role on component mount
  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role || "guest");
  }, []);

  // Check if user is customer
  const isCustomer = userRole === "customer";

  // Get assigned assessments from Redux store
  const {
    assignedAssessments,
    isAssignedAssessmentsLoading,
    assignedAssessmentsError,
  } = useSelector((state) => state.form);

  // Get add task state from Redux
  const { isAddingTask, addTaskError, successMessage } = useSelector(
    (state) => state.attendance,
  );

  // Fetch assigned assessments on component mount
  useEffect(() => {
    dispatch(getAssignedAssessments(1));
  }, [dispatch]);

  // Mark initial load as complete after data loads
  useEffect(() => {
    if (!isAssignedAssessmentsLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [isAssignedAssessmentsLoading, initialLoad]);

  // Show toast when add task succeeds or fails
  useEffect(() => {
    // Only show toast for addTask actions, not for initial data loading
    if (successMessage && successMessage.includes("Task")) {
      showToast(successMessage, "success");
    }
    if (addTaskError) {
      showToast(addTaskError, "error");
    }
  }, [successMessage, addTaskError]);

  const getUniqueFacilities = () => {
    if (!assignedAssessments.data || assignedAssessments.data.length === 0) {
      return ["All"];
    }

    const facilities = ["All"];

    assignedAssessments.data.forEach((assessment) => {
      const facilityName = assessment.facility_name || "Unknown Facility";
      if (facilityName && !facilities.includes(facilityName)) {
        facilities.push(facilityName);
      }
    });

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
      `/facility-detail-page/${encodeURIComponent(assessment.category_name)}`,
    );
  };

  const handleAddTask = (form) => {
    setSelectedForm(form);
    setShowAddTaskModal(true);
  };

  const handleSaveTask = (taskData) => {
    const apiTaskData = {
      title: taskData.title,
      description: taskData.description || "",
      start_time: taskData.startDateTime.split("T")[0],
      end_time: taskData.endDateTime.split("T")[0],
      assigned_assessment_id: taskData.assigned_assessment_id || 1,
    };

    dispatch(addTask(apiTaskData)).then((action) => {
      if (action.payload?.success) {
        showToast("Task added to timelogs successfully!", "success");
        setShowAddTaskModal(false);
        setSelectedForm(null);

        // Get current page from Redux or state if you track it
        const currentPage = 1; // Replace with actual current page if you track it
        dispatch(getAssignedAssessments(currentPage));
      } else if (action.error) {
        // Error will be shown via useEffect
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Toast helper function - with improved logic
  const showToast = (message, type = "info") => {
    // Don't show generic "Operation successful" messages on initial load
    if (
      initialLoad &&
      (message.includes("Operation successful") ||
        message.includes("successfully"))
    ) {
      return;
    }

    setToast({
      show: true,
      message,
      type,
    });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  const getFormStatusInfo = (assessment) => {
    const submittedAssessmentId = assessment.submitted_assessment_id;
    const startTime = assessment.start_time;
    const endTime = assessment.end_time;

    if (submittedAssessmentId === null) {
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
        fillFormText: "Fill",
        fillFormIcon: "material-symbols:edit-document",
      };
    } else if (startTime === null && endTime === null) {
      return {
        isCompleted: true,
        canShowTaskButton: !isCustomer, // Hide for customers
        taskButtonText: "Add Task",
        taskButtonDisabled: isCustomer,
        taskButtonStyle: {
          background: "#2196F3",
          cursor: isCustomer ? "not-allowed" : "pointer",
        },
        fillFormText: "View",
        fillFormIcon: "ic:baseline-remove-red-eye",
      };
    } else {
      return {
        isCompleted: true,
        canShowTaskButton: !isCustomer, // Hide for customers
        taskButtonText: "Task Added",
        taskButtonDisabled: true,
        taskButtonStyle: {
          background: "#28a745",
          cursor: "not-allowed",
          opacity: 0.8,
        },
        fillFormText: "View",
        fillFormIcon: "ic:baseline-remove-red-eye",
      };
    }
  };

  // Helper function to format date as MM/DD/YYYY
  const formatDateMMDDYYYY = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    try {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch (error) {
      return "N/A";
    }
  };

  // Helper function to format time as HH:MM
  const formatTimeHHMM = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    try {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch (error) {
      return "N/A";
    }
  };

  const transformAssessmentData = () => {
    if (!assignedAssessments.data || assignedAssessments.data.length === 0) {
      return [];
    }

    return assignedAssessments.data.map((assessment) => {
      const formStatusInfo = getFormStatusInfo(assessment);

      const startTime = assessment.start_time
        ? new Date(assessment.start_time)
        : new Date();
      const endTime = assessment.end_time
        ? new Date(assessment.end_time)
        : new Date();

      // Format date as MM/DD/YYYY
      const dateStr = assessment.start_time
        ? formatDateMMDDYYYY(assessment.start_time)
        : "N/A";

      // Format time as HH:MM
      const timeStr = assessment.start_time
        ? formatTimeHHMM(assessment.start_time)
        : "N/A";

      // Combined date and time for display (vertical stack to save space)
      const dateTimeDisplay = assessment.start_time ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: "1.3",
          }}>
          <span style={{ fontWeight: 500, color: "#333" }}>{dateStr}</span>
          <span style={{ fontSize: "0.8rem", color: "#666" }}>{timeStr}</span>
        </div>
      ) : (
        "N/A"
      );

      let hoursWorked = "N/A";
      if (assessment.start_time && assessment.end_time) {
        const diffMs = endTime - startTime;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        hoursWorked = diffHours.toString();
      }

      const formName = assessment.category_name || "Assessment";
      const facility = assessment.facility_name || "Unknown Facility";

      return {
        id: assessment.id,
        formName: formName,
        dateTimeDisplay: dateTimeDisplay,
        hoursWorked: hoursWorked,
        customergroup: assessment.customer_group_name || "N/A",
        formStatus: formStatusInfo.isCompleted,
        facility: facility,
        canShowTaskButton: formStatusInfo.canShowTaskButton,
        taskButtonText: formStatusInfo.taskButtonText,
        taskButtonDisabled: formStatusInfo.taskButtonDisabled,
        taskButtonStyle: formStatusInfo.taskButtonStyle,
        fillFormText: formStatusInfo.fillFormText,
        fillFormIcon: formStatusInfo.fillFormIcon,
        assessmentScore: assessment.assessment_score || 0,
        assessmentMaxScore: assessment.assessment_max_score || 0,
        scorePercentage:
          assessment.assessment_max_score > 0
            ? Math.round(
                (assessment.assessment_score /
                  assessment.assessment_max_score) *
                  100,
              )
            : 0,
        originalData: assessment,
      };
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage < 0) return "#dc3545"; // Negative - Red
    if (percentage < 40) return "#dc3545"; // Below 40% - Red
    if (percentage < 70) return "#fd7e14"; // 40-69% - Orange
    return "#28a745"; // 70% and above - Green
  };

  const transformedData = transformAssessmentData();
  const filteredData =
    selectedFacility === "All"
      ? transformedData
      : transformedData.filter((item) => item.facility === selectedFacility);

  const employeeColumns = [
    { name: "facility", label: "Facility Name" },
    { name: "formName", label: "Task Name" },
    {
      name: "scorePercentage",
      label: "Score",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const row = filteredData[rowIndex];
          const score = row.assessmentScore;
          const maxScore = row.assessmentMaxScore;
          const percentage = row.scorePercentage;

          const scoreColor = getScoreColor(percentage);

          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontWeight: 600,
                  color: scoreColor,
                  fontSize: "1rem",
                }}>
                {percentage}%
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#666",
                  marginTop: "2px",
                }}>
                ({score} / {maxScore})
              </span>
            </div>
          );
        },
      },
    },
    { name: "customergroup", label: "Group Name" },
    {
      name: "dateTimeDisplay",
      label: "Date & Time",
      options: {
        filter: false,
        sort: true,
        sortThirdClickReset: true,
        customBodyRender: (value) => value,
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
      label: "Status",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          // Traffic light indicators
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
              }}>
              {value ? (
                // Completed - Green light
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#28a745",
                    boxShadow: "0 0 5px rgba(40, 167, 69, 0.5)",
                    display: "inline-block",
                  }}
                  title="Completed"
                />
              ) : (
                // In-Process - Red light
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#dc3545",
                    boxShadow: "0 0 5px rgba(220, 53, 69, 0.5)",
                    display: "inline-block",
                  }}
                  title="In-Process"
                />
              )}
            </div>
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

          const handleActionClick = () => {
            const row = filteredData[dataIndex];
            const isCompleted = row.formStatus;

            let assessmentId;

            if (isCompleted) {
              assessmentId = row.originalData?.submitted_assessment_id;
            } else {
              assessmentId = row.originalData?.id;
            }

            if (!assessmentId) {
              showToast("Cannot navigate: No assessment ID found", "error");
              return;
            }

            const categoryId = row.originalData?.category_id;
            const categoryName =
              row.originalData?.category_name || "Assessment";

            // Create a clean version of row data without React elements
            const cleanRow = {
              id: row.id,
              formName: row.formName,
              hoursWorked: row.hoursWorked,
              customergroup: row.customergroup,
              formStatus: row.formStatus,
              facility: row.facility,
              canShowTaskButton: row.canShowTaskButton,
              taskButtonText: row.taskButtonText,
              taskButtonDisabled: row.taskButtonDisabled,
              fillFormText: row.fillFormText,
              fillFormIcon: row.fillFormIcon,
              assessmentScore: row.assessmentScore,
              assessmentMaxScore: row.assessmentMaxScore,
              scorePercentage: row.scorePercentage,
              // Don't include dateTimeDisplay as it contains JSX
            };

            if (isCompleted) {
              navigate(`/view-form/${assessmentId}`, {
                state: {
                  form: cleanRow, // Use clean row without JSX
                  assessmentId: assessmentId,
                  category_id: categoryId,
                  category_name: categoryName,
                  isCompleted: true,
                },
              });
            } else {
              navigate(`/fill-form/${assessmentId}`, {
                state: {
                  form: cleanRow, // Use clean row without JSX
                  assessmentId: assessmentId,
                  category_id: categoryId,
                  category_name: categoryName,
                  isCompleted: false,
                },
              });
            }
          };

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

              {row.canShowTaskButton && !isCustomer && (
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

  const AddTaskModal = ({ form, onClose, onSave, isAdding }) => {
    const [taskData, setTaskData] = useState({
      title: form ? `${form.formName} - ${form.facility}` : "",
      description: "",
      startDateTime: new Date().toISOString().slice(0, 16),
      endDateTime: new Date(new Date().getTime() + 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16),
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
                  background:
                    "linear-gradient(90deg,rgba(216, 81, 80, 1) 0%,rgba(87, 36, 103, 1) 100% )",
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
      document.body,
    );
  };

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
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
        duration={3000}
      />

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
          document.body,
        )}

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
