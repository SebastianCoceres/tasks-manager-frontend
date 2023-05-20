import { createSlice } from "@reduxjs/toolkit";

const initialState = { value: [] };

export const favouritesSlice = createSlice({
  name: "favourites",
  initialState,
  reducers: {
    setFavouritesList: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setFavouritesList } = favouritesSlice.actions;
export default favouritesSlice.reducer;
