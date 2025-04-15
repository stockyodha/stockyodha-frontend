import { create } from 'zustand';
import { UserRead } from '../types/userTypes';
import { getCurrentUser } from '../services/userService'; // Import userService function


type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: UserRead | null; // Store user info
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: UserRead | null) => void;
  fetchUser: () => Promise<void>; // Action to fetch user data
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    user: null,

    setTokens: (access, refresh) => {
      console.log('Setting tokens...', { access: !!access }); // Add log
      set({
        accessToken: access,
        refreshToken: refresh,
        isAuthenticated: !!access,
      });
      if (access) {
        console.log('setTokens: Tokens set, calling fetchUser...'); // Add log
        get().fetchUser();
      }
    },

    setUser: (user) => set({ user }),

    fetchUser: async () => {
      // Add check for token existence before fetching
      const token = get().accessToken;
      if (!token) {
        console.log('fetchUser: No token, skipping fetch.')
        set({ user: null, isAuthenticated: false }); // Ensure consistent state
        return;
      }
      console.log('fetchUser: Attempting to fetch user...')
      try {
        const userData = await getCurrentUser();
        console.log('fetchUser: User data received:', userData);
        set({ user: userData, isAuthenticated: true }); // Ensure authenticated state
      } catch (error) {
        console.error("Failed to fetch user in store:", error);
        // If fetch fails (e.g., invalid token), log out
        set({ accessToken: null, refreshToken: null, isAuthenticated: false, user: null });
      }
    },

    logout: () => {
      console.log('Logging out...'); // Add log
      // Call logout service if needed
      // logoutUser();
      set({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        user: null,
      });
    },
  })
); 