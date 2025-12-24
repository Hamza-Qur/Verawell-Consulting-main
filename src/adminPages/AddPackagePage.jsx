import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import AddPackageForm from "../components/AddPackageForm";
import DefaultTopBar from "../components/DefaultTopBar";

const AddPackagePage = () => {
  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        <DefaultTopBar
            title="Create a New Package"
            desc="Create a package using a form with the following fields:"
        />

        {/* TableDataLayer */}
        <AddPackageForm />

      </MasterLayout>

    </>
  );
};

export default AddPackagePage; 
