import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import boardReducer from "./features/boardSlice";
import favouritesReducer from "./features/favouritesSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    board: boardReducer,
    favourites: favouritesReducer,
  },
});
