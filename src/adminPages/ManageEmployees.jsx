import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import EmployeeDataTable from "../components/EmployeeDataTable";
import DefaultTopBar from "../components/DefaultTopBar";

const ManageEmployees = () => {
  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        <DefaultTopBar
            title="Employees Management"
            btnText2="Download CVS"
            btnLink2="#" 
        />

        {/* TableDataLayer */}
        <EmployeeDataTable />

      </MasterLayout>

    </>
  );
};

export default ManageEmployees; 
