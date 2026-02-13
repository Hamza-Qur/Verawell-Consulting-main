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

  // Use the custom hook for date filtering - NO PREDICTION STUFF
  const { dateFilter, updateFilter, getDateRange } = useDateFilter();

  // ============ DEFINE FUNCTIONS FIRST ============

  const getFormsSeries = useCallback(() => {
    if (!submittedForms || submittedForms.length === 0) {
      return [
        {
          name: "Forms Submitted",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ];
    }

    const monthData = {};
    submittedForms.forEach((item) => {
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
        name: "Forms Submitted",
        data: data,
      },
    ];
  }, [submittedForms]);

  const getFormsCategories = useCallback(() => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleString("default", { month: "short" }));
    }
    return months;
  }, []);

  // ============ USEEFFECTS ============

  // Fetch data based on filters - ONLY ONE API CALL
  useEffect(() => {
    if (activeTab === "tab1") {
      dispatch(getSubmittedForms());
    } else if (activeTab === "tab2") {
      const dateRange = getDateRange();

      console.log("Fetching facility scores with params:", dateRange);

      // ONLY fetch the main requested date range - NO PREDICTION CALLS
      dispatch(
        getFacilityScores({
          from_date: dateRange.from_date,
          to_date: dateRange.to_date,
        }),
      );
    }
  }, [
    dispatch,
    activeTab,
    dateFilter.selectedYear,
    dateFilter.viewType,
    dateFilter.selectedQuarter,
    dateFilter.selectedMonth,
  ]);

  // ============ MEMOIZED VALUES ============

  const maxScore = useMemo(() => {
    if (!facilityScores || facilityScores.length === 0) return 100;
    const scores = facilityScores.map((f) => parseInt(f.total_score) || 0);
    return Math.max(...scores);
  }, [facilityScores]);

  const facilityCategories = useMemo(() => {
    if (!facilityScores || facilityScores.length === 0) return ["No Data"];

    const topFacilities = [...facilityScores]
      .sort((a, b) => parseInt(b.total_score) - parseInt(a.total_score))
      .slice(0, 5);

    return topFacilities.map((facility) => facility.facility_name);
  }, [facilityScores]);

  const facilitySeries = useMemo(() => {
    if (!facilityScores || facilityScores.length === 0) {
      return [
        {
          name: "Facility Score",
          data: [0, 0, 0, 0, 0],
        },
      ];
    }

    const topFacilities = [...facilityScores]
      .sort((a, b) => parseInt(b.total_score) - parseInt(a.total_score))
      .slice(0, 5);

    return [
      {
        name: "Facility Score (%)",
        data: topFacilities.map((facility) => {
          const score = parseInt(facility.total_score) || 0;
          return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        }),
      },
    ];
  }, [facilityScores, maxScore]);

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
          const label = w.config.xaxis.categories[dataPointIndex];
          const value = series[seriesIndex][dataPointIndex];

          if (isFacilityTab) {
            if (facilityScores?.length > 0) {
              const topFacilities = [...facilityScores]
                .sort(
                  (a, b) => parseInt(b.total_score) - parseInt(a.total_score),
                )
                .slice(0, 5);

              if (topFacilities[dataPointIndex]) {
                const facility = topFacilities[dataPointIndex];
                const actualScore = parseInt(facility.total_score) || 0;
                const percentage =
                  maxScore > 0 ? Math.round((actualScore / maxScore) * 100) : 0;

                return `
                  <div style="padding: 12px; background: #fff; border-radius: 6px; border: 1px solid #e2e8f0; min-width: 200px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-size: 15px; color: #1a202c; font-weight: 600; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                      ${facility.facility_name}
                    </div>
                    <div style="font-size: 13px; color: #4a5568; margin-bottom: 6px; display: flex; justify-content: space-between;">
                      <span>Period:</span>
                      <span style="font-weight: 500;">${dateRange.label}</span>
                    </div>
                    <div style="font-size: 14px; color: #8B2885; font-weight: 600; margin-bottom: 6px; display: flex; justify-content: space-between;">
                      <span>Score:</span>
                      <span>${actualScore} (${percentage}%)</span>
                    </div>
                    <div style="font-size: 13px; color: #4a5568; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; margin-top: 6px; padding-top: 6px;">
                      <span>Forms Submitted:</span>
                      <span style="font-weight: 500;">${facility.total || 0}</span>
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
                  ${value} Form${value !== 1 ? "s" : ""} Submitted
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
              if (!submittedForms || submittedForms.length === 0) return 100;
              const totals = submittedForms.map((f) => f.total || 0);
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
    facilityScores,
    maxScore,
    submittedForms,
    getDateRange,
  ]);

  const isLoading =
    activeTab === "tab1" ? isFormsLoading : isFacilityScoresLoading;

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
                Forms Submitted
              </button>
            </li>
          </ul>

          {/* Date Filter - Only for Facility Score tab */}
          {activeTab === "tab2" && (
            <div className="mb-4 pb-2 border-bottom">
              <DateFilter
                {...dateFilter}
                onFilterChange={updateFilter}
                size="sm"
              />

              <div className="mt-10 mb-10 d-flex align-items-center gap-2 flex-wrap">
                <span className="badge bg-light text-dark p-2">
                  <i className="fas fa-calendar-alt me-1"></i>
                  {getDateRange().label}
                </span>
                {facilityScores?.length > 0 && (
                  <span className="badge bg-success p-2">
                    <i className="fas fa-building me-1"></i>
                    {facilityScores.length} Facilities
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
                    <h6 className="text-lg mb-0 mt-0">Forms Submitted</h6>
                    <ul className="salesList">
                      <li className="text-sm fw-semibold">
                        X-axis: Last 12 Months
                      </li>
                      <li className="text-sm fw-semibold">
                        Y-axis: Number of Forms Submitted
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
                    <h6 className="text-lg mb-0 mt-0">
                      Facility Performance
                      {facilityScores?.length > 0 && (
                        <span className="ms-2 small text-muted fw-normal">
                          (Showing Top 5 of {facilityScores.length} Facilities)
                        </span>
                      )}
                    </h6>
                    <ul className="salesList">
                      <li className="text-sm fw-semibold">
                        X-axis: Top 5 Facilities by Score
                      </li>
                      <li className="text-sm fw-semibold">
                        Y-axis: Score (% of Highest Scoring Facility)
                      </li>
                    </ul>
                  </div>

                  {!facilityScores || facilityScores.length === 0 ? (
                    <div className="text-center py-5">
                      <Icon
                        icon="mdi:chart-line"
                        width={48}
                        height={48}
                        className="text-muted mb-2"
                      />
                      <p className="text-muted mb-1">
                        No facility data available for selected period
                      </p>
                      <p className="text-muted small">
                        Try selecting a different date range
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
