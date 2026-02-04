import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import DynamicModal from "./DynamicModal";
import EditAttendanceModal from "./EditAttendanceModal";
import {
  getAttendance,
  deleteAttendance,
} from "../redux/slices/attendanceSlice";

const AttendanceDataTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { attendanceList, isLoading, error, isDeleting } = useSelector(
    (state) => state.attendance,
  );

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [selectedFacility, setSelectedFacility] = useState("All");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const buttonRefs = useRef([]);

  useEffect(() => {
    dispatch(getAttendance());
  }, [dispatch]);

  const handleFacilityFilter = (facility) => {
    setSelectedFacility(facility);
  };

  const handleDropdownToggle = (index, e) => {
    e.stopPropagation();

    if (buttonRefs.current[index]) {
      const rect = buttonRefs.current[index].getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 120,
      });
    }

    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const handleEdit = (rowData) => {
    setSelectedAttendance(rowData);
    setShowEditModal(true);
    setDropdownOpen(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedAttendance(null);
  };

  const handleDelete = (rowData) => {
    if (
      window.confirm(
        `Are you sure you want to delete attendance record for "${rowData.title}"?`,
      )
    ) {
      dispatch(deleteAttendance(rowData.id)).then((result) => {
        // Refresh after successful deletion
        if (result.payload?.success) {
          dispatch(getAttendance());
        }
      });
    }
    setDropdownOpen(null);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const calculateHoursWorked = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";

    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffInMs = end - start;
      const diffInHours = diffInMs / (1000 * 60 * 60);
      return `${diffInHours.toFixed(1)}`;
    } catch (error) {
      return "N/A";
    }
  };

  const transformAttendanceData = (apiData) => {
    return apiData.map((task) => {
      const hoursWorked = calculateHoursWorked(task.start_time, task.end_time);

      let month = "N/A";
      if (task.start_time) {
        try {
          const startDate = new Date(task.start_time);
          month = startDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
        } catch (error) {
          month = "N/A";
        }
      }

      return {
        id: task.id || "N/A",
        title: task.title || "No Title",
        description: task.description || "No Description",
        startTime: task.start_time
          ? new Date(task.start_time).toLocaleTimeString("en-US", {
              hour12: true,
            })
          : "N/A",
        endTime: task.end_time
          ? new Date(task.end_time).toLocaleTimeString("en-US", {
              hour12: true,
            })
          : "N/A",
        month: month,
        employeeName: task.user_name || `User ${task.user_id || "N/A"}`,
        employeeId: task.user_id || "N/A",
        employeeEmail: task.user_email || "N/A",
        facility: task.facility_name || "Unknown Facility",
        hoursWorked: hoursWorked,
        originalData: task,
      };
    });
  };

  const attendanceData = isLoading
    ? []
    : transformAttendanceData(attendanceList);

  const filteredData =
    selectedFacility === "All"
      ? attendanceData
      : attendanceData.filter((task) => {
          if (selectedFacility === "KFC Facility")
            return (
              task.facility === "KFC" ||
              task.facility.toLowerCase().includes("kfc")
            );
          if (selectedFacility === "Starbucks Facility")
            return (
              task.facility === "Starbucks" ||
              task.facility.toLowerCase().includes("starbucks")
            );
          if (selectedFacility === "Burger King Facility")
            return (
              task.facility === "Burger King" ||
              task.facility.toLowerCase().includes("burger king")
            );
          return true;
        });

  const columns = [
    {
      name: "employeeName",
      label: "Employee Name",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowData = filteredData[tableMeta.rowIndex];
          return (
            <div>
              <div style={{ fontWeight: "500", color: "#1A1A1A" }}>{value}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {rowData.employeeEmail}
              </div>
            </div>
          );
        },
      },
    },
    {
      name: "employeeId",
      label: "Employee ID",
      options: {
        customBodyRender: (value) => {
          return (
            <div style={{ color: "#666", fontWeight: "400" }}>ID: {value}</div>
          );
        },
      },
    },
    {
      name: "facility",
      label: "Facility",
      options: {
        customBodyRender: (value) => {
          return (
            <div
              style={{
                padding: "4px 8px",
                backgroundColor: "#E5F4FF",
                color: "#1976D2",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: 500,
                display: "inline-block",
              }}>
              {value}
            </div>
          );
        },
      },
    },
    {
      name: "startTime",
      label: "Check-In",
    },
    {
      name: "endTime",
      label: "Check-Out",
    },
    {
      name: "hoursWorked",
      label: "Hours Worked",
      options: {
        customBodyRender: (value) => {
          let color = "#666";
          let displayValue = value;

          if (value !== "N/A") {
            const hoursNum = parseFloat(value);
            if (!isNaN(hoursNum)) {
              if (hoursNum < 4) color = "#D32F2F";
              else if (hoursNum < 8) color = "#FF8104";
              else color = "#29BF5A";

              displayValue = `${hoursNum} hours`;
            }
          }

          return <div style={{ color, fontWeight: "500" }}>{displayValue}</div>;
        },
      },
    },
    {
      name: "month",
      label: "Month",
    },
    {
      name: "action",
      label: "Action",
      options: {
        sort: false,
        filter: false,
        customBodyRenderLite: (dataIndex) => {
          return (
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                ref={(el) => (buttonRefs.current[dataIndex] = el)}
                onClick={(e) => handleDropdownToggle(dataIndex, e)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                }}>
                <Icon icon="mdi:dots-horizontal" width="25" height="25" />
              </button>
            </div>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: "none",
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: false,
    search: true,
    searchPlaceholder: "Search by employee name, facility...",
    pagination: false,
    tableBodyHeight: "auto",
  };

  return (
    <>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: "10px" }}>Loading attendance data...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#D32F2F" }}>
          <Icon icon="material-symbols:error-outline" width="48" height="48" />
          <p style={{ marginTop: "10px" }}>Error: {error}</p>
          <button
            onClick={() => dispatch(getAttendance())}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#8B2885",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}>
            Retry
          </button>
        </div>
      ) : (
        <>
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
              }}></div>
          </div>

          {attendanceData.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              <Icon icon="mdi:calendar-clock" width="48" height="48" />
              <p style={{ marginTop: "10px" }}>No attendance records found.</p>
            </div>
          ) : (
            <div className="basic-data-table">
              <MUIDataTable
                title=""
                data={filteredData}
                columns={columns}
                options={options}
                className="overflow-hidden packageTable"
              />
            </div>
          )}
        </>
      )}

      <DynamicModal
        show={showEditModal}
        handleClose={handleCloseEditModal}
        title={`Edit Attendance - ${selectedAttendance?.title || ""}`}
        content={
          <EditAttendanceModal
            attendanceData={selectedAttendance}
            isEditMode={true}
            onClose={handleCloseEditModal}
            onSuccess={() => {
              // This will be called when the edit is successful
              handleCloseEditModal();
              dispatch(getAttendance()); // Refresh the attendance data
            }}
          />
        }
        modalWidth="50%"
      />

      {dropdownOpen !== null &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: buttonPosition.top,
              left: buttonPosition.left,
              backgroundColor: "white",
              border: "1px solid #E0E0E0",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              minWidth: "140px",
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                color: "#333",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F5F5F5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() => handleEdit(filteredData[dropdownOpen])}>
              <Icon icon="line-md:edit" width="18" height="18" color="#666" />
              <span>Edit</span>
            </div>
            <div
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                color: "#D32F2F",
                borderTop: "1px solid #F0F0F0",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F5F5F5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() => handleDelete(filteredData[dropdownOpen])}>
              <Icon
                icon="material-symbols:delete-outline"
                width="18"
                height="18"
                color="#D32F2F"
              />
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default AttendanceDataTable;
