// src/components/TeamDashboardData.jsx
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTeamAssignedFacilities } from "../redux/slices/dashboardSlice";
import DateFilter from "./DateFilter";
import useDateFilter from "./useDateFilter";

const TeamDashboardData = ({ rows }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get team assigned facilities from Redux store
  const {
    teamAssignedFacilities,
    isTeamAssignedFacilitiesLoading,
    teamAssignedFacilitiesError,
  } = useSelector((state) => state.dashboard);

  // Use date filter hook
  const { dateFilter, updateFilter, getDateRange } = useDateFilter();

  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch team assigned facilities with date filters
  useEffect(() => {
    const dateRange = getDateRange();

    dispatch(
      getTeamAssignedFacilities({
        page: currentPage,
        from_date: dateRange.from_date,
        to_date: dateRange.to_date,
      }),
    );
  }, [
    dispatch,
    currentPage,
    dateFilter.selectedYear,
    dateFilter.viewType,
    dateFilter.selectedQuarter,
    dateFilter.selectedMonth,
  ]);

  const handleClick = (rowData) => {
    // Navigate to the correct route with facility ID in the URL
    navigate(`/facility/${rowData.id}`, {
      state: {
        facility: rowData,
        facilityId: rowData.id,
      },
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Transform API data to match table structure
  const transformFacilityData = () => {
    if (
      !teamAssignedFacilities?.data ||
      teamAssignedFacilities.data.length === 0
    ) {
      return [];
    }

    return teamAssignedFacilities.data.map((facility) => ({
      id: facility.id,
      facility: facility.facility_name || "N/A",
      facility_address: facility.facility_address || "N/A",
      customer_group: facility.customer_group_name || "N/A",
      hoursWorked: facility.total_hours || "0",
      formsSubmitted: facility.total_assessments || "0",
      documents: facility.total_assigned_assessments || "0",
      total_tasks: facility.total_tasks || "0",
      total_assigned_users: facility.total_assigned_users || "0",
      budgetedhours: facility.budgeted_hours
        ? Math.round(facility.budgeted_hours)
        : "N/A",
      // Include all original data for navigation
      originalData: facility,
    }));
  };

  const employeeColumns = [
    {
      name: "facility",
      label: "Facility",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "customer_group",
      label: "Group Name",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "budgetedhours",
      label: "Budgeted Hours",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          return (
            <span style={{ color: "#666", fontSize: "14px" }}>{value}</span>
          );
        },
      },
    },
    {
      name: "hoursWorked",
      label: "Hours Worked",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "formsSubmitted",
      label: "Tasks Submitted",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "documents",
      label: "Documents",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "action",
      label: "Action",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const rowData = transformFacilityData()[dataIndex];
          return (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => handleClick(rowData.originalData)}
                style={{
                  background: "#8B2885",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px 10px",
                  color: "white",
                  borderRadius: "7px",
                }}
                disabled={isTeamAssignedFacilitiesLoading}>
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

  const options = {
    selectableRows: "none",
    rowsPerPageOptions: [5, 10, 25, 50],
    rowsPerPage: rows,
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: true,
    search: true,
    searchText: searchText,
    onSearchChange: (searchText) => setSearchText(searchText),
    pagination: true,
    serverSide: false,
    count: teamAssignedFacilities?.total || 0,
    page: currentPage - 1,
    onPageChange: (page) => handlePageChange(page + 1),
    onTableChange: (action, tableState) => {
      switch (action) {
        case "changePage":
          handlePageChange(tableState.page + 1);
          break;
        default:
          break;
      }
    },
    textLabels: {
      body: {
        noMatch: isTeamAssignedFacilitiesLoading
          ? "Loading..."
          : teamAssignedFacilitiesError
            ? `Error: ${teamAssignedFacilitiesError}`
            : "No facilities found for selected period",
      },
    },
  };

  // Show loading state
  if (isTeamAssignedFacilitiesLoading && !teamAssignedFacilities.data?.length) {
    return (
      <div className="mt-40">
        <h2 className="fs-2">Facilities</h2>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "200px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (teamAssignedFacilitiesError && !teamAssignedFacilities.data?.length) {
    return (
      <div className="mt-40">
        <h2 className="fs-2">Facilities</h2>
        <div className="alert alert-danger" role="alert">
          Error loading facilities: {teamAssignedFacilitiesError}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => {
              const dateRange = getDateRange();
              dispatch(
                getTeamAssignedFacilities({
                  page: 1,
                  from_date: dateRange.from_date,
                  to_date: dateRange.to_date,
                }),
              );
            }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-40">
        <h2 className="fs-2">Facilities</h2>

        {/* Date Filter and Header */}
        <div className="mb-4 pb-2 border-bottom">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <DateFilter
              {...dateFilter}
              onFilterChange={updateFilter}
              size="sm"
            />
          </div>

          <div className="mt-10 mb-10 d-flex align-items-center gap-2 flex-wrap">
            <span className="badge bg-light text-dark p-2">
              <i className="fas fa-calendar-alt me-1"></i>
              {getDateRange().label}
            </span>
            {teamAssignedFacilities?.total > 0 && (
              <span className="badge bg-success p-2">
                <i className="fas fa-building me-1"></i>
                {teamAssignedFacilities.total} Facilities
              </span>
            )}
          </div>
        </div>

        {teamAssignedFacilities?.data?.length === 0 &&
        !isTeamAssignedFacilitiesLoading ? (
          <div className="alert alert-info" role="alert">
            No facilities found for {getDateRange().label}.
          </div>
        ) : (
          <div className="basic-data-table">
            <MUIDataTable
              data={transformFacilityData()}
              columns={employeeColumns}
              options={options}
              className="overflow-hidden packageTable"
            />
          </div>
        )}

        {/* Stats summary */}
        {teamAssignedFacilities?.total > 0 && (
          <div className="mt-3 text-muted small">
            Showing {transformFacilityData().length} of{" "}
            {teamAssignedFacilities?.total || 0} facilities
          </div>
        )}
      </div>
    </>
  );
};

export default TeamDashboardData;
