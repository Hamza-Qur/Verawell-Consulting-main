import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { createPortal } from "react-dom";

const FacilityDetailDashboardData = ({ rows }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [selectedFacility, setSelectedFacility] = useState("All");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const buttonRefs = useRef([]);

  // Facility filter tabs
  const facilities = [
    "All",
    "KFC Facility",
    "Starbucks Facility",
    "Burger King Facility",
  ];

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
    alert(`Edit Employee: ${row.facilityName} successfully`);
    setDropdownOpen(null);
  };

  const handleDelete = (row) => {
    alert(`Deleted Employee: ${row.employeeName} successfully`);
    setDropdownOpen(null);
  };

  const handleClick = (index, e) => {
    handleDropdownToggle(index, e);
    const facility = employeeData[index].facility;
    navigate(`/facility-detail-page/${encodeURIComponent(facility)}`);
  };

  const handleAddTask = (form) => {
    setSelectedForm(form);
    setShowAddTaskModal(true);
  };

  const handleSaveTask = (taskData) => {
    // Here you would save the task to your backend
    console.log("Saving task:", taskData);
    alert(`Task "${taskData.title}" added successfully to Timelogs!`);
    setShowAddTaskModal(false);
    setSelectedForm(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Updated employeeData with facility field
  const employeeData = [
    {
      formName: "Kitchen Sanitation",
      time: "09:12:33",
      date: "25 November, 2025",
      hoursWorked: "3",
      formStatus: false,
      facility: "KFC", // Added facility field
    },
    {
      formName: "Meal Observation",
      time: "07:45:38",
      date: "25 November, 2025",
      hoursWorked: "5",
      formStatus: true,
      facility: "Starbucks", // Added facility field
    },
    {
      formName: "Kitchen Sanitation",
      time: "08:45:00",
      date: "17 December, 2025",
      hoursWorked: "6",
      formStatus: true,
      facility: "Burger King", // Added facility field
    },
    {
      formName: "Meal Observation",
      time: "11:15:00",
      date: "17 December, 2025",
      hoursWorked: "1",
      formStatus: false,
      facility: "KFC", // Added facility field
    },
    {
      formName: "Kitchen Sanitation",
      time: "07:50:00",
      date: "17 December, 2025",
      hoursWorked: "8",
      formStatus: true,
      facility: "Starbucks", // Added facility field
    },
    {
      formName: "Kitchen Sanitation",
      time: "09:12:33",
      date: "25 November, 2025",
      hoursWorked: "3",
      formStatus: false,
      facility: "Burger King", // Added facility field
    },
    {
      formName: "Meal Observation",
      time: "07:45:38",
      date: "25 November, 2025",
      hoursWorked: "5",
      formStatus: true,
      facility: "KFC", // Added facility field
    },
    {
      formName: "Kitchen Sanitation",
      time: "08:45:00",
      date: "17 December, 2025",
      hoursWorked: "6",
      formStatus: true,
      facility: "Starbucks", // Added facility field
    },
    {
      formName: "Meal Observation",
      time: "11:15:00",
      date: "17 December, 2025",
      hoursWorked: "1",
      formStatus: false,
      facility: "Burger King", // Added facility field
    },
    {
      formName: "Kitchen Sanitation",
      time: "07:50:00",
      date: "17 December, 2025",
      hoursWorked: "8",
      formStatus: true,
      facility: "KFC", // Added facility field
    },
    {
      formName: "Kitchen Sanitation",
      time: "09:12:33",
      date: "25 November, 2025",
      hoursWorked: "3",
      formStatus: false,
      facility: "Starbucks", // Added facility field
    },
    {
      formName: "Meal Observation",
      time: "07:45:38",
      date: "25 November, 2025",
      hoursWorked: "5",
      formStatus: true,
      facility: "Burger King", // Added facility field
    },
    {
      formName: "Kitchen Sanitation",
      time: "08:45:00",
      date: "17 December, 2025",
      hoursWorked: "6",
      formStatus: true,
      facility: "KFC", // Added facility field
    },
    {
      formName: "Meal Observation",
      time: "11:15:00",
      date: "17 December, 2025",
      hoursWorked: "1",
      formStatus: false,
      facility: "Starbucks", // Added facility field
    },
    {
      formName: "Kitchen Sanitation",
      time: "07:50:00",
      date: "17 December, 2025",
      hoursWorked: "8",
      formStatus: true,
      facility: "Burger King", // Added facility field
    },
  ];

  // Filter data based on selected facility
  const filteredData =
    selectedFacility === "All"
      ? employeeData
      : employeeData.filter((item) => {
          if (selectedFacility === "KFC Facility")
            return item.facility === "KFC";
          if (selectedFacility === "Starbucks Facility")
            return item.facility === "Starbucks";
          if (selectedFacility === "Burger King Facility")
            return item.facility === "Burger King";
          return true;
        });

  const employeeColumns = [
    { name: "formName", label: "Form Name" },
    {
      name: "time",
      label: "Time",
      options: {
        customBodyRender: (value) => (
          <span style={{ color: "#29BF5A", fontWeight: 500 }}>{value}</span>
        ),
      },
    },
    {
      name: "date",
      label: "Date",
      options: {
        customBodyRender: (value) => (
          <span style={{ color: "#8B2885", fontWeight: 500 }}>{value}</span>
        ),
      },
    },
    { name: "hoursWorked", label: "Hours Worked" },
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
          const isCompleted = row.formStatus;

          const handleActionClick = () => {
            // Navigate based on form type
            if (row.formName === "Kitchen Sanitation") {
              navigate(
                isCompleted ? "/kitchen-view-form" : "/kitchen-fill-form",
                {
                  state: { form: row },
                }
              );
            } else if (row.formName === "Meal Observation") {
              navigate(isCompleted ? "/meal-view-form" : "/meal-fill-form", {
                state: { form: row },
              });
            } else {
              // fallback, just in case
              navigate(
                isCompleted ? "/client-view-form" : "/client-fill-form",
                {
                  state: { form: row },
                }
              );
            }
          };

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
                <Icon
                  icon={
                    isCompleted
                      ? "ic:baseline-remove-red-eye"
                      : "material-symbols:edit-document"
                  }
                  width="17"
                  height="20"
                />
                {isCompleted ? "View Form" : "Fill Form"}
              </button>
              
              <button
                onClick={() => handleAddTask(row)}
                style={{
                  background: "#2196F3",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px 12px",
                  color: "white",
                  borderRadius: "7px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                <Icon
                  icon="mdi:plus-circle-outline"
                  width="17"
                  height="20"
                />
                Add Task
              </button>
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
  };

  // Add Task Modal Component
  const AddTaskModal = ({ form, onClose, onSave }) => {
    const [taskData, setTaskData] = useState({
      title: form ? `${form.formName} - ${form.facility}` : "",
      facility: form?.facility || "KFC",
      description: "",
      startDateTime: new Date().toISOString().slice(0, 16),
      endDateTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString().slice(0, 16),
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
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
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
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                Facility
              </label>
              <select
                value={taskData.facility}
                onChange={(e) => setTaskData({ ...taskData, facility: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                }}>
                <option value="KFC">KFC</option>
                <option value="Starbucks">Starbucks</option>
                <option value="Burger King">Burger King</option>
                <option value="McDonald">McDonald</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}>
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={taskData.startDateTime}
                  onChange={(e) => setTaskData({ ...taskData, startDateTime: e.target.value })}
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
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}>
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={taskData.endDateTime}
                  onChange={(e) => setTaskData({ ...taskData, endDateTime: e.target.value })}
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
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
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
                }}>
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
                }}>
                Add to Timelogs
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
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
      <div>
        <MUIDataTable
          data={filteredData}
          columns={employeeColumns}
          options={options}
          className="overflow-hidden packageTable"
        />
      </div>

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
        />
      )}
    </>
  );
};

export default FacilityDetailDashboardData;