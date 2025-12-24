import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import DefaultTopBar from "../components/DefaultTopBar";
import ClientDocumentsData from "../components/ClientDocumentsData";

const ClientDocuments = () => {
  return (
    <>
      <MasterLayout>
        <DefaultTopBar
          title="Team Documents"
          btnText2="Download CSV"
          btnLink2="#"
        />
        <ClientDocumentsData />
      </MasterLayout>
    </>
  );
};

export default ClientDocuments;
