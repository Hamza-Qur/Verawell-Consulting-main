import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import EditClientForm from "../components/EditClientForm";
import DefaultTopBar from "../components/DefaultTopBar";

const EditClientPage = () => {
  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        <DefaultTopBar
            title="Edit  Client"
            desc="Edit, and manage client account efficiently."
        />

        {/* TableDataLayer */}
        <EditClientForm />

      </MasterLayout>

    </>
  );
};

export default EditClientPage; 
