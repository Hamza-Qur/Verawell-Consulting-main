import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import PaymentHistoryTable from "../components/PaymentHistoryTable";
import DefaultTopBar from "../components/DefaultTopBar";
import HomeTopBar from "../components/HomeTopBar";

const PaymentHistoryPage = () => {
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
        <PaymentHistoryTable />

      </MasterLayout>

    </>
  );
};

export default PaymentHistoryPage; 
