// src/components/FacilityDataTable.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import MUIDataTable from "mui-datatables";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteFacility,
  getMyFacilities,
  updateFacility,
  downloadFacilitiesCSV, // Keep CSV import as is
} from "../redux/slices/facilitySlice";
import DateFilter from "./DateFilter";
import useDateFilter from "./useDateFilter";
import Toast from "./Toast";

const FacilityDataTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    myFacilities,
    isFetching,
    fetchError,
    isUpdating,
    isDeleting,
    updateError,
    deleteError,
    successMessage,
    isDownloadingCSV,
    downloadCSVError,
  } = useSelector((state) => state.facility);

  // Use date filter hook
  const { dateFilter, updateFilter, getDateRange } = useDateFilter();

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [editingFacility, setEditingFacility] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const buttonRefs = useRef([]);

  // Fetch facilities with date filters
  useEffect(() => {
    const dateRange = getDateRange();

    dispatch(
      getMyFacilities({
        page: currentPage,
        from_date: dateRange.from_date,
        to_date: dateRange.to_date,
      }),
    );
  }, [
    dispatch,
    currentPage,
    dateFilter.selectedYear,
    dateFilter.viewType,
    dateFilter.selectedQuarter,
    dateFilter.selectedMonth,
  ]);

  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, "success");
    }
    if (updateError) {
      showToast(updateError, "error");
    }
    if (deleteError) {
      showToast(deleteError, "error");
    }
    if (fetchError) {
      showToast(fetchError, "error");
    }
    if (downloadCSVError) {
      showToast(downloadCSVError, "error");
    }
  }, [successMessage, updateError, deleteError, fetchError, downloadCSVError]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
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

  const handleEdit = (facility) => {
    setEditingFacility(facility);
    setDropdownOpen(null);
  };

  const handleViewDetails = (facility) => {
    if (!facility) return;

    const actualFacilityId =
      facility.facility_id ||
      facility.originalData?.facility_id ||
      facility.id ||
      "1";

    navigate(`/facilities/${actualFacilityId}`, {
      state: { facility: facility.originalData || facility },
    });
    setDropdownOpen(null);
  };

  const handleDelete = (facility) => {
    const actualFacilityId = facility.originalData?.facility_id || facility.id;

    if (
      window.confirm(
        `Are you sure you want to delete ${facility.facilityName}? This action cannot be undone.`,
      )
    ) {
      dispatch(deleteFacility(actualFacilityId)).then((result) => {
        if (result.payload?.success) {
          const dateRange = getDateRange();
          dispatch(
            getMyFacilities({
              page: currentPage,
              from_date: dateRange.from_date,
              to_date: dateRange.to_date,
            }),
          );
        }
      });
    }
    setDropdownOpen(null);
  };

  const handleSaveEdit = (updatedData) => {
    const actualFacilityId =
      editingFacility.facility_id ||
      editingFacility.originalData?.facility_id ||
      editingFacility.id;

    dispatch(
      updateFacility({
        facilityId: actualFacilityId,
        facilityData: {
          name: updatedData.facilityName,
          address: updatedData.address,
        },
      }),
    ).then((result) => {
      if (result.payload?.success) {
        const dateRange = getDateRange();
        dispatch(
          getMyFacilities({
            page: currentPage,
            from_date: dateRange.from_date,
            to_date: dateRange.to_date,
          }),
        );
        setEditingFacility(null);
      }
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // CSV Download handler - REVERTED to original without date params
  const handleDownloadCSV = () => {
    dispatch(downloadFacilitiesCSV());
  };

  const transformFacilityData = (apiData) => {
    return apiData.map((facility) => ({
      id: facility.id,
      facility_id: facility.facility_id,
      facilityName: facility.facility_name || "N/A",
      formsSubmitted: facility.total_assessments || "0",
      totalHoursWorked: facility.total_hours || "0",
      customerName: facility.customer_name || "N/A",
      groupNames: facility.customer_group_name || "N/A",
      budgetedHours: facility.budgeted_hours
        ? Math.round(facility.budgeted_hours)
        : "N/A",
      customerId: facility.customer_id || null,
      status: facility.total_assessments > 0 ? true : false,
      address: facility.facility_address || "No address",
      assignedEmployees: [],
      originalData: facility,
    }));
  };

  const facilityData = isFetching
    ? []
    : myFacilities.data && myFacilities.data.length > 0
      ? transformFacilityData(myFacilities.data)
      : [];

  const columns = [
    {
      name: "facilityName",
      label: "Facility Name",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "groupNames",
      label: "Group Name",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "customerName",
      label: "Customer Name",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = facilityData[tableMeta.rowIndex];
          const customerId = rowData?.customerId;
          return (
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (customerId) {
                  navigate(`/customers/${customerId}`, {
                    state: {
                      customerId: customerId,
                      customerName: value,
                      from: "facilities",
                    },
                  });
                }
              }}
              style={{
                color: customerId ? "#8b2885" : "#333",
                cursor: customerId ? "pointer" : "default",
                textDecoration: customerId ? "underline" : "none",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                if (customerId) e.target.style.opacity = "0.8";
              }}
              onMouseLeave={(e) => {
                if (customerId) e.target.style.opacity = "1";
              }}>
              {value}
            </span>
          );
        },
      },
    },
    {
      name: "formsSubmitted",
      label: "Forms Submitted",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "budgetedHours",
      label: "Budgeted Hours",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          return (
            <span style={{ color: "#666", fontSize: "14px" }}>{value}</span>
          );
        },
      },
    },
    {
      name: "totalHoursWorked",
      label: "Total Hours Worked",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const row = facilityData[tableMeta.rowIndex];
          let displayValue = "N/A";
          let color = "#666";

          if (row && value && parseFloat(value) > 0) {
            displayValue = `${value} hours`;
            color = "#29BF5A";
          } else if (row && row.formsSubmitted > 0) {
            displayValue = "In Progress";
            color = "#FF8104";
          } else {
            displayValue = "Not Started";
            color = "#999";
          }

          return (
            <span
              style={{
                color,
                fontWeight: 500,
                fontStyle: value ? "normal" : "italic",
              }}>
              {displayValue}
            </span>
          );
        },
      },
    },
    {
      name: "address",
      label: "Facility Address",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          return (
            <span style={{ color: "#333", fontWeight: 500 }}>
              {value || "No address"}
            </span>
          );
        },
      },
    },
    {
      name: "action",
      label: "Action",
      options: {
        sort: false,
        filter: false,
        customBodyRenderLite: (dataIndex) => {
          const rowData = facilityData[dataIndex];

          if (!rowData) return null;

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

  // FIXED: MUIDataTable options - CSV and View Columns disabled
  const options = {
    selectableRows: "none",
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false, // DISABLED: Use custom download button instead
    viewColumns: false, // DISABLED: Remove view columns toggle
    filter: false,
    filterType: "dropdown",
    search: true,
    searchPlaceholder: "Search facilities...",
    pagination: true,
    serverSide: false,
    count: myFacilities.total || 0,
    rowsPerPage: myFacilities.per_page || 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    page: currentPage - 1,
    onPageChange: (page) => handlePageChange(page + 1),
    onTableChange: (action, tableState) => {
      switch (action) {
        case "changePage":
          handlePageChange(tableState.page + 1);
          break;
        default:
          break;
      }
    },
    textLabels: {
      body: {
        noMatch: isFetching
          ? "Loading..."
          : "No facilities found for selected period",
      },
      toolbar: {
        search: "Search",
        viewColumns: "View Columns", // This won't show since viewColumns is false
      },
    },
  };

  const dropdownOptions = [
    {
      label: "Edit Facility",
      icon: "line-md:edit",
      color: "#333",
      onClick: (facility) => handleEdit(facility),
    },
    {
      label: "View Details",
      icon: "mdi:eye-outline",
      color: "#2196F3",
      onClick: (facility) => handleViewDetails(facility),
    },
    {
      label: "Delete",
      icon: "material-symbols:delete-outline",
      color: "#D32F2F",
      onClick: (facility) => handleDelete(facility),
    },
  ];

  const FacilityEditModal = ({ facility, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      facilityName: facility.facilityName,
      address: facility.address || "",
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}
        onClick={onClose}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            width: "90%",
            maxWidth: "500px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}>
            <h3 style={{ margin: 0, color: "#8B2885" }}>
              Edit {facility.facilityName}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#666",
              }}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                Facility Name
              </label>
              <input
                type="text"
                name="facilityName"
                value={formData.facilityName}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                }}
                required
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}>
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  minHeight: "80px",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  background: "white",
                  cursor: isUpdating ? "not-allowed" : "pointer",
                  color: "#666",
                  opacity: isUpdating ? 0.6 : 1,
                }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#8B2885",
                  cursor: isUpdating ? "not-allowed" : "pointer",
                  color: "white",
                  fontWeight: "500",
                  opacity: isUpdating ? 0.6 : 1,
                }}>
                {isUpdating ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body,
    );
  };

  return (
    <>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />

      {/* Date Filter and Header */}
      <div className="mb-4 pb-2 border-bottom">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <DateFilter {...dateFilter} onFilterChange={updateFilter} size="sm" />
        </div>

        <div className="mt-10 mb-10 d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-light text-dark p-2">
            <i className="fas fa-calendar-alt me-1"></i>
            {getDateRange().label}
          </span>
          {myFacilities.total > 0 && (
            <span className="badge bg-success p-2">
              <i className="fas fa-building me-1"></i>
              {myFacilities.total} Facilities
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="basic-data-table">
        <MUIDataTable
          title=""
          data={facilityData}
          columns={columns}
          options={options}
          className="overflow-hidden packageTable"
        />
      </div>

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
              minWidth: "160px",
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}>
            {dropdownOptions.map((option, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "14px",
                  color: option.color,
                  borderTop: idx === 0 ? "none" : "1px solid #F0F0F0",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F5F5F5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                onClick={() => option.onClick(facilityData[dropdownOpen])}>
                <Icon icon={option.icon} width="18" height="18" />
                <span>{option.label}</span>
              </div>
            ))}
          </div>,
          document.body,
        )}

      {editingFacility && (
        <FacilityEditModal
          facility={editingFacility}
          onClose={() => setEditingFacility(null)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default FacilityDataTable;
