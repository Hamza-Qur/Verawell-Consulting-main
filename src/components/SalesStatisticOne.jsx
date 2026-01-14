import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactApexChart from "react-apexcharts";
import {
  getSubmittedForms,
  getFacilityScores,
} from "../redux/slices/dashboardSlice";

const SalesStatisticOne = () => {
  const dispatch = useDispatch();
  const {
    submittedForms,
    facilityScores,
    isFormsLoading,
    isFacilityScoresLoading,
  } = useSelector((state) => state.dashboard);

  const [activeTab, setActiveTab] = useState("tab2");

  // Fetch data on component mount
  useEffect(() => {
    if (activeTab === "tab1") {
      dispatch(getSubmittedForms());
    } else {
      dispatch(getFacilityScores());
    }
  }, [dispatch, activeTab]);

  // Format facility scores for chart
  const getFacilitySeries = () => {
    if (!facilityScores || facilityScores.length === 0) {
      return [
        {
          name: "Facility Score",
          data: [0, 0, 0, 0, 0],
        },
      ];
    }

    // Take top 5 facilities or all if less than 5
    const topFacilities = [...facilityScores]
      .sort(
        (a, b) =>
          Math.abs(parseInt(b.total_score)) - Math.abs(parseInt(a.total_score))
      )
      .slice(0, 5);

    return [
      {
        name: "Facility Score",
        data: topFacilities.map(
          (facility) => parseInt(facility.total_score) || 0
        ),
      },
    ];
  };

  // Format submitted forms for chart
  const getFormsSeries = () => {
    if (!submittedForms || submittedForms.length === 0) {
      return [
        {
          name: "Forms Submitted",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ];
    }

    // Create a map of months to totals
    const monthData = {};
    submittedForms.forEach((item) => {
      monthData[item.month] = item.total;
    });

    // Generate last 12 months
    const months = [];
    const data = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthName = date.toLocaleString("default", { month: "short" });

      months.push(monthName);
      data.push(monthData[monthKey] || 0);
    }

    return [
      {
        name: "Forms Submitted",
        data: data,
      },
    ];
  };

  // Get categories based on active tab
  const getCategories = () => {
    if (activeTab === "tab1") {
      // Last 12 months
      const months = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(date.toLocaleString("default", { month: "short" }));
      }
      return months;
    } else {
      if (!facilityScores || facilityScores.length === 0) {
        return ["No Data"];
      }

      // Get top 5 facility names
      const topFacilities = [...facilityScores]
        .sort(
          (a, b) =>
            Math.abs(parseInt(b.total_score)) -
            Math.abs(parseInt(a.total_score))
        )
        .slice(0, 5);

      return topFacilities.map((facility) =>
        facility.facility_name.length > 10
          ? facility.facility_name.substring(0, 10) + "..."
          : facility.facility_name
      );
    }
  };

  // Get series based on active tab
  const getSeries = () => {
    return activeTab === "tab1" ? getFormsSeries() : getFacilitySeries();
  };

  const chartOptions = {
    chart: {
      height: 264,
      type: "line",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      dropShadow: {
        enabled: false,
        top: 6,
        left: 0,
        blur: 4,
        color: "#fff",
        opacity: 0.1,
      },
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

    dataLabels: {
      enabled: false,
    },

    stroke: {
      curve: "smooth",
      colors: ["#8B2885"],
      width: 3,
    },

    markers: {
      size: 1,
      strokeWidth: 3,
      hover: {
        size: 8,
      },
      colors: ["#FF0000"],
    },

    xaxis: {
      categories: getCategories(),
      tooltip: {
        enabled: false,
      },
      labels: {
        style: {
          fontSize: "14px",
        },
        rotate: activeTab === "tab2" ? -45 : 0,
      },
      axisBorder: {
        show: false,
      },
    },

    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const label = w.config.xaxis.categories[dataPointIndex];
        const value = series[seriesIndex][dataPointIndex];

        let title = label;
        let valueText = "";

        if (activeTab === "tab1") {
          // Forms Submitted tab
          const originalLabel = getCategories()[dataPointIndex];
          valueText = `${value} Form${value !== 1 ? "s" : ""} Submitted`;

          // Get full month-year for forms tooltip
          const now = new Date();
          const monthsAgo = 11 - dataPointIndex;
          const date = new Date(
            now.getFullYear(),
            now.getMonth() - monthsAgo,
            1
          );
          const monthYear = date.toLocaleString("default", {
            month: "long",
            year: "numeric",
          });
          title = monthYear;
        } else {
          // Facility Score tab
          if (facilityScores && facilityScores.length > 0) {
            const topFacilities = [...facilityScores]
              .sort(
                (a, b) =>
                  Math.abs(parseInt(b.total_score)) -
                  Math.abs(parseInt(a.total_score))
              )
              .slice(0, 5);

            if (topFacilities[dataPointIndex]) {
              const facility = topFacilities[dataPointIndex];
              title = facility.facility_name;
              valueText = `Score: ${facility.total_score} | Forms: ${facility.total}`;
            }
          }
        }

        return `
          <div style="padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd; min-width: 150px;">
            <div style="font-size: 14px; color: #333; font-weight: bold; margin-bottom: 5px;">
              ${title}
            </div>
            <div style="font-size: 14px; color: #8B2885; font-weight: bold;">
              ${valueText}
            </div>
          </div>
        `;
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
      min:
        activeTab === "tab1"
          ? 0
          : (() => {
              // For facility scores, set min based on data
              if (!facilityScores || facilityScores.length === 0) return -10;
              const scores = facilityScores.map(
                (f) => parseInt(f.total_score) || 0
              );
              const minScore = Math.min(...scores);
              return Math.min(minScore - 5, -10);
            })(),
      max:
        activeTab === "tab1"
          ? (() => {
              // For forms, set max based on data
              if (!submittedForms || submittedForms.length === 0) return 100;
              const totals = submittedForms.map((f) => f.total || 0);
              const maxTotal = Math.max(...totals);
              return Math.max(maxTotal + 10, 50);
            })()
          : (() => {
              // For facility scores
              if (!facilityScores || facilityScores.length === 0) return 10;
              const scores = facilityScores.map(
                (f) => parseInt(f.total_score) || 0
              );
              const maxScore = Math.max(...scores);
              return Math.max(maxScore + 5, 10);
            })(),
      labels: {
        formatter: (value) => Math.round(value),
        style: {
          fontSize: "14px",
        },
      },
    },
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
                Forms Submitted
              </button>
            </li>
          </ul>

          {/* Loading states */}
          {(activeTab === "tab1" && isFormsLoading) ||
          (activeTab === "tab2" && isFacilityScoresLoading) ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading chart data...</p>
            </div>
          ) : (
            <>
              {/* Tab content */}
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
                    series={getSeries()}
                    type="area"
                    height={264}
                  />
                </>
              )}

              {activeTab === "tab2" && (
                <>
                  <div className="d-flex flex-wrap align-items-center justify-content-start mb-3 mt-20">
                    <h6 className="text-lg mb-0 mt-0">Facility Score</h6>
                    <ul className="salesList">
                      <li className="text-sm fw-semibold">
                        X-axis: Top 5 Facilities
                      </li>
                      <li className="text-sm fw-semibold">
                        Y-axis: Score (Total: Forms Submitted)
                      </li>
                    </ul>
                  </div>

                  <ReactApexChart
                    options={chartOptions}
                    series={getSeries()}
                    type="area"
                    height={264}
                  />
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
