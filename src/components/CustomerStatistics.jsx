import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactApexChart from "react-apexcharts";
import { getSubmittedForms } from "../redux/slices/dashboardSlice";

const CustomerStatistics = () => {
  const dispatch = useDispatch();
  const { submittedForms, isFormsLoading, formsError } = useSelector(
    (state) => state.dashboard,
  );

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getSubmittedForms());
  }, [dispatch]);

  // Process the submitted forms data for the chart
  const processChartData = () => {
    const monthlyData = Array(12).fill(0); // Initialize array for 12 months with 0

    if (submittedForms && submittedForms.length > 0) {
      // Process each item from the API response
      submittedForms.forEach((item) => {
        // Extract month from "YYYY-MM" format
        const monthStr = item.month; // e.g., "2026-01"

        if (monthStr && monthStr.includes("-")) {
          const monthPart = monthStr.split("-")[1]; // Get "01" from "2026-01"
          const monthIndex = parseInt(monthPart, 10) - 1; // Convert to 0-based index

          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyData[monthIndex] = item.total || 0;
          }
        }
      });
    }

    return monthlyData;
  };

  // Get month names for the current year's data
  const getMonthNames = () => {
    const monthNames = [
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

    // If we have data, find the year from the first item
    if (submittedForms && submittedForms.length > 0) {
      const firstItem = submittedForms[0];
      if (firstItem.month && firstItem.month.includes("-")) {
        return monthNames.map((month) => `${month}`);
      }
    }

    return monthNames; // Fallback to just month names
  };

  const chartSeries = [
    {
      name: "Forms Submitted",
      data: processChartData(),
    },
  ];

  let chartOptions = {
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
      categories: getMonthNames(),
      tooltip: {
        enabled: false,
      },
      labels: {
        formatter: function (value) {
          return value;
        },
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
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const month = w.config.xaxis.categories[dataPointIndex];
        const value = series[seriesIndex][dataPointIndex];

        return `
        <div style="padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd;">
          <div style="font-size: 14px; color: #333; font-weight: bold;">This Month</div>
          <div style="font-size: 16px; color: #8B2885; font-weight: bold;">${value} Forms Submitted</div>
        </div>
      `;
      },
      x: {
        show: true,
      },
      y: {
        show: false,
      },
      z: {
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
          return Math.round(value); // Show whole numbers
        },
        style: {
          fontSize: "14px",
        },
      },
      min: 0,
      forceNiceScale: true,
      tickAmount: 5, // Show 5 ticks on Y-axis
    },
  };

  // Show loading state
  if (isFormsLoading) {
    return (
      <div className="col-xxl-12 col-xl-12">
        <div className="card h-100">
          <div className="card-body">
            <div className="d-flex flex-wrap align-items-center justify-content-start mb-3 mt-20">
              <h6 className="text-lg mb-0 mt-0">Forms Submitted</h6>
            </div>
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading form data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (formsError) {
    return (
      <div className="col-xxl-12 col-xl-12">
        <div className="card h-100">
          <div className="card-body">
            <div className="d-flex flex-wrap align-items-center justify-content-start mb-3 mt-20">
              <h6 className="text-lg mb-0 mt-0">Forms Submitted</h6>
            </div>
            <div className="alert alert-danger" role="alert">
              Error loading form data: {formsError}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no data
  if (!submittedForms || submittedForms.length === 0) {
    return (
      <div className="col-xxl-12 col-xl-12">
        <div className="card h-100">
          <div className="card-body">
            <div className="d-flex flex-wrap align-items-center justify-content-start mb-3 mt-20">
              <h6 className="text-lg mb-0 mt-0">Forms Submitted</h6>
            </div>
            <div className="text-center py-4">
              <p>No form submission data available.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Debug: Log the processed data
  console.log("Submitted Forms:", submittedForms);
  console.log("Processed Chart Data:", processChartData());
  console.log("Month Names:", getMonthNames());

  return (
    <div className="col-xxl-12 col-xl-12">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center justify-content-start mb-3 mt-20">
            <h6 className="text-lg mb-0 mt-0">Forms Submitted</h6>
            <ul className="salesList">
              <li className="text-sm fw-semibold">X-axis: Months</li>
              <li className="text-sm fw-semibold">
                Y-axis: Number of Forms Submitted
              </li>
            </ul>
          </div>
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={264}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerStatistics;
