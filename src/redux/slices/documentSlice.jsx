// src/redux/slices/documentSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../services/endpoint";

// Get assessments list
export const getAssessments = createAsyncThunk(
  "document/getAssessments",
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/assessment/get-list?page=${page}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch assessments");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// Get assessment details by ID
export const getAssessmentDetails = createAsyncThunk(
  "document/getAssessmentDetails",
  async (assessmentId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/assessment/get/${assessmentId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to fetch assessment details"
        );
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// Delete assessment - USING assessment_id
export const deleteAssessment = createAsyncThunk(
  "document/deleteAssessment",
  async (assessmentId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/assessment/delete/${assessmentId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to delete assessment");
      }

      return {
        assessmentId,
        success: data.success || true,
        message: data.message || "Assessment deleted successfully",
        data: data,
      };
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// Download assessment PDF document
export const downloadAssessmentPDF = createAsyncThunk(
  "document/downloadAssessmentPDF",
  async (assessmentId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/assessment/get-document/${assessmentId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/pdf",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to download PDF");
      }

      // Get the PDF blob from response
      const pdfBlob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `assessment-${assessmentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: "PDF downloaded successfully",
        assessmentId,
      };
    } catch (err) {
      return rejectWithValue("Network error while downloading PDF");
    }
  }
);

// Download assessments list CSV
export const downloadAssessmentsCSV = createAsyncThunk(
  "document/downloadAssessmentsCSV",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/assessment/get-list-csv`,
        {
          method: "GET",
          headers: {
            Accept: "application/json, text/csv", // CHANGED: Accept both JSON and CSV
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to download CSV");
      }

      // Get response as text first
      const responseText = await response.text();
      
      // Check if it's the "No data found" JSON response
      try {
        const jsonData = JSON.parse(responseText);
        if (jsonData.success === true && 
            jsonData.message && 
            jsonData.message.includes("No data found")) {
          return rejectWithValue(jsonData.message);
        }
      } catch {
        // Not JSON, must be CSV - proceed with download
      }
      
      // Convert text back to blob for CSV download
      const blob = new Blob([responseText], { type: 'text/csv' });
      return blob;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

const documentSlice = createSlice({
  name: "document",
  initialState: {
    assessments: {
      data: [],
      current_page: 1,
      total: 0,
      per_page: 10,
      last_page: 1,
    },
    assessmentDetails: null,
    isLoading: false,
    isDetailsLoading: false,
    isDeleting: false,
    isDownloadingPDF: false,
    error: null,
    detailsError: null,
    deleteError: null,
    downloadPDFError: null,
    isDownloadingCSV: false,
    downloadCSVError: null,
    successMessage: "",
    deleteSuccess: false,
  },
  reducers: {
    clearDocumentState: (state) => {
      state.error = null;
      state.detailsError = null;
      state.deleteError = null;
      state.downloadPDFError = null;
      state.successMessage = "";
      state.downloadCSVError = null;
      state.deleteSuccess = false;
    },
    clearAssessments: (state) => {
      state.assessments = {
        data: [],
        current_page: 1,
        total: 0,
        per_page: 10,
        last_page: 1,
      };
      state.error = null;
    },
    clearAssessmentDetails: (state) => {
      state.assessmentDetails = null;
      state.detailsError = null;
    },
  },
  extraReducers: (builder) => {
    // Get Assessments
    builder
      .addCase(getAssessments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAssessments.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.assessments = action.payload.data || action.payload;
        } else {
          state.error = action.payload.message || "Failed to fetch assessments";
        }
      })
      .addCase(getAssessments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch assessments";
      });

    // Get Assessment Details
    builder
      .addCase(getAssessmentDetails.pending, (state) => {
        state.isDetailsLoading = true;
        state.detailsError = null;
      })
      .addCase(getAssessmentDetails.fulfilled, (state, action) => {
        state.isDetailsLoading = false;
        if (action.payload.success) {
          state.assessmentDetails = action.payload.data;
        } else {
          state.detailsError =
            action.payload.message || "Failed to fetch assessment details";
        }
      })
      .addCase(getAssessmentDetails.rejected, (state, action) => {
        state.isDetailsLoading = false;
        state.detailsError =
          action.payload || "Failed to fetch assessment details";
      });

    // Delete Assessment - USING assessment_id
    builder
      .addCase(deleteAssessment.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteAssessment.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.deleteSuccess = true;
        state.successMessage =
          action.payload.message || "Assessment deleted successfully";

        // Remove the deleted assessment from the state using assessment_id
        state.assessments.data = state.assessments.data.filter(
          (assessment) =>
            assessment.assessment_id !== action.payload.assessmentId
        );

        // Update total count
        state.assessments.total = Math.max(0, state.assessments.total - 1);
      })
      .addCase(deleteAssessment.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload || "Failed to delete assessment";
        state.deleteSuccess = false;
      });

    // Download Assessment PDF
    builder
      .addCase(downloadAssessmentPDF.pending, (state) => {
        state.isDownloadingPDF = true;
        state.downloadPDFError = null;
      })
      .addCase(downloadAssessmentPDF.fulfilled, (state, action) => {
        state.isDownloadingPDF = false;
        state.successMessage =
          action.payload.message || "PDF downloaded successfully";
      })
      .addCase(downloadAssessmentPDF.rejected, (state, action) => {
        state.isDownloadingPDF = false;
        state.downloadPDFError = action.payload || "Failed to download PDF";
      });

    builder
      .addCase(downloadAssessmentsCSV.pending, (state) => {
        state.isDownloadingCSV = true;
        state.downloadCSVError = null;
      })
      .addCase(downloadAssessmentsCSV.fulfilled, (state, action) => {
        state.isDownloadingCSV = false;
        // Trigger file download
        const url = window.URL.createObjectURL(action.payload);
        const link = document.createElement("a");
        link.href = url;
        link.download = `assessments-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        state.successMessage = "CSV downloaded successfully";
      })
      .addCase(downloadAssessmentsCSV.rejected, (state, action) => {
        state.isDownloadingCSV = false;
        state.downloadCSVError = action.payload;
      });
  },
});

export const { clearDocumentState, clearAssessments, clearAssessmentDetails } =
  documentSlice.actions;
export default documentSlice.reducer;
