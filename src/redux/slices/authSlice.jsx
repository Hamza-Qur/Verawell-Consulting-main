import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../services/endpoint";

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async ({ email }) => {
    const formData = new FormData();
    formData.append("email", email);

    const response = await fetch(
      `${BASE_URL}/api/auth/password/request-reset`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      },
    );

    const data = await response.json();
    return data;
  },
);

export const validateResetCode = createAsyncThunk(
  "auth/validateResetCode",
  async ({ email, code }) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("code", code);

    const response = await fetch(
      `${BASE_URL}/api/auth/password/validate-code`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      },
    );

    const data = await response.json();
    return data;
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, code, password, password_confirmation }) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("code", code);
    formData.append("password", password);
    formData.append("password_confirmation", password_confirmation);

    const response = await fetch(`${BASE_URL}/api/auth/password/reset`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  },
);

export const login = createAsyncThunk("auth/login", async (credentials) => {
  const formData = new FormData();
  formData.append("email", credentials.email);
  formData.append("password", credentials.password);

  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  const data = await response.json();

  return data;
});

export const register = createAsyncThunk("auth/register", async (userData) => {
  const formData = new FormData();
  formData.append("name", userData.name);
  formData.append("email", userData.email);
  formData.append("password", userData.password);
  formData.append("password_confirmation", userData.password_confirmation);
  formData.append("phone_number", userData.phone_number);
  formData.append("role", userData.role);

  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  const data = await response.json();
  return data;
});

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("userProfile");

      if (token) {
        fetch(`${BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;

        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.success) {
          state.token = action.payload.data.token;
          state.user = action.payload.data.user;
          state.isAuthenticated = true;

          localStorage.setItem("token", action.payload.data.token);
          localStorage.setItem(
            "user",
            JSON.stringify(action.payload.data.user),
          );
          localStorage.setItem("role", action.payload.data.user.role);
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export default authSlice.reducer;
