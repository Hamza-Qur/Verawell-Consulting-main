import React from "react";
import UsersOverviewOne from "../components/UsersOverviewOne";
import TeamDashboardData from "./TeamDashboardData";
import UsersOverviewTwo from "../components/UsersOverviewTwo";
import TeamStatistics from "./TeamStatistics";
import UnitCountTwo from "./UnitCountTwo";
import FacilityDetailDashboardData from "./FacilityDetailDashboardData";

const DashBoardLayerTwo = () => {
  return (
    <>
      {/* UnitCountOne */}
      <UnitCountTwo />

      <TeamStatistics />

      {/* LatestRegisteredOne */}
      <TeamDashboardData rows={5} />
      <FacilityDetailDashboardData rows={5} />
    </>
  );
};

export default DashBoardLayerTwo;
