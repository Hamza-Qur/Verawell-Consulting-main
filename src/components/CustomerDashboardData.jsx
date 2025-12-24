import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { createPortal } from "react-dom";

const CustomerDashboardData = () => {
  const navigate = useNavigate();

  // const handleEdit = (row) => {
  //   alert(`Edit Employee: ${row.facilityName} successfully`);
  //   setDropdownOpen(null);
  // };

  // const handleDelete = (row) => {
  //   alert(`Deleted Employee: ${row.employeeName} successfully`);
  //   setDropdownOpen(null);
  // };

  const handleClick = (rowData) => {
    navigate("/customer-detail-page", { state: { facility: rowData } });
  };

  const employeeColumns = [
    { name: "facility", label: "Facility" },
    { name: "hoursWorked", label: "Hours Worked" },
    { name: "formsSubmitted", label: "Forms Submitted" },
    { name: "documents", label: "Documents" },
    {
      name: "action",
      label: "Action",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const rowData = employeeData[dataIndex];
          return (
            <div style={{ position: "relative" }}>
              <button
                // ref={(el) => (buttonRefs.current[dataIndex] = el)}
                onClick={() => handleClick(rowData)}
                style={{
                  background: "#8B2885",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px 10px",
                  color: "white",
                  borderRadius: "7px",
                }}>
                <Icon
                  icon="ic:baseline-remove-red-eye"
                  width="17"
                  height="20"
                  style={{ marginRight: "5px" }}
                />
                View Facility
              </button>
            </div>
          );
        },
      },
    },
  ];

  const employeeData = [
    {
      facility: "KFC",
      documents: "04",
      formsSubmitted: "03",
      hoursWorked: "3",
    },
    {
      facility: "Starbucks",
      documents: "06",
      formsSubmitted: "03",
      hoursWorked: "5",
    },
    {
      facility: "Burger King",
      documents: "05",
      formsSubmitted: "03",
      hoursWorked: "6",
    },
    {
      facility: "KFC",
      documents: "02",
      formsSubmitted: "03",
      hoursWorked: "1",
    },
    {
      facility: "Burger King",
      documents: "08",
      formsSubmitted: "03",
      hoursWorked: "8",
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
        <h2 className="fs-2 mt-40">Recent Activity</h2>
        <MUIDataTable
          data={employeeData}
          columns={employeeColumns}
          options={options}
          className="overflow-hidden packageTable"
        />
      </div>
    </>
  );
};

export default CustomerDashboardData;
