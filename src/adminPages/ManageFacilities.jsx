// src/pages/ManageFacilities.jsx
import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import DefaultTopBar from "../components/DefaultTopBar";
import FacilityDataTable from "../components/FacilityDataTable";
import { useDispatch, useSelector } from "react-redux";
import { downloadFacilitiesCSV } from "../redux/slices/facilitySlice";
import Toast from "../components/Toast"; // If you have a Toast component

const ManageFacilities = () => {
  const dispatch = useDispatch();

  // Get download states from Redux
  const { isDownloadingCSV, downloadCSVError, successMessage } = useSelector(
    (state) => state.facility
  );

  const handleDownloadCSV = () => {
    dispatch(downloadFacilitiesCSV());
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
          title="Facility Management"
          btnText2="Download CSV"
          btnLink2="#"
          isApiButton2={true}
          onBtn2Click={handleDownloadCSV}
          isBtn2Loading={isDownloadingCSV}
          btn2LoadingText="Downloading..."
        />

        <FacilityDataTable />
      </MasterLayout>
    </>
  );
};

export default ManageFacilities;
