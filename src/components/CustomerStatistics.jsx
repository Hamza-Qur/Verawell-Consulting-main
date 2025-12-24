import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import ReactApexChart from "react-apexcharts";

const CustomerStatistics = () => {
  // let { chartOptions, chartSeries } = useReactApexChart();

  let chartSeries = [
    {
      name: "This month",
      data: [0, 2, 4, 6, 5, 1, 7, 3, 0, 8, 8, 4],
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
        // Check if categories are available, otherwise use fallback
        let month =
          w.config.xaxis.categories &&
          w.config.xaxis.categories[dataPointIndex];
        let value = series[seriesIndex][dataPointIndex];

        if (month === undefined) {
          month = "This Month"; // Default value if month is undefined
        }

        return `
        <div style="padding: 10px; background: #fff; border-radius: 5px; border: 1px solid #ddd;">
          <div style="font-size: 14px; color: #333; font-weight: bold;">${month}</div>
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
        colors: ["transparent", "transparent"], // takes an array which will be repeated on columns
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
