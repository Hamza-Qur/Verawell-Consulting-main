// src/redux/slices/formSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../services/endpoint";

// Get categories list only
export const getCategories = createAsyncThunk(
  "form/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/category/get-list`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

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

// Get specific category by ID (1 = Kitchen Sanitation, 2 = Meel Observation)
export const getCategoryById = createAsyncThunk(
  "form/getCategoryById",
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/category/get/${categoryId}`,
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
        return rejectWithValue(data.message || "Failed to fetch category");
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
    currentCategory: null,
    isLoading: false,
    isCategoryLoading: false,
    error: null,
    categoryError: null,
  },
  reducers: {
    clearFormState: (state) => {
      state.error = null;
      state.categoryError = null;
    },
    clearCategories: (state) => {
      state.categories = [];
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
      state.categoryError = null;
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

    // Get Category by ID
    builder
      .addCase(getCategoryById.pending, (state) => {
        state.isCategoryLoading = true;
        state.categoryError = null;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.isCategoryLoading = false;
        if (action.payload.success) {
          state.currentCategory = action.payload.data || null;
        } else {
          state.categoryError =
            action.payload.message || "Failed to fetch category";
        }
      })
      .addCase(getCategoryById.rejected, (state, action) => {
        state.isCategoryLoading = false;
        state.categoryError = action.payload || "Failed to fetch category";
      });
  },
});

export const { clearFormState, clearCategories, clearCurrentCategory } =
  formSlice.actions;
export default formSlice.reducer;
