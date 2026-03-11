// src/pages/LoginHistoryPage.jsx
import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import DefaultTopBar from "../components/DefaultTopBar";
import { useDispatch, useSelector } from "react-redux";
import { downloadAdminAttendanceCSV } from "../redux/slices/dailyAttendanceSlice";
import Toast from "../components/Toast"; // If you have a Toast component
import DailyAdminAttendance from "../components/DailyAdminAttendance";

const ManageDailyAttendance = () => {
  const dispatch = useDispatch();

  // Get download states from Redux
  const { isDownloadingCSV, downloadCSVError, successMessage } = useSelector(
    (state) => state.attendance,
  );

  const handleDownloadCSV = () => {
    dispatch(downloadAdminAttendanceCSV());
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
          title="Daily Attendance"
          btnText2="Download CSV"
          btnLink2="#"
          isApiButton2={true}
          onBtn2Click={handleDownloadCSV}
          isBtn2Loading={isDownloadingCSV}
          btn2LoadingText="Downloading..."
        />

        <DailyAdminAttendance />
      </MasterLayout>
    </>
  );
};

export default ManageDailyAttendance;
