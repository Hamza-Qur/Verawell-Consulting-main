import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { getTeamTaskGraph } from "../redux/slices/dashboardSlice";

const TeamStatistics = () => {
  const dispatch = useDispatch();

  // Get team task graph data from Redux store
  const { teamTaskGraph, isTeamTaskGraphLoading, teamTaskGraphError } =
    useSelector((state) => state.dashboard);

  // Get current year for date range
  const getCurrentYearDateRange = () => {
    const currentYear = new Date().getFullYear();
    return {
      from_date: `${currentYear}-01-01`,
      to_date: `${currentYear}-12-31`,
    };
  };

  // Fetch team task graph data on component mount
  useEffect(() => {
    const dateRange = getCurrentYearDateRange();
    dispatch(
      getTeamTaskGraph({
        from_date: dateRange.from_date,
        to_date: dateRange.to_date,
      })
    );
  }, [dispatch]);

  // Transform API data to match the static data format
  const getChartData = () => {
    if (!teamTaskGraph || teamTaskGraph.length === 0) {
      // Return all zeros when no data available
      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    // Create an array for all 12 months initialized with 0
    const monthlyData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Month mapping from "2025-10" format to array index (0-11)
    teamTaskGraph.forEach((item) => {
      const yearMonth = item.month; // "2025-10"
      const monthNumber = parseInt(yearMonth.split("-")[1]); // 10

      // Convert to array index (month 10 = index 9, since Jan = 0)
      const arrayIndex = monthNumber - 1;

      if (arrayIndex >= 0 && arrayIndex < 12) {
        // Parse total_hours to number
        const hours = parseFloat(item.total_hours) || 0;
        monthlyData[arrayIndex] = hours;
      }
    });

    return monthlyData;
  };

  const chartData = getChartData();

  // Keep the exact same chart series structure
  const chartSeries = [
    {
      name: "Hours Logged",
      data: chartData,
    },
  ];

  // Keep the exact same chart options
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
      categories: [
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
      ],
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
        let month =
          w.config.xaxis.categories &&
          w.config.xaxis.categories[dataPointIndex];
        let value = series[seriesIndex][dataPointIndex];

        if (month === undefined) {
          month = "This Month";
        }

        return `
          <div style="padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd;">
            <div style="font-size: 14px; color: #333; font-weight: bold;">${month}</div>
            <div style="font-size: 16px; color: #8B2885; font-weight: bold;">${value} Hours Logged</div>
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
          return value;
        },
        style: {
          fontSize: "14px",
        },
      },
    },
  };

  // Show loading indicator in the same UI structure
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

  // Show error in the same UI structure
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
                    const dateRange = getCurrentYearDateRange();
                    dispatch(
                      getTeamTaskGraph({
                        from_date: dateRange.from_date,
                        to_date: dateRange.to_date,
                      })
                    );
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

export default TeamStatistics;
