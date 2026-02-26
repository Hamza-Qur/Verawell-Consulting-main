import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTeamAssignedFacilities } from "../redux/slices/dashboardSlice";

const CustomerDashboardData = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get team assigned facilities from Redux store
  const {
    teamAssignedFacilities,
    isTeamAssignedFacilitiesLoading,
    teamAssignedFacilitiesError,
  } = useSelector((state) => state.dashboard);

  const [searchText, setSearchText] = useState("");

  // Fetch team assigned facilities on component mount
  useEffect(() => {
    dispatch(getTeamAssignedFacilities(1));
  }, [dispatch]);

  const handleClick = (rowData) => {
    // Navigate to the correct route with facility ID in the URL
    navigate(`/client-facility/${rowData.id}`, {
      state: {
        facility: rowData,
        facilityId: rowData.id,
      },
    });
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
      hoursWorked: facility.total_hours || "0",
      formsSubmitted: facility.total_assessments || "0",
      documents: facility.total_assigned_assessments || "0",
      total_tasks: facility.total_tasks || "0",
      total_assigned_users: facility.total_assigned_users || "0",
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
    rowsPerPageOptions: [], // Empty array removes pagination dropdown
    rowsPerPage: teamAssignedFacilities?.total || 100, // Show all records
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: true,
    search: true,
    searchText: searchText,
    onSearchChange: (searchText) => setSearchText(searchText),
    pagination: false, // This completely removes pagination
    serverSide: false,
    count: teamAssignedFacilities?.total || 0,
    // Custom loading overlay
    textLabels: {
      body: {
        noMatch: isTeamAssignedFacilitiesLoading ? (
          <div>Loading...</div>
        ) : teamAssignedFacilitiesError ? (
          <div>Error: {teamAssignedFacilitiesError}</div>
        ) : (
          "Sorry, there is no matching data to display"
        ),
      },
    },
  };

  // Show loading state
  if (isTeamAssignedFacilitiesLoading && !teamAssignedFacilities.data.length) {
    return (
      <div className="mt-40">
        <h2 className="fs-2">Recent Activity</h2>
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
  if (teamAssignedFacilitiesError && !teamAssignedFacilities.data.length) {
    return (
      <div className="mt-40">
        <h2 className="fs-2">Recent Activity</h2>
        <div className="alert alert-danger" role="alert">
          Error loading facilities: {teamAssignedFacilitiesError}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => dispatch(getTeamAssignedFacilities(1))}>
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

        {teamAssignedFacilities?.data?.length === 0 &&
        !isTeamAssignedFacilitiesLoading ? (
          <div className="alert alert-info" role="alert">
            No facilities assigned to your team yet.
          </div>
        ) : (
          <MUIDataTable
            data={transformFacilityData()}
            columns={employeeColumns}
            options={options}
            className="overflow-hidden packageTable"
          />
        )}

        {/* Stats summary (optional) */}
        <div className="mt-3 text-muted small">
          Showing {transformFacilityData().length} of{" "}
          {teamAssignedFacilities?.total || 0} facilities
        </div>
      </div>
    </>
  );
};

export default CustomerDashboardData;
