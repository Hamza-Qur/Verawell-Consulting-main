import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import MUIDataTable from "mui-datatables";
import MasterLayout from "../otherImages/MasterLayout";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../components/Toast";
import { updateFacility } from "../redux/slices/facilitySlice";
import { getAssignedAssessments } from "../redux/slices/formSlice";

const ClientFacilityDetailPage = () => {
  const navigate = useNavigate();
  const { facilityId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  // Facility slice states
  const {
    isUpdating,
    isDeleting,
    updateError,
    deleteError,
    successMessage: facilitySuccessMessage,
  } = useSelector((state) => state.facility);

  // Form slice states
  const {
    assignedAssessments,
    isAssignedAssessmentsLoading,
    assignedAssessmentsError,
  } = useSelector((state) => state.form);

  const [facility, setFacility] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Initialize facility data from location state
  useEffect(() => {
    if (location.state?.facility) {
      const apiFacility = location.state.facility;
      setFacility(apiFacility);
      setEditForm({
        facilityName: apiFacility.facility_name || "N/A",
        address: apiFacility.facility_address || "No address",
        total_tasks: apiFacility.total_tasks || "0",
        total_assessments: apiFacility.total_assessments || "0",
        total_hours: apiFacility.total_hours || "0",
      });
    }
  }, [location.state]);

  // Fetch assigned assessments for this specific facility
  useEffect(() => {
    if (facility?.id || facilityId) {
      dispatch(getAssignedAssessments(1));
    }
  }, [dispatch, facility, facilityId]);

  // Filter assessments by current facility
  const getFacilityAssessments = () => {
    if (!assignedAssessments?.data || !facility) return [];

    const actualFacilityId = facility.facility_id || facility.id;

    return assignedAssessments.data.filter((assessment) => {
      // Check if the assessment belongs to current facility
      return (
        assessment.facility_id === actualFacilityId ||
        assessment.facility_name === facility.facility_name
      );
    });
  };

  // Show toast messages
  useEffect(() => {
    if (facilitySuccessMessage) {
      showToast(facilitySuccessMessage, "success");
    }
    if (updateError) {
      showToast(updateError, "error");
    }
    if (deleteError) {
      showToast(deleteError, "error");
    }
  }, [facilitySuccessMessage, updateError, deleteError]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Helper function to determine form status
  const getFormStatusInfo = (assessment) => {
    const submittedAssessmentId = assessment.submitted_assessment_id;
    const startTime = assessment.start_time;
    const endTime = assessment.end_time;

    if (submittedAssessmentId === null) {
      // Form not submitted - in process
      return {
        isCompleted: false,
      };
    } else if (startTime === null && endTime === null) {
      // Form submitted, but times not set
      return {
        isCompleted: true,
      };
    } else {
      // Form submitted and times are set
      return {
        isCompleted: true,
      };
    }
  };

  // Transform API data for current facility assessments
  const transformFacilityAssessments = () => {
    const facilityAssessments = getFacilityAssessments();

    return facilityAssessments.map((assessment) => {
      const formStatusInfo = getFormStatusInfo(assessment);

      // Parse dates if available
      const startTime = assessment.start_time
        ? new Date(assessment.start_time)
        : new Date();
      const endTime = assessment.end_time
        ? new Date(assessment.end_time)
        : new Date();

      // Format time (HH:MM:SS)
      const timeStr = assessment.start_time
        ? startTime.toTimeString().split(" ")[0]
        : "N/A";

      // Format date (e.g., "25 November, 2025")
      const dateStr = assessment.start_time
        ? startTime.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "N/A";

      // Calculate hours worked
      let hoursWorked = "N/A";
      if (assessment.start_time && assessment.end_time) {
        const diffMs = endTime - startTime;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        hoursWorked = diffHours.toString();
      }

      // Use category_name for form name
      const formName = assessment.category_name || "Assessment";

      return {
        id: assessment.id,
        formName: formName,
        time: timeStr,
        date: dateStr,
        hoursWorked: hoursWorked,
        formStatus: formStatusInfo.isCompleted,
        facility: assessment.facility_name || facility?.facility_name || "N/A",
        // Original API data for reference (needed for navigation)
        originalData: {
          id: assessment.id,
          submitted_assessment_id: assessment.submitted_assessment_id,
          category_id: assessment.category_id,
          category_name: assessment.category_name,
          // Include any other fields you might need
        },
      };
    });
  };

  // Columns for assessments table (with action column - only View button)
  const assessmentColumns = [
    {
      name: "formName",
      label: "Task Name",
      options: {
        customBodyRender: (value) => (
          <span style={{ fontWeight: 500, color: "#333" }}>{value}</span>
        ),
      },
    },
    {
      name: "time",
      label: "Time",
      options: {
        customBodyRender: (value) => (
          <span
            style={{
              color: value === "N/A" ? "#999999" : "#29BF5A",
              fontWeight: value === "N/A" ? 400 : 500,
            }}>
            {value}
          </span>
        ),
      },
    },
    {
      name: "date",
      label: "Date",
      options: {
        customBodyRender: (value) => (
          <span
            style={{
              color: value === "N/A" ? "#999999" : "#8B2885",
              fontWeight: value === "N/A" ? 400 : 500,
            }}>
            {value}
          </span>
        ),
      },
    },
    {
      name: "hoursWorked",
      label: "Hours Worked",
      options: {
        customBodyRender: (value) => (
          <span
            style={{
              color: value === "N/A" ? "#999999" : "#000000",
              fontWeight: value === "N/A" ? 400 : 500,
            }}>
            {value === "N/A" ? "N/A" : `${value} hours`}
          </span>
        ),
      },
    },
    {
      name: "formStatus",
      label: "Task Status",
      options: {
        customBodyRender: (value) => {
          const style = {
            padding: "4px 8px",
            borderRadius: "12px",
            color: value ? "#28a745" : "#FF8104",
            fontWeight: 500,
            fontSize: "0.85rem",
            display: "inline-block",
            textAlign: "center",
            backgroundColor: value ? "#28a74563" : "#ff810430",
            border: value ? "solid 2px #28a745" : "solid 2px #FF8104",
          };
          return (
            <span style={style}>{value ? "Completed" : "In-Process"}</span>
          );
        },
      },
    },
    {
      name: "action",
      label: "Action",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const row = facilityAssessments[dataIndex];

          // Only show View button if form is completed
          if (!row.formStatus) {
            return (
              <span style={{ color: "#999", fontSize: "0.9rem" }}>
                Not available
              </span>
            );
          }

          const handleViewClick = () => {
            const assessmentId = row.originalData?.submitted_assessment_id;

            if (!assessmentId) {
              showToast("Cannot view: No assessment ID found", "error");
              return;
            }

            const categoryId = row.originalData?.category_id;
            const categoryName =
              row.originalData?.category_name || "Assessment";

            navigate(`/view-form/${assessmentId}`, {
              state: {
                form: row,
                assessmentId: assessmentId,
                category_id: categoryId,
                category_name: categoryName,
                isCompleted: true,
              },
            });
          };

          return (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={handleViewClick}
                style={{
                  background: "#8B2885",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px 12px",
                  color: "white",
                  borderRadius: "7px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                title="View completed form">
                <Icon
                  icon="ic:baseline-remove-red-eye"
                  width="17"
                  height="20"
                />
                View
              </button>
            </div>
          );
        },
      },
    },
  ];

  const assessmentTableOptions = {
    selectableRows: "none",
    rowsPerPage: 10,
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: false,
    search: true,
    searchPlaceholder: "Search assessments...",
    textLabels: {
      body: {
        noMatch: isAssignedAssessmentsLoading ? (
          <div>Loading assessments...</div>
        ) : assignedAssessmentsError ? (
          <div>Error: {assignedAssessmentsError}</div>
        ) : (
          "No assessments found for this facility"
        ),
      },
    },
  };

  if (!facility) {
    return (
      <MasterLayout>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h3>Facility not found</h3>
          <button
            onClick={() => navigate("/customer-dashboard")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#8B2885",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}>
            Back to Facilities
          </button>
        </div>
      </MasterLayout>
    );
  }

  const getFacilityStatus = () => {
    const assessments = parseInt(facility.total_assessments) || 0;
    return assessments > 0;
  };

  const isCompleted = getFacilityStatus();
  const facilityAssessments = transformFacilityAssessments();

  return (
    <MasterLayout>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />

      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <div>
              <button
                onClick={() => navigate("/customer-dashboard")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8B2885",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  fontSize: "14px",
                }}>
                <Icon icon="mdi:arrow-left" width="20" height="20" />
                Back to Facilities
              </button>
              <h1 style={{ margin: "0", color: "#333" }}>
                {facility.facility_name || "N/A"}
              </h1>
              <p style={{ margin: "8px 0 0 0", color: "#666" }}>
                Facility ID: {facility.facility_id || facility.id || "N/A"} •
                Status:{" "}
                <span
                  style={{
                    color: isCompleted ? "#28a745" : "#FF8104",
                    fontWeight: 500,
                  }}>
                  {isCompleted ? "Has Assessments" : "No Assessments"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "32px",
          }}>
          {/* Facility Information */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}>
            <h3 style={{ marginTop: "0", marginBottom: "20px", color: "#333" }}>
              Facility Information
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                    fontSize: "14px",
                  }}>
                  Facility Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="facilityName"
                    value={editForm.facilityName || ""}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                    }}
                  />
                ) : (
                  <p style={{ margin: "0", fontWeight: 500 }}>
                    {facility.facility_name || "N/A"}
                  </p>
                )}
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                    fontSize: "14px",
                  }}>
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={editForm.address || ""}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      minHeight: "80px",
                      resize: "vertical",
                    }}
                  />
                ) : (
                  <p style={{ margin: "0", fontWeight: 500 }}>
                    {facility.facility_address || "No address"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}>
            <h3 style={{ marginTop: "0", marginBottom: "20px", color: "#333" }}>
              Statistics
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                    fontSize: "14px",
                  }}>
                  Total Hours
                </label>
                <p
                  style={{
                    margin: "0",
                    fontWeight: "500",
                    color: facility.total_hours > 0 ? "#29BF5A" : "#999",
                  }}>
                  {facility.total_hours || "0"} hours
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                    fontSize: "14px",
                  }}>
                  Documents Submitted
                </label>
                <p style={{ margin: "0", fontWeight: 500, color: "#333" }}>
                  {facility.total_assessments || "0"}
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                    fontSize: "14px",
                  }}>
                  Total Tasks
                </label>
                <p
                  style={{
                    margin: "0",
                    fontWeight: 500,
                    color: "#333",
                    fontSize: "1.5rem",
                  }}>
                  {facility.total_tasks || "0"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assessments Section */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "32px",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}>
            <h3 style={{ margin: "0", color: "#333" }}>Facility Assessments</h3>
            <div style={{ fontSize: "14px", color: "#666" }}>
              Showing {facilityAssessments.length} assessment
              {facilityAssessments.length !== 1 ? "s" : ""}
            </div>
          </div>

          {isAssignedAssessmentsLoading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p style={{ marginTop: "10px" }}>Loading assessments...</p>
            </div>
          ) : assignedAssessmentsError ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#D32F2F",
              }}>
              <p>Error loading assessments: {assignedAssessmentsError}</p>
            </div>
          ) : facilityAssessments.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#666",
              }}>
              <Icon icon="mdi:clipboard-text-outline" width="50" height="50" />
              <p style={{ marginTop: "10px" }}>
                No assessments found for this facility
              </p>
            </div>
          ) : (
            <MUIDataTable
              data={facilityAssessments}
              columns={assessmentColumns}
              options={assessmentTableOptions}
            />
          )}
        </div>
      </div>
    </MasterLayout>
  );
};

export default ClientFacilityDetailPage;
