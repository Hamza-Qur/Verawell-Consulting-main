import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { getTeamTaskGraph } from "../redux/slices/dashboardSlice";
import DateFilter from "../components/DateFilter";
import useDateFilter from "../components/useDateFilter";
import { getMyFacilities } from "../redux/slices/facilitySlice";

const TeamStatistics = () => {
  const dispatch = useDispatch();

  // Use date filter hook
  const { dateFilter, updateFilter, getDateRange } = useDateFilter();

  // Facility filter state
  const [selectedFacility, setSelectedFacility] = useState("");
  const [facilities, setFacilities] = useState([]);

  // Get team task graph data from Redux store
  const { teamTaskGraph, isTeamTaskGraphLoading, teamTaskGraphError } =
    useSelector((state) => state.dashboard);

  // Get facilities from facility slice
  const {
    myFacilities = { data: [] },
    isLoading: isLoadingFacilities = false,
  } = useSelector((state) => state.facility || {});

  // Fetch facilities on component mount
  useEffect(() => {
    dispatch(getMyFacilities(1));
  }, [dispatch]);

  // Process facilities when they load
  useEffect(() => {
    if (myFacilities.data && myFacilities.data.length > 0) {
      const facilityList = myFacilities.data.map((facility) => ({
        id: facility.facility_id || facility.id,
        name: facility.facility_name || facility.name,
        address: facility.facility_address,
      }));
      setFacilities(facilityList);
    }
  }, [myFacilities]);

  // Fetch team task graph data when filters change
  useEffect(() => {
    const dateRange = getDateRange();
    const params = {
      from_date: dateRange.from_date,
      to_date: dateRange.to_date,
    };

    // Only add facility_id to params if a facility is selected
    if (selectedFacility && selectedFacility !== "") {
      params.facility_id = selectedFacility;
    }

    dispatch(getTeamTaskGraph(params));
  }, [
    dispatch,
    selectedFacility,
    dateFilter.selectedYear,
    dateFilter.viewType,
    dateFilter.selectedQuarter,
    dateFilter.selectedMonth,
  ]);

  // Handle facility filter change
  const handleFacilityChange = (facilityId) => {
    setSelectedFacility(facilityId);
  };

  // Clear facility filter
  const clearFacilityFilter = () => {
    setSelectedFacility("");
  };

  // Get facility name by ID
  const getFacilityName = (id) => {
    if (!id || id === "") return "All Facilities";

    // Make sure we're comparing the right ID format
    const facility = facilities.find((f) => String(f.id) === String(id));

    if (facility) {
      return facility.name;
    }

    // If facility not found, return a formatted version of the ID
    return `Facility ${id}`;
  };

  // Transform API data to match the new format with all hour types
  const getChartData = () => {
    if (!teamTaskGraph || teamTaskGraph.length === 0) {
      // Return all zeros for all three metrics
      return {
        assigned: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        unassigned: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        attendance: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        total: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      };
    }

    // Create arrays for all 12 months initialized with 0
    const assignedData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const unassignedData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const attendanceData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const totalData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Month mapping from "2026-02" format to array index (0-11)
    teamTaskGraph.forEach((item) => {
      const yearMonth = item.month; // "2026-02"
      const monthNumber = parseInt(yearMonth.split("-")[1]); // 2

      // Convert to array index (month 2 = index 1, since Jan = 0)
      const arrayIndex = monthNumber - 1;

      if (arrayIndex >= 0 && arrayIndex < 12) {
        // Parse hours to numbers
        const assigned = parseFloat(item.assigned_task_hours) || 0;
        const unassigned = parseFloat(item.unassigned_task_hours) || 0;
        const attendance = parseFloat(item.attendance_hours) || 0;
        const total = assigned + unassigned + attendance;

        assignedData[arrayIndex] = assigned;
        unassignedData[arrayIndex] = unassigned;
        attendanceData[arrayIndex] = attendance;
        totalData[arrayIndex] = total;
      }
    });

    return {
      assigned: assignedData,
      unassigned: unassignedData,
      attendance: attendanceData,
      total: totalData,
    };
  };

  const chartData = getChartData();

  // Month names
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Chart series with all hour types
  const chartSeries = [
    {
      name: "Total Hours",
      data: chartData.total,
    },
    // {
    //   name: "Assigned Tasks Hours",
    //   data: chartData.assigned,
    // },
    // {
    //   name: "Other Tasks Hours",
    //   data: chartData.unassigned,
    // },
    // {
    //   name: "Attendance Hours",
    //   data: chartData.attendance,
    // },
  ];

  // Chart options with area chart configuration
  const chartOptions = {
    chart: {
      height: 264,
      type: "area",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      dropShadow: {
        enabled: false,
      },
    },

    colors: ["#8B2885", "#FF6B6B", "#4ECDC4", "#45B7D1"],

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.2,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      curve: "smooth",
      width: 3,
    },

    markers: {
      size: 1,
      strokeWidth: 3,
      hover: {
        size: 8,
      },
    },

    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },

    xaxis: {
      categories: months,
      tooltip: {
        enabled: false,
      },
      labels: {
        style: {
          fontSize: "14px",
        },
      },
      axisBorder: {
        show: false,
      },
      crosshairs: {
        show: true,
        width: 30,
        stroke: {
          width: 0,
        },
        fill: {
          type: "solid",
          color: "#d14f5183",
        },
      },
    },

    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const month = months[dataPointIndex];

        // Safely access series data with fallbacks
        const total = series[0]?.[dataPointIndex] || 0;
        const assigned = series[1]?.[dataPointIndex] || 0;
        const unassigned = series[2]?.[dataPointIndex] || 0;
        const attendance = series[3]?.[dataPointIndex] || 0;

        const dateRange = getDateRange();
        const facilityName = getFacilityName(selectedFacility);

        return `
      <div style="padding: 12px; background: #fff; border-radius: 6px; border: 1px solid #e2e8f0; min-width: 280px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="font-size: 15px; color: #1a202c; font-weight: 600; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          ${month}
        </div>
        
        <div style="font-size: 13px; color: #4a5568; margin-bottom: 6px; display: flex; justify-content: space-between;">
          <span>Period:</span>
          <span style="font-weight: 500;">${dateRange.label}</span>
        </div>
        
        <div style="font-size: 13px; color: #4a5568; margin-bottom: 10px; display: flex; justify-content: space-between;">
          <span>Facility:</span>
          <span style="font-weight: 500;">${facilityName}</span>
        </div>

        <div style="background: #f7fafc; padding: 8px; border-radius: 4px;">
          <div style="font-size: 14px; color: #8B2885; font-weight: 600; margin-bottom: 6px; display: flex; justify-content: space-between;">
            <span>Total Hours:</span>
            <span>${total.toFixed(1)}</span>
          </div>
          
          ${
            assigned > 0
              ? `
          <div style="font-size: 13px; color: #4a5568; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span style="color: #FF6B6B;">● Assigned Tasks:</span>
            <span>${assigned.toFixed(1)}</span>
          </div>
          `
              : ""
          }
          
          ${
            unassigned > 0
              ? `
          <div style="font-size: 13px; color: #4a5568; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span style="color: #4ECDC4;">● Other Tasks:</span>
            <span>${unassigned.toFixed(1)}</span>
          </div>
          `
              : ""
          }
          
          ${
            attendance > 0
              ? `
          <div style="font-size: 13px; color: #4a5568; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span style="color: #45B7D1;">● Attendance:</span>
            <span>${attendance.toFixed(1)}</span>
          </div>
          `
              : ""
          }
        </div>
      </div>
    `;
      },
      x: {
        show: true,
      },
      y: {
        show: false,
      },
    },

    grid: {
      row: {
        colors: ["transparent", "transparent"],
        opacity: 0.5,
      },
      borderColor: "#D1D5DB",
      strokeDashArray: 3,
    },

    yaxis: {
      labels: {
        formatter: function (value) {
          return value.toFixed(1);
        },
        style: {
          fontSize: "14px",
        },
      },
      title: {
        text: "Hours",
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
  };

  // Show loading indicator
  if (isTeamTaskGraphLoading) {
    return (
      <div className="col-xxl-12 col-xl-12">
        <div className="card h-100">
          <div className="card-body">
            <div className="d-flex flex-wrap align-items-center justify-content-start mb-3 mt-20">
              <h6 className="text-lg mb-0 mt-0">
                Hours Logged ({new Date().getFullYear()})
              </h6>
              <ul className="salesList">
                <li className="text-sm fw-semibold">X-axis: Months</li>
                <li className="text-sm fw-semibold">
                  Y-axis: Number of Hours Logged
                </li>
              </ul>
            </div>
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "264px" }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading chart data...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error
  if (teamTaskGraphError) {
    return (
      <div className="col-xxl-12 col-xl-12">
        <div className="card h-100">
          <div className="card-body">
            <div className="d-flex flex-wrap align-items-center justify-content-start mb-3 mt-20">
              <h6 className="text-lg mb-0 mt-0">
                Hours Logged ({new Date().getFullYear()})
              </h6>
              <ul className="salesList">
                <li className="text-sm fw-semibold">X-axis: Months</li>
                <li className="text-sm fw-semibold">
                  Y-axis: Number of Hours Logged
                </li>
              </ul>
            </div>
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "264px" }}>
              <div className="text-center">
                <p className="text-danger">Error loading chart data</p>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    const dateRange = getDateRange();
                    const params = {
                      from_date: dateRange.from_date,
                      to_date: dateRange.to_date,
                    };
                    if (selectedFacility) {
                      params.facility_id = selectedFacility;
                    }
                    dispatch(getTeamTaskGraph(params));
                  }}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-xxl-12 col-xl-12">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center justify-content-start mb-3 mt-20">
            <h6 className="text-lg mb-0 mt-0">Hours Logged</h6>
            <ul className="salesList">
              <li className="text-sm fw-semibold">X-axis: Months</li>
              <li className="text-sm fw-semibold">
                Y-axis: Number of Hours Logged
              </li>
            </ul>
          </div>

          {/* Filter Section */}
          <div className="mb-4 pb-2 border-bottom">
            <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
              {/* Date Filter */}
              <div style={{ minWidth: "300px" }}>
                <DateFilter
                  {...dateFilter}
                  onFilterChange={updateFilter}
                  size="sm"
                />
              </div>

              {/* Facility Filter */}
              <div style={{ minWidth: "250px" }}>
                <select
                  value={selectedFacility}
                  onChange={(e) => handleFacilityChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    backgroundColor: "white",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}>
                  <option value="">All Facilities</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}{" "}
                      {facility.address ? `- ${facility.address}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter badges */}
            <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
              <span className="badge bg-light text-dark p-2">
                <i className="fas fa-calendar-alt me-1"></i>
                {getDateRange().label}
              </span>

              {selectedFacility && selectedFacility !== "" && (
                <span className="badge bg-info text-white p-2">
                  <i className="fas fa-building me-1"></i>
                  Facility: {getFacilityName(selectedFacility)}
                  <button
                    onClick={clearFacilityFilter}
                    style={{
                      background: "none",
                      border: "none",
                      color: "white",
                      marginLeft: "8px",
                      padding: "0 4px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}>
                    ×
                  </button>
                </span>
              )}

              {teamTaskGraph && teamTaskGraph.length > 0 && (
                <span className="badge bg-success p-2">
                  <i className="fas fa-clock me-1"></i>
                  {teamTaskGraph.length} Months of Data
                </span>
              )}
            </div>
          </div>

          {/* Chart - Area chart with multiple series */}
          {!teamTaskGraph || teamTaskGraph.length === 0 ? (
            <div
              className="text-center py-5"
              style={{
                height: "264px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}>
              <Icon
                icon="mdi:chart-line"
                width={48}
                height={48}
                className="text-muted mb-2"
              />
              <p className="text-muted mb-1">
                No hour data available for selected period
                {selectedFacility && ` and facility`}
              </p>
              <p className="text-muted small">
                Try selecting a different date range or facility
              </p>
            </div>
          ) : (
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={264}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamStatistics;
