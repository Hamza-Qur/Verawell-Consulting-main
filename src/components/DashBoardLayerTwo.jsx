import React from "react";
import UsersOverviewOne from "../components/UsersOverviewOne";
import TeamDashboardData from "./TeamDashboardData";
import UsersOverviewTwo from "../components/UsersOverviewTwo";
import TeamStatistics from "./TeamStatistics";
import UnitCountTwo from "./UnitCountTwo";

const DashBoardLayerTwo = () => {
  return (
    <>
      {/* UnitCountOne */}
      <UnitCountTwo />

        <TeamStatistics />

        {/* LatestRegisteredOne */}
        <TeamDashboardData />
    </>
  );
};

export default DashBoardLayerTwo;
