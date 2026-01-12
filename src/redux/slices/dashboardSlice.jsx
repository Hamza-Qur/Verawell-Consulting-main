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

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    users: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearDashboardErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
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
  },
});

export const { clearDashboardErrors } = dashboardSlice.actions;
export default dashboardSlice.reducer;
