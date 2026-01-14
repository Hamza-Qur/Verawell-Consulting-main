// src/pages/ManageDocuments.jsx
import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import DocumentDataTable from "../components/DocumentDataTable";
import DefaultTopBar from "../components/DefaultTopBar";
import { useDispatch, useSelector } from "react-redux";
import { downloadAssessmentsCSV } from "../redux/slices/documentSlice";
import Toast from "../components/Toast"; // If you have a Toast component

const ManageDocuments = () => {
  const dispatch = useDispatch();

  // Get download states from Redux
  const { isDownloadingCSV, downloadCSVError, successMessage } = useSelector(
    (state) => state.document
  );

  const handleDownloadCSV = () => {
    dispatch(downloadAssessmentsCSV());
  };

  return (
    <>
      {/* If you have a Toast component for error messages */}
      {downloadCSVError && (
        <Toast
          show={!!downloadCSVError}
          message={downloadCSVError}
          type="error"
          onClose={() => {
            /* Clear error if needed */
          }}
          duration={3000}
        />
      )}

      <MasterLayout>
        <DefaultTopBar
          title="Documents Management"
          btnText2="Download CSV"
          btnLink2="#"
          isApiButton2={true}
          onBtn2Click={handleDownloadCSV}
          isBtn2Loading={isDownloadingCSV}
          btn2LoadingText="Downloading..."
        />

        <DocumentDataTable />
      </MasterLayout>
    </>
  );
};

export default ManageDocuments;
