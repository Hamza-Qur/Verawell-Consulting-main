import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import PDFIcon from "../otherImages/pdf-icon.svg";
import SamplePDF from "../otherImages/file-sample.pdf";

const ClientDocumentsData = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef([]);

  // Function to download PDF
  const handleDownload = (rowData) => {
    try {
      // Create a link and trigger download
      const link = document.createElement("a");
      link.href = rowData.pdfContent;
      link.download = `${rowData.documentName.replace(
        /\s+/g,
        "_"
      )}_${rowData.uploadedBy.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Error downloading PDF. Please try again.");
    }
    setDropdownOpen(null);
  };

  // Function to attach PDF to email
  const handleAttachToEmail = async (rowData) => {
    try {
      const response = await fetch(rowData.pdfContent);
      const pdfBlob = await response.blob();

      const pdfFile = new File(
        [pdfBlob],
        `${rowData.documentName.replace(
          /\s+/g,
          "_"
        )}_${rowData.uploadedBy.replace(/\s+/g, "_")}.pdf`,
        { type: "application/pdf" }
      );

      const formData = new FormData();
      formData.append("attachment", pdfFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];

        const subject = encodeURIComponent(
          `${rowData.documentName} - ${rowData.uploadedBy}`
        );
        const body = encodeURIComponent(
          `Please find attached the ${rowData.documentName} submitted by ${rowData.uploadedBy} on ${rowData.uploadDate} at ${rowData.uploadTime}.\n\n` +
            `File: ${rowData.documentName.replace(
              /\s+/g,
              "_"
            )}_${rowData.uploadedBy.replace(/\s+/g, "_")}.pdf`
        );

        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

        window.location.href = mailtoLink;

        setTimeout(() => {
          alert(
            `PDF has been prepared for email.\n\n` +
              `File: ${pdfFile.name}\n` +
              `You can also download it first and attach manually.`
          );
        }, 500);
      };
      reader.readAsDataURL(pdfFile);
    } catch (error) {
      console.error("Error preparing email attachment:", error);

      const subject = encodeURIComponent(
        `${rowData.documentName} - ${rowData.uploadedBy}`
      );
      const body = encodeURIComponent(
        `Document: ${rowData.documentName}\n` +
          `Employee: ${rowData.uploadedBy}\n` +
          `Employee ID: ${rowData.id}\n` +
          `Date: ${rowData.uploadDate}\n` +
          `Time: ${rowData.uploadTime}\n\n` +
          `Please download the document first from the system and attach it to your email.`
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
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

  const handleDelete = (rowData) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${rowData.documentName} for ${rowData.uploadedBy}?`
      )
    ) {
      alert(`Deleted Document: ${rowData.documentName} successfully`);
    }
    setDropdownOpen(null);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const documentData = [
    {
      documentName: "KFC Kitchen Facility Form",
      facilityName: "Homeplace Manor",
      uploadDate: "25 October, 2025",
      uploadTime: "08:30 AM",
      pdfContent: SamplePDF,
    },
    {
      documentName: "KFC Sanitation Checklist",
      facilityName: "Homeplace Manor East Wing",
      uploadDate: "05 October, 2025",
      uploadTime: "09:00 AM",
      pdfContent: SamplePDF,
    },
    {
      documentName: "KFC Food Safety Audit",
      facilityName: "Homeplace Manor West Wing",
      uploadDate: "02 October, 2025",
      uploadTime: "12:45 PM",
      pdfContent: SamplePDF,
    },
    {
      documentName: "KFC Daily Kitchen Log",
      facilityName: "Homeplace Manor – Kitchen A",
      uploadDate: "30 September, 2025",
      uploadTime: "08:30 AM",
      pdfContent: SamplePDF,
    },
    {
      documentName: "KFC Equipment Inspection",
      facilityName: "Homeplace Manor – Kitchen B",
      uploadDate: "27 September, 2025",
      uploadTime: "09:00 AM",
      pdfContent: SamplePDF,
    },
    {
      documentName: "KFC Hygiene Assessment",
      facilityName: "Homeplace Manor South",
      uploadDate: "22 September, 2025",
      uploadTime: "12:45 PM",
      pdfContent: SamplePDF,
    },
    {
      documentName: "KFC Kitchen Facility Form",
      facilityName: "Homeplace Manor North",
      uploadDate: "15 September, 2025",
      uploadTime: "12:45 PM",
      pdfContent: SamplePDF,
    },
    {
      documentName: "KFC Food Handling Review",
      facilityName: "Homeplace Manor Annex",
      uploadDate: "09 September, 2025",
      uploadTime: "09:00 AM",
      pdfContent: SamplePDF,
    },
    {
      documentName: "KFC Sanitation Follow-Up",
      facilityName: "Homeplace Manor – Service Wing",
      uploadDate: "01 September, 2025",
      uploadTime: "08:30 AM",
      pdfContent: SamplePDF,
    },
    {
      documentName: "KFC Safety Compliance Form",
      facilityName: "Homeplace Manor Central",
      uploadDate: "31 August, 2025",
      uploadTime: "12:45 PM",
      pdfContent: SamplePDF,
    },
    {
      documentName: "KFC Kitchen Facility Form",
      facilityName: "Homeplace Manor – Unit 3",
      uploadDate: "29 August, 2025",
      uploadTime: "09:00 AM",
      pdfContent: SamplePDF,
    },
    {
      documentName: "KFC Internal Inspection Report",
      facilityName: "Homeplace Manor – Unit 5",
      uploadDate: "16 August, 2025",
      uploadTime: "08:30 AM",
      pdfContent: SamplePDF,
    },
    {
      documentName: "KFC Closing Shift Checklist",
      facilityName: "Homeplace Manor – Main Building",
      uploadDate: "14 August, 2025",
      uploadTime: "12:45 PM",
      pdfContent: SamplePDF,
    },
  ];

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
                  PDF Document
                </div>
              </div>
            </div>
          );
        },
      },
    },
    {
      name: "facilityName",
      label: "Facility Name",
      options: {
        customBodyRender: (value) => {
          return (
            <div style={{ color: "#666", fontWeight: "400" }}>{value}</div>
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
          return (
            <div style={{ position: "relative" }}>
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
  };

  return (
    <>
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
                borderTop: "1px solid #F0F0F0",
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
                (e.currentTarget.style.backgroundColor = "#F5F5F5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() => handleDelete(documentData[dropdownOpen])}>
              <Icon
                icon="material-symbols:delete-outline"
                width="18"
                height="18"
                color="#D32F2F"
              />
              <span>Delete</span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ClientDocumentsData;
