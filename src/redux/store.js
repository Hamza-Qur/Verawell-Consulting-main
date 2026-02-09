import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";

import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import dashboardReducer from "./slices/dashboardSlice";
import facilityReducer from "./slices/facilitySlice";
import documentReducer from "./slices/documentSlice";
import formReducer from "./slices/formSlice";
import attendanceReducer from "./slices/attendanceSlice";
import notificationReducer from "./slices/notificationSlice";
import chatReducer from "./slices/chatSlice";

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  dashboard: dashboardReducer,
  facility: facilityReducer,
  document: documentReducer,
  form: formReducer,
  attendance: attendanceReducer,
  notification: notificationReducer,
  chat: chatReducer,
});

// Persist configuration - focus on user and auth slices
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "auth"],
  blacklist: ["chat"],
  version: 1, // Start with version 1
  migrate: (state, version) => {
    console.log("Migrating from version:", version);

    // If version is 0 (initial), migrate to version 1
    if (version === 0) {
      // Add any migration logic here if needed
      return Promise.resolve(state);
    }

    return Promise.resolve(state);
  },
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);
