// src/components/Timelogs.jsx
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MasterLayout from "../otherImages/MasterLayout";
import DynamicModal from "../components/DynamicModal";
import Toast from "../components/Toast";
import DateFilter from "../components/DateFilter";
import useDateFilter from "../components/useDateFilter";
import {
  getMyTasks,
  updateTask,
  deleteAttendance,
  addTask,
} from "../redux/slices/attendanceSlice";
import { getMyFacilities } from "../redux/slices/facilitySlice";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const Timelogs = () => {
  const dispatch = useDispatch();

  // Use date filter hook
  const { dateFilter, updateFilter, getDateRange } = useDateFilter();

  // Get my tasks from Redux store
  const { myTasks, isMyTasksLoading, myTasksError, isAddingTask } = useSelector(
    (state) => state.attendance,
  );

  // Get facilities from facility slice
  const {
    myFacilities = { data: [] },
    isLoading: isLoadingFacilities = false,
  } = useSelector((state) => state.facility || {});

  const [tasks, setTasks] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddOtherTaskModal, setShowAddOtherTaskModal] = useState(false);

  // Facility filter state
  const [selectedFacility, setSelectedFacility] = useState("");
  const [facilities, setFacilities] = useState([]);

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Fetch facilities on component mount
  useEffect(() => {
    dispatch(getMyFacilities(1));
  }, [dispatch]);

  // Process facilities when they load
  useEffect(() => {
    if (myFacilities.data && myFacilities.data.length > 0) {
      const facilityList = myFacilities.data.map((facility) => ({
        id: facility.id || facility.facility_id,
        name: facility.facility_name || facility.name,
        address: facility.facility_address,
      }));
      setFacilities(facilityList);
    }
  }, [myFacilities]);

  // Show toast function
  const showToast = (message, type = "info") => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  const getCurrentWeekMonday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const [baseDate, setBaseDate] = useState(getCurrentWeekMonday());

  // Fetch tasks when component mounts or filters change
  useEffect(() => {
    const dateRange = getDateRange();
    const params = {
      from_date: dateRange.from_date,
      to_date: dateRange.to_date,
    };

    if (selectedFacility) {
      params.facility_id = selectedFacility;
    }

    dispatch(getMyTasks(params));
  }, [
    dispatch,
    selectedFacility,
    dateFilter.selectedYear,
    dateFilter.viewType,
    dateFilter.selectedQuarter,
    dateFilter.selectedMonth,
  ]);

  // Transform API data to match the UI format when data loads
  useEffect(() => {
    if (myTasks && myTasks.length > 0) {
      const transformedTasks = myTasks.map((task) => {
        // Parse date string manually to avoid timezone issues
        const parseDateTime = (dateTimeStr) => {
          // dateTimeStr format: "2026-02-04 15:00:00"
          const [datePart, timePart] = dateTimeStr.split(" ");
          const [year, month, day] = datePart.split("-");
          const [hours, minutes] = (timePart || "00:00:00").split(":");

          // Create date object with local time
          return new Date(year, month - 1, day, hours, minutes);
        };

        const startDate = parseDateTime(task.start_time);
        const endDate = parseDateTime(task.end_time);
        const dayIndex = (startDate.getDay() + 6) % 7;
        const dateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;

        return {
          id: task.id,
          title: task.title,
          description: task.description || "",
          day: DAYS[dayIndex],
          date: dateStr,
          startDate: startDate,
          endDate: endDate,
          startDateStr: startDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          endDateStr: endDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          facility_id: task.facility_id,
          facility_name: task.facility_name,
        };
      });
      setTasks(transformedTasks);
    } else {
      setTasks([]);
    }
  }, [myTasks]);

  // Handle facility filter change
  const handleFacilityChange = (facilityId) => {
    setSelectedFacility(facilityId);
  };

  // Clear facility filter
  const clearFacilityFilter = () => {
    setSelectedFacility("");
  };

  const getMondayOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const resetToCurrentWeek = () => {
    setBaseDate(getCurrentWeekMonday());
  };

  const getWeekDates = () =>
    DAYS.map((_, index) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + index);
      return d;
    });

  const weekDates = getWeekDates();

  const isCurrentWeek = () => {
    const currentMonday = getCurrentWeekMonday();
    return baseDate.getTime() === currentMonday.getTime();
  };

  const saveTask = (taskData) => {
    setIsSaving(true);

    // Parse the datetime-local string (format: YYYY-MM-DDTHH:MM)
    const parseDateTimeLocal = (dateTimeStr) => {
      const [datePart, timePart] = dateTimeStr.split("T");
      const [year, month, day] = datePart.split("-");
      const [hours, minutes] = timePart.split(":");

      return {
        year,
        month,
        day,
        hours,
        minutes: minutes || "00",
      };
    };

    const startParts = parseDateTimeLocal(taskData.startDateTime);
    const endParts = parseDateTimeLocal(taskData.endDateTime);

    const updateData = {
      id: selectedTask.id,
      title: taskData.title,
      description: taskData.description || "",
      start_time: `${startParts.year}-${startParts.month}-${startParts.day} ${startParts.hours}:${startParts.minutes}:00`,
      end_time: `${endParts.year}-${endParts.month}-${endParts.day} ${endParts.hours}:${endParts.minutes}:00`,
    };

    dispatch(updateTask(updateData))
      .then((action) => {
        setIsSaving(false);

        if (action.payload?.success) {
          showToast("Task updated successfully!", "success");
          const dateRange = getDateRange();
          const params = {
            from_date: dateRange.from_date,
            to_date: dateRange.to_date,
          };
          if (selectedFacility) {
            params.facility_id = selectedFacility;
          }
          dispatch(getMyTasks(params));
          closeModals();
        } else {
          showToast(
            action.payload?.message || "Failed to update task",
            "error",
          );
        }
      })
      .catch((error) => {
        setIsSaving(false);
        showToast("An error occurred while saving", "error");
        console.error("Save task error:", error);
      });
  };

  // Handle adding other task with facility
  const handleAddOtherTask = (taskData) => {
    const apiTaskData = {
      title: taskData.title,
      description: taskData.description || "",
      start_time: taskData.startDateTime.split("T")[0],
      end_time: taskData.endDateTime.split("T")[0],
      assigned_assessment_id: null,
      facility_id: taskData.facility_id || null,
    };

    dispatch(addTask(apiTaskData)).then((action) => {
      if (action.payload?.success) {
        showToast("Task added to timelogs successfully!", "success");
        setShowAddOtherTaskModal(false);
        const dateRange = getDateRange();
        const params = {
          from_date: dateRange.from_date,
          to_date: dateRange.to_date,
        };
        if (selectedFacility) {
          params.facility_id = selectedFacility;
        }
        dispatch(getMyTasks(params));
      } else {
        showToast(action.payload?.message || "Failed to add task", "error");
      }
    });
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteAttendance(taskId)).then((action) => {
        if (action.payload?.success) {
          showToast("Task deleted successfully!", "success");
          const dateRange = getDateRange();
          const params = {
            from_date: dateRange.from_date,
            to_date: dateRange.to_date,
          };
          if (selectedFacility) {
            params.facility_id = selectedFacility;
          }
          dispatch(getMyTasks(params));
          closeModals();
        } else {
          showToast(
            action.payload?.message || "Failed to delete task",
            "error",
          );
        }
      });
    }
  };

  const handleNav = (dir) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + (dir === "next" ? 7 : -7));
    setBaseDate(d);
  };

  const closeModals = () => {
    setActiveModal(null);
    setSelectedTask(null);
    setIsSaving(false);
    setShowAddOtherTaskModal(false);
  };

  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startMonth = start.toLocaleString("default", { month: "short" });
    const endMonth = end.toLocaleString("default", { month: "short" });

    if (startMonth === endMonth) {
      return `${start.getDate()} - ${end.getDate()} ${startMonth}, ${start.getFullYear()}`;
    } else {
      return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}, ${start.getFullYear()}`;
    }
  };

  const getTasksForDay = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return tasks.filter((task) => task.date === dateStr);
  };

  if (isMyTasksLoading) {
    return (
      <MasterLayout>
        <div
          style={{
            padding: "30px",
            backgroundColor: "#f9f9f9",
            minHeight: "100vh",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
              Timelogs - Task Completion Tracking
            </h2>
          </div>
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "400px" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading tasks...</span>
            </div>
          </div>
        </div>
      </MasterLayout>
    );
  }

  if (myTasksError) {
    return (
      <MasterLayout>
        <div
          style={{
            padding: "30px",
            backgroundColor: "#f9f9f9",
            minHeight: "100vh",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
              Timelogs - Form Completion Tracking
            </h2>
          </div>
          <div className="alert alert-danger" role="alert">
            Error loading tasks: {myTasksError}
            <button
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={() => {
                const dateRange = getDateRange();
                const params = {
                  from_date: dateRange.from_date,
                  to_date: dateRange.to_date,
                };
                if (selectedFacility) {
                  params.facility_id = selectedFacility;
                }
                dispatch(getMyTasks(params));
              }}>
              Retry
            </button>
          </div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <div
        style={{
          padding: "30px",
          backgroundColor: "#f9f9f9",
          minHeight: "100vh",
          position: "relative",
        }}>
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={3000}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
            Timelogs - Form Completion Tracking
          </h2>

          {/* Add Other Task Button */}
          <button
            onClick={() => setShowAddOtherTaskModal(true)}
            style={{
              background: "linear-gradient(90deg, #d64c4c, #8B2885)",
              border: "none",
              cursor: "pointer",
              padding: "12px 24px",
              color: "white",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}>
            <Icon icon="mdi:plus-circle-outline" width={20} height={20} />
            Add Other Task
          </button>
        </div>

        {/* Filter Section */}
        <div className="mb-4 pb-2 border-bottom">
          <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
            {/* Date Filter */}
            <div style={{ minWidth: "300px" }}>
              <DateFilter
                {...dateFilter}
                onFilterChange={updateFilter}
                size="sm"
              />
            </div>

            {/* Facility Filter */}
            <div style={{ minWidth: "250px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}>
                Facility
              </label>
              <select
                value={selectedFacility}
                onChange={(e) => handleFacilityChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  backgroundColor: "white",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}>
                <option value="">All Facilities</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}{" "}
                    {facility.address ? `- ${facility.address}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter badges */}
          <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
            <span className="badge bg-light text-dark p-2">
              <i className="fas fa-calendar-alt me-1"></i>
              {getDateRange().label}
            </span>

            {selectedFacility && (
              <span className="badge bg-info text-white p-2">
                <i className="fas fa-building me-1"></i>
                Facility:{" "}
                {facilities.find((f) => f.id === selectedFacility)?.name ||
                  selectedFacility}
                <button
                  onClick={() => {
                    setSelectedFacility("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    marginLeft: "8px",
                    padding: "0 4px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}>
                  ×
                </button>
              </span>
            )}

            {tasks.length > 0 && (
              <span className="badge bg-success p-2">
                <i className="fas fa-tasks me-1"></i>
                {tasks.length} Tasks
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{ fontWeight: "600", color: "#333", fontSize: "16px" }}>
              {formatDateRange()}
            </span>
            {!isCurrentWeek() && (
              <button
                onClick={resetToCurrentWeek}
                style={{
                  background: "transparent",
                  border: "1px solid #8B2885",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  color: "#8B2885",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}>
                <Icon icon="mdi:calendar-today" width={14} height={14} />
                Today
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleNav("prev")}
              style={{
                background: "white",
                border: "1px solid #eee",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
              }}>
              <Icon icon="mdi:chevron-left" width={24} height={24} />
            </button>
            <button
              onClick={() => handleNav("next")}
              style={{
                background: "white",
                border: "1px solid #eee",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
              }}>
              <Icon icon="mdi:chevron-right" width={24} height={24} />
            </button>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #eee",
            overflow: "hidden",
          }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              background: "#fafafa",
              borderBottom: "1px solid #eee",
            }}>
            {weekDates.map((date, i) => {
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <div
                  key={i}
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    background: isToday ? "#F2F7FF" : "transparent",
                    borderLeft: isToday ? "2px solid #8B2885" : "none",
                  }}>
                  <div style={{ fontSize: "11px", color: "#999" }}>
                    {DAYS[i].substring(0, 3)}
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: isToday ? "#8B2885" : "#333",
                    }}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              minHeight: "300px",
            }}>
            {weekDates.map((date, i) => {
              const isToday = new Date().toDateString() === date.toDateString();
              const dayTasks = getTasksForDay(date);

              return (
                <div
                  key={i}
                  style={{
                    borderRight: "1px solid #eee",
                    borderBottom: "1px solid #eee",
                    padding: "15px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    overflowY: "auto",
                    background: isToday ? "#F9FBFF" : "white",
                    minHeight: "300px",
                  }}>
                  {dayTasks.length === 0 ? (
                    <div
                      style={{
                        color: "#999",
                        fontSize: "14px",
                        textAlign: "center",
                        marginTop: "20px",
                      }}>
                      No tasks
                    </div>
                  ) : (
                    dayTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setActiveModal("view");
                        }}
                        style={{
                          background: "#F2F7FF",
                          border: "1px solid #E1E9F5",
                          borderRadius: "12px",
                          padding: "12px",
                          fontSize: "13px",
                          cursor: "pointer",
                          width: "100%",
                          boxSizing: "border-box",
                          overflow: "hidden",
                          wordBreak: "break-word",
                        }}>
                        <div
                          style={{
                            color: "#8B2885",
                            fontWeight: "700",
                            marginBottom: "4px",
                          }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "#666" }}>
                          {task.startDateStr} - {task.endDateStr}
                        </div>
                        {task.facility_name && (
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#8B2885",
                              marginTop: "4px",
                            }}>
                            📍 {task.facility_name}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DynamicModal
          show={activeModal === "edit"}
          handleClose={closeModals}
          title="Edit Task"
          modalWidth="480px"
          content={
            <TaskForm
              initialData={selectedTask}
              onSave={saveTask}
              isSaving={isSaving}
            />
          }
        />

        <DynamicModal
          show={activeModal === "view"}
          handleClose={closeModals}
          title="View Task"
          modalWidth="440px"
          content={
            <TaskView
              task={selectedTask}
              onEdit={() => setActiveModal("edit")}
              onDelete={handleDeleteTask}
              close={closeModals}
            />
          }
        />

        {/* Add Other Task Modal with Facility Dropdown */}
        <DynamicModal
          show={showAddOtherTaskModal}
          handleClose={closeModals}
          title="Add Other Task"
          modalWidth="480px"
          content={
            <AddOtherTaskForm
              onSave={handleAddOtherTask}
              isSaving={isAddingTask}
              onClose={closeModals}
              facilities={myFacilities.data || []}
              isLoadingFacilities={isLoadingFacilities}
            />
          }
        />
      </div>
    </MasterLayout>
  );
};

// AddOtherTaskForm component remains the same...
const AddOtherTaskForm = ({
  onSave,
  isSaving,
  onClose,
  facilities = [],
  isLoadingFacilities = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDateTime: new Date().toISOString().slice(0, 16),
    endDateTime: new Date(new Date().getTime() + 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16),
    facility_id: "",
  });

  const inputStyle = {
    background: "#F7F8FA",
    border: "none",
    borderRadius: "12px",
    padding: "12px",
    width: "100%",
    fontSize: "14px",
    marginTop: "8px",
    marginBottom: "16px",
    boxSizing: "border-box",
  };

  const handleSave = () => {
    if (isSaving) return;

    if (!formData.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    if (!formData.startDateTime || !formData.endDateTime) {
      alert("Please select both start and end date & time");
      return;
    }

    const startDate = new Date(formData.startDateTime);
    const endDate = new Date(formData.endDateTime);

    if (endDate < startDate) {
      alert("End date & time cannot be before start date & time");
      return;
    }

    if (!formData.facility_id) {
      alert("Please select a facility");
      return;
    }

    onSave(formData);
  };

  return (
    <div>
      <label>Facility *</label>
      <select
        value={formData.facility_id}
        onChange={(e) =>
          setFormData({ ...formData, facility_id: e.target.value })
        }
        style={inputStyle}
        disabled={isSaving || isLoadingFacilities}
        required>
        <option value="">Select Facility</option>
        {isLoadingFacilities ? (
          <option disabled>Loading facilities...</option>
        ) : facilities && facilities.length > 0 ? (
          facilities.map((facility) => (
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

      <label>Title *</label>
      <input
        value={formData.title}
        style={inputStyle}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Enter task title"
        disabled={isSaving}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ flex: 1 }}>
          <label>Start Date & Time *</label>
          <input
            type="datetime-local"
            value={formData.startDateTime}
            style={inputStyle}
            onChange={(e) =>
              setFormData({
                ...formData,
                startDateTime: e.target.value,
              })
            }
            disabled={isSaving}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>End Date & Time *</label>
          <input
            type="datetime-local"
            value={formData.endDateTime}
            style={inputStyle}
            onChange={(e) =>
              setFormData({
                ...formData,
                endDateTime: e.target.value,
              })
            }
            disabled={isSaving}
          />
        </div>
      </div>

      <label>Description</label>
      <textarea
        value={formData.description}
        style={{ ...inputStyle, height: "80px" }}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        placeholder="Enter task description"
        disabled={isSaving}
      />

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
            fontWeight: "600",
          }}
          disabled={isSaving}>
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            flex: 2,
            padding: "12px",
            borderRadius: "12px",
            color: "white",
            background: isSaving
              ? "#cccccc"
              : "linear-gradient(90deg, #d64c4c, #8B2885)",
            border: "none",
            cursor: isSaving ? "not-allowed" : "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}>
          {isSaving ? (
            <>
              <Icon
                icon="mdi:loading"
                width={20}
                height={20}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Adding...
            </>
          ) : (
            "Add Task"
          )}
        </button>
      </div>
    </div>
  );
};

// TaskForm component remains the same...
const TaskForm = ({ initialData, onSave, isSaving }) => {
  const prepareInitialData = () => {
    if (initialData) {
      const formatForDateTimeLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      return {
        title: initialData.title || "",
        description: initialData.description || "",
        startDateTime: formatForDateTimeLocal(initialData.startDate),
        endDateTime: formatForDateTimeLocal(initialData.endDate),
      };
    }

    return {
      title: "",
      description: "",
      startDateTime: "",
      endDateTime: "",
    };
  };
  const [formData, setFormData] = useState(prepareInitialData());
  const [localIsSaving, setLocalIsSaving] = useState(false);

  useEffect(() => {
    setLocalIsSaving(isSaving);
  }, [isSaving]);

  const inputStyle = {
    background: "#F7F8FA",
    border: "none",
    borderRadius: "12px",
    padding: "12px",
    width: "100%",
    fontSize: "14px",
    marginTop: "8px",
    marginBottom: "16px",
    boxSizing: "border-box",
  };

  const handleSave = () => {
    if (localIsSaving) return;

    if (!formData.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    if (!formData.startDateTime || !formData.endDateTime) {
      alert("Please select both start and end date & time");
      return;
    }

    const startDate = new Date(formData.startDateTime);
    const endDate = new Date(formData.endDateTime);

    if (endDate < startDate) {
      alert("End date & time cannot be before start date & time");
      return;
    }

    setLocalIsSaving(true);
    onSave(formData);
  };

  return (
    <div>
      <label>Title *</label>
      <input
        value={formData.title}
        style={inputStyle}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Enter task title"
        disabled={localIsSaving}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ flex: 1 }}>
          <label>Start Date & Time *</label>
          <input
            type="datetime-local"
            value={formData.startDateTime}
            style={inputStyle}
            onChange={(e) =>
              setFormData({
                ...formData,
                startDateTime: e.target.value,
              })
            }
            disabled={localIsSaving}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>End Date & Time *</label>
          <input
            type="datetime-local"
            value={formData.endDateTime}
            style={inputStyle}
            onChange={(e) =>
              setFormData({
                ...formData,
                endDateTime: e.target.value,
              })
            }
            disabled={localIsSaving}
          />
        </div>
      </div>

      <label>Description</label>
      <textarea
        value={formData.description}
        style={{ ...inputStyle, height: "80px" }}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        placeholder="Enter task description"
        disabled={localIsSaving}
      />

      <button
        onClick={handleSave}
        disabled={localIsSaving}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "12px",
          color: "white",
          background: localIsSaving
            ? "#cccccc"
            : "linear-gradient(90deg, #d64c4c, #8B2885)",
          border: "none",
          cursor: localIsSaving ? "not-allowed" : "pointer",
          fontWeight: "700",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.3s ease",
        }}>
        {localIsSaving ? (
          <>
            <Icon
              icon="mdi:loading"
              width={20}
              height={20}
              style={{ animation: "spin 1s linear infinite" }}
            />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </button>

      {localIsSaving && (
        <div
          style={{
            textAlign: "center",
            marginTop: "12px",
            fontSize: "12px",
            color: "#666",
            fontStyle: "italic",
          }}>
          Please wait while we save your changes...
        </div>
      )}
    </div>
  );
};

// TaskView component remains the same...
const TaskView = ({ task, onEdit, onDelete, close }) => {
  if (!task) return null;

  const formatDateTime = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div
        style={{
          background: "#F7F8FA",
          padding: "20px",
          borderRadius: "16px",
          marginBottom: "20px",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}>
        <h3
          style={{
            margin: "0 0 10px 0",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}>
          {task.title}
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "#666",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            marginBottom: "15px",
          }}>
          Start: {formatDateTime(task.startDate)}
          <br />
          End: {formatDateTime(task.endDate)}
        </p>
        {task.facility_name && (
          <p
            style={{
              fontSize: "14px",
              color: "#8B2885",
              marginBottom: "10px",
            }}>
            <strong>Facility:</strong> {task.facility_name}
          </p>
        )}
        <p
          style={{
            marginTop: "15px",
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            wordBreak: "break-word",
            maxWidth: "100%",
            fontSize: "14px",
            lineHeight: "1.5",
          }}>
          {task.description || "No description provided."}
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => {
            onDelete(task.id);
          }}
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #ff0000ff",
            borderRadius: "12px",
            color: "#ff0000ff",
            background: "white",
            cursor: "pointer",
            fontWeight: "600",
          }}>
          Delete
        </button>
        <button
          className="dsgnbtn"
          onClick={onEdit}
          style={{
            flex: 2,
            padding: "12px",
            borderRadius: "12px",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
          }}>
          Edit Task
        </button>
      </div>
    </div>
  );
};

export default Timelogs;
