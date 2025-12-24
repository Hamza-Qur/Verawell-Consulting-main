import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import EditPackageForm from "../components/EditPackageForm";
import DefaultTopBar from "../components/DefaultTopBar";

const EditPackagePage = () => {
  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        <DefaultTopBar
            title="Edit Package"
            desc="Edit a package using a form with the following fields:"
        />

        {/* TableDataLayer */}
        <EditPackageForm />

      </MasterLayout>

    </>
  );
};

export default EditPackagePage; 
