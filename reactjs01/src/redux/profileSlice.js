import { createSlice } from "@reduxjs/toolkit";

const initialState = {

  profileLoading: false,

  profileData: null,

  profileError: "",

  updateProfileLoading: false,

  updateProfileSuccess: false,
};

const profileSlice = createSlice({

  name: "profile",

  initialState,

  reducers: {


    getProfileStart: (state) => {

      state.profileLoading = true;

      state.profileError = "";
    },

    getProfileSuccess: (state, action) => {

      state.profileLoading = false;

      state.profileData = action.payload;
    },

    getProfileFail: (state, action) => {

      state.profileLoading = false;

      state.profileError = action.payload;
    },



    updateProfileStart: (state) => {

      state.updateProfileLoading = true;

      state.updateProfileSuccess = false;
    },

    updateProfileSuccess: (state, action) => {

      state.updateProfileLoading = false;

      state.updateProfileSuccess = true;

      state.profileData = action.payload;
    },

    updateProfileFail: (state, action) => {

      state.updateProfileLoading = false;

      state.profileError = action.payload;
    },
  },
});

export const {

  getProfileStart,
  getProfileSuccess,
  getProfileFail,

  updateProfileStart,
  updateProfileSuccess,
  updateProfileFail,

} = profileSlice.actions;

export default profileSlice.reducer;