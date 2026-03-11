import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiGetCategoriesAndLocations } from "./categoriesApi";

export const fetchCategoriesAndLocations = createAsyncThunk(
  "categories/fetchCategoriesAndLocations",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGetCategoriesAndLocations();
      console.log(data);
      
      return data;
    } catch (e) {
      return rejectWithValue(e?.message || "Failed to load categories");
    }
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    resetCategories(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriesAndLocations.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategoriesAndLocations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategoriesAndLocations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load categories";
      });
  },
});

export const { resetCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;

export const selectCategories = (s) => s.categories.items;
export const selectCategoriesStatus = (s) => s.categories.status;
export const selectCategoriesError = (s) => s.categories.error;