import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import DashBoardLayerOne from "../components/DashBoardLayerOne";
import HomeTopBar from "../components/HomeTopBar";

const HomePageOne = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}


        {/* DashBoardLayerOne */}
        <DashBoardLayerOne />

      </MasterLayout>
    </>
  );
};

export default HomePageOne;
