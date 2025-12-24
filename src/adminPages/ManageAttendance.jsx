import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import AttendanceDataTable from "../components/AttendanceDataTable";
import DefaultTopBar from "../components/DefaultTopBar";

const LoginHistoryPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout> 

        <DefaultTopBar
            title="Attendance"
            btnText2="Download CSV"
            btnLink2="#"
        />

        {/* TableDataLayer */}
        <AttendanceDataTable />

      </MasterLayout>

    </>
  );
};

export default LoginHistoryPage; 
