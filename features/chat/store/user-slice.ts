import { createSlice } from "@reduxjs/toolkit";
import { fetchAllUsers } from "./user-thunks";
import { BaseUser } from "@/types/user.types";

interface UserState {
  users: BaseUser[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: UserState = {
  users: [],
  status: "idle",
};

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAllUsers.pending, state => {
        state.status = "loading";
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, state => {
        state.status = "failed";
      });
  },
});

export default userSlice.reducer;
