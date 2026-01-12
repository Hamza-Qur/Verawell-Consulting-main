// src/redux/slices/formSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../services/endpoint";

// Get categories list only
export const getCategories = createAsyncThunk(
  "form/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/category/get-list`,
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
        return rejectWithValue(data.message || "Failed to fetch categories");
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

const formSlice = createSlice({
  name: "form",
  initialState: {
    categories: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearFormState: (state) => {
      state.error = null;
    },
    clearCategories: (state) => {
      state.categories = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Categories
    builder
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.categories = action.payload.data || [];
        } else {
          state.error = action.payload.message || "Failed to fetch categories";
        }
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch categories";
      });
  },
});

export const { clearFormState, clearCategories } = formSlice.actions;
export default formSlice.reducer;