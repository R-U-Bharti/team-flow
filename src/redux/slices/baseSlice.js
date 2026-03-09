import { createSlice } from "@reduxjs/toolkit";

const baseSlice = createSlice({
  name: "base",
  initialState: {
    title: "",
    subTitle: "",
    token: "",
    menuItems: "",
    profile: "",
  },
  reducers: {
    updateBase: (state, action) => {
      return Object.assign(state, action.payload);
    },
    resetBase: (state) => {
      return state = {
        title: "",
        subTitle: "",
        token: "",
        menuItems: "",
        profile: "",
      };
    },
  },
});

export const { updateBase, resetBase } = baseSlice.actions;
export default baseSlice.reducer;
