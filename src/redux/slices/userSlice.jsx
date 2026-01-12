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

    // Cache the response
    localStorage.setItem("userProfile", JSON.stringify(data));

    return data;
  }
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
          (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1])
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
    if (data.success) localStorage.setItem("userProfile", JSON.stringify(data));
    return data;
  }
);

// Change password (unchanged)
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
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    isLoading: false,
    isLoadingProfile: false,
    isLoadingPassword: false,
    error: null,
    passwordError: null,
    successMessage: "",
  },
  reducers: {
    clearUserErrors: (state) => {
      state.error = null;
      state.passwordError = null;
      state.successMessage = "";
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
        // Store the entire response
        state.profile = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.error = action.error.message;
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
  },
});

export const { clearUserErrors } = userSlice.actions;
export default userSlice.reducer;
