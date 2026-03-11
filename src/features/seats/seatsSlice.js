// src/features/seats/seatsSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiGetSeats } from "./seatsApi";

export const fetchSeats = createAsyncThunk(
  "seats/fetch",
  async ({ sessionId, bookedSeats = -1, lang = "ru" }, { rejectWithValue }) => {
    try {
      return await apiGetSeats({ sessionId, bookedSeats, lang });
    } catch (e) {
      return rejectWithValue(e?.message || "Failed to load seats");
    }
  }
);

const slice = createSlice({
  name: "seats",
  initialState: { item: null, status: "idle", error: null },
  reducers: {
    clearSeats(s) {
      s.item = null;
      s.status = "idle";
      s.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchSeats.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchSeats.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.item = a.payload;
    });
    b.addCase(fetchSeats.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload || a.error?.message;
    });
  },
});

export const { clearSeats } = slice.actions;
export const selectSeats = (st) => st.seats.item;
export const selectSeatsStatus = (st) => st.seats.status;
export const selectSeatsError = (st) => st.seats.error;

export default slice.reducer;