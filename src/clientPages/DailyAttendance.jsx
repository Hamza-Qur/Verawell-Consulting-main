// src/pages/DailyAttendance.jsx - UPDATED with ref
import React, { useState, useRef, useEffect } from "react";
import MasterLayout from "../otherImages/MasterLayout";
import DefaultTopBar from "../components/DefaultTopBar";
import { useDispatch, useSelector } from "react-redux";
import {
  addDailyAttendance,
  downloadMyAttendanceCSV,
  getMyDailyAttendance,
  clearDailyAttendanceState,
} from "../redux/slices/dailyAttendanceSlice";
import Toast from "../components/Toast";
import DailyTeamAttendance from "../components/DailyTeamAttendance";
import DynamicModal from "../components/DynamicModal";
import AddDailyAttendanceModal from "../components/AddDailyAttendanceModal";

const DailyAttendance = () => {
  const dispatch = useDispatch();
  const [showAddModal, setShowAddModal] = useState(false);

  // Create a ref to access DailyTeamAttendance methods
  const teamAttendanceRef = useRef();

  // Get states from Redux
  const {
    isDownloadingMyCSV,
    downloadMyCSVError,
    isAdding,
    addError,
    successMessage,
  } = useSelector((state) => state.dailyAttendance);

  // Local toast state - single source of truth for toasts
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const toastTimeoutRef = useRef(null);

  // Show toast function
  const showToast = (message, type = "info") => {
    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({
      show: true,
      message,
      type,
    });

    // Set new timeout
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "info" });
      toastTimeoutRef.current = null;
    }, 3000);
  };

  const hideToast = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast({ show: false, message: "", type: "info" });
  };

  // Watch for Redux errors and show them as toasts
  useEffect(() => {
    if (downloadMyCSVError) {
      showToast(downloadMyCSVError, "error");
      // Clear the error from Redux after showing
      dispatch(clearDailyAttendanceState());
    }
  }, [downloadMyCSVError, dispatch]);

  useEffect(() => {
    if (addError) {
      showToast(addError, "error");
      // Clear the error from Redux after showing
      dispatch(clearDailyAttendanceState());
    }
  }, [addError, dispatch]);

  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, "success");
      // Clear the success message from Redux after showing
      dispatch(clearDailyAttendanceState());
    }
  }, [successMessage, dispatch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleDownloadCSV = () => {
    // Get the current filter parameters from the DailyTeamAttendance component
    if (teamAttendanceRef.current) {
      const filterParams = teamAttendanceRef.current.getFilterParams();
      dispatch(downloadMyAttendanceCSV(filterParams)).then((result) => {
        if (result.error) {
          showToast(result.payload || "Failed to download CSV", "error");
        }
      });
    } else {
      // Fallback: dispatch without params if ref not available
      dispatch(downloadMyAttendanceCSV()).then((result) => {
        if (result.error) {
          showToast(result.payload || "Failed to download CSV", "error");
        }
      });
    }
  };

  const handleAddAttendance = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleSaveAttendance = (attendanceData) => {
    // Transform the data to match API expected format
    const parseDateTimeForAPI = (dateTimeStr) => {
      // Input: "2026-03-11T14:20"
      // Output: "2026-03-11 14:20:13.000000"
      const [datePart, timePart] = dateTimeStr.split("T");
      const [year, month, day] = datePart.split("-");
      const [hours, minutes] = timePart.split(":");

      // Add seconds and milliseconds
      return `${year}-${month}-${day} ${hours}:${minutes}:13.000000`;
    };

    const apiData = {
      start_time: parseDateTimeForAPI(attendanceData.startDateTime),
      end_time: parseDateTimeForAPI(attendanceData.endDateTime),
      facility_id: parseInt(attendanceData.facility_id, 10), // This is the actual facility_id (e.g., 3)
    };

    dispatch(addDailyAttendance(apiData)).then((result) => {
      if (result.payload?.success) {
        showToast("Daily attendance added successfully!", "success");
        handleCloseAddModal();
        // Refresh the list with current filters
        if (teamAttendanceRef.current) {
          const filterParams = teamAttendanceRef.current.getFilterParams();
          dispatch(getMyDailyAttendance(filterParams));
        } else {
          dispatch(getMyDailyAttendance());
        }
      } else {
        showToast(
          result.payload?.message || "Failed to add daily attendance",
          "error",
        );
      }
    });
  };

  return (
    <>
      {/* Single Toast component - only shows when local toast state has show=true */}
      {toast.show && (
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={3000}
        />
      )}

      <MasterLayout>
        <DefaultTopBar
          title="Facility Attendance"
          btnText="Add Attendance"
          btnLink="#"
          isApiButton={true}
          onBtnClick={handleAddAttendance}
          isBtnLoading={isAdding}
          btnLoadingText="Adding..."
          btnText2="Download CSV"
          btnLink2="#"
          isApiButton2={true}
          onBtn2Click={handleDownloadCSV}
          isBtn2Loading={isDownloadingMyCSV}
          btn2LoadingText="Downloading..."
        />

        <DailyTeamAttendance ref={teamAttendanceRef} />

        {/* Add Attendance Modal */}
        <DynamicModal
          show={showAddModal}
          handleClose={handleCloseAddModal}
          title="Facility Attendance"
          modalWidth="500px"
          content={
            <AddDailyAttendanceModal
              onClose={handleCloseAddModal}
              onSave={handleSaveAttendance}
              isSaving={isAdding}
            />
          }
        />
      </MasterLayout>
    </>
  );
};

export default DailyAttendance;
