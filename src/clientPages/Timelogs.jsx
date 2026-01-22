import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MasterLayout from "../otherImages/MasterLayout";
import DynamicModal from "../components/DynamicModal";
import Toast from "../components/Toast"; // Import your Toast component
import {
  getMyTasks,
  updateTask,
  deleteAttendance,
} from "../redux/slices/attendanceSlice";

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

  // Get my tasks from Redux store
  const { myTasks, isMyTasksLoading, myTasksError } = useSelector(
    (state) => state.attendance
  );

  const [tasks, setTasks] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Show toast function
  const showToast = (message, type = "info") => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  // Hide toast function
  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  // Initialize with current week's Monday
  const getCurrentWeekMonday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Adjust to get Monday (if Sunday, go back 6 days; otherwise go back to Monday)
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const [baseDate, setBaseDate] = useState(getCurrentWeekMonday());

  // Fetch tasks on component mount
  useEffect(() => {
    dispatch(getMyTasks());
  }, [dispatch]);

  // Transform API data to match the UI format when data loads
  useEffect(() => {
    if (myTasks && myTasks.length > 0) {
      const transformedTasks = myTasks.map((task) => {
        const startDate = new Date(task.start_time);
        const endDate = new Date(task.end_time);

        // Get day index (0 = Monday, 6 = Sunday)
        const dayIndex = (startDate.getDay() + 6) % 7;

        // Format date as YYYY-MM-DD
        const dateStr = startDate.toISOString().split("T")[0];

        return {
          id: task.id,
          title: task.title,
          description: task.description || "",
          day: DAYS[dayIndex],
          date: dateStr,
          startDate: startDate,
          endDate: endDate,
          // Display date strings
          startDateStr: startDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          endDateStr: endDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        };
      });
      setTasks(transformedTasks);
    } else {
      // Clear tasks if API returns empty
      setTasks([]);
    }
  }, [myTasks]);

  // Helper function to get start of any week for a given date
  const getMondayOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = day === 0 ? 6 : day - 1; // Days to subtract to get Monday
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Reset to current week button
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

  // Check if current week is displayed
  const isCurrentWeek = () => {
    const currentMonday = getCurrentWeekMonday();
    return baseDate.getTime() === currentMonday.getTime();
  };

  const saveTask = (taskData) => {
    // Format dates for API (YYYY-MM-DD)
    const startDate = taskData.startDateTime.split("T")[0];
    const endDate = taskData.endDateTime.split("T")[0];

    // Update existing task
    const updateData = {
      id: selectedTask.id,
      title: taskData.title,
      description: taskData.description || "",
      start_time: startDate,
      end_time: endDate,
    };

    dispatch(updateTask(updateData)).then((action) => {
      if (action.payload?.success) {
        showToast("Task updated successfully!", "success");
        // Refresh tasks after update
        dispatch(getMyTasks());
        closeModals();
      } else {
        showToast(action.payload?.message || "Failed to update task", "error");
      }
    });
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteAttendance(taskId)).then((action) => {
        if (action.payload?.success) {
          showToast("Task deleted successfully!", "success");
          // Refresh tasks after delete
          dispatch(getMyTasks());
          closeModals();
        } else {
          showToast(
            action.payload?.message || "Failed to delete task",
            "error"
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
  };

  // Format date for display
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

  // Group tasks by day for display
  const getTasksForDay = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return tasks.filter((task) => task.date === dateStr);
  };

  // Loading state
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
              Timelogs - Form Completion Tracking
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

  // Error state
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
              onClick={() => dispatch(getMyTasks())}>
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
        {/* Toast Notification */}
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
            marginBottom: "30px",
          }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
            Timelogs - Form Completion Tracking
          </h2>
        </div>

        {/* Navigation */}
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

        {/* Grid - List view without time slots */}
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

          {/* Tasks list for each day */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              minHeight: "300px",
            }}>
            {weekDates.map((date, i) => {
              const dateStr = date.toISOString().split("T")[0];
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
          content={<TaskForm initialData={selectedTask} onSave={saveTask} />}
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
      </div>
    </MasterLayout>
  );
};

// --- SUBSIDIARY COMPONENTS ---

const TaskForm = ({ initialData, onSave }) => {
  // Helper to prepare initial data with datetime values
  const prepareInitialData = () => {
    if (initialData) {
      // Use the actual dates from the task data
      return {
        title: initialData.title || "",
        description: initialData.description || "",
        startDateTime: initialData.startDate.toISOString().slice(0, 16),
        endDateTime: initialData.endDate.toISOString().slice(0, 16),
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

  return (
    <div>
      <label>Title</label>
      <input
        value={formData.title}
        style={inputStyle}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Enter task title"
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ flex: 1 }}>
          <label>Start Date</label>
          <input
            type="date"
            value={formData.startDateTime.split("T")[0]}
            style={inputStyle}
            onChange={(e) =>
              setFormData({
                ...formData,
                startDateTime:
                  e.target.value +
                  "T" +
                  (formData.startDateTime.split("T")[1] || "00:00"),
              })
            }
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>End Date</label>
          <input
            type="date"
            value={formData.endDateTime.split("T")[0]}
            style={inputStyle}
            onChange={(e) =>
              setFormData({
                ...formData,
                endDateTime:
                  e.target.value +
                  "T" +
                  (formData.endDateTime.split("T")[1] || "00:00"),
              })
            }
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
      />

      <button
        onClick={() => onSave(formData)}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "12px",
          color: "white",
          background: "linear-gradient(90deg, #d64c4c, #8B2885)",
          border: "none",
          cursor: "pointer",
          fontWeight: "700",
        }}>
        Save
      </button>
    </div>
  );
};

const TaskView = ({ task, onEdit, onDelete, close }) => {
  if (!task) return null;

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
          {task.startDateStr} - {task.endDateStr}
        </p>
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
