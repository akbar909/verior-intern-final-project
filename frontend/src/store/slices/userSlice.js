import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Search users
export const searchUsers = createAsyncThunk(
  'user/searchUsers',
  async (query, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/users/search?query=${query}`, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);


const userSlice = createSlice({
  name: 'user',
  initialState: {
    searchResults: [],
    isLoading: false,
    isSearching: false,
    isError: false,
    message: '',
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    resetUserState: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isSearching = false;
        state.isError = true;
        state.message = action.payload;
      })
  },
});

export const { clearSearchResults, resetUserState } = userSlice.actions;
export default userSlice.reducer;