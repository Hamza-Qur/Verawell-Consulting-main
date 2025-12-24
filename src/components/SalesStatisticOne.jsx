import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import ReactApexChart from "react-apexcharts";

const SalesStatisticOne = () => {
  // let { chartOptions, chartSeries } = useReactApexChart();
  const [activeTab, setActiveTab] = React.useState("tab1");

  let chartSeries = [
    {
      name: "This month",
      data: [0, 20, 12, 25, 45, 42, 60, 50, 40, 50, 80, 90],
    },
  ];

  const monthSeries = [
    {
      name: "This month",
      data: [0, 20, 12, 25, 45, 42, 60, 50, 40, 50, 80, 90],
    },
  ];

  const foodSeries = [
    {
      name: "Brand Score",
      data: [98, 10, 35, 92, 69], // random out of 100
    },
  ];

  const monthCategories = [
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

  const foodCategories = [
    "KFC",
    "Burger King",
    "White Castle",
    "Nobu",
    "Five Guys",
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
      colors: ["#8B2885"], // Specify the line color here
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
      categories: activeTab === "tab1" ? monthCategories : foodCategories,
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
    },

    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const label =
          w.config.xaxis.categories &&
          w.config.xaxis.categories[dataPointIndex];

        const value = series[seriesIndex][dataPointIndex];

        // Tab-aware text
        const title = label ?? (activeTab === "tab1" ? "This Month" : "Total");
        const valueText =
          activeTab === "tab1" ? `${value} Form Submitted` : `${value} Score`;

        return `
      <div style="padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd;">
        <div style="font-size: 14px; color: #333; font-weight: bold;">
          ${title}
        </div>
        <div style="font-size: 16px; color: #8B2885; font-weight: bold;">
          ${valueText}
        </div>
      </div>
    `;
      },
    },

    grid: {
      row: {
        colors: ["transparent", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
      borderColor: "#D1D5DB",
      strokeDashArray: 3,
    },

    yaxis: {
      min: 0,
      max: 100,
      labels: {
        formatter: (value) => value,
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

          {/* Tab content */}
          {activeTab === "tab1" && (
            <>
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
                series={activeTab === "tab1" ? monthSeries : foodSeries}
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
                  <li className="text-sm fw-semibold">X-axis: Brands</li>
                  <li className="text-sm fw-semibold">Y-axis: Score</li>
                </ul>
              </div>

              <ReactApexChart
                options={chartOptions}
                series={activeTab === "tab1" ? monthSeries : foodSeries}
                type="area"
                height={264}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesStatisticOne;
