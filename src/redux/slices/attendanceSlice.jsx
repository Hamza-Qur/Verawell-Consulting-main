// src/redux/slices/attendanceSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../services/endpoint";

// Get attendance/tasks list
export const getAttendance = createAsyncThunk(
  "attendance/getAttendance",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/task/get`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch attendance");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// Update a task/attendance
export const updateAttendance = createAsyncThunk(
  "attendance/updateAttendance",
  async (attendanceData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      console.log("=== DEBUG UPDATE ATTENDANCE ===");
      console.log("Token:", token ? "Exists" : "Missing");
      console.log("User ID from attendanceData:", attendanceData.user_id);
      console.log("Full payload:", attendanceData);

      console.log("Sending update data:", attendanceData); // Add this log

      const response = await fetch(`${BASE_URL}/api/task/update`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(attendanceData),
      });

      const data = await response.json();
      console.log("Update response:", data); // Add this log

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to update attendance");
      }

      return data;
    } catch (err) {
      console.error("Update error:", err); // Add this log
      return rejectWithValue("Network error");
    }
  }
);

// Delete a task/attendance
export const deleteAttendance = createAsyncThunk(
  "attendance/deleteAttendance",
  async (taskId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/task/delete/${taskId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to delete attendance");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

export const downloadAttendanceCSV = createAsyncThunk(
  "attendance/downloadAttendanceCSV",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/task/get-csv`, {
        method: "GET",
        headers: {
          Accept: "application/json, text/csv",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Handle errors
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
      return rejectWithValue("Network error: " + err.message);
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    attendanceList: [],
    isLoading: false,
    isUpdating: false,
    isDeleting: false,
    isDownloadingCSV: false,
    downloadCSVError: null,
    error: null,
    updateError: null,
    deleteError: null,
    successMessage: "",
  },
  reducers: {
    clearAttendanceState: (state) => {
      state.error = null;
      state.updateError = null;
      state.deleteError = null;
      state.downloadCSVError = null;
      state.successMessage = "";
    },
    clearAttendanceList: (state) => {
      state.attendanceList = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Attendance
    builder
      .addCase(getAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.attendanceList = action.payload.data || [];
        } else {
          state.error = action.payload.message || "Failed to fetch attendance";
        }
      })
      .addCase(getAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch attendance";
      });

    // Update Attendance
    builder
      .addCase(updateAttendance.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
        state.successMessage = "";
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.successMessage =
          action.payload.message || "Attendance updated successfully";
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload;
      });

    // Delete Attendance
    builder
      .addCase(deleteAttendance.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.successMessage = "";
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.successMessage =
          action.payload.message || "Attendance deleted successfully";
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload;
      });

    builder
      .addCase(downloadAttendanceCSV.pending, (state) => {
        state.isDownloadingCSV = true;
        state.downloadCSVError = null;
      })
      .addCase(downloadAttendanceCSV.fulfilled, (state, action) => {
        state.isDownloadingCSV = false;
        // Trigger file download
        const url = window.URL.createObjectURL(action.payload);
        const link = document.createElement("a");
        link.href = url;
        link.download = `attendance-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        state.successMessage = "Attendance CSV downloaded successfully";
      })
      .addCase(downloadAttendanceCSV.rejected, (state, action) => {
        state.isDownloadingCSV = false;
        state.downloadCSVError = action.payload;
      });
  },
});

export const { clearAttendanceState, clearAttendanceList } =
  attendanceSlice.actions;
export default attendanceSlice.reducer;
