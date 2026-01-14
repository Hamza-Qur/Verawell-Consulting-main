import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import dashboardReducer from "./slices/dashboardSlice";
import facilityReducer from "./slices/facilitySlice";
import documentReducer from "./slices/documentSlice";
import formReducer from "./slices/formSlice";
import attendanceReducer from "./slices/attendanceSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    dashboard: dashboardReducer,
    facility: facilityReducer,
    document: documentReducer,
    form: formReducer,
    attendance: attendanceReducer,
    notification: notificationReducer,
  },
});
