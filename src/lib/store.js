import { configureStore } from "@reduxjs/toolkit";
import categoriesSlice from "../features/categories/categoriesSlice";
import eventsSlice from "../features/catalog/catalogSlice";
import detailSlice from "../features/detail/detailSlice.js";
import seatsSlice from "../features/seats/seatsSlice.js";

export const store = configureStore({
  reducer: {
    categories: categoriesSlice,
    events: eventsSlice,
    details: detailSlice,
     seats: seatsSlice,
  },
});