import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import DocumentDataTable from "../components/DocumentDataTable";
import DefaultTopBar from "../components/DefaultTopBar";

const ManageDocuments = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout> 

        <DefaultTopBar
            title="Documents Management"
            btnText2="Download CSV"
            btnLink2="#" 
        />

        {/* TableDataLayer */}
        <DocumentDataTable />

      </MasterLayout>

    </>
  );
};

export default ManageDocuments; 
