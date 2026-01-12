// src/redux/slices/facilitySlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../services/endpoint";

export const createFacility = createAsyncThunk(
  "facility/create",
  async (facilityData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/facility/store`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(facilityData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to create facility");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// Get my assigned facilities
export const getMyFacilities = createAsyncThunk(
  "facility/getMyFacilities",
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/assign-facility/get-my?page=${page}`,
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
        return rejectWithValue(data.message || "Failed to fetch facilities");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// Get assigned users for a specific facility
export const getAssignedUsers = createAsyncThunk(
  "facility/getAssignedUsers",
  async ({ facilityId, page = 1 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/assign-facility/get?facility_id=${facilityId}&page=${page}`,
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
        return rejectWithValue(
          data.message || "Failed to fetch assigned users"
        );
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// Assign user to facility
export const assignUserToFacility = createAsyncThunk(
  "facility/assignUser",
  async ({ facility_id, user_id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/assign-facility/assign`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ facility_id, user_id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to assign user");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

export const assignAssessment = createAsyncThunk(
  "facility/assignAssessment",
  async ({ category_id, facility_id, user_id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/assign-assessment/assign`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_id,
          facility_id,
          user_id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to assign assessment");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// Unassign user from facility
export const unassignUserFromFacility = createAsyncThunk(
  "facility/unassignUser",
  async ({ facility_id, user_id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/assign-facility/unassign`, {
        method: "Post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ facility_id, user_id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to unassign user");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// Update facility
export const updateFacility = createAsyncThunk(
  "facility/update",
  async ({ facilityId, facilityData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/facility/update`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: facilityId,
          ...facilityData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to update facility");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

// Delete facility
export const deleteFacility = createAsyncThunk(
  "facility/delete",
  async (facilityId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/facility/delete/${facilityId}`,
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
        return rejectWithValue(data.message || "Failed to delete facility");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

const facilitySlice = createSlice({
  name: "facility",
  initialState: {
    isCreating: false,
    isFetching: false,
    isFetchingAssignedUsers: false,
    isAssigning: false,
    isUnassigning: false,
    isUpdating: false,
    isDeleting: false,
    isAssigningAssessment: false,
    myFacilities: {
      data: [],
      current_page: 1,
      total: 0,
      per_page: 10,
      last_page: 1,
    },
    assignedUsers: {
      data: [],
      current_page: 1,
      total: 0,
      per_page: 10,
      last_page: 1,
    },
    successMessage: "",
    error: null,
    fetchError: null,
    assignedUsersError: null,
    assignError: null,
    unassignError: null,
    updateError: null,
    deleteError: null,
    assignAssessmentError: null,
  },
  reducers: {
    clearFacilityState: (state) => {
      state.error = null;
      state.fetchError = null;
      state.successMessage = "";
      state.assignAssessmentError = null;
    },
    clearMyFacilities: (state) => {
      state.myFacilities = {
        data: [],
        current_page: 1,
        total: 0,
        per_page: 10,
        last_page: 1,
      };
      state.fetchError = null;
    },
    clearAssignedUsers: (state) => {
      state.assignedUsers = {
        data: [],
        current_page: 1,
        total: 0,
        per_page: 10,
        last_page: 1,
      };
      state.assignedUsersError = null;
    },
  },
  extraReducers: (builder) => {
    // Create Facility
    builder
      .addCase(createFacility.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(createFacility.fulfilled, (state, action) => {
        state.isCreating = false;
        state.successMessage = action.payload.message || "Facility created";
      })
      .addCase(createFacility.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      });

         // NEW: Assign Assessment
    builder
      .addCase(assignAssessment.pending, (state) => {
        state.isAssigningAssessment = true;
        state.assignAssessmentError = null;
        state.successMessage = "";
      })
      .addCase(assignAssessment.fulfilled, (state, action) => {
        state.isAssigningAssessment = false;
        state.successMessage =
          action.payload.message || "Assessment assigned successfully";
      })
      .addCase(assignAssessment.rejected, (state, action) => {
        state.isAssigningAssessment = false;
        state.assignAssessmentError = action.payload;
      });

    // Get My Facilities
    builder
      .addCase(getMyFacilities.pending, (state) => {
        state.isFetching = true;
        state.fetchError = null;
      })
      .addCase(getMyFacilities.fulfilled, (state, action) => {
        state.isFetching = false;
        if (action.payload.success) {
          state.myFacilities = action.payload.data;
        } else {
          state.fetchError =
            action.payload.message || "Failed to fetch facilities";
        }
      })
      .addCase(getMyFacilities.rejected, (state, action) => {
        state.isFetching = false;
        state.fetchError = action.payload || "Failed to fetch facilities";
      });

    // Get Assigned Users
    builder
      .addCase(getAssignedUsers.pending, (state) => {
        state.isFetchingAssignedUsers = true;
        state.assignedUsersError = null;
      })
      .addCase(getAssignedUsers.fulfilled, (state, action) => {
        state.isFetchingAssignedUsers = false;
        if (action.payload.success) {
          state.assignedUsers = action.payload.data;
        } else {
          state.assignedUsersError =
            action.payload.message || "Failed to fetch assigned users";
        }
      })
      .addCase(getAssignedUsers.rejected, (state, action) => {
        state.isFetchingAssignedUsers = false;
        state.assignedUsersError =
          action.payload || "Failed to fetch assigned users";
      });

    // Assign User to Facility
    builder
      .addCase(assignUserToFacility.pending, (state) => {
        state.isAssigning = true;
        state.assignError = null;
      })
      .addCase(assignUserToFacility.fulfilled, (state, action) => {
        state.isAssigning = false;
        state.successMessage =
          action.payload.message || "User assigned successfully";
      })
      .addCase(assignUserToFacility.rejected, (state, action) => {
        state.isAssigning = false;
        state.assignError = action.payload;
      });

    // Unassign User from Facility
    builder
      .addCase(unassignUserFromFacility.pending, (state) => {
        state.isUnassigning = true;
        state.unassignError = null;
      })
      .addCase(unassignUserFromFacility.fulfilled, (state, action) => {
        state.isUnassigning = false;
        state.successMessage =
          action.payload.message || "User unassigned successfully";
      })
      .addCase(unassignUserFromFacility.rejected, (state, action) => {
        state.isUnassigning = false;
        state.unassignError = action.payload;
      });

    // Update Facility
    builder
      .addCase(updateFacility.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
        state.successMessage = "";
      })
      .addCase(updateFacility.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.successMessage =
          action.payload.message || "Facility updated successfully";
      })
      .addCase(updateFacility.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload;
      });

    // Delete Facility
    builder
      .addCase(deleteFacility.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.successMessage = "";
      })
      .addCase(deleteFacility.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.successMessage =
          action.payload.message || "Facility deleted successfully";
      })
      .addCase(deleteFacility.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearFacilityState, clearMyFacilities, clearAssignedUsers } =
  facilitySlice.actions;
export default facilitySlice.reducer;
