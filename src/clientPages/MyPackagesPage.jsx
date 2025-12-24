import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import MyPackageTable from "../components/MyPackageTable";
import DefaultTopBar from "../components/DefaultTopBar";
import HomeTopBar from "../components/HomeTopBar";

const MyPackagesPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout> 
        <HomeTopBar
        title="Welcome Back, John Doe!"
         desc="Your recruitment metrics and activities at a glance"
        />
        <DefaultTopBar
            title="Project Overview"
            desc="Status of current project in the system"
            btnText="New Package"
            // btnLink="/add-package" 
        />

        {/* TableDataLayer */}
        <MyPackageTable />

      </MasterLayout>

    </>
  );
};

export default MyPackagesPage; 
