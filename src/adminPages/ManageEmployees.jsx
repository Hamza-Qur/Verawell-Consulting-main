// src/pages/ManageEmployees.jsx
import React, { useState } from "react";
import MasterLayout from "../otherImages/MasterLayout";
import EmployeeDataTable from "../components/EmployeeDataTable";
import DefaultTopBar from "../components/DefaultTopBar";
import Toast from "../components/Toast";
import { BASE_URL } from "../redux/services/endpoint";

const ManageEmployees = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  const handleDownloadCSV = async () => {
    try {
      setIsDownloading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${BASE_URL}/api/dashboard/get-user-csv`, {
        method: "GET",
        headers: {
          Accept: "application/json, text/csv", // CHANGED: Accept both
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to download CSV");
      }

      // Get response as text first
      const responseText = await response.text();

      // Check if it's the "No data found" JSON response
      try {
        const jsonData = JSON.parse(responseText);
        if (
          jsonData.success === true &&
          jsonData.message &&
          jsonData.message.includes("No data found")
        ) {
          throw new Error(jsonData.message);
        }
      } catch {
        // Not JSON, must be CSV - proceed with download
      }

      // Convert text back to blob for CSV download
      const csvBlob = new Blob([responseText], { type: "text/csv" });
      const url = window.URL.createObjectURL(csvBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast("CSV downloaded successfully", "success");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      showToast(error.message || "Failed to download CSV", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        duration={3000}
      />

      <MasterLayout>
        <DefaultTopBar
          title="Employees | Customer Management"
          btnText2={isDownloading ? "Downloading..." : "Download CSV"}
          btnLink2="#" // Still required to trigger button rendering
          isApiButton2={true} // This tells DefaultTopBar it's an API button
          onBtn2Click={handleDownloadCSV} // API call handler
          isBtn2Loading={isDownloading} // Loading state
          btn2LoadingText="Downloading..." // Loading text
        />

        <EmployeeDataTable />
      </MasterLayout>
    </>
  );
};

export default ManageEmployees;
