// src/components/DocumentDataTable.jsx
import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getAssessments,
  deleteAssessment,
  downloadAssessmentPDF,
  clearDocumentState,
} from "../redux/slices/documentSlice";
import PDFIcon from "../otherImages/pdf-icon.svg";
import Toast from "../components/Toast";

const ClientDocumentsData = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    assessments,
    isLoading,
    isDeleting,
    isDownloadingPDF,
    error,
    deleteError,
    downloadPDFError,
    successMessage,
  } = useSelector((state) => state.document);

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const buttonRefs = useRef([]);

  // Fetch assessments on component mount
  useEffect(() => {
    dispatch(getAssessments(1));
  }, [dispatch]);

  // Show toast messages
  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, "success");
      dispatch(clearDocumentState());
    }
    if (error) {
      showToast(error, "error");
      dispatch(clearDocumentState());
    }
    if (deleteError) {
      showToast(deleteError, "error");
      dispatch(clearDocumentState());
    }
    if (downloadPDFError) {
      showToast(downloadPDFError, "error");
      dispatch(clearDocumentState());
    }
  }, [successMessage, error, deleteError, downloadPDFError, dispatch]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Function to download PDF using Redux thunk
  const handleDownload = async (assessment) => {
    try {
      // Get the assessment_id from the assessment data
      const assessmentId =
        assessment.assessmentId ||
        assessment.originalData?.assessment_id ||
        assessment.originalData?.id;

      if (!assessmentId) {
        showToast("Cannot download: Missing assessment ID", "error");
        return;
      }

      // Dispatch the download thunk
      dispatch(downloadAssessmentPDF(assessmentId)).then((result) => {
        if (result.payload?.success) {
          showToast("PDF downloaded successfully", "success");
        }
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showToast(`Error downloading PDF: ${error.message}`, "error");
    } finally {
      setDropdownOpen(null);
    }
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleDelete = (assessment) => {
    // Get the assessment_id from the assessment
    const assessmentId =
      assessment.assessmentId ||
      assessment.originalData?.assessment_id ||
      assessment.originalData?.id;

    if (!assessmentId) {
      showToast("Cannot delete: Missing assessment ID", "error");
      setDropdownOpen(null);
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete "${
          assessment.documentName || "this document"
        }"? This action cannot be undone.`,
      )
    ) {
      dispatch(deleteAssessment(assessmentId)).then((result) => {
        if (result.payload?.success) {
          showToast(
            `Document "${assessment.documentName}" deleted successfully`,
            "success",
          );
          // Refresh the assessments list
          const currentPage = assessments.current_page || 1;
          dispatch(getAssessments(currentPage));
        }
      });
    }
    setDropdownOpen(null);
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format time function
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Transform API data to match table structure
  const transformAssessmentData = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) return [];

    return apiData.map((assessment) => {
      // Document name is now the category name
      const documentName = assessment.category_name || "Uncategorized";

      return {
        id: assessment.id,
        assessmentId: assessment.assessment_id || assessment.id,
        documentName: documentName, // This is now category_name
        facilityName: assessment.facility_name || "Unknown Facility",
        uploadedBy:
          assessment.user_name || assessment.user?.name || "Unknown User",
        userId: assessment.user_id || assessment.user?.id || "N/A",
        uploadDate: formatDate(assessment.created_at || assessment.upload_date),
        uploadTime: formatTime(assessment.created_at || assessment.upload_date),
        description: assessment.description || "",
        pdf_url: assessment.pdf_url || assessment.file_url,
        originalData: assessment,
      };
    });
  };

  const documentData = isLoading
    ? []
    : assessments.data && Array.isArray(assessments.data)
      ? transformAssessmentData(assessments.data)
      : [];

  const columns = [
    {
      name: "facilityName",
      label: "Facility",
      options: {
        customBodyRender: (value) => {
          return (
            <div style={{ color: "#000000", fontWeight: "400" }}>{value}</div>
          );
        },
      },
    },
    {
      name: "documentName",
      label: "Document Name", // This is now Category Name
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowData = documentData[tableMeta.rowIndex];
          return (
            <div className={`col-clientName d-flex align-items-center gap-8`}>
              <img
                style={{ height: "35px", width: "35px" }}
                src={PDFIcon}
                alt="pdfImage"
              />
              <div>
                <div style={{ fontWeight: "500", color: "#000000" }}>
                  {value}
                </div>
                <div style={{ fontSize: "12px", color: "#666666" }}>
                  {rowData?.description
                    ? rowData.description.length > 50
                      ? `${rowData.description.substring(0, 50)}...`
                      : rowData.description
                    : "PDF Document"}
                </div>
                {rowData?.assessmentId && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#999999",
                      marginTop: "2px",
                    }}>
                    ID: {rowData.assessmentId}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
    },
    {
      name: "uploadedBy",
      label: "Uploaded By",
      options: {
        customBodyRender: (value) => {
          return <div style={{ color: "#000000" }}>{value}</div>;
        },
      },
    },
    // {
    //   name: "userId",
    //   label: "User ID",
    //   options: {
    //     customBodyRender: (value) => {
    //       return (
    //         <div style={{ color: "#8B2885", fontWeight: "500" }}>
    //           ID: {value}
    //         </div>
    //       );
    //     },
    //   },
    // },
    {
      name: "uploadDate",
      label: "Uploaded Date",
      options: {
        customBodyRender: (value) => {
          return <div style={{ color: "#000000" }}>{value}</div>;
        },
      },
    },
    {
      name: "uploadTime",
      label: "Uploaded Time",
      options: {
        customBodyRender: (value) => {
          return <div style={{ color: "#000000" }}>{value}</div>;
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
          const rowData = documentData[dataIndex];

          if (!rowData) return null;

          return (
            <div style={{ position: "relative" }}>
              <button
                ref={(el) => (buttonRefs.current[dataIndex] = el)}
                onClick={(e) => handleDropdownToggle(dataIndex, e)}
                disabled={isDeleting || isDownloadingPDF}
                style={{
                  background: "none",
                  border: "1px solid #E0E0E0",
                  borderRadius: "4px",
                  cursor:
                    isDeleting || isDownloadingPDF ? "not-allowed" : "pointer",
                  padding: "4px 8px",
                  opacity: isDeleting || isDownloadingPDF ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <Icon
                  icon="mdi:dots-horizontal"
                  width="20"
                  height="20"
                  color="#000000"
                />
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
    searchPlaceholder: "Search documents...",
    pagination: false,
    tableBodyHeight: "auto",
    setRowProps: (row, dataIndex) => ({
      style: {
        backgroundColor: dataIndex % 2 === 0 ? "#f9f9f9" : "white",
      },
    }),
    // Remove any custom styling that adds colors
    textLabels: {
      body: {
        noMatch: "No documents found",
      },
    },
  };

  // Loading state
  if (isLoading && !documentData.length) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: "10px", color: "#000000" }}>
          Loading documents...
        </p>
      </div>
    );
  }

  // Error state
  if (error && !documentData.length) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#D32F2F" }}>
        <Icon icon="material-symbols:error-outline" width="48" height="48" />
        <p style={{ marginTop: "10px" }}>Error: {error}</p>
        <button
          onClick={() => dispatch(getAssessments(1))}
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

  // No data state
  if (!documentData.length && !isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#666666" }}>
        <Icon
          icon="material-symbols:description-outline"
          width="48"
          height="48"
        />
        <p style={{ marginTop: "10px" }}>No documents found.</p>
        <button
          onClick={() => dispatch(getAssessments(1))}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#8B2885",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}>
          Refresh
        </button>
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
          data={documentData}
          columns={columns}
          options={options}
          className="overflow-hidden packageTable"
        />
      </div>

      {/* Portal dropdown to body */}
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
              minWidth: "180px",
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: "10px 16px",
                cursor: isDownloadingPDF ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                color: isDownloadingPDF ? "#999" : "#333",
                transition: "background-color 0.2s",
                opacity: isDownloadingPDF ? 0.6 : 1,
              }}
              onMouseEnter={(e) =>
                !isDownloadingPDF &&
                (e.currentTarget.style.backgroundColor = "#F5F5F5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() =>
                !isDownloadingPDF && handleDownload(documentData[dropdownOpen])
              }>
              {isDownloadingPDF ? (
                <>
                  <div
                    className="spinner-border spinner-border-sm"
                    style={{
                      width: "18px",
                      height: "18px",
                      borderColor: "#666",
                    }}
                    role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Icon
                    icon="mdi:download-outline"
                    width="18"
                    height="18"
                    color="#666"
                  />
                  <span>Download PDF</span>
                </>
              )}
            </div>
            <div
              style={{
                padding: "10px 16px",
                cursor:
                  isDeleting || isDownloadingPDF ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                color: "#D32F2F",
                borderTop: "1px solid #F0F0F0",
                transition: "background-color 0.2s",
                opacity: isDeleting || isDownloadingPDF ? 0.6 : 1,
              }}
              onMouseEnter={(e) =>
                !isDeleting &&
                !isDownloadingPDF &&
                (e.currentTarget.style.backgroundColor = "#FFE5E5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() =>
                !isDeleting &&
                !isDownloadingPDF &&
                handleDelete(documentData[dropdownOpen])
              }>
              {isDeleting ? (
                <>
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    style={{ borderColor: "#D32F2F" }}
                    role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Deleting...
                </>
              ) : (
                <>
                  <Icon
                    icon="material-symbols:delete-outline"
                    width="18"
                    height="18"
                    color="#D32F2F"
                  />
                  <span>Delete</span>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default ClientDocumentsData;
