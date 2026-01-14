import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteFacility,
  getMyFacilities,
  updateFacility,
} from "../redux/slices/facilitySlice";
import Toast from "../components/Toast";

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
  } = useSelector((state) => state.facility);

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [editingFacility, setEditingFacility] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const buttonRefs = useRef([]);

  useEffect(() => {
    dispatch(getMyFacilities(1));
  }, [dispatch]);

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
  }, [successMessage, updateError, deleteError, fetchError]);

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

    // Use actual facility_id for routing
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
        `Are you sure you want to delete ${facility.facilityName}? This action cannot be undone.`
      )
    ) {
      dispatch(deleteFacility(actualFacilityId)).then((result) => {
        if (result.payload?.success) {
          dispatch(getMyFacilities(1));
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
      })
    ).then((result) => {
      if (result.payload?.success) {
        dispatch(getMyFacilities(1));
        setEditingFacility(null);
      }
    });
  };

  const transformFacilityData = (apiData) => {
    return apiData.map((facility) => ({
      id: facility.id, // assignment ID
      facility_id: facility.facility_id, // actual facility ID
      facilityName: facility.facility_name || "N/A",
      numberOfEmployees: facility.total_tasks || "0",
      formsSubmitted: facility.total_assessments || "0",
      totalHoursWorked: facility.total_hours || "0",
      date: "N/A",
      status: facility.total_assessments > 0 ? true : false,
      address: facility.facility_address || "No address",
      customerName: "Customer Name",
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
    },
    {
      name: "numberOfEmployees",
      label: "Number Of Tasks",
    },
    {
      name: "formsSubmitted",
      label: "Forms Submitted",
    },
    {
      name: "totalHoursWorked",
      label: "Total Hours Worked",
      options: {
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

  const options = {
    selectableRows: "none",
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: false,
    search: true,
    searchPlaceholder: "Search facilities...",
    pagination: false, // REMOVED PAGINATION
    tableBodyHeight: "auto",
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
      document.body
    );
  };

  if (isFetching) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: "10px" }}>Loading facilities...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#D32F2F" }}>
        <Icon icon="material-symbols:error-outline" width="48" height="48" />
        <p style={{ marginTop: "10px" }}>Error: {fetchError}</p>
        <button
          onClick={() => dispatch(getMyFacilities(1))}
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
    );
  }

  if (!facilityData.length) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        <Icon
          icon="material-symbols:location-city-outline"
          width="48"
          height="48"
        />
        <p style={{ marginTop: "10px" }}>No facilities assigned yet.</p>
      </div>
    );
  }

  return (
    <>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />

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
          document.body
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
