import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Read the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'; // Fallback for local dev

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState(); // Get token directly from store state
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (can be used for token refresh later)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Basic check for unauthorized error and if it's not a retry attempt
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retry attempt
      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          if (refreshResponse.status === 200) {
            const { access_token, refresh_token } = refreshResponse.data;
            setTokens(access_token, refresh_token); // Update store with new tokens

            // Update the original request header and retry
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return apiClient(originalRequest); // Retry the original request with new token
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout(); // Logout user if refresh fails
          // Redirect to login or handle appropriately
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        console.log('No refresh token available, logging out.');
        logout();
        window.location.href = '/login';
      }
    }
    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default apiClient; 