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

// Flag to indicate if a token refresh is currently in progress
let isRefreshing = false;
// Queue to hold requests that failed with 401 while refreshing
let failedQueue: { resolve: (value: any) => void; reject: (reason?: any) => void; config: any }[] = [];

// Function to process the queue
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      // Update the Authorization header before resolving
      prom.config.headers['Authorization'] = `Bearer ${token}`;
      // Resolve with the original request configuration, letting axios retry it
      apiClient(prom.config).then(prom.resolve).catch(prom.reject);
    }
  });
  failedQueue = [];
};

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check for 401 Unauthorized
    if (error.response?.status === 401) {
      // If the failed request was the refresh attempt itself, logout immediately.
      if (originalRequest.url === `${API_BASE_URL}/auth/refresh`) {
        console.error('Refresh token is invalid or expired. Logging out.');
        // Use store's logout which handles state clearing
        useAuthStore.getState().logout();
        // Reject the promise to prevent further processing
        return Promise.reject(error);
      }
      
      // If a refresh is already in progress, queue the original request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        }).catch(err => {
          // This catch is important to prevent unhandled promise rejections
          // when the refresh eventually fails and rejects the queued promises.
          return Promise.reject(err); 
        });
      }

      // Start the refresh process
      originalRequest._retry = true; // Mark as retry attempt (might be useful)
      isRefreshing = true;

      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (!refreshToken) {
        console.log('No refresh token available, logging out.');
        logout();
        isRefreshing = false;
        processQueue(error, null); // Reject queue
        return Promise.reject(error);
      }

      try {
        console.log('Attempting to refresh token...');
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        if (refreshResponse.status === 200) {
          console.log('Token refresh successful.');
          const { access_token, refresh_token } = refreshResponse.data;
          setTokens(access_token, refresh_token); // Update store

          // Update the header for the original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          // Process the queue with the new token
          processQueue(null, access_token);
          
          // Retry the original request
          return apiClient(originalRequest);
        } else {
          // Handle unexpected non-200 success status from refresh endpoint if necessary
          console.error('Token refresh returned non-200 status:', refreshResponse.status);
          logout(); 
          processQueue(new Error('Token refresh failed with status ' + refreshResponse.status), null);
          return Promise.reject(new Error('Token refresh failed'));
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        logout(); // Logout user if refresh fails
        processQueue(refreshError, null); // Reject queue
        // No need for window.location.href, ProtectedRoute will handle redirect
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default apiClient; 