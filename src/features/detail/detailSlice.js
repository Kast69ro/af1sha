// src/features/eventDetails/eventDetailsSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiGetSessionDetails } from "./detailApi";

export const fetchEventDetails = createAsyncThunk(
  "details/fetch",
  async ({ eventId, lang = "ru" }, { rejectWithValue }) => {
    try {
      return await apiGetSessionDetails({ eventId, lang });
      
    } catch (e) {
      return rejectWithValue(e?.message || "Failed to load details");
    }
  }
);

const slice = createSlice({
  name: "details",
  initialState: { item: null, status: "idle", error: null },
  reducers: {
    clearEventDetails(s) {
      s.item = null;
      s.status = "idle";
      s.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchEventDetails.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchEventDetails.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.item = a.payload;
    });
    b.addCase(fetchEventDetails.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload || a.error?.message;
    });
  },
});

export const { clearEventDetails } = slice.actions;
export const selectEventDetails = (st) => st.details.item;
export const selectEventDetailsStatus = (st) => st.details.status;
export const selectEventDetailsError = (st) => st.details.error;

export default slice.reducer;