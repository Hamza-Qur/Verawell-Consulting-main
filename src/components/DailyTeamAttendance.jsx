// src/components/DailyTeamAttendance.jsx - FIXED facility mapping
import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import DynamicModal from "./DynamicModal";
import EditDailyAttendanceModal from "./EditDailyAttendanceModal";
import {
  getMyDailyAttendance,
  updateDailyAttendance,
} from "../redux/slices/dailyAttendanceSlice";
import { getMyFacilities } from "../redux/slices/facilitySlice";
import DateFilter from "./DateFilter";
import useDateFilter from "./useDateFilter";

const DailyTeamAttendance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myAttendanceList, isMyAttendanceLoading, error } = useSelector(
    (state) => state.dailyAttendance,
  );

  const {
    myFacilities = { data: [] },
    isLoading: isLoadingFacilities = false,
  } = useSelector((state) => state.facility || {});

  const [facilities, setFacilities] = useState([]);

  const { dateFilter, updateFilter, getDateRange } = useDateFilter();

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [selectedFacilityId, setSelectedFacilityId] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const buttonRefs = useRef([]);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    dispatch(getMyFacilities(1));
  }, [dispatch]);

  // FIXED: For team attendance, we need to use facility_id from the response
  useEffect(() => {
    if (myFacilities.data && myFacilities.data.length > 0) {
      const facilityList = myFacilities.data.map((facility) => ({
        id: facility.facility_id, // This is the actual facility ID (e.g., 3)
        name: facility.facility_name || facility.name,
      }));
      setFacilities(facilityList);
    }
  }, [myFacilities]);

  const showToast = (message, type = "info") => {
    setToast({
      show: true,
      message,
      type,
    });
    setTimeout(() => {
      setToast({ ...toast, show: false });
    }, 3000);
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  useEffect(() => {
    const dateRange = getDateRange();

    const params = {
      from_date: dateRange.from_date,
      to_date: dateRange.to_date,
    };

    if (selectedFacilityId !== "all") {
      params.facility_id = selectedFacilityId;
    }

    dispatch(getMyDailyAttendance(params));
  }, [
    dispatch,
    dateFilter.selectedYear,
    dateFilter.viewType,
    dateFilter.selectedQuarter,
    dateFilter.selectedMonth,
    selectedFacilityId,
  ]);

  const handleFacilityFilter = (facilityId) => {
    setSelectedFacilityId(facilityId);
  };

  const handleDropdownToggle = (index, e) => {
    e.stopPropagation();

    if (buttonRefs.current[index]) {
      const rect = buttonRefs.current[index].getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 120,
      });
    }

    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const handleViewDetails = (rowData) => {
    setSelectedAttendance(rowData);
    setShowViewModal(true);
    setDropdownOpen(null);
  };

  const handleEdit = (rowData) => {
    setSelectedAttendance(rowData);
    setShowEditModal(true);
    setDropdownOpen(null);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedAttendance(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedAttendance(null);
  };

  const handleSaveAttendance = (apiData) => {
    setIsSaving(true);

    dispatch(updateDailyAttendance(apiData))
      .then((action) => {
        setIsSaving(false);

        if (action.payload?.success) {
          showToast("Daily attendance record updated successfully!", "success");
          handleCloseEditModal();
          handleCloseViewModal();

          const dateRange = getDateRange();
          const params = {
            from_date: dateRange.from_date,
            to_date: dateRange.to_date,
          };

          if (selectedFacilityId !== "all") {
            params.facility_id = selectedFacilityId;
          }

          dispatch(getMyDailyAttendance(params));
        } else {
          showToast(
            action.payload?.message ||
              "Failed to update daily attendance record",
            "error",
          );
        }
      })
      .catch((error) => {
        setIsSaving(false);
        showToast("An error occurred while saving", "error");
      });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const calculateHoursWorked = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";

    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffInMs = end - start;
      const diffInHours = diffInMs / (1000 * 60 * 60);
      return `${diffInHours.toFixed(1)}`;
    } catch (error) {
      return "N/A";
    }
  };

  const transformAttendanceData = (apiData) => {
    return apiData.map((item) => {
      const hoursWorked = calculateHoursWorked(item.start_time, item.end_time);

      let month = "N/A";
      if (item.start_time) {
        try {
          const startDate = new Date(item.start_time);
          month = startDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
        } catch (error) {
          month = "N/A";
        }
      }

      // FIXED: Find facility using the actual facility_id
      const facility = facilities.find((f) => f.id === item.facility_id);

      return {
        id: item.id || "N/A",
        facility: facility?.name || item.facility_name || "Unknown Facility",
        facility_id: item.facility_id,
        startTime: item.start_time
          ? new Date(item.start_time).toLocaleTimeString("en-US", {
              hour12: true,
            })
          : "N/A",
        startDate: item.start_time
          ? new Date(item.start_time).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "N/A",
        endTime: item.end_time
          ? new Date(item.end_time).toLocaleTimeString("en-US", {
              hour12: true,
            })
          : "N/A",
        endDate: item.end_time
          ? new Date(item.end_time).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "N/A",
        month: month,
        customergroupname: item.customer_group_name || "N/A",
        customerName: item.customer_name || "N/A",
        hoursWorked: hoursWorked,
        originalData: item,
      };
    });
  };

  const attendanceData = isMyAttendanceLoading
    ? []
    : transformAttendanceData(myAttendanceList);

  const filteredData =
    selectedFacilityId === "all"
      ? attendanceData
      : attendanceData.filter(
          (attendance) =>
            attendance.facility_id === parseInt(selectedFacilityId, 10),
        );

  // FIXED: Use id (which is facility_id) for dropdown values
  const facilityOptions = [
    { id: "all", name: "All Facilities" },
    ...facilities.map((f) => ({ id: f.id, name: f.name })),
  ];

  const columns = [
    {
      name: "facility",
      label: "Facility",
      options: {
        customBodyRender: (value) => {
          return (
            <div
              style={{
                padding: "4px 8px",
                backgroundColor: "#E5F4FF",
                color: "#1976D2",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: 500,
                display: "inline-block",
              }}>
              {value}
            </div>
          );
        },
      },
    },
    {
      name: "customergroupname",
      label: "Group Name",
    },
    {
      name: "customerName",
      label: "Customer Name",
    },
    {
      name: "startDate",
      label: "Date",
    },
    {
      name: "checkInOut",
      label: "Check-In/Out",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowData = filteredData[tableMeta.rowIndex];
          return (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "0.9rem", color: "#333" }}>
                <span style={{ fontWeight: 500 }}>In:</span> {rowData.startTime}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#333" }}>
                <span style={{ fontWeight: 500 }}>Out:</span> {rowData.endTime}
              </div>
            </div>
          );
        },
      },
    },
    {
      name: "hoursWorked",
      label: "Hours Worked",
      options: {
        customBodyRender: (value) => {
          let color = "#666";
          let displayValue = value;

          if (value !== "N/A") {
            const hoursNum = parseFloat(value);
            if (!isNaN(hoursNum)) {
              if (hoursNum < 4) color = "#D32F2F";
              else if (hoursNum < 8) color = "#FF8104";
              else color = "#29BF5A";

              displayValue = `${hoursNum} hours`;
            }
          }

          return <div style={{ color, fontWeight: "500" }}>{displayValue}</div>;
        },
      },
    },
    {
      name: "month",
      label: "Month",
    },
    {
      name: "action",
      label: "Action",
      options: {
        sort: false,
        filter: false,
        customBodyRenderLite: (dataIndex) => {
          return (
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                ref={(el) => (buttonRefs.current[dataIndex] = el)}
                onClick={(e) => handleDropdownToggle(dataIndex, e)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                }}>
                <Icon icon="mdi:dots-horizontal" width="25" height="25" />
              </button>
            </div>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: "none",
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: false,
    search: true,
    searchPlaceholder: "Search by facility, customer...",
    pagination: false,
    tableBodyHeight: "auto",
    textLabels: {
      body: {
        noMatch: isMyAttendanceLoading
          ? "Loading..."
          : "No daily attendance records found for selected period",
      },
    },
  };

  const ViewAttendanceModal = ({ attendance, onClose, onEdit }) => {
    if (!attendance) return null;

    const formatDateTime = (dateTimeStr) => {
      if (!dateTimeStr || dateTimeStr === "N/A") return "N/A";
      try {
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (error) {
        return dateTimeStr;
      }
    };

    return (
      <div>
        <div
          style={{
            background: "#F7F8FA",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "20px",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}>
          <div style={{ marginBottom: "15px" }}>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "5px 0",
              }}>
              <strong>Facility:</strong> {attendance.facility}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "5px 0",
              }}>
              <strong>Group:</strong> {attendance.customergroupname}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "5px 0",
              }}>
              <strong>Customer:</strong> {attendance.customerName}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "5px 0",
              }}>
              <strong>Check-In:</strong>{" "}
              {formatDateTime(attendance.originalData?.start_time)}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "5px 0",
              }}>
              <strong>Check-Out:</strong>{" "}
              {formatDateTime(attendance.originalData?.end_time)}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                margin: "5px 0",
              }}>
              <strong>Hours Worked:</strong>{" "}
              {attendance.hoursWorked !== "N/A"
                ? `${attendance.hoursWorked} hours`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="mb-4 pb-2 border-bottom">
        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
          <div style={{ minWidth: "300px" }}>
            <DateFilter
              {...dateFilter}
              onFilterChange={updateFilter}
              size="sm"
            />
          </div>

          <div style={{ minWidth: "200px" }}>
            <select
              className="form-select form-select-sm"
              value={selectedFacilityId}
              onChange={(e) => handleFacilityFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #E0E0E0",
                backgroundColor: "white",
                fontSize: "14px",
              }}>
              {facilityOptions.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-light text-dark p-2">
            <i className="fas fa-calendar-alt me-1"></i>
            {getDateRange().label}
          </span>

          {selectedFacilityId !== "all" && (
            <span className="badge bg-info text-white p-2">
              <i className="fas fa-building me-1"></i>
              Facility:{" "}
              {
                facilityOptions.find(
                  (f) => f.id === parseInt(selectedFacilityId, 10),
                )?.name
              }
              <button
                onClick={() => setSelectedFacilityId("all")}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  marginLeft: "8px",
                  padding: "0 4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}>
                ×
              </button>
            </span>
          )}

          {!isMyAttendanceLoading && myAttendanceList.length > 0 && (
            <span className="badge bg-success p-2">
              <i className="fas fa-clock me-1"></i>
              {myAttendanceList.length} Records
            </span>
          )}
        </div>
      </div>

      {isMyAttendanceLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: "10px" }}>
            Loading your daily attendance data...
          </p>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#D32F2F" }}>
          <Icon icon="material-symbols:error-outline" width="48" height="48" />
          <p style={{ marginTop: "10px" }}>Error: {error}</p>
          <button
            onClick={() => {
              const dateRange = getDateRange();
              const params = {
                from_date: dateRange.from_date,
                to_date: dateRange.to_date,
              };

              if (selectedFacilityId !== "all") {
                params.facility_id = selectedFacilityId;
              }

              dispatch(getMyDailyAttendance(params));
            }}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#8B2885",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}>
            Retry
          </button>
        </div>
      ) : (
        <>
          {attendanceData.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              <Icon icon="mdi:calendar-clock" width="48" height="48" />
              <p style={{ marginTop: "10px" }}>
                No daily attendance records found for {getDateRange().label}
                {selectedFacilityId !== "all" &&
                  ` at ${facilityOptions.find((f) => f.id === parseInt(selectedFacilityId, 10))?.name}`}
                .
              </p>
              <p style={{ fontSize: "14px", marginTop: "8px", color: "#999" }}>
                Click "Add Attendance" to create a new record
              </p>
            </div>
          ) : (
            <div className="basic-data-table">
              <MUIDataTable
                title=""
                data={filteredData}
                columns={columns}
                options={options}
                className="overflow-hidden packageTable"
              />
            </div>
          )}
        </>
      )}

      <DynamicModal
        show={showViewModal}
        handleClose={handleCloseViewModal}
        title="Daily Attendance Details"
        modalWidth="500px"
        content={
          <ViewAttendanceModal
            attendance={selectedAttendance}
            onClose={handleCloseViewModal}
            onEdit={(attendance) => {
              setSelectedAttendance(attendance);
              setShowEditModal(true);
            }}
          />
        }
      />

      <DynamicModal
        show={showEditModal}
        handleClose={handleCloseEditModal}
        title={`Edit Daily Attendance - ${selectedAttendance?.facility || ""}`}
        modalWidth="500px"
        content={
          <EditDailyAttendanceModal
            attendanceData={selectedAttendance}
            isEditMode={true}
            onClose={handleCloseEditModal}
            onSave={handleSaveAttendance}
            isSaving={isSaving}
            facilities={facilities}
            isLoadingFacilities={isLoadingFacilities}
          />
        }
      />

      {dropdownOpen !== null &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: buttonPosition.top,
              left: buttonPosition.left,
              backgroundColor: "white",
              border: "1px solid #E0E0E0",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              minWidth: "140px",
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                color: "#333",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F5F5F5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() => handleViewDetails(filteredData[dropdownOpen])}>
              <Icon
                icon="mdi:eye-outline"
                width="18"
                height="18"
                color="#2196F3"
              />
              <span>View Details</span>
            </div>
            <div
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                color: "#333",
                borderTop: "1px solid #F0F0F0",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F5F5F5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() => handleEdit(filteredData[dropdownOpen])}>
              <Icon icon="line-md:edit" width="18" height="18" color="#666" />
              <span>Edit</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default DailyTeamAttendance;
