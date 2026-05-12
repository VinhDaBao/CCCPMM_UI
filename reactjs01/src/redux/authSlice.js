import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: {
    email: "",
    name: "",
  },
    registerLoading: false,

  registerSuccess: false,

  registerError: "",
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {

    loginSuccess: (state, action) => {

      state.isAuthenticated = true;

      state.user = action.payload;
    },

    logout: (state) => {

      state.isAuthenticated = false;

      state.user = {
        email: "",
        name: "",
      };
    },
      registerStart: (state) => {

    state.registerLoading = true;

    state.registerSuccess = false;

    state.registerError = "";
  },

  registerSuccess: (state) => {

    state.registerLoading = false;

    state.registerSuccess = true;
  },

  registerFail: (state, action) => {

    state.registerLoading = false;

    state.registerError = action.payload;
  },
  },
});

export const {
  loginSuccess,
  logout,
  registerStart,
  registerSuccess,
  registerFail
} = authSlice.actions;

export default authSlice.reducer;