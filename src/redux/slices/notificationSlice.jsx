// src/redux/slices/notificationSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../services/endpoint";

// Send broadcast notification
export const sendBroadcastNotification = createAsyncThunk(
  "notification/sendBroadcast",
  async (notificationData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/notification/send-broadcast`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(notificationData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to send notification");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// Get my notifications
export const getMyNotifications = createAsyncThunk(
  "notification/getMyNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/notification/get-my-notifications`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to fetch notifications");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    isLoading: false,
    isFetching: false,
    error: null,
    success: false,
    successMessage: "",
    notifications: [],
    unreadCount: 0,
  },
  reducers: {
    clearNotificationState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = false;
      state.successMessage = "";
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.viewed = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.viewed = true;
      });
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Send broadcast notification
    builder
      .addCase(sendBroadcastNotification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
        state.successMessage = "";
      })
      .addCase(sendBroadcastNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.successMessage =
          action.payload.message || "Notification sent successfully!";
      })
      .addCase(sendBroadcastNotification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to send notification";
        state.success = false;
      });

    // Get my notifications
    builder
      .addCase(getMyNotifications.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(getMyNotifications.fulfilled, (state, action) => {
        state.isFetching = false;
        state.notifications = action.payload.data || [];
        // Calculate unread count
        state.unreadCount = state.notifications.filter((n) => !n.viewed).length;
      })
      .addCase(getMyNotifications.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload || "Failed to fetch notifications";
      });
  },
});

export const {
  clearNotificationState,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;
