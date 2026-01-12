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
  clearDocumentState,
} from "../redux/slices/documentSlice";
import PDFIcon from "../otherImages/pdf-icon.svg";
import Toast from "../components/Toast";

const DocumentDataTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    assessments,
    isLoading,
    isDeleting,
    error,
    deleteError,
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
  }, [successMessage, error, deleteError, dispatch]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Function to download PDF
  const handleDownload = (assessment) => {
    try {
      // Check if assessment has a PDF URL
      const pdfUrl =
        assessment.pdf_url ||
        assessment.file_url ||
        assessment.originalData?.pdf_url;

      if (pdfUrl) {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `${
          assessment.documentName || assessment.title || "document"
        }.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Download started", "success");
      } else {
        showToast("No PDF available for download", "error");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showToast("Error downloading PDF", "error");
    }
    setDropdownOpen(null);
  };

  // Function to attach PDF to email
  const handleAttachToEmail = async (assessment) => {
    try {
      const pdfUrl =
        assessment.pdf_url ||
        assessment.file_url ||
        assessment.originalData?.pdf_url;

      if (!pdfUrl) {
        showToast("No PDF available for email attachment", "error");
        return;
      }

      const subject = encodeURIComponent(
        `${assessment.documentName || "Document"}`
      );
      const body = encodeURIComponent(
        `Please find attached the ${
          assessment.documentName || "document"
        }.\n\n` +
          `Submitted by: ${assessment.uploadedBy || "User"}\n` +
          `Date: ${assessment.uploadDate}\n` +
          `Description: ${assessment.description || "No description available"}`
      );

      window.location.href = `mailto:?subject=${subject}&body=${body}`;

      showToast("Email client opened", "info");
    } catch (error) {
      console.error("Error preparing email attachment:", error);
      showToast("Error preparing email", "error");
    }
    setDropdownOpen(null);
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
        }"? This action cannot be undone.`
      )
    ) {
      dispatch(deleteAssessment(assessmentId)).then((result) => {
        if (result.payload?.success) {
          showToast(
            `Document "${assessment.documentName}" deleted successfully`,
            "success"
          );
          // Refresh the assessments list if we're on the last page and deleted the last item
          const currentPage = assessments.current_page || 1;
          const perPage = assessments.per_page || 10;
          const remainingItems = assessments.total - 1;

          if (
            remainingItems <= (currentPage - 1) * perPage &&
            currentPage > 1
          ) {
            // If we deleted the last item on the page, go to previous page
            dispatch(getAssessments(currentPage - 1));
          } else {
            // Otherwise refresh current page
            dispatch(getAssessments(currentPage));
          }
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

  // Transform API data to match table structure - USING assessment_id
  const transformAssessmentData = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) return [];

    return apiData.map((assessment) => ({
      id: assessment.id,
      assessmentId: assessment.assessment_id || assessment.id, // Use assessment_id if available, fallback to id
      documentName: assessment.title || assessment.name || "Unnamed Document",
      uploadedBy:
        assessment.user_name || assessment.user?.name || "Unknown User",
      userId: assessment.user_id || assessment.user?.id || "N/A",
      uploadDate: formatDate(assessment.created_at || assessment.upload_date),
      uploadTime: formatTime(assessment.created_at || assessment.upload_date),
      description: assessment.description || "",
      pdf_url: assessment.pdf_url || assessment.file_url,
      originalData: assessment,
    }));
  };

  const documentData = isLoading
    ? []
    : assessments.data && Array.isArray(assessments.data)
    ? transformAssessmentData(assessments.data)
    : [];

  const columns = [
    {
      name: "documentName",
      label: "Document Name",
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
                <div style={{ fontWeight: "500" }}>{value}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {rowData?.description
                    ? rowData.description.length > 50
                      ? `${rowData.description.substring(0, 50)}...`
                      : rowData.description
                    : "PDF Document"}
                </div>
                {/* Debug: Show the assessment_id */}
                {rowData?.assessmentId && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#999",
                      marginTop: "2px",
                    }}>
                    Assessment ID: {rowData.assessmentId}
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
    },
    {
      name: "userId",
      label: "User ID",
      options: {
        customBodyRender: (value) => {
          return (
            <div style={{ color: "#8B2885", fontWeight: "500" }}>
              ID: {value}
            </div>
          );
        },
      },
    },
    {
      name: "uploadDate",
      label: "Uploaded Date",
    },
    {
      name: "uploadTime",
      label: "Uploaded Time",
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
                disabled={isDeleting}
                style={{
                  background: "none",
                  border: "1px solid #E0E0E0",
                  borderRadius: "4px",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  padding: "4px 8px",
                  opacity: isDeleting ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <Icon icon="mdi:dots-horizontal" width="20" height="20" />
              </button>
            </div>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: "none",
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 15, 20],
    responsive: "standard",
    elevation: 0,
    print: false,
    download: false,
    viewColumns: false,
    filter: false,
    search: true,
    searchPlaceholder: "Search documents...",
    pagination: true,
    tableBodyHeight: "auto",
    count: assessments.total || 0,
    page: (assessments.current_page || 1) - 1,
    onChangePage: (page) => {
      dispatch(getAssessments(page + 1));
    },
    onChangeRowsPerPage: (rowsPerPage) => {
      dispatch(getAssessments(1));
    },
    setRowProps: (row, dataIndex) => ({
      style: {
        backgroundColor: dataIndex % 2 === 0 ? "#f9f9f9" : "white",
      },
    }),
  };

  // Loading state
  if (isLoading && !documentData.length) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: "10px" }}>Loading documents...</p>
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
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
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
              onClick={() => handleDownload(documentData[dropdownOpen])}>
              <Icon
                icon="mdi:download-outline"
                width="18"
                height="18"
                color="#666"
              />
              <span>Download PDF</span>
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
              onClick={() => handleAttachToEmail(documentData[dropdownOpen])}>
              <Icon
                icon="mdi:email-outline"
                width="18"
                height="18"
                color="#666"
              />
              <span>Attach to Email</span>
            </div>
            <div
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                color: "#D32F2F",
                borderTop: "1px solid #F0F0F0",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#FFE5E5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() => handleDelete(documentData[dropdownOpen])}>
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
          document.body
        )}
    </>
  );
};

export default DocumentDataTable;
