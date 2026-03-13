// src/redux/slices/dailyAttendanceSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../services/endpoint";

// Get all daily attendance (admin)
export const getAdminDailyAttendance = createAsyncThunk(
  "dailyAttendance/getAdminDailyAttendance",
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // Build URL with query parameters
      let url = `${BASE_URL}/api/attendance/get`;
      const queryParams = new URLSearchParams();

      // Add query parameters if they exist
      if (params.from_date) queryParams.append("from_date", params.from_date);
      if (params.to_date) queryParams.append("to_date", params.to_date);
      if (params.facility_id)
        queryParams.append("facility_id", params.facility_id);

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to fetch daily attendance",
        );
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
);

// Get my daily attendance (team member)
export const getMyDailyAttendance = createAsyncThunk(
  "dailyAttendance/getMyDailyAttendance",
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // Build URL with query parameters
      let url = `${BASE_URL}/api/attendance/get-my`;
      const queryParams = new URLSearchParams();

      // Add query parameters if they exist
      if (params.from_date) queryParams.append("from_date", params.from_date);
      if (params.to_date) queryParams.append("to_date", params.to_date);
      if (params.facility_id)
        queryParams.append("facility_id", params.facility_id);

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to fetch my daily attendance",
        );
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
);

// Add new daily attendance
export const addDailyAttendance = createAsyncThunk(
  "dailyAttendance/addDailyAttendance",
  async (attendanceData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/attendance/store`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(attendanceData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Failed to add daily attendance",
        );
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
);

// Update daily attendance
export const updateDailyAttendance = createAsyncThunk(
  "dailyAttendance/updateDailyAttendance",
  async (attendanceData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/attendance/update`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(attendanceData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Failed to update daily attendance",
        );
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
);

// Delete daily attendance
export const deleteDailyAttendance = createAsyncThunk(
  "dailyAttendance/deleteDailyAttendance",
  async (attendanceId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/attendance/delete/${attendanceId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Failed to delete daily attendance",
        );
      }

      return { ...data, deletedId: attendanceId };
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
);

// Download admin attendance CSV
export const downloadAdminAttendanceCSV = createAsyncThunk(
  "dailyAttendance/downloadAdminAttendanceCSV",
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // Build URL with query parameters
      let url = `${BASE_URL}/api/attendance/get-csv`;
      const queryParams = new URLSearchParams();

      // Add date parameters if they exist
      if (params.from_date) queryParams.append("from_date", params.from_date);
      if (params.to_date) queryParams.append("to_date", params.to_date);

      // Add facility_id parameter if it exists and is not "all"
      if (params.facility_id && params.facility_id !== "all") {
        queryParams.append("facility_id", params.facility_id);
      }

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }


      const response = await fetch(url, {
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

      const responseText = await response.text();

      // Check if response is JSON (error) or CSV
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

      const blob = new Blob([responseText], { type: "text/csv" });
      return blob;
    } catch (err) {
      return rejectWithValue("Network error: " + err.message);
    }
  },
);

// Download my attendance CSV (team member) - UPDATED to accept params
export const downloadMyAttendanceCSV = createAsyncThunk(
  "dailyAttendance/downloadMyAttendanceCSV",
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // Build URL with query parameters
      let url = `${BASE_URL}/api/attendance/get-my-csv`;
      const queryParams = new URLSearchParams();

      // Add date parameters if they exist
      if (params.from_date) queryParams.append("from_date", params.from_date);
      if (params.to_date) queryParams.append("to_date", params.to_date);

      // Add facility_id parameter if it exists and is not "all"
      if (params.facility_id && params.facility_id !== "all") {
        queryParams.append("facility_id", params.facility_id);
      }

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }


      const response = await fetch(url, {
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

      const responseText = await response.text();

      // Check if response is JSON (error) or CSV
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

      const blob = new Blob([responseText], { type: "text/csv" });
      return blob;
    } catch (err) {
      return rejectWithValue("Network error: " + err.message);
    }
  },
);

const dailyAttendanceSlice = createSlice({
  name: "dailyAttendance",
  initialState: {
    adminAttendanceList: [], // All daily attendance (admin view)
    myAttendanceList: [], // My daily attendance (team member view)
    isLoading: false,
    isMyAttendanceLoading: false,
    isAdding: false,
    isUpdating: false,
    isDeleting: false,
    isDownloadingAdminCSV: false,
    isDownloadingMyCSV: false,
    downloadAdminCSVError: null,
    downloadMyCSVError: null,
    error: null,
    myAttendanceError: null,
    addError: null,
    updateError: null,
    deleteError: null,
    successMessage: "",
  },
  reducers: {
    clearDailyAttendanceState: (state) => {
      state.error = null;
      state.myAttendanceError = null;
      state.addError = null;
      state.updateError = null;
      state.deleteError = null;
      state.downloadAdminCSVError = null;
      state.downloadMyCSVError = null;
      state.successMessage = "";
    },
    clearAdminAttendanceList: (state) => {
      state.adminAttendanceList = [];
      state.error = null;
    },
    clearMyAttendanceList: (state) => {
      state.myAttendanceList = [];
      state.myAttendanceError = null;
    },
  },
  extraReducers: (builder) => {
    // Get Admin Daily Attendance
    builder
      .addCase(getAdminDailyAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminDailyAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.adminAttendanceList = action.payload.data || [];
        } else {
          state.error =
            action.payload.message || "Failed to fetch daily attendance";
        }
      })
      .addCase(getAdminDailyAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch daily attendance";
      });

    // Get My Daily Attendance
    builder
      .addCase(getMyDailyAttendance.pending, (state) => {
        state.isMyAttendanceLoading = true;
        state.myAttendanceError = null;
      })
      .addCase(getMyDailyAttendance.fulfilled, (state, action) => {
        state.isMyAttendanceLoading = false;
        if (action.payload.success) {
          state.myAttendanceList = action.payload.data || [];
        } else {
          state.myAttendanceError =
            action.payload.message || "Failed to fetch my daily attendance";
        }
      })
      .addCase(getMyDailyAttendance.rejected, (state, action) => {
        state.isMyAttendanceLoading = false;
        state.myAttendanceError =
          action.payload || "Failed to fetch my daily attendance";
      });

    // Add Daily Attendance
    builder
      .addCase(addDailyAttendance.pending, (state) => {
        state.isAdding = true;
        state.addError = null;
        state.successMessage = "";
      })
      .addCase(addDailyAttendance.fulfilled, (state, action) => {
        state.isAdding = false;
        if (action.payload.success) {
          state.successMessage =
            action.payload.message || "Daily attendance added successfully";
          // Optionally add the new item to the list
          if (action.payload.data) {
            state.myAttendanceList.unshift(action.payload.data);
          }
        } else {
          state.addError =
            action.payload.message || "Failed to add daily attendance";
          // Handle validation errors
          if (action.payload.data && action.payload.data.error) {
            state.addError = JSON.stringify(action.payload.data.error);
          }
        }
      })
      .addCase(addDailyAttendance.rejected, (state, action) => {
        state.isAdding = false;
        state.addError = action.payload;
      });

    // Update Daily Attendance
    builder
      .addCase(updateDailyAttendance.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
        state.successMessage = "";
      })
      .addCase(updateDailyAttendance.fulfilled, (state, action) => {
        state.isUpdating = false;
        if (action.payload.success) {
          state.successMessage =
            action.payload.message || "Daily attendance updated successfully";
          // Update the item in both lists if it exists
          if (action.payload.data) {
            // Update in admin list
            const adminIndex = state.adminAttendanceList.findIndex(
              (item) => item.id === action.payload.data.id,
            );
            if (adminIndex !== -1) {
              state.adminAttendanceList[adminIndex] = action.payload.data;
            }

            // Update in my list
            const myIndex = state.myAttendanceList.findIndex(
              (item) => item.id === action.payload.data.id,
            );
            if (myIndex !== -1) {
              state.myAttendanceList[myIndex] = action.payload.data;
            }
          }
        } else {
          state.updateError =
            action.payload.message || "Failed to update daily attendance";
        }
      })
      .addCase(updateDailyAttendance.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload;
      });

    // Delete Daily Attendance
    builder
      .addCase(deleteDailyAttendance.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.successMessage = "";
      })
      .addCase(deleteDailyAttendance.fulfilled, (state, action) => {
        state.isDeleting = false;
        if (action.payload.success) {
          state.successMessage =
            action.payload.message || "Daily attendance deleted successfully";
          // Remove the deleted item from both lists
          const deletedId = action.payload.deletedId;
          state.adminAttendanceList = state.adminAttendanceList.filter(
            (item) => item.id !== deletedId,
          );
          state.myAttendanceList = state.myAttendanceList.filter(
            (item) => item.id !== deletedId,
          );
        } else {
          state.deleteError =
            action.payload.message || "Failed to delete daily attendance";
        }
      })
      .addCase(deleteDailyAttendance.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload;
      });

    // Download Admin Attendance CSV
    builder
      .addCase(downloadAdminAttendanceCSV.pending, (state) => {
        state.isDownloadingAdminCSV = true;
        state.downloadAdminCSVError = null;
        state.successMessage = "";
      })
      .addCase(downloadAdminAttendanceCSV.fulfilled, (state, action) => {
        state.isDownloadingAdminCSV = false;
        // Trigger file download
        const url = window.URL.createObjectURL(action.payload);
        const link = document.createElement("a");
        link.href = url;
        link.download = `daily-attendance-admin-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        state.successMessage = "Daily attendance CSV downloaded successfully";
      })
      .addCase(downloadAdminAttendanceCSV.rejected, (state, action) => {
        state.isDownloadingAdminCSV = false;
        state.downloadAdminCSVError = action.payload;
      });

    // Download My Attendance CSV
    builder
      .addCase(downloadMyAttendanceCSV.pending, (state) => {
        state.isDownloadingMyCSV = true;
        state.downloadMyCSVError = null;
        state.successMessage = "";
      })
      .addCase(downloadMyAttendanceCSV.fulfilled, (state, action) => {
        state.isDownloadingMyCSV = false;
        // Trigger file download
        const url = window.URL.createObjectURL(action.payload);
        const link = document.createElement("a");
        link.href = url;
        link.download = `daily-attendance-my-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        state.successMessage =
          "My daily attendance CSV downloaded successfully";
      })
      .addCase(downloadMyAttendanceCSV.rejected, (state, action) => {
        state.isDownloadingMyCSV = false;
        state.downloadMyCSVError = action.payload;
      });
  },
});

export const {
  clearDailyAttendanceState,
  clearAdminAttendanceList,
  clearMyAttendanceList,
} = dailyAttendanceSlice.actions;

export default dailyAttendanceSlice.reducer;
