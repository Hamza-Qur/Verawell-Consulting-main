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
  },
);

// Get Customer Stats
export const getCustomerStats = createAsyncThunk(
  "dashboard/getCustomerStats",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/dashboard/get-customer-stats`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to fetch customer stats",
        );
      }

      return data.data || {};
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
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
  },
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
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch admin stats");
      }

      return data.data || {};
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
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
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to fetch submitted forms",
        );
      }

      return data.data || [];
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
);

// Get facility scores
export const getFacilityScores = createAsyncThunk(
  "dashboard/getFacilityScores",
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      let url = `${BASE_URL}/api/dashboard/get-facility-score-customer`;

      const queryParams = new URLSearchParams();
      if (params.from_date) queryParams.append("from_date", params.from_date);
      if (params.to_date) queryParams.append("to_date", params.to_date);
      if (params.customer_group_name) {
        queryParams.append("customer_group_name", params.customer_group_name);
      }

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data.data || [];
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
);

export const getTeamAssignedFacilities = createAsyncThunk(
  "dashboard/getTeamAssignedFacilities",
  async (params = { page: 1 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // Build URL with query parameters
      let url = `${BASE_URL}/api/assign-facility/get-my`;
      const queryParams = new URLSearchParams();

      // Add page parameter
      if (params.page) queryParams.append("page", params.page);

      // Add date parameters if they exist
      if (params.from_date) queryParams.append("from_date", params.from_date);
      if (params.to_date) queryParams.append("to_date", params.to_date);

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to fetch team assigned facilities",
        );
      }

      return data; // Return entire response including pagination data
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
);

// Get Team Task Graph Data
export const getTeamTaskGraph = createAsyncThunk(
  "dashboard/getTeamTaskGraph",
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // Default to current year if no params provided
      const currentYear = new Date().getFullYear();
      const from_date = params.from_date || `${currentYear}-01-01`;
      const to_date = params.to_date || `${currentYear}-12-31`;

      const response = await fetch(
        `${BASE_URL}/api/task/get-my-graph?from_date=${from_date}&to_date=${to_date}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to fetch team task graph data",
        );
      }

      return data.data || []; // Return the array of monthly data
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
);

// Get Team Stats
export const getTeamStats = createAsyncThunk(
  "dashboard/getTeamStats",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/dashboard/get-team-stats`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch team stats");
      }

      return data.data || {}; // Return the team stats object
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
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
    // Customer-specific stats
    customerStats: {
      total_facilities: 0,
      total_tasks: 0,
      total_hours: 0,
      total_assessments: 0,
      total_assigned_assessments: 0,
    },
    // Team-specific stats
    teamStats: {
      total_facilities: 0,
      total_tasks: 0,
      total_hours: 0,
      total_assessments: 0,
      total_assigned_assessments: 0,
    },
    // Team-specific assigned facilities
    teamAssignedFacilities: {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 100,
      total: 0,
      first_page_url: "",
      from: null,
      last_page_url: "",
      links: [],
      next_page_url: null,
      path: "",
      prev_page_url: null,
      to: null,
    },
    // Team task graph data
    teamTaskGraph: [],
    submittedForms: [],
    facilityScores: [],
    isLoading: false,
    isStatsLoading: false,
    isCustomerStatsLoading: false,
    isFormsLoading: false,
    isFacilityScoresLoading: false,
    // Team-specific loading states
    isTeamAssignedFacilitiesLoading: false,
    isTeamTaskGraphLoading: false,
    isTeamStatsLoading: false,
    isDownloadingCSV: false,
    error: null,
    statsError: null,
    customerStatsError: null,
    formsError: null,
    facilityScoresError: null,
    // Team-specific error states
    teamAssignedFacilitiesError: null,
    teamTaskGraphError: null,
    teamStatsError: null,
    downloadCSVError: null,
    successMessage: "",
  },
  reducers: {
    clearDashboardErrors: (state) => {
      state.error = null;
      state.statsError = null;
      state.customerStatsError = null;
      state.formsError = null;
      state.facilityScoresError = null;
      state.teamAssignedFacilitiesError = null;
      state.teamTaskGraphError = null;
      state.teamStatsError = null;
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
    clearCustomerStats: (state) => {
      state.customerStats = {
        total_facilities: 0,
        total_tasks: 0,
        total_hours: 0,
        total_assessments: 0,
        total_assigned_assessments: 0,
      };
      state.customerStatsError = null;
    },
    clearSubmittedForms: (state) => {
      state.submittedForms = [];
      state.formsError = null;
    },
    clearFacilityScores: (state) => {
      state.facilityScores = [];
      state.facilityScoresError = null;
    },
    // Team-specific reducers
    clearTeamAssignedFacilities: (state) => {
      state.teamAssignedFacilities = {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 100,
        total: 0,
        first_page_url: "",
        from: null,
        last_page_url: "",
        links: [],
        next_page_url: null,
        path: "",
        prev_page_url: null,
        to: null,
      };
      state.teamAssignedFacilitiesError = null;
    },
    clearTeamTaskGraph: (state) => {
      state.teamTaskGraph = [];
      state.teamTaskGraphError = null;
    },
    clearTeamStats: (state) => {
      state.teamStats = {
        total_facilities: 0,
        total_tasks: 0,
        total_hours: 0,
        total_assessments: 0,
        total_assigned_assessments: 0,
      };
      state.teamStatsError = null;
    },
    setTeamAssignedFacilitiesPage: (state, action) => {
      state.teamAssignedFacilities.current_page = action.payload;
    },
    // You can also add a reducer to update specific team facility data if needed
    updateTeamFacilityData: (state, action) => {
      const { facilityId, data } = action.payload;
      const index = state.teamAssignedFacilities.data.findIndex(
        (facility) => facility.id === facilityId,
      );
      if (index !== -1) {
        state.teamAssignedFacilities.data[index] = {
          ...state.teamAssignedFacilities.data[index],
          ...data,
        };
      }
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

    // Get Customer Stats
    builder
      .addCase(getCustomerStats.pending, (state) => {
        state.isCustomerStatsLoading = true;
        state.customerStatsError = null;
      })
      .addCase(getCustomerStats.fulfilled, (state, action) => {
        state.isCustomerStatsLoading = false;
        state.customerStats = {
          total_facilities: action.payload.total_facilities || 0,
          total_tasks: action.payload.total_tasks || 0,
          total_hours: action.payload.total_hours || 0,
          total_assessments: action.payload.total_assessments || 0,
          total_assigned_assessments:
            action.payload.total_assigned_assessments || 0,
        };
      })
      .addCase(getCustomerStats.rejected, (state, action) => {
        state.isCustomerStatsLoading = false;
        state.customerStatsError = action.payload;
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
    // Add this to your extraReducers
    builder.addCase(getFacilityScores.fulfilled, (state, action) => {
      state.isFacilityScoresLoading = false;
      // Ensure we always store an array
      if (Array.isArray(action.payload)) {
        state.facilityScores = action.payload;
      } else if (action.payload && typeof action.payload === "object") {
        // If it's an object with a data property that's an array
        if (Array.isArray(action.payload.data)) {
          state.facilityScores = action.payload.data;
        } else {
          // If it's some other object, wrap it in an array or use empty array
          console.warn(
            "Unexpected facilityScores payload format:",
            action.payload,
          );
          state.facilityScores = [];
        }
      } else {
        state.facilityScores = [];
      }
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

    // Get Team Assigned Facilities
    builder
      .addCase(getTeamAssignedFacilities.pending, (state) => {
        state.isTeamAssignedFacilitiesLoading = true;
        state.teamAssignedFacilitiesError = null;
      })
      .addCase(getTeamAssignedFacilities.fulfilled, (state, action) => {
        state.isTeamAssignedFacilitiesLoading = false;

        if (action.payload.success) {
          state.teamAssignedFacilities = {
            ...action.payload.data,
            // Ensure all properties exist
            data: action.payload.data.data || [],
            current_page: action.payload.data.current_page || 1,
            last_page: action.payload.data.last_page || 1,
            per_page: action.payload.data.per_page || 100,
            total: action.payload.data.total || 0,
            first_page_url: action.payload.data.first_page_url || "",
            from: action.payload.data.from || null,
            last_page_url: action.payload.data.last_page_url || "",
            links: action.payload.data.links || [],
            next_page_url: action.payload.data.next_page_url || null,
            path: action.payload.data.path || "",
            prev_page_url: action.payload.data.prev_page_url || null,
            to: action.payload.data.to || null,
          };
        } else {
          state.teamAssignedFacilitiesError =
            action.payload.message ||
            "Failed to fetch team assigned facilities";
        }
      })
      .addCase(getTeamAssignedFacilities.rejected, (state, action) => {
        state.isTeamAssignedFacilitiesLoading = false;
        state.teamAssignedFacilitiesError =
          action.payload || "Network error occurred";
      });

    // Get Team Task Graph
    builder
      .addCase(getTeamTaskGraph.pending, (state) => {
        state.isTeamTaskGraphLoading = true;
        state.teamTaskGraphError = null;
      })
      .addCase(getTeamTaskGraph.fulfilled, (state, action) => {
        state.isTeamTaskGraphLoading = false;
        state.teamTaskGraph = action.payload; // Array of {month, total_hours}
      })
      .addCase(getTeamTaskGraph.rejected, (state, action) => {
        state.isTeamTaskGraphLoading = false;
        state.teamTaskGraphError = action.payload || "Network error occurred";
      });

    // Get Team Stats
    builder
      .addCase(getTeamStats.pending, (state) => {
        state.isTeamStatsLoading = true;
        state.teamStatsError = null;
      })
      .addCase(getTeamStats.fulfilled, (state, action) => {
        state.isTeamStatsLoading = false;
        state.teamStats = {
          total_facilities: action.payload.total_facilities || 0,
          total_tasks: action.payload.total_tasks || 0,
          total_hours: action.payload.total_hours || 0,
          total_assessments: action.payload.total_assessments || 0,
          total_assigned_assessments:
            action.payload.total_assigned_assessments || 0,
        };
      })
      .addCase(getTeamStats.rejected, (state, action) => {
        state.isTeamStatsLoading = false;
        state.teamStatsError = action.payload || "Network error occurred";
      });
  },
});

export const {
  clearDashboardErrors,
  clearAdminStats,
  clearCustomerStats,
  clearSubmittedForms,
  clearFacilityScores,
  clearTeamAssignedFacilities,
  clearTeamTaskGraph,
  clearTeamStats,
  setTeamAssignedFacilitiesPage,
  updateTeamFacilityData,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
