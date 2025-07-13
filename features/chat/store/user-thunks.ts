import { apiClient } from "@/lib/api-client";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { BaseUser } from "@/types/user.types";

export const fetchAllUsers = createAsyncThunk<BaseUser[]>(
  "users/fetchAll",
  async () => {
    const res = await apiClient("/users", { method: "GET", requiresAuth: true });
    return res.data;
  }
);
