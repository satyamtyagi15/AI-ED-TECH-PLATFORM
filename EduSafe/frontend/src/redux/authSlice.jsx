// src/redux/authSlice.jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../utils/api.jsx';

// =================== Async Thunks ===================

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

// Register tenant
export const registerTenant = createAsyncThunk(
  'auth/registerTenant',
  async (tenantData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register-tenant', tenantData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Tenant registration failed' });
    }
  }
);

// Get Current User (for reload persistence)
export const getCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me'); // backend must have this
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch user' });
    }
  }
);

// =================== Helpers ===================
const loadUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// =================== Slice ===================
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadUserFromStorage(),
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token;
        if (state.token) {
          localStorage.setItem('token', state.token);
        }
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      })

      // Register user
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token;
        if (state.token) {
          localStorage.setItem('token', state.token);
        }
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })

      // Register tenant
      .addCase(registerTenant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.user?.token || action.payload.token || null;
        if (state.token) {
          localStorage.setItem('token', state.token);
        }
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })

      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        state.error = action.payload?.message || 'Failed to fetch user';
      });
  },
});

// =================== Exports ===================
export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
