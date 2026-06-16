import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import profileReducer from "./profileSlice";
import worldReducer from "./worldSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    world: worldReducer,
  },
});