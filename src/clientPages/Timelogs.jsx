import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import MasterLayout from "../otherImages/MasterLayout";
import DynamicModal from "../components/DynamicModal";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIME_SLOTS = [
  { label: "00:00 - 06:00", start: 0, end: 6 },
  { label: "06:00 - 12:00", start: 6, end: 12 },
  { label: "12:00 - 18:00", start: 12, end: 18 },
  { label: "18:00 - 24:00", start: 18, end: 24 },
];

const Timelogs = () => {
  const [tasks, setTasks] = useState([
    // ... your tasks array remains the same
    {
      id: 101,
      facility: "KFC",
      title: "Old Stock Audit",
      startTime: "08:00",
      endTime: "10:00",
      day: "Tuesday",
      date: "2025-12-09",
      description: "Completed last week.",
    },
    {
      id: 1,
      facility: "Nobu",
      title: "Current Training",
      startTime: "14:00",
      endTime: "16:00",
      day: "Monday",
      date: "2025-12-15",
      description: "Weekly staff sync.",
    },
    {
      id: 2,
      facility: "KFC",
      title: "Inventory",
      startTime: "09:00",
      endTime: "11:00",
      day: "Thursday",
      date: "2025-12-18",
      description: "Morning count.",
    },
    {
      id: 201,
      facility: "Burger King",
      title: "Xmas Prep",
      startTime: "10:00",
      endTime: "13:00",
      day: "Monday",
      date: "2025-12-22",
      description: "Planning for holiday rush.",
    },
    {
      id: 3,
      facility: "White Castle",
      title: "Safety Inspection",
      startTime: "08:30",
      endTime: "10:30",
      day: "Tuesday",
      date: "2025-12-23", // This week
      description: "Monthly safety compliance check.",
    },
    {
      id: 4,
      facility: "Cluckin' Bell",
      title: "Equipment Maintenance",
      startTime: "11:00",
      endTime: "14:00",
      day: "Wednesday",
      date: "2025-12-24", // This week
      description: "Deep cleaning of kitchen equipment.",
    },
    {
      id: 5,
      facility: "KFC",
      title: "Staff Meeting",
      startTime: "15:00",
      endTime: "16:30",
      day: "Thursday",
      date: "2025-12-25", // This week
      description: "Holiday schedule discussion.",
    },
    {
      id: 6,
      facility: "Nobu",
      title: "Vendor Delivery",
      startTime: "09:00",
      endTime: "11:00",
      day: "Friday",
      date: "2025-12-26", // This week
      description: "Weekly seafood delivery and inspection.",
    },
    {
      id: 7,
      facility: "Burger King",
      title: "Quality Check",
      startTime: "13:00",
      endTime: "15:00",
      day: "Saturday",
      date: "2025-12-27", // This week
      description: "Food quality and freshness audit.",
    },
    {
      id: 8,
      facility: "White Castle",
      title: "End-of-Year Inventory",
      startTime: "08:00",
      endTime: "12:00",
      day: "Sunday",
      date: "2025-12-28", // This week
      description: "Year-end stock taking.",
    },
    {
      id: 9,
      facility: "KFC",
      title: "New Year Preparation",
      startTime: "10:00",
      endTime: "13:00",
      day: "Monday",
      date: "2025-12-29", // Next week
      description: "Planning for New Year's Eve rush.",
    },
    {
      id: 10,
      facility: "Nobu",
      title: "Menu Tasting",
      startTime: "14:00",
      endTime: "16:00",
      day: "Tuesday",
      date: "2025-12-30", // Next week
      description: "Testing new menu items for January.",
    },
    {
      id: 11,
      facility: "Burger King",
      title: "Year-End Cleanup",
      startTime: "07:00",
      endTime: "11:00",
      day: "Wednesday",
      date: "2025-12-31", // Next week
      description: "Deep cleaning before New Year.",
    },
    {
      id: 12,
      facility: "Cluckin' Bell",
      title: "Staff Training",
      startTime: "09:30",
      endTime: "12:30",
      day: "Thursday",
      date: "2026-01-01", // Next week
      description: "New year safety protocols training.",
    },
    {
      id: 13,
      facility: "White Castle",
      title: "Supplier Meeting",
      startTime: "11:00",
      endTime: "13:00",
      day: "Friday",
      date: "2026-01-02", // Next week
      description: "Discussing 2026 supply contracts.",
    },
    {
      id: 14,
      facility: "KFC",
      title: "Health Inspection",
      startTime: "08:00",
      endTime: "10:00",
      day: "Saturday",
      date: "2026-01-03", // Next week
      description: "Random health department inspection.",
    },
    {
      id: 15,
      facility: "Nobu",
      title: "Wine Pairing Session",
      startTime: "16:00",
      endTime: "18:00",
      day: "Sunday",
      date: "2026-01-04", // Next week
      description: "Training staff on new wine selections.",
    },
    {
      id: 16,
      facility: "Burger King",
      title: "Equipment Upgrade",
      startTime: "07:00",
      endTime: "15:00",
      day: "Monday",
      date: "2026-01-05", // Next week
      description: "Installing new fryer systems.",
    },
    {
      id: 17,
      facility: "Cluckin' Bell",
      title: "Customer Feedback Review",
      startTime: "10:00",
      endTime: "12:00",
      day: "Tuesday",
      date: "2026-01-06", // Next week
      description: "Analyzing December customer surveys.",
    },
    {
      id: 18,
      facility: "White Castle",
      title: "Marketing Strategy",
      startTime: "13:00",
      endTime: "15:30",
      day: "Wednesday",
      date: "2026-01-07", // Next week
      description: "Q1 2026 marketing campaign planning.",
    },
    {
      id: 19,
      facility: "KFC",
      title: "Inventory Replenishment",
      startTime: "09:00",
      endTime: "11:00",
      day: "Thursday",
      date: "2026-01-08", // Next week
      description: "Restocking after holiday season.",
    },
    {
      id: 20,
      facility: "Nobu",
      title: "Chef Special Training",
      startTime: "14:00",
      endTime: "17:00",
      day: "Friday",
      date: "2026-01-09", // Next week
      description: "Masterclass on new cooking techniques.",
    },
  ]);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

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

  // n-1 LOGIC: Allows editing for today/future, and up to 24 hours in the past
  const isPastTime = (selectedDateStr, selectedTimeStr) => {
    const now = new Date();
    const [hours, minutes] = selectedTimeStr.split(":").map(Number);

    // Combine date and time (Local ISO format)
    const taskTime = new Date(
      `${selectedDateStr}T${selectedTimeStr.padStart(5, "0")}:00`
    );

    const diffInMs = now - taskTime;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return diffInHours > 24; // True if task is older than 24 hours
  };

  const saveTask = (taskData) => {
    if (taskData.endTime <= taskData.startTime) {
      alert("Error: End time must be later than start time.");
      return;
    }

    const dayIndex = DAYS.indexOf(taskData.day);
    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + dayIndex);
    const dateStr = targetDate.toISOString().split("T")[0];

    if (isPastTime(dateStr, taskData.startTime)) {
      alert(
        "Error: This time slot is older than the 24-hour grace period and cannot be modified."
      );
      return;
    }

    const taskWithDate = { ...taskData, date: dateStr };

    if (activeModal === "edit") {
      setTasks(
        tasks.map((t) =>
          t.id === selectedTask.id ? { ...taskWithDate, id: t.id } : t
        )
      );
    } else {
      setTasks([...tasks, { id: Date.now(), ...taskWithDate }]);
    }
    closeModals();
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
            Timelogs
          </h2>
          <button
            className="dsgnbtn"
            onClick={() => {
              setSelectedTask(null);
              setActiveModal("add");
            }}
            style={{
              color: "white",
              border: "none",
              padding: "12px 28px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
            }}>
            Add Task
          </button>
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

        {/* Grid */}
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

          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.label}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                minHeight: "140px",
                borderBottom: "1px solid #eee",
              }}>
              {weekDates.map((date, i) => {
                const dateStr = date.toISOString().split("T")[0];
                const isToday =
                  new Date().toDateString() === date.toDateString();
                return (
                  <div
                    key={i}
                    style={{
                      borderRight: "1px solid #eee",
                      padding: "10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      overflow: "hidden",
                      background: isToday ? "#F9FBFF" : "white",
                    }}>
                    {tasks
                      .filter(
                        (t) =>
                          t.date === dateStr &&
                          parseInt(t.startTime) >= slot.start &&
                          parseInt(t.startTime) < slot.end
                      )
                      .map((task) => (
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
                            padding: "8px",
                            fontSize: "11px",
                            cursor: "pointer",
                            width: "100%",
                            boxSizing: "border-box",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            display: "block",
                          }}>
                          <span style={{ color: "#8B2885", fontWeight: "700" }}>
                            {task.facility}:
                          </span>{" "}
                          {task.title}
                        </div>
                      ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <DynamicModal
          show={activeModal === "add" || activeModal === "edit"}
          handleClose={closeModals}
          title={activeModal === "edit" ? "Edit Task" : "Add Task"}
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
              isPast={
                selectedTask
                  ? isPastTime(selectedTask.date, selectedTask.startTime)
                  : false
              }
              onEdit={() => setActiveModal("edit")}
              onDelete={(id) => setTasks(tasks.filter((t) => t.id !== id))}
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
  const [formData, setFormData] = useState(
    initialData || {
      facility: "KFC",
      title: "",
      startTime: "09:00",
      endTime: "10:00",
      description: "",
      day: "Monday",
    }
  );
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
    wordBreak: "break-all",
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ flex: 1 }}>
          <label>Facility</label>
          <select
            value={formData.facility}
            style={inputStyle}
            onChange={(e) =>
              setFormData({ ...formData, facility: e.target.value })
            }>
            <option>KFC</option>
            <option>Nobu</option>
            <option>Burger King</option>
            <option>White Castle</option>
            <option>Cluckin' Bell</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Day</label>
          <select
            value={formData.day}
            style={inputStyle}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}>
            {DAYS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>
      <label>Title</label>
      <input
        value={formData.title}
        style={inputStyle}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ flex: 1 }}>
          <label>Start</label>
          <input
            type="time"
            value={formData.startTime}
            style={inputStyle}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>End</label>
          <input
            type="time"
            value={formData.endTime}
            style={inputStyle}
            onChange={(e) =>
              setFormData({ ...formData, endTime: e.target.value })
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

const TaskView = ({ task, isPast, onEdit, onDelete, close }) => (
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
        {task?.title}
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: "#666",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}>
        {task?.facility} • {task?.date} ({task?.startTime}-{task?.endTime})
      </p>
      <p
        style={{
          marginTop: "15px",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          wordBreak: "break-word",
          maxWidth: "100%",
        }}>
        {task?.description}
      </p>
      {isPast && (
        <div
          style={{
            marginTop: "10px",
            color: "#d64c4c",
            fontWeight: "600",
            fontSize: "12px",
            wordBreak: "break-word",
          }}>
          Note: This task is locked as it is outside the 24h grace period.
        </div>
      )}
    </div>

    <div style={{ display: "flex", gap: "10px" }}>
      {!isPast ? (
        <>
          <button
            onClick={() => {
              if (window.confirm("Delete?")) {
                onDelete(task.id);
                close();
              }
            }}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #ff0000ff",
              borderRadius: "12px",
              color: "#ff0000ff",
              background: "white",
              cursor: "pointer",
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
            }}>
            Edit Task
          </button>
        </>
      ) : (
        <button
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            background: "#eee",
            color: "#999",
            border: "none",
            cursor: "not-allowed",
          }}>
          Locked (Past Record)
        </button>
      )}
    </div>
  </div>
);

export default Timelogs;
