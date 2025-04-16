import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // Import middleware
import { UserRead } from '../types/userTypes';
import { getCurrentUser } from '../services/userService'; // Import userService function
import { logoutUser } from '../services/authService'; // Import logoutUser service
import { AxiosError } from 'axios'; // Import AxiosError


type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: UserRead | null; // Store user info
  _hasHydrated: boolean; // Flag to indicate if hydration from storage is complete
  setTokens: (access: string | null, refresh: string | null) => void; // Allow null for clearing
  setUser: (user: UserRead | null) => void;
  fetchUser: () => Promise<void>; // Action to fetch user data
  logout: () => Promise<void>; // Ensure logout is async
  setHasHydrated: (state: boolean) => void; // Action to set hydration status
};

export const useAuthStore = create<AuthState>()(
  persist( // Wrap with persist middleware
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false, // Initial state before hydration
      user: null,
      _hasHydrated: false, // Initialize hydration state

      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },

      setTokens: (access, refresh) => {
        console.log('Setting tokens in store...', { access: !!access });
        // Persist middleware will automatically save accessToken and refreshToken
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: !!access, // Derive auth state from token presence
        });
        // Clear user data if tokens are cleared
        if (!access) {
            set({ user: null });
        }
        // Note: fetchUser is now triggered by hydration or explicitly after login, not directly here
      },

      setUser: (user) => set({ user }),

      fetchUser: async () => {
        const token = get().accessToken;
        if (!token) {
          console.log('fetchUser: No access token found. Skipping fetch.');
          // Ensure clean state if called without a token unexpectedly
           set({ user: null, isAuthenticated: false });
          return;
        }
        console.log('fetchUser: Attempting to fetch user with stored token...');
        try {
          const userData = await getCurrentUser();
          console.log('fetchUser: User data received successfully:', userData);
          set({ user: userData, isAuthenticated: true }); // Confirm authentication
        } catch (error) {
          console.error("Failed to fetch user in store:", error);
          const isAxiosError = error instanceof AxiosError;
          const status = isAxiosError ? (error as AxiosError).response?.status : null;

          if (status === 401) {
            // If 401 during fetchUser, the token might be expired or invalid
            console.log("fetchUser: Received 401. Interceptor should handle refresh OR logout if refresh fails.");
            // Don't logout here; let the interceptor decide.
            // If the interceptor fails refresh, IT calls logout which clears state.
          } else {
            // For other errors (network, server issue), treat the session as invalid
            console.log("fetchUser: Non-401 error during user fetch. Logging out.");
            // Use await here if logout becomes complex, but it mainly sets state now
            get().logout();
          }
        }
      },

      logout: async () => {
        console.log('Executing logout action...');
        try {
          // Call API first, but don't block client-side logout if it fails
          await logoutUser();
          console.log('Logout API call successful (or skipped if no endpoint)');
        } catch (error) {
          console.error("Logout API call failed:", error);
        } finally {
          // Clear local state - persist middleware handles removing from localStorage
          // when accessToken/refreshToken are set to null
          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            user: null,
          });
          console.log("Auth state cleared.");
        }
      },
    }),
    {
      name: 'auth-storage', // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({
        // Only persist the tokens
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: (state) => {
        console.log("useAuthStore: Hydration starting...");
        return (hydratedState, error) => {
          if (error) {
            console.error("useAuthStore: Error during hydration:", error);
            // Still attempt to mark hydration as complete to unblock UI
            hydratedState?.setHasHydrated(true);
          } else {
            console.log("useAuthStore: Hydration successful.");
            // Ensure hydratedState is defined before using it
            if (hydratedState) {
              if (hydratedState.accessToken) {
                console.log("useAuthStore: Access token found. Setting authenticated and fetching user.");
                hydratedState.isAuthenticated = true;
                hydratedState.fetchUser();
              } else {
                console.log("useAuthStore: No access token found. Ensuring logged out state.");
                hydratedState.isAuthenticated = false;
                hydratedState.user = null;
              }
              // Mark hydration as complete after processing state
              hydratedState.setHasHydrated(true);
            } else {
               console.error("useAuthStore: hydratedState is undefined even after successful hydration?");
               // Attempt to mark hydration complete using the outer state reference as fallback
               state?.setHasHydrated(true);
            }
          }
        };
      },
    }
  )
); 