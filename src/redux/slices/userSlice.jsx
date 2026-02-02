// src/redux/slices/userSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../services/endpoint";

// Get user profile
export const getUserProfile = createAsyncThunk(
  "user/getProfile",
  async (forceRefresh = false) => {
    const token = localStorage.getItem("token");

    // Only use cache if NOT forcing refresh
    if (!forceRefresh) {
      const cachedProfile = localStorage.getItem("userProfile");
      if (cachedProfile) return JSON.parse(cachedProfile);
    }

    // If forceRefresh OR no cache, fetch from API
    const response = await fetch(`${BASE_URL}/api/user/get-user`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Get profile response:", data);

    const normalizedProfile = {
      success: true,
      data: data.data,
    };

    localStorage.setItem("userProfile", JSON.stringify(normalizedProfile));
    return normalizedProfile;
  },
);

// Get all users (raw data)
export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (
    {
      page = 1,
      perPage = 10,
      search = "",
      facility_id = null, // ADDED: facility_id parameter
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const token = localStorage.getItem("token");

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      // ADDED: facility_id parameter
      if (facility_id) {
        params.append("facility_id", facility_id.toString());
      }

      const response = await fetch(
        `${BASE_URL}/api/user/get-users-raw?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to fetch users");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (profileData) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    // Add text fields
    if (profileData.name) formData.append("name", profileData.name);
    if (profileData.email) formData.append("email", profileData.email);
    if (profileData.phone_number)
      formData.append("phone_number", profileData.phone_number);

    // Add profile picture if it exists
    if (
      profileData.profile_picture &&
      profileData.profile_picture instanceof File
    ) {
      formData.append("profile_picture", profileData.profile_picture);
    }

    console.log("FormData entries:");
    for (let pair of formData.entries()) {
      console.log(
        pair[0] +
          ": " +
          (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]),
      );
    }

    const response = await fetch(`${BASE_URL}/api/user/update-profile`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (data.success && data.data?.user) {
      const normalizedProfile = {
        success: true,
        data: data.data.user,
      };

      localStorage.setItem("userProfile", JSON.stringify(normalizedProfile));
    }
    return data;
  },
);

// Admin update user profile (for admin editing other users)
export const adminUpdateUserProfile = createAsyncThunk(
  "user/adminUpdateUserProfile",
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Add user_id parameter (required)
      formData.append("user_id", userId);

      // Add only required fields
      if (profileData.name) formData.append("name", profileData.name);
      if (profileData.phone_number !== undefined)
        formData.append("phone_number", profileData.phone_number || "");

      // Add profile picture if it exists (File object)
      if (profileData.profile_picture instanceof File) {
        formData.append("profile_picture", profileData.profile_picture);
      }

      console.log("Admin Update FormData entries:");
      for (let pair of formData.entries()) {
        console.log(
          pair[0] +
            ": " +
            (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]),
        );
      }

      const response = await fetch(`${BASE_URL}/api/user/update-profile`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to update user profile");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
);

// Change password
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (passwordData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}/api/auth/password/change`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      }),
    });

    const data = await response.json();
    console.log("Change password response:", data);
    return data;
  },
);

// Delete user
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/api/user/delete?user_id=${userId}`,
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
        return rejectWithValue(data.message || "Failed to delete user");
      }

      return data;
    } catch (err) {
      return rejectWithValue("Network error");
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    usersList: {
      data: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
      },
      links: [],
    },
    isLoading: false,
    isLoadingProfile: false,
    isLoadingUsers: false,
    isLoadingPassword: false,
    isDeleting: false,
    isAdminUpdating: false,
    error: null,
    usersError: null,
    passwordError: null,
    deleteError: null,
    adminUpdateError: null,
    adminUpdateSuccess: "",
    successMessage: "",
  },
  reducers: {
    clearUserErrors: (state) => {
      state.error = null;
      state.usersError = null;
      state.passwordError = null;
      state.deleteError = null;
      state.adminUpdateError = null;
      state.successMessage = "";
      state.adminUpdateSuccess = "";
    },
    clearUsersList: (state) => {
      state.usersList = {
        data: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0,
        },
        links: [],
      };
      state.usersError = null;
    },
  },
  extraReducers: (builder) => {
    // Get user profile
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.isLoadingProfile = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoadingProfile = false;

        state.profile = {
          success: true,
          data: action.payload?.data?.user ?? action.payload?.data ?? null,
        };
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.error = action.error.message;
      });

    // Get all users
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.isLoadingUsers = true;
        state.usersError = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoadingUsers = false;

        if (action.payload.success) {
          state.usersList = {
            data: action.payload.data.data || [],
            pagination: {
              current_page: action.payload.data.current_page || 1,
              last_page: action.payload.data.last_page || 1,
              per_page: action.payload.data.per_page || 10,
              total: action.payload.data.total || 0,
              from: action.payload.data.from || 0,
              to: action.payload.data.to || 0,
            },
            links: action.payload.data.links || [],
          };
        } else {
          state.usersError = action.payload.message || "Failed to fetch users";
        }
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.usersError = action.payload || "Failed to fetch users";
      });

    // Update user profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("Update payload:", action.payload);

        if (action.payload.success) {
          // Update profile with new data if available
          if (action.payload.data?.user) {
            state.profile.data = action.payload.data.user;
          }
          state.successMessage =
            action.payload.message || "Profile updated successfully!";
        } else {
          state.error = action.payload.message || "Failed to update profile";
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to update profile";
      });

    // Admin update user profile
    builder
      .addCase(adminUpdateUserProfile.pending, (state) => {
        state.isAdminUpdating = true;
        state.adminUpdateError = null;
        state.adminUpdateSuccess = "";
      })
      .addCase(adminUpdateUserProfile.fulfilled, (state, action) => {
        state.isAdminUpdating = false;
        console.log("Admin update payload:", action.payload);

        if (action.payload.success) {
          state.adminUpdateSuccess =
            action.payload.message || "User updated successfully!";
        } else {
          state.adminUpdateError =
            action.payload.message || "Failed to update user";
        }
      })
      .addCase(adminUpdateUserProfile.rejected, (state, action) => {
        state.isAdminUpdating = false;
        state.adminUpdateError = action.payload || "Failed to update user";
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoadingPassword = true;
        state.passwordError = null;
        state.successMessage = "";
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoadingPassword = false;
        console.log("Change password payload:", action.payload);

        if (action.payload.success) {
          state.successMessage =
            action.payload.message || "Password changed successfully!";
        } else {
          state.passwordError =
            action.payload.message || "Failed to change password";
        }
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoadingPassword = false;
        state.passwordError =
          action.error.message || "Failed to change password";
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.successMessage = "";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.successMessage =
          action.payload.message || "User deleted successfully!";
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearUserErrors, clearUsersList } = userSlice.actions;
export default userSlice.reducer;
