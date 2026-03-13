import React from "react";
import SalesStatisticOne from "../components/SalesStatisticOne";
import EmployeeDashbaordData from "./EmployeeDashbaordData";
import UnitCountOne from "../components/UnitCountOne";
import FacilityDataTable from "./FacilityDataTable";
import DocumentDataTable from "./DocumentDataTable";

const DashBoardLayerOne = () => {
  return (
    <>
      {/* UnitCountOne */}
      <UnitCountOne />

      <section className="row gy-4 mt-1 mb-4">
        {/* SalesStatisticOne */}
        <SalesStatisticOne />
      </section>

      <section className="row gy-4 mt-4">
        <div className="col-12">
          <h2 className="fs-2">Employees</h2>

          {/* LatestRegisteredOne */}
          <EmployeeDashbaordData />
        </div>
      </section>

      <section className="row gy-4 mt-4">
        <div className="col-12">
          <h2 className="fs-2">Facilities</h2>
          {/* LatestRegisteredOne */}
          <FacilityDataTable rows={[5]} />
        </div>
      </section>

      <section className="row gy-4 mt-4">
        <div className="col-12">
          <h2 className="fs-2">Documents</h2>
          {/* LatestRegisteredOne */}
          <DocumentDataTable />
        </div>
      </section>
    </>
  );
};

export default DashBoardLayerOne;
