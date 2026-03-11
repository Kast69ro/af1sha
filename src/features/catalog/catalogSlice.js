import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiGetAllEventsV2 } from "./catalogApi";

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async ({ categoryId, dateValue, lang = "ru", eventName = "" }, { rejectWithValue }) => {
    try {
      const data = await apiGetAllEventsV2({ categoryId, dateValue, lang, eventName });
      return data;
    } catch (e) {
      return rejectWithValue(e?.message || "Ошибка загрузки мероприятий");
    }
  }
);

const eventsSlice = createSlice({
  name: "events",
  initialState: {
    items: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default eventsSlice.reducer;

export const selectEventsItems = (state) => state.events.items;
export const selectEventsStatus = (state) => state.events.status;
export const selectEventsError = (state) => state.events.error;