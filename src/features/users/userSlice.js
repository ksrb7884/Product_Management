import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const loginUser = createAsyncThunk("user/login", async (credentials) => {
  const res = await axios.get(
    `http://localhost:3001/users?email=${credentials.email}&password=${credentials.password}`
  );
  if (res.data.length > 0) {
    return res.data[0];
  } else {
    throw new Error("Invalid credentials");
  }
});

export const signupUser = createAsyncThunk("user/signup", async (userData) => {
  const res = await axios.post("http://localhost:3001/users", userData);
  return res.data;
});

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    error: null,
    loading: false,
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.current = action.payload;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.current = null;
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
