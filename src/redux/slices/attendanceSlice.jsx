// src/redux/slices/attendanceSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../services/endpoint";

// Get all attendance/tasks list (admin)
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

// Get my tasks (team member - specific to logged in user)
export const getMyTasks = createAsyncThunk(
  "attendance/getMyTasks",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/task/get-my`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch my tasks");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// Add a new task
export const addTask = createAsyncThunk(
  "attendance/addTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      console.log("=== DEBUG ADD TASK ===");
      console.log("Task data:", taskData);

      const response = await fetch(`${BASE_URL}/api/task/store`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();
      console.log("Add task response:", data);

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to add task");
      }

      return data;
    } catch (err) {
      console.error("Add task error:", err);
      return rejectWithValue("Network error");
    }
  }
);

// Update a task
export const updateTask = createAsyncThunk(
  "attendance/updateTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      console.log("=== DEBUG UPDATE TASK ===");
      console.log("Task data:", taskData);

      const response = await fetch(`${BASE_URL}/api/task/update`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();
      console.log("Update task response:", data);

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to update task");
      }

      return data;
    } catch (err) {
      console.error("Update task error:", err);
      return rejectWithValue("Network error");
    }
  }
);

// Update attendance (legacy - kept for backward compatibility)
export const updateAttendance = createAsyncThunk(
  "attendance/updateAttendance",
  async (attendanceData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      console.log("=== DEBUG UPDATE ATTENDANCE ===");
      console.log("Token:", token ? "Exists" : "Missing");
      console.log("User ID from attendanceData:", attendanceData.user_id);
      console.log("Full payload:", attendanceData);

      console.log("Sending update data:", attendanceData);

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
      console.log("Update response:", data);

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to update attendance");
      }

      return data;
    } catch (err) {
      console.error("Update error:", err);
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
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to download CSV");
      }

      const responseText = await response.text();

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
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    attendanceList: [], // All tasks (admin view)
    myTasks: [], // My tasks (team member view)
    isLoading: false,
    isMyTasksLoading: false,
    isAddingTask: false,
    isUpdating: false,
    isUpdatingTask: false,
    isDeleting: false,
    isDownloadingCSV: false,
    downloadCSVError: null,
    error: null,
    myTasksError: null,
    addTaskError: null,
    updateError: null,
    updateTaskError: null,
    deleteError: null,
    successMessage: "",
  },
  reducers: {
    clearAttendanceState: (state) => {
      state.error = null;
      state.myTasksError = null;
      state.addTaskError = null;
      state.updateError = null;
      state.updateTaskError = null;
      state.deleteError = null;
      state.downloadCSVError = null;
      state.successMessage = "";
    },
    clearAttendanceList: (state) => {
      state.attendanceList = [];
      state.error = null;
    },
    clearMyTasks: (state) => {
      state.myTasks = [];
      state.myTasksError = null;
    },
  },
  extraReducers: (builder) => {
    // Get Attendance (all tasks - admin)
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

    // Get My Tasks (team member)
    builder
      .addCase(getMyTasks.pending, (state) => {
        state.isMyTasksLoading = true;
        state.myTasksError = null;
      })
      .addCase(getMyTasks.fulfilled, (state, action) => {
        state.isMyTasksLoading = false;
        if (action.payload.success) {
          state.myTasks = action.payload.data || [];
        } else {
          state.myTasksError =
            action.payload.message || "Failed to fetch my tasks";
        }
      })
      .addCase(getMyTasks.rejected, (state, action) => {
        state.isMyTasksLoading = false;
        state.myTasksError = action.payload || "Failed to fetch my tasks";
      });

    // Add Task
    builder
      .addCase(addTask.pending, (state) => {
        state.isAddingTask = true;
        state.addTaskError = null;
        state.successMessage = "";
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.isAddingTask = false;
        if (action.payload.success) {
          state.successMessage = action.payload.message || "Task added successfully";
        } else {
          state.addTaskError = action.payload.message || "Failed to add task";
          // Handle validation errors
          if (action.payload.data && action.payload.data.error) {
            state.addTaskError = JSON.stringify(action.payload.data.error);
          }
        }
      })
      .addCase(addTask.rejected, (state, action) => {
        state.isAddingTask = false;
        state.addTaskError = action.payload;
      });

    // Update Task
    builder
      .addCase(updateTask.pending, (state) => {
        state.isUpdatingTask = true;
        state.updateTaskError = null;
        state.successMessage = "";
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isUpdatingTask = false;
        if (action.payload.success) {
          state.successMessage = action.payload.message || "Task updated successfully";
        } else {
          state.updateTaskError = action.payload.message || "Failed to update task";
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isUpdatingTask = false;
        state.updateTaskError = action.payload;
      });

    // Update Attendance (legacy)
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

export const { 
  clearAttendanceState, 
  clearAttendanceList, 
  clearMyTasks,
} = attendanceSlice.actions;
export default attendanceSlice.reducer;