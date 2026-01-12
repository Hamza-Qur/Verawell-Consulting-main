import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { createPortal } from "react-dom";
// ADD THESE TWO IMPORTS
import DynamicModal from "./DynamicModal";
import CreateEmployeeModal from "./CreateEmployeeModal";

const EmployeeDashboardData = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef([]);

  // ADD THESE TWO STATES FOR THE EDIT MODAL
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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

  // UPDATE THIS FUNCTION TO OPEN MODAL INSTEAD OF ALERT
  const handleEdit = (row) => {
    setSelectedEmployee(row); // Store the employee data
    setShowEditModal(true); // Open the modal
    setDropdownOpen(null); // Close the dropdown
  };

  const handleDelete = (row) => {
    alert(`Deleted Employee: ${row.employeeName} successfully`);
    setDropdownOpen(null);
  };

  // ADD THIS FUNCTION TO CLOSE THE EDIT MODAL
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const employeeColumns = [
    {
      name: "employeeName",
      label: "Employee Name",
      options: {
        customBodyRender: (value, tableMeta) => {
          return value;
        },
      },
    },
    { name: "employeeID", label: "Employee ID" },
    { name: "facility", label: "Facility" },
    { name: "hoursWorked", label: "Hours Worked" },
    { name: "formsSubmitted", label: "Forms Submitted" },
    {
      name: "action",
      label: "Action",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          return (
            <div style={{ position: "relative" }}>
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

  const employeeData = [
    {
      employeeName: "Savannah Nguyen",
      employeeID: "NV-1001",
      facility: "KFC",
      checkinTime: "09:12:33",
      checkoutTime: "18:31:58",
      status: "Leave",
      late: "09",
      formsSubmitted: "03",
      hoursWorked: "84",
    },
    {
      employeeName: "Darlene Robertson",
      employeeID: "NV-1002",
      facility: "Starbucks",
      checkinTime: "07:45:38",
      checkoutTime: "---",
      status: "On Site",
      late: "09",
      formsSubmitted: "03",
      hoursWorked: "84",
    },
    {
      employeeName: "Marvin McKinney",
      employeeID: "NV-1003",
      facility: "Burger King",
      checkinTime: "08:30:31",
      checkoutTime: "18:20:51",
      status: "Leave",
      late: "09",
      formsSubmitted: "03",
      hoursWorked: "84",
    },
    {
      employeeName: "Jacob Jones",
      employeeID: "NV-1004",
      facility: "KFC",
      checkinTime: "09:02:15",
      checkoutTime: "---",
      status: "On Site",
      late: "09",
      formsSubmitted: "03",
      hoursWorked: "91",
    },
    {
      employeeName: "Esther Howard",
      employeeID: "NV-1005",
      facility: "Burger King",
      checkinTime: "07:43:18",
      checkoutTime: "17:56:43",
      status: "Leave",
      late: "09",
      formsSubmitted: "03",
      hoursWorked: "95",
    },
  ];

  const options = {
    selectableRows: "none",
    rowsPerPageOptions: [5, 10, 15, 100],
    rowsPerPage: 5,
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: false,
    search: true,
  };

  return (
    <>
      <div>
        <h2 className="fs-2 mt-40">Employees</h2>
        <MUIDataTable
          data={employeeData}
          columns={employeeColumns}
          options={options}
          className="overflow-hidden packageTable"
        />
      </div>

      {/* ADD THIS EDIT MODAL COMPONENT */}
      <DynamicModal
        show={showEditModal}
        handleClose={handleCloseEditModal}
        title={`Edit Employee - ${selectedEmployee?.employeeName || ""}`}
        content={
          <div className="modal-fix">
            <CreateEmployeeModal
              employeeData={selectedEmployee}
              isEditMode={true}
              onClose={handleCloseEditModal}
            />
          </div>
        }
        modalWidth="40%"
      />

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
              onClick={() => handleEdit(employeeData[dropdownOpen])}>
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
              onClick={() => handleDelete(employeeData[dropdownOpen])}>
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
    </>
  );
};

export default EmployeeDashboardData;
