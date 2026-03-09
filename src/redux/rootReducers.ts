import { combineReducers } from "@reduxjs/toolkit";
import teamSliceReducer from "./slices/teamSlice";

const rootReducer = combineReducers({
  team: teamSliceReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
