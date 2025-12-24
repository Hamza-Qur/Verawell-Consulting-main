import React from 'react';
import ReactApexChart from 'react-apexcharts';


const UsersOverviewOne = () => {
    // let { donutChartSeries, donutChartOptions } = useReactApexChart();
    let donutChartSeries = [300, 700, 500];
let total = donutChartSeries.reduce((acc, val) => acc + val, 0);

let donutChartOptions = {
  colors: ["#707070", "#164AFF", "#92BFFF"],
  labels: ["Front sell", "Upsell", "Follow Up"],
  legend: {
    show: false,
  },
  chart: {
    type: "donut",
    height: 270,
    sparkline: {
      enabled: true,
    },
  },
  stroke: {
    width: 0,
  },
  dataLabels: {
    enabled: false, // Hides percentage from donut
  },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: false, // Hides center text
        }
      }
    }
  },
  tooltip: {
    y: {
      formatter: function (value, { seriesIndex }) {
        const percent = (value / total) * 100;
        return percent.toFixed(1) + "%";
      }
    }
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: "bottom",
        },
      },
    },
  ],
};
  
    return (
      <div className="col-xxl-3 col-xl-6">
        <div className="card h-100 radius-8 border-0 overflow-hidden">
          <div className="card-body p-24">
            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
              <h6 className="mb-40 fw-bold text-lg">Sales</h6>
            </div>
  
            <div className="d-flex justify-content-center">
              <ReactApexChart
                options={donutChartOptions}
                series={donutChartSeries}
                type="donut"
                height={150}
                width={150}
              />
            </div>
  
            <ul className="d-flex flex-wrap align-items-center justify-content-between mt-3 gap-3">
              {donutChartSeries.map((value, index) => {
                const label = donutChartOptions.labels[index];
                const color = donutChartOptions.colors[index];
                const percent = ((value / total) * 100).toFixed(1);
  
                return (
                  <li key={index} className="d-flex align-items-center gap-2 w-100">
                    
                    <span
                      className="w-12-px h-12-px radius-6"
                      style={{ backgroundColor: color }}
                    />
                    <div className='d-flex justify-content-between w-100'>
                    <div className="text-secondary-light text-sm fw-normal">
                      {label}:{" "}
                      
                    </div>
                    <div className="text-primary-light text-sm fw-normal">
                         {percent}%
                      </div>
                    </div>
                    
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  };
  

export default UsersOverviewOne;