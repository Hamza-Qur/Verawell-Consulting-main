// src/redux/slices/dashboardSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../services/endpoint";

export const getDashboardUsers = createAsyncThunk(
  "dashboard/getUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/dashboard/get-user`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch users");
      }

      return data.data || [];
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// Download Users CSV - UPDATED VERSION
export const downloadUsersCSV = createAsyncThunk(
  "dashboard/downloadUsersCSV",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/dashboard/get-user-csv`, {
        method: "GET",
        headers: {
          Accept: "application/json, text/csv",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to download CSV");
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
          return rejectWithValue(jsonData.message);
        }
      } catch {
        // Not JSON, must be CSV - proceed with download
      }

      // Convert text back to blob for CSV download
      const blob = new Blob([responseText], { type: "text/csv" });
      return blob;
    } catch (err) {
      return rejectWithValue("Network error while downloading CSV");
    }
  }
);

export const getAdminStats = createAsyncThunk(
  "dashboard/getAdminStats",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/dashboard/get-admin-stats`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch admin stats");
      }

      return data.data || {};
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

export const getSubmittedForms = createAsyncThunk(
  "dashboard/getSubmittedForms",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/dashboard/get-submitted-form`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to fetch submitted forms"
        );
      }

      return data.data || [];
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// Get facility scores
export const getFacilityScores = createAsyncThunk(
  "dashboard/getFacilityScores",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/dashboard/get-facility-score`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to fetch facility scores"
        );
      }

      return data.data || [];
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    users: [],
    adminStats: {
      total_customer: 0,
      total_team: 0,
      total_hours_logged: 0,
      total_facilities: 0,
    },
    submittedForms: [],
    facilityScores: [],
    isLoading: false,
    isStatsLoading: false,
    isFormsLoading: false,
    isFacilityScoresLoading: false,
    isDownloadingCSV: false,
    error: null,
    statsError: null,
    formsError: null,
    facilityScoresError: null,
    downloadCSVError: null,
    successMessage: "",
  },
  reducers: {
    clearDashboardErrors: (state) => {
      state.error = null;
      state.statsError = null;
      state.formsError = null;
      state.facilityScoresError = null;
      state.downloadCSVError = null;
      state.successMessage = "";
    },
    clearAdminStats: (state) => {
      state.adminStats = {
        total_customer: 0,
        total_team: 0,
        total_hours_logged: 0,
        total_facilities: 0,
      };
      state.statsError = null;
    },
    clearSubmittedForms: (state) => {
      state.submittedForms = [];
      state.formsError = null;
    },
    clearFacilityScores: (state) => {
      state.facilityScores = [];
      state.facilityScoresError = null;
    },
  },
  extraReducers: (builder) => {
    // Get Dashboard Users
    builder
      .addCase(getDashboardUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(getDashboardUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get Admin Stats
    builder
      .addCase(getAdminStats.pending, (state) => {
        state.isStatsLoading = true;
        state.statsError = null;
      })
      .addCase(getAdminStats.fulfilled, (state, action) => {
        state.isStatsLoading = false;
        state.adminStats = action.payload;
      })
      .addCase(getAdminStats.rejected, (state, action) => {
        state.isStatsLoading = false;
        state.statsError = action.payload;
      });

    // Get Submitted Forms
    builder
      .addCase(getSubmittedForms.pending, (state) => {
        state.isFormsLoading = true;
        state.formsError = null;
      })
      .addCase(getSubmittedForms.fulfilled, (state, action) => {
        state.isFormsLoading = false;
        state.submittedForms = action.payload;
      })
      .addCase(getSubmittedForms.rejected, (state, action) => {
        state.isFormsLoading = false;
        state.formsError = action.payload;
      });

    // Get Facility Scores
    builder
      .addCase(getFacilityScores.pending, (state) => {
        state.isFacilityScoresLoading = true;
        state.facilityScoresError = null;
      })
      .addCase(getFacilityScores.fulfilled, (state, action) => {
        state.isFacilityScoresLoading = false;
        state.facilityScores = action.payload;
      })
      .addCase(getFacilityScores.rejected, (state, action) => {
        state.isFacilityScoresLoading = false;
        state.facilityScoresError = action.payload;
      });

    // Download Users CSV
    builder
      .addCase(downloadUsersCSV.pending, (state) => {
        state.isDownloadingCSV = true;
        state.downloadCSVError = null;
        state.successMessage = "";
      })
      .addCase(downloadUsersCSV.fulfilled, (state, action) => {
        state.isDownloadingCSV = false;
        state.successMessage =
          action.payload.message || "CSV downloaded successfully";
      })
      .addCase(downloadUsersCSV.rejected, (state, action) => {
        state.isDownloadingCSV = false;
        state.downloadCSVError = action.payload || "Failed to download CSV";
      });
  },
});

export const {
  clearDashboardErrors,
  clearAdminStats,
  clearSubmittedForms,
  clearFacilityScores,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
