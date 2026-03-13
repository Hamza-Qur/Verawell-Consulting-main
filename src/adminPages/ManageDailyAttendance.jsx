// src/pages/ManageDailyAttendance.jsx
import React, { useRef } from "react";
import MasterLayout from "../otherImages/MasterLayout";
import DefaultTopBar from "../components/DefaultTopBar";
import { useDispatch, useSelector } from "react-redux";
import { downloadAdminAttendanceCSV } from "../redux/slices/dailyAttendanceSlice";
import Toast from "../components/Toast";
import DailyAdminAttendance from "../components/DailyAdminAttendance";

const ManageDailyAttendance = () => {
  const dispatch = useDispatch();

  // Create a ref to access DailyAdminAttendance methods
  const attendanceRef = useRef();

  // Get download states from Redux
  const { isDownloadingAdminCSV, downloadAdminCSVError, successMessage } =
    useSelector((state) => state.dailyAttendance);

  const handleDownloadCSV = () => {
    // Get the current filter parameters from the DailyAdminAttendance component
    if (attendanceRef.current) {
      const filterParams = attendanceRef.current.getFilterParams();
      dispatch(downloadAdminAttendanceCSV(filterParams));
    } else {
      // Fallback: dispatch without params if ref not available
      dispatch(downloadAdminAttendanceCSV());
    }
  };

  return (
    <>
      {downloadAdminCSVError && (
        <Toast
          show={!!downloadAdminCSVError}
          message={downloadAdminCSVError}
          type="error"
          onClose={() => {
            // Clear error if needed
          }}
          duration={3000}
        />
      )}

      <MasterLayout>
        <DefaultTopBar
          title="Facility Attendance"
          btnText2="Download CSV"
          btnLink2="#"
          isApiButton2={true}
          onBtn2Click={handleDownloadCSV}
          isBtn2Loading={isDownloadingAdminCSV}
          btn2LoadingText="Downloading..."
        />

        <DailyAdminAttendance ref={attendanceRef} />
      </MasterLayout>
    </>
  );
};

export default ManageDailyAttendance;
