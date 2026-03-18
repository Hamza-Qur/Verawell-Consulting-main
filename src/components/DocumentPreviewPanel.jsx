// src/components/DocumentPreviewPanel.jsx
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import PDFIcon from "../otherImages/pdf-icon.svg";
import { BASE_URL } from "../redux/services/endpoint";

const DocumentPreviewPanel = ({ isOpen, onClose, assessment }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100); // Add zoom control
  const objectRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsLoading(true);
      setPdfError(false);
      setZoomLevel(100); // Reset zoom when opening new document
      document.body.style.overflow = "hidden";

      // Fetch the PDF when panel opens
      if (assessment?.assessmentId) {
        fetchPDF(assessment.assessmentId);
      }
    } else {
      // Clean up PDF URL when closing
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        setPdfBlob(null);
      }

      setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "unset";
      }, 300);
    }

    return () => {
      document.body.style.overflow = "unset";
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, assessment?.assessmentId]);

  // Fetch PDF using the same endpoint as download
  const fetchPDF = async (assessmentId) => {
    try {
      setIsLoading(true);
      setPdfError(false);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/assessment/get-document/${assessmentId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/pdf",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      // Get the PDF blob from response
      const blob = await response.blob();
      setPdfBlob(blob);

      // Create URL for the blob
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching PDF:", error);
      setPdfError(true);
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfBlob && assessment) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${assessment.documentName || "assessment"}-${assessment.assessmentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  if (!isVisible || !assessment) return null;

  const panelStyle = {
    position: "fixed",
    top: 0,
    right: 0,
    width: "60%", // Increased from 50% to 60%
    height: "100vh",
    backgroundColor: "white",
    boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
    zIndex: 10000,
    transform: isOpen ? "translateX(0)" : "translateX(100%)",
    transition: "transform 0.3s ease-in-out",
    display: "flex",
    flexDirection: "column",
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 9999,
    opacity: isOpen ? 1 : 0,
    transition: "opacity 0.3s ease-in-out",
    pointerEvents: isOpen ? "auto" : "none",
  };

  return createPortal(
    <>
      <div style={overlayStyle} onClick={onClose} />

      <div style={panelStyle}>
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #E0E0E0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#F8F9FA",
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={PDFIcon}
              alt="PDF"
              style={{ height: "32px", width: "32px" }}
            />
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                {assessment.documentName || "Document Preview"}
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#666" }}>
                Assessment ID: {assessment.assessmentId}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {/* Zoom Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginRight: "8px",
                border: "1px solid #E0E0E0",
                borderRadius: "6px",
                padding: "2px",
              }}>
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50 || isLoading || !pdfUrl}
                style={{
                  background: "none",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  cursor:
                    zoomLevel <= 50 || isLoading || !pdfUrl
                      ? "not-allowed"
                      : "pointer",
                  color: "#666",
                  opacity: zoomLevel <= 50 || isLoading || !pdfUrl ? 0.5 : 1,
                }}
                title="Zoom Out">
                <Icon icon="mdi:magnify-minus" width="18" height="18" />
              </button>
              <button
                onClick={handleZoomReset}
                disabled={isLoading || !pdfUrl}
                style={{
                  background: "none",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  cursor: isLoading || !pdfUrl ? "not-allowed" : "pointer",
                  color: "#666",
                  fontSize: "12px",
                  fontWeight: 500,
                  opacity: isLoading || !pdfUrl ? 0.5 : 1,
                }}
                title="Reset Zoom">
                {zoomLevel}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200 || isLoading || !pdfUrl}
                style={{
                  background: "none",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  cursor:
                    zoomLevel >= 200 || isLoading || !pdfUrl
                      ? "not-allowed"
                      : "pointer",
                  color: "#666",
                  opacity: zoomLevel >= 200 || isLoading || !pdfUrl ? 0.5 : 1,
                }}
                title="Zoom In">
                <Icon icon="mdi:magnify-plus" width="18" height="18" />
              </button>
            </div>

            <button
              onClick={handleDownload}
              disabled={!pdfBlob || isLoading}
              style={{
                background: "none",
                border: "1px solid #8B2885",
                borderRadius: "6px",
                padding: "8px 16px",
                color: !pdfBlob || isLoading ? "#999" : "#8B2885",
                cursor: !pdfBlob || isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                transition: "all 0.2s",
                opacity: !pdfBlob || isLoading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (pdfBlob && !isLoading) {
                  e.currentTarget.style.backgroundColor = "#8B2885";
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (pdfBlob && !isLoading) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8B2885";
                }
              }}>
              <Icon icon="mdi:download" width="18" height="18" />
              Download
            </button>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                borderRadius: "6px",
                padding: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F0F0F0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }>
              <Icon icon="mdi:close" width="20" height="20" />
            </button>
          </div>
        </div>

        {/* Document metadata - collapsible? */}
        <div
          style={{
            padding: "12px 24px",
            backgroundColor: "white",
            borderBottom: "1px solid #E0E0E0",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "13px",
          }}>
          <span>
            <strong>Facility:</strong> {assessment.facility_name}
          </span>
          <span>
            <strong>Category:</strong> {assessment.category_name}
          </span>
          <span>
            <strong>Group:</strong> {assessment.customer_group_name}
          </span>
          <span>
            <strong>Uploaded:</strong> {assessment.uploadDate}{" "}
            {assessment.uploadTime}
          </span>
          <span>
            <strong>Score:</strong> {assessment.score || 0}/
            {assessment.max_score || 0}
            {assessment.max_score > 0 &&
              ` (${Math.round((assessment.score / assessment.max_score) * 100)}%)`}
          </span>
        </div>

        {/* PDF Preview - Full size */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#404040", // Dark background like PDF readers
            padding: "20px",
            overflow: "auto",
            position: "relative",
            display: "flex",
            justifyContent: "center",
          }}>
          {/* Loading indicator */}
          {isLoading && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                zIndex: 1,
                backgroundColor: "rgba(255,255,255,0.9)",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p style={{ marginTop: "10px", color: "#666" }}>
                Loading PDF preview...
              </p>
            </div>
          )}

          {/* PDF Viewer */}
          {pdfUrl && !pdfError ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                overflow: "auto",
              }}>
              <object
                ref={objectRef}
                data={pdfUrl}
                type="application/pdf"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "800px", // Ensure minimum height
                  border: "none",
                  borderRadius: "4px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "center top",
                  transition: "transform 0.2s ease",
                }}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setPdfError(true);
                  setIsLoading(false);
                }}>
                {/* Fallback if object tag fails */}
                <div
                  style={{
                    height: "100%",
                    minHeight: "800px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "40px",
                  }}>
                  <Icon
                    icon="mdi:file-pdf-box"
                    width="64"
                    height="64"
                    color="#8B2885"
                  />
                  <p
                    style={{
                      margin: "20px 0",
                      textAlign: "center",
                      color: "#666",
                    }}>
                    Your browser doesn't support embedded PDF previews.
                  </p>
                  <button
                    onClick={handleDownload}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: "#8B2885",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}>
                    <Icon icon="mdi:download" width="18" height="18" />
                    Download PDF to View
                  </button>
                </div>
              </object>
            </div>
          ) : pdfError ? (
            <div
              style={{
                height: "100%",
                minHeight: "800px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "40px",
              }}>
              <Icon
                icon="mdi:file-pdf-box"
                width="64"
                height="64"
                color="#dc3545"
              />
              <h4 style={{ margin: "20px 0 10px", color: "#dc3545" }}>
                Failed to load PDF
              </h4>
              <p
                style={{
                  marginBottom: "20px",
                  textAlign: "center",
                  color: "#666",
                }}>
                The PDF could not be loaded. Please try downloading it instead.
              </p>
              <button
                onClick={handleDownload}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#8B2885",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                <Icon icon="mdi:download" width="18" height="18" />
                Download PDF
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>,
    document.body,
  );
};

export default DocumentPreviewPanel;
