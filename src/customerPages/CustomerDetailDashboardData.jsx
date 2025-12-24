import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { createPortal } from "react-dom";

const CustomerDetailDashboardData = ({ rows }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef([]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
          const row = employeeData[dataIndex];
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
          );
        },
      },
    },
  ];

  const employeeData = [
    {
      formName: "Kitchen Sanitation",
      time: "09:12:33",
      date: "25 November, 2025",
      hoursWorked: "3",
      formStatus: false,
    },
    {
      formName: "Meal Observation",
      time: "07:45:38",
      date: "25 November, 2025",
      hoursWorked: "5",
      formStatus: true,
    },
    {
      formName: "Kitchen Sanitation",
      time: "08:45:00",
      date: "17 December, 2025",
      hoursWorked: "6",
      formStatus: true,
    },
    {
      formName: "Meal Observation",
      time: "11:15:00",
      date: "17 December, 2025",
      hoursWorked: "1",
      formStatus: false,
    },
    {
      formName: "Kitchen Sanitation",
      time: "07:50:00",
      date: "17 December, 2025",
      hoursWorked: "8",
      formStatus: true,
    },
    {
      formName: "Kitchen Sanitation",
      time: "09:12:33",
      date: "25 November, 2025",
      hoursWorked: "3",
      formStatus: false,
    },
    {
      formName: "Meal Observation",
      time: "07:45:38",
      date: "25 November, 2025",
      hoursWorked: "5",
      formStatus: true,
    },
    {
      formName: "Kitchen Sanitation",
      time: "08:45:00",
      date: "17 December, 2025",
      hoursWorked: "6",
      formStatus: true,
    },
    {
      formName: "Meal Observation",
      time: "11:15:00",
      date: "17 December, 2025",
      hoursWorked: "1",
      formStatus: false,
    },
    {
      formName: "Kitchen Sanitation",
      time: "07:50:00",
      date: "17 December, 2025",
      hoursWorked: "8",
      formStatus: true,
    },
    {
      formName: "Kitchen Sanitation",
      time: "09:12:33",
      date: "25 November, 2025",
      hoursWorked: "3",
      formStatus: false,
    },
    {
      formName: "Meal Observation",
      time: "07:45:38",
      date: "25 November, 2025",
      hoursWorked: "5",
      formStatus: true,
    },
    {
      formName: "Kitchen Sanitation",
      time: "08:45:00",
      date: "17 December, 2025",
      hoursWorked: "6",
      formStatus: true,
    },
    {
      formName: "Meal Observation",
      time: "11:15:00",
      date: "17 December, 2025",
      hoursWorked: "1",
      formStatus: false,
    },
    {
      formName: "Kitchen Sanitation",
      time: "07:50:00",
      date: "17 December, 2025",
      hoursWorked: "8",
      formStatus: true,
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

  return (
    <>
      <div>
        <MUIDataTable
          data={employeeData}
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

export default CustomerDetailDashboardData;
