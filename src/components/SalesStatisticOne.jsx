// src/components/Dashboard/SalesStatisticOne.jsx
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactApexChart from "react-apexcharts";
import {
  getSubmittedForms,
  getFacilityScores,
} from "../redux/slices/dashboardSlice";
import DateFilter from "../components/DateFilter";
import CustomerGroupFilter from "../components/CustomerGroupFilter";
import useDateFilter from "../components/useDateFilter";

const SalesStatisticOne = () => {
  const dispatch = useDispatch();
  const {
    submittedForms,
    facilityScores,
    isFormsLoading,
    isFacilityScoresLoading,
  } = useSelector((state) => state.dashboard);

  const [activeTab, setActiveTab] = useState("tab2");
  const [customerGroup, setCustomerGroup] = useState("");

  // Use the custom hook for date filtering
  const { dateFilter, updateFilter, getDateRange } = useDateFilter();

  // ============ SAFELY GET ARRAY DATA ============

  // Ensure facilityScores is always an array
  const safeFacilityScores = useMemo(() => {
    // If it's an array, use it
    if (Array.isArray(facilityScores)) {
      return facilityScores;
    }
    // If it's an object with a data property that's an array
    if (
      facilityScores &&
      typeof facilityScores === "object" &&
      Array.isArray(facilityScores.data)
    ) {
      return facilityScores.data;
    }
    // If it's a truthy value but not an array, log it for debugging
    if (facilityScores) {
      console.warn("facilityScores is not an array:", facilityScores);
    }
    // Default to empty array
    return [];
  }, [facilityScores]);

  // Ensure submittedForms is always an array
  const safeSubmittedForms = useMemo(() => {
    if (Array.isArray(submittedForms)) {
      return submittedForms;
    }
    if (
      submittedForms &&
      typeof submittedForms === "object" &&
      Array.isArray(submittedForms.data)
    ) {
      return submittedForms.data;
    }
    if (submittedForms) {
      console.warn("submittedForms is not an array:", submittedForms);
    }
    return [];
  }, [submittedForms]);

  // ============ DEFINE FUNCTIONS ============

  const getFormsSeries = useCallback(() => {
    if (!safeSubmittedForms || safeSubmittedForms.length === 0) {
      return [
        {
          name: "Tasks Submitted",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ];
    }

    const monthData = {};
    safeSubmittedForms.forEach((item) => {
      monthData[item.month] = item.total;
    });

    const data = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      data.push(monthData[monthKey] || 0);
    }

    return [
      {
        name: "Tasks Submitted",
        data: data,
      },
    ];
  }, [safeSubmittedForms]);

  const getFormsCategories = useCallback(() => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleString("default", { month: "short" }));
    }
    return months;
  }, []);

  // Fetch data based on filters
  useEffect(() => {
    if (activeTab === "tab1") {
      dispatch(getSubmittedForms());
    } else if (activeTab === "tab2") {
      const dateRange = getDateRange();

      console.log("🔍 Fetching facility scores with params:", {
        from_date: dateRange.from_date,
        to_date: dateRange.to_date,
        customer_group_name: customerGroup || undefined,
      });

      // Fetch with both date and customer group filters
      dispatch(
        getFacilityScores({
          from_date: dateRange.from_date,
          to_date: dateRange.to_date,
          customer_group_name: customerGroup || undefined,
        }),
      );
    }
  }, [
    dispatch,
    activeTab,
    dateFilter.selectedYear,
    dateFilter.selectedMonth,
    dateFilter.selectedQuarter,
    dateFilter.viewType,
    customerGroup,
  ]);

  // ============ MEMOIZED VALUES ============

  const maxScore = useMemo(() => {
    if (!safeFacilityScores || safeFacilityScores.length === 0) return 100;
    const scores = safeFacilityScores
      .map((f) => parseInt(f?.total_score) || 0)
      .filter((score) => !isNaN(score));
    return scores.length > 0 ? Math.max(...scores) : 100;
  }, [safeFacilityScores]);

  const facilityCategories = useMemo(() => {
    if (!safeFacilityScores || safeFacilityScores.length === 0)
      return ["No Data"];

    // REMOVED THE .slice(0, 5) LIMIT - Now showing all facilities
    const sortedFacilities = [...safeFacilityScores].sort(
      (a, b) => parseInt(b?.total_score || 0) - parseInt(a?.total_score || 0),
    );

    return sortedFacilities.map(
      (facility) => facility?.facility_name || "Unknown",
    );
  }, [safeFacilityScores]);

  const facilitySeries = useMemo(() => {
    if (!safeFacilityScores || safeFacilityScores.length === 0) {
      return [
        {
          name: "Facility Score",
          data: [0], // Default to single zero
        },
      ];
    }

    // REMOVED THE .slice(0, 5) LIMIT - Now showing all facilities
    const sortedFacilities = [...safeFacilityScores].sort(
      (a, b) => parseInt(b?.total_score || 0) - parseInt(a?.total_score || 0),
    );

    return [
      {
        name: "Facility Score (%)",
        data: sortedFacilities.map((facility) => {
          const score = parseInt(facility?.total_score) || 0;
          return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        }),
      },
    ];
  }, [safeFacilityScores, maxScore]);

  const chartOptions = useMemo(() => {
    const isFacilityTab = activeTab === "tab2";
    const dateRange = getDateRange();

    return {
      chart: {
        height: 264,
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
        dropShadow: { enabled: false },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        colors: ["#8B2885"],
        width: 3,
      },
      markers: {
        size: 1,
        strokeWidth: 3,
        hover: { size: 8 },
        colors: ["#FF0000"],
      },
      xaxis: {
        categories: isFacilityTab ? facilityCategories : getFormsCategories(),
        tooltip: { enabled: false },
        labels: {
          style: { fontSize: "14px" },
          rotate: isFacilityTab ? -45 : 0,
          trim: true,
          maxHeight: 120,
        },
        axisBorder: { show: false },
      },
      tooltip: {
        enabled: true,
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          const value = series[seriesIndex][dataPointIndex];

          if (isFacilityTab) {
            if (safeFacilityScores?.length > 0) {
              // REMOVED THE .slice(0, 5) LIMIT - Now using all facilities
              const sortedFacilities = [...safeFacilityScores].sort(
                (a, b) =>
                  parseInt(b?.total_score || 0) - parseInt(a?.total_score || 0),
              );

              if (sortedFacilities[dataPointIndex]) {
                const facility = sortedFacilities[dataPointIndex];
                const actualScore = parseInt(facility?.total_score) || 0;
                const percentage =
                  maxScore > 0 ? Math.round((actualScore / maxScore) * 100) : 0;

                return `
                  <div style="padding: 12px; background: #fff; border-radius: 6px; border: 1px solid #e2e8f0; min-width: 220px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 15px; color: #1a202c; font-weight: 600; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                      ${facility?.facility_name || "Unknown Facility"}
                    </div>
                    <div style="font-size: 13px; color: #4a5568; margin-bottom: 6px; display: flex; justify-content: space-between;">
                      <span>Period:</span>
                      <span style="font-weight: 500;">${dateRange.label}</span>
                    </div>
                    <div style="font-size: 13px; color: #4a5568; margin-bottom: 6px; display: flex; justify-content: space-between;">
                      <span>Customer Group:</span>
                      <span style="font-weight: 500;">${customerGroup || "All Groups"}</span>
                    </div>
                    <div style="font-size: 14px; color: #8B2885; font-weight: 600; margin-bottom: 6px; display: flex; justify-content: space-between;">
                      <span>Score:</span>
                      <span>${actualScore} (${percentage}%)</span>
                    </div>
                    <div style="font-size: 13px; color: #4a5568; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; margin-top: 6px; padding-top: 6px;">
                      <span>Tasks Submitted:</span>
                      <span style="font-weight: 500;">${facility?.total || 0}</span>
                    </div>
                  </div>
                `;
              }
            }
          } else {
            const date = new Date();
            date.setMonth(date.getMonth() - (11 - dataPointIndex));
            return `
              <div style="padding: 12px; background: #fff; border-radius: 6px; border: 1px solid #e2e8f0; min-width: 180px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="font-size: 15px; color: #1a202c; font-weight: 600; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                  ${date.toLocaleString("default", { month: "long", year: "numeric" })}
                </div>
                <div style="font-size: 14px; color: #8B2885; font-weight: 600;">
                  ${value} Task${value !== 1 ? "s" : ""} Submitted
                </div>
              </div>
            `;
          }
          return "";
        },
      },
      grid: {
        row: { colors: ["transparent", "transparent"], opacity: 0.5 },
        borderColor: "#D1D5DB",
        strokeDashArray: 3,
      },
      yaxis: {
        min: 0,
        max: isFacilityTab
          ? 100
          : (() => {
              if (!safeSubmittedForms || safeSubmittedForms.length === 0)
                return 100;
              const totals = safeSubmittedForms.map((f) => f?.total || 0);
              const maxTotal = Math.max(...totals);
              return Math.max(maxTotal + 10, 50);
            })(),
        labels: {
          formatter: (value) =>
            isFacilityTab ? `${Math.round(value)}` : Math.round(value),
          style: { fontSize: "14px" },
        },
      },
    };
  }, [
    activeTab,
    facilityCategories,
    getFormsCategories,
    safeFacilityScores,
    safeSubmittedForms,
    maxScore,
    getDateRange,
    customerGroup,
  ]);

  const isLoading =
    activeTab === "tab1" ? isFormsLoading : isFacilityScoresLoading;

  // Handle customer group filter change
  const handleGroupChange = (group) => {
    console.log("Group changed to:", group);
    setCustomerGroup(group);
  };

  return (
    <div className="col-xxl-12 col-xl-12">
      <div className="card h-100">
        <div className="card-body">
          {/* Tabs header */}
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "tab2" ? "active" : ""}`}
                onClick={() => setActiveTab("tab2")}>
                Facility Score
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "tab1" ? "active" : ""}`}
                onClick={() => setActiveTab("tab1")}>
                Tasks Submitted
              </button>
            </li>
          </ul>

          {/* Filters Section - Only for Facility Score tab */}
          {activeTab === "tab2" && (
            <div className="mb-4 pb-2 border-bottom">
              <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <div style={{ minWidth: "300px" }}>
                  <DateFilter
                    {...dateFilter}
                    onFilterChange={updateFilter}
                    size="sm"
                  />
                </div>

                <div className="flex-grow-1">
                  <CustomerGroupFilter
                    selectedGroup={customerGroup}
                    onGroupChange={handleGroupChange}
                    size="sm"
                  />
                </div>
              </div>

              <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
                <span className="badge bg-light text-dark p-2">
                  <i className="fas fa-calendar-alt me-1"></i>
                  {getDateRange().label}
                </span>

                {customerGroup && (
                  <span className="badge bg-info text-white p-2">
                    <i className="fas fa-tag me-1"></i>
                    Group: {customerGroup}
                  </span>
                )}

                {safeFacilityScores?.length > 0 && (
                  <span className="badge bg-success p-2">
                    <i className="fas fa-building me-1"></i>
                    {safeFacilityScores.length} Facilities
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading chart data...</p>
            </div>
          ) : (
            <>
              {/* Forms Submitted Tab */}
              {activeTab === "tab1" && (
                <>
                  <div className="d-flex flex-wrap align-items-center justify-content-start mb-3 mt-20">
                    <h6 className="text-lg mb-0 mt-0">Tasks Submitted</h6>
                    <ul className="salesList">
                      <li className="text-sm fw-semibold">
                        X-axis: Last 12 Months
                      </li>
                      <li className="text-sm fw-semibold">
                        Y-axis: Number of Tasks Submitted
                      </li>
                    </ul>
                  </div>
                  <ReactApexChart
                    options={chartOptions}
                    series={getFormsSeries()}
                    type="area"
                    height={264}
                  />
                </>
              )}

              {/* Facility Score Tab */}
              {activeTab === "tab2" && (
                <>
                  <div className="d-flex flex-wrap align-items-center justify-content-start mb-3">
                    <h6 className="text-lg mb-0 mt-0">Facility Performance</h6>
                    <ul className="salesList">
                      <li className="text-sm fw-semibold">
                        X-axis: Facilities by Score
                      </li>
                      <li className="text-sm fw-semibold">
                        Y-axis: Score (% of Highest Scoring Facility)
                      </li>
                    </ul>
                  </div>

                  {!safeFacilityScores || safeFacilityScores.length === 0 ? (
                    <div className="text-center py-5">
                      <Icon
                        icon="mdi:chart-line"
                        width={48}
                        height={48}
                        className="text-muted mb-2"
                      />
                      <p className="text-muted mb-1">
                        No facility data available for selected period
                        {customerGroup &&
                          ` and customer group "${customerGroup}"`}
                      </p>
                      <p className="text-muted small">
                        Try selecting a different date range or customer group
                      </p>
                    </div>
                  ) : (
                    <ReactApexChart
                      options={chartOptions}
                      series={facilitySeries}
                      type="area"
                      height={264}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesStatisticOne;
