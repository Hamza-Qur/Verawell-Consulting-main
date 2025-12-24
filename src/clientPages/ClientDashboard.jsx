import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import HomeTopBar from "../components/HomeTopBar";
import DashBoardLayerTwo from "../components/DashBoardLayerTwo";

const ClientDashboard = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}

        <DashBoardLayerTwo />
      </MasterLayout>
    </>
  );
};

export default ClientDashboard;
