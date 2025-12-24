import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import ClientPackageTable from "../components/ClientPackageTable";
import DefaultTopBar from "../components/DefaultTopBar";
import HomeTopBar from "../components/HomeTopBar";

const ClientPackagesPage = () => {
  
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout> 
        <HomeTopBar
        title="Welcome Back, John Doe!"
         desc="Your recruitment metrics and activities at a glance"
        />
        <DefaultTopBar
            title="Package Details"
            desc="Your Active Packages. Click 'View Details' for more information."
            btnText="New Package"
            // btnLink="/add-package" 
        />

        {/* TableDataLayer */}
        <ClientPackageTable />

      </MasterLayout>

    </>
  );
};

export default ClientPackagesPage; 
