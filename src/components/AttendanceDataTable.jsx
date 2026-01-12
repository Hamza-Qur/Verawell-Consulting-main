import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import DynamicModal from "./DynamicModal";
import EditAttendanceModal from "./EditAttendanceModal";

const AttendanceDataTable = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [selectedFacility, setSelectedFacility] = useState("All");
  const buttonRefs = useRef([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

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
        left: rect.left + window.scrollX - 120,
      });
    }

    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const handleEdit = (rowData) => {
    setSelectedAttendance(rowData); // Store the attendance data
    setShowEditModal(true); // Open the modal
    setDropdownOpen(null); // Close the dropdown
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedAttendance(null);
  };

  const handleDelete = (rowData) => {
    if (
      window.confirm(
        `Are you sure you want to delete attendance record for ${rowData.employeeName}?`
      )
    ) {
      alert(
        `Deleted attendance record for ${rowData.employeeName} successfully`
      );
    }
    setDropdownOpen(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Attendance data matching your image exactly
  const attendanceData = [
    {
      employeeName: "Savannah Nguyen",
      id: "70668",
      facility: "KFC",
      month: "October 2025",
      hoursWorked: "84",
    },
    {
      employeeName: "Darlene Robertson",
      id: "97774",
      facility: "Starbucks",
      month: "October 2025",
      hoursWorked: "84",
    },
    {
      employeeName: "Marvin McKinney",
      id: "97774",
      facility: "Burger King",
      month: "October 2025",
      hoursWorked: "84",
    },
    {
      employeeName: "Jerome Bell",
      id: "22739",
      facility: "Starbucks",
      month: "September 2025",
      hoursWorked: "90",
    },
    {
      employeeName: "Jacob Jones",
      id: "22739",
      facility: "KFC",
      month: "September 2025",
      hoursWorked: "91",
    },
    {
      employeeName: "Esther Howard",
      id: "43718",
      facility: "Burger King",
      month: "September 2025",
      hoursWorked: "95",
    },
    {
      employeeName: "Annette Block",
      id: "70668",
      facility: "KFC",
      month: "August 2025",
      hoursWorked: "84",
    },
    {
      employeeName: "Guy Howkins",
      id: "39635",
      facility: "Starbucks",
      month: "August 2025",
      hoursWorked: "84",
    },
    {
      employeeName: "Keith Watson",
      id: "43756",
      facility: "Burger King",
      month: "August 2025",
      hoursWorked: "84",
    },
    {
      employeeName: "Floyd Miles",
      id: "22739",
      facility: "Starbucks",
      month: "July 2025",
      hoursWorked: "90",
    },
    {
      employeeName: "Esther Howard",
      id: "70668",
      facility: "KFC",
      month: "July 2025",
      hoursWorked: "91",
    },
    {
      employeeName: "Jerome Bell",
      id: "70668",
      facility: "Burger King",
      month: "July 2025",
      hoursWorked: "95",
    },
  ];

  // Filter data based on selected facility
  const filteredData =
    selectedFacility === "All"
      ? attendanceData
      : attendanceData.filter((employee) => {
          if (selectedFacility === "KFC Facility")
            return employee.facility === "KFC";
          if (selectedFacility === "Starbucks Facility")
            return employee.facility === "Starbucks";
          if (selectedFacility === "Burger King Facility")
            return employee.facility === "Burger King";
          return true;
        });

  const columns = [
    {
      name: "employeeName",
      label: "Employee Name",
      options: {
        customBodyRender: (value) => {
          return (
            <div style={{ fontWeight: "500", color: "#1A1A1A" }}>{value}</div>
          );
        },
      },
    },
    {
      name: "id",
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
    },
    {
      name: "hoursWorked",
      label: "Hours Worked",
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
          const rowData = filteredData[dataIndex];
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
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 15, 20],
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: false,
    search: true,
    searchPlaceholder: "Search attendance...",
    pagination: true,
    tableBodyHeight: "auto",
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

      <div className="basic-data-table">
        <MUIDataTable
          title=""
          data={filteredData}
          columns={columns}
          options={options}
          className="overflow-hidden packageTable"
        />
      </div>
      <DynamicModal
        show={showEditModal}
        handleClose={handleCloseEditModal}
        title={`Edit Attendance - ${selectedAttendance?.employeeName || ""}`}
        content={
          <EditAttendanceModal
            attendanceData={selectedAttendance}
            isEditMode={true}
            onClose={handleCloseEditModal}
          />
        }
        modalWidth="50%"
      />

      {/* Portal dropdown to body */}
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
              <span>Delete</span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default AttendanceDataTable;
