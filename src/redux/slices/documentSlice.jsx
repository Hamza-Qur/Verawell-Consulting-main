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
    isLoading: false,
    isDeleting: false,
    error: null,
    deleteError: null,
    successMessage: "",
    deleteSuccess: false,
  },
  reducers: {
    clearDocumentState: (state) => {
      state.error = null;
      state.deleteError = null;
      state.successMessage = "";
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
        state.successMessage = action.payload.message || "Assessment deleted successfully";

        // Remove the deleted assessment from the state using assessment_id
        state.assessments.data = state.assessments.data.filter(
          (assessment) => assessment.assessment_id !== action.payload.assessmentId
        );
        
        // Update total count
        state.assessments.total = Math.max(0, state.assessments.total - 1);
      })
      .addCase(deleteAssessment.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload || "Failed to delete assessment";
        state.deleteSuccess = false;
      });
  },
});

export const { clearDocumentState, clearAssessments } = documentSlice.actions;
export default documentSlice.reducer;