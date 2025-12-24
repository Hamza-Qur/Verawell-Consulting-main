import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import CreateInvoiceForm from "../components/CreateInvoiceForm";
import DefaultTopBar from "../components/DefaultTopBar";

const CreateInvoicePage = () => {
  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        <DefaultTopBar
            title="Create a New Link"
            desc="Create a link using a form with the following fields:"
        />

        {/* TableDataLayer */}
        <CreateInvoiceForm />

      </MasterLayout>

    </>
  );
};

export default CreateInvoicePage; 
