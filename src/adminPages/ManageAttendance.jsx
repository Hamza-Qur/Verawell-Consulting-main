// src/pages/LoginHistoryPage.jsx
import React from "react";
import MasterLayout from "../otherImages/MasterLayout";
import AttendanceDataTable from "../components/AttendanceDataTable";
import DefaultTopBar from "../components/DefaultTopBar";
import { useDispatch, useSelector } from "react-redux";
import { downloadAttendanceCSV } from "../redux/slices/attendanceSlice";
import Toast from "../components/Toast"; // If you have a Toast component

const LoginHistoryPage = () => {
  const dispatch = useDispatch();

  // Get download states from Redux
  const { isDownloadingCSV, downloadCSVError, successMessage } = useSelector(
    (state) => state.attendance
  );

  const handleDownloadCSV = () => {
    dispatch(downloadAttendanceCSV());
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
          title="Attendance"
          btnText2="Download CSV"
          btnLink2="#"
          isApiButton2={true}
          onBtn2Click={handleDownloadCSV}
          isBtn2Loading={isDownloadingCSV}
          btn2LoadingText="Downloading..."
        />

        <AttendanceDataTable />
      </MasterLayout>
    </>
  );
};

export default LoginHistoryPage;
