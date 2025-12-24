import React from "react";
import UsersOverviewOne from "../components/UsersOverviewOne";
import TeamDashboardData from "./TeamDashboardData";
import UsersOverviewTwo from "../components/UsersOverviewTwo";
import UnitCountTwo from "./UnitCountTwo";
import UnitCountFacility from "./UnitCountFacility";

const DashBoardFacility = () => {
  return (
    <>
        <UnitCountFacility />

        {/* LatestRegisteredOne */}
        <TeamDashboardData />
    </>
  );
};

export default DashBoardFacility;
