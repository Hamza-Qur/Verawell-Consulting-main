import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import DefaultAvatar from "../otherImages/default.png";
import DP1 from "../otherImages/dp-1.png";
import DP2 from "../otherImages/dp-2.png";
import DP3 from "../otherImages/dp-3.png";
import DP4 from "../otherImages/dp-4.png";
import DP5 from "../otherImages/dp-5.png";
import DP6 from "../otherImages/dp-6.png";
// ADD THESE IMPORTS
import DynamicModal from "./DynamicModal";
import CreateEmployeeModal from "./CreateEmployeeModal";

const EmployeeDataTable = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef([]);

  // ADD THESE STATES FOR THE EDIT MODAL
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleDropdownToggle = (index, e) => {
    e.stopPropagation();

    // Get button position
    if (buttonRefs.current[index]) {
      const rect = buttonRefs.current[index].getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 100, // Adjust to show left of button
      });
    }

    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  // UPDATE THIS FUNCTION TO OPEN MODAL
  const handleEdit = (rowData) => {
    setSelectedEmployee(rowData); // Store the employee data
    setShowEditModal(true); // Open the modal
    setDropdownOpen(null); // Close the dropdown
  };

  const handleDelete = (rowData) => {
    alert(`Deleted Employee: ${rowData.employeeName} successfully`);
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

  // Employee data matching your image
  const employeeData = [
    {
      id: "70668",
      employeeName: "Savannah Nguyen",
      employeeImage: DP1,
      email: "tanyo.hill@example.com",
      phone: "(205) 555-0100",
      formsUploaded: "05",
    },
    {
      id: "9774",
      employeeName: "Darlene Robertson",
      employeeImage: DP2,
      email: "michael.mitc@example.com",
      phone: "(429) 555-0129",
      formsUploaded: "04",
    },
    {
      id: "9774",
      employeeName: "Marvin McKinney",
      employeeImage: DP3,
      email: "micheller.ivera@example.com",
      phone: "(505) 555-0125",
      formsUploaded: "12",
    },
    {
      id: "22739",
      employeeName: "Jerome Bell",
      employeeImage: DP4,
      email: "willie.jennings@example.com",
      phone: "(303) 555-0105",
      formsUploaded: "05",
    },
    {
      id: "22739",
      employeeName: "Jacob Jones",
      employeeImage: DP5,
      email: "curtis.wesave@example.com",
      phone: "(907) 555-0101",
      formsUploaded: "06",
    },
    {
      id: "4378",
      employeeName: "Esther Howard",
      employeeImage: DP6,
      email: "sara.cruz@example.com",
      phone: "(229) 555-0109",
      formsUploaded: "02",
    },
    {
      id: "70668",
      employeeName: "Annette Block",
      employeeImage: DP1,
      email: "deama.curtis@example.com",
      phone: "(217) 555-0113",
      formsUploaded: "10",
    },
    {
      id: "39635",
      employeeName: "Guy Howkins",
      employeeImage: DP2,
      email: "kenzilawson@example.com",
      phone: "(225) 555-0118",
      formsUploaded: "05",
    },
    {
      id: "43756",
      employeeName: "Kistin Watson",
      employeeImage: DP3,
      email: "felicia.reld@example.com",
      phone: "(316) 555-0116",
      formsUploaded: "08",
    },
    {
      id: "22739",
      employeeName: "Floyd Miles",
      employeeImage: DP4,
      email: "jessica.hanson@example.com",
      phone: "(308) 555-0121",
      formsUploaded: "07",
    },
    {
      id: "70668",
      employeeName: "Esther Howard",
      employeeImage: DP5,
      email: "deama.curtis@example.com",
      phone: "(217) 555-0113",
      formsUploaded: "10",
    },
    {
      id: "70668",
      employeeName: "Jerome Bell",
      employeeImage: DP6,
      email: "deama.curtis@example.com",
      phone: "(217) 555-0113",
      formsUploaded: "10",
    },
    {
      id: "70668",
      employeeName: "Marvin McKinney",
      employeeImage: DP1,
      email: "deama.curtis@example.com",
      phone: "(217) 555-0113",
      formsUploaded: "10",
    },
  ];

  const columns = [
    {
      name: "employeeName",
      label: "Name",
    },
    {
      name: "id",
      label: "Employee ID",
    },
    {
      name: "email",
      label: "Email",
    },
    {
      name: "phone",
      label: "Phone",
    },
    {
      name: "formsUploaded",
      label: "Form Uploaded",
    },
    {
      name: "action",
      label: "Action",
      options: {
        sort: false,
        filter: false,
        customBodyRenderLite: (dataIndex) => {
          const rowData = employeeData[dataIndex];
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
    searchPlaceholder: "Search employees...",
    pagination: true,
    tableBodyHeight: "auto",
  };

  return (
    <>
      <div className="basic-data-table">
        <MUIDataTable
          title=""
          data={employeeData}
          columns={columns}
          options={options}
          className="overflow-hidden packageTable"
        />
      </div>

      {/* ADD THE EDIT MODAL HERE */}
      <DynamicModal
        show={showEditModal}
        handleClose={handleCloseEditModal}
        title={`Edit Employee - ${selectedEmployee?.employeeName || ""}`}
        content={
          <CreateEmployeeModal
            employeeData={selectedEmployee}
            isEditMode={true}
            onClose={handleCloseEditModal}
          />
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
              onClick={() => handleEdit(employeeData[dropdownOpen])}>
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
              onClick={() => handleDelete(employeeData[dropdownOpen])}>
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

export default EmployeeDataTable;
