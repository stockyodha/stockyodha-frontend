import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
// import { useThemeStore } from './store/themeStore' // No longer needed here
// import { theme as appTheme } from './config/theme' // Remove this
import './index.css'
import { ThemeProvider } from "./components/providers/theme-provider" // Import the provider
import { Toaster } from "@/components/ui/sonner" // Import Toaster
// Import React Query
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient()

// Main component to handle theme state
function Main() {

  // Remove the entire useEffect hook for hydration logic
  /*
  useEffect(() => {
    const state = useAuthStore.getState();
    console.log('Main useEffect: Checking hydration state', state);
    if (state.accessToken && !state.user) {
      // If we have a token but no user data, fetch user data.
      // isAuthenticated should be derived automatically by Zustand based on token presence.
      console.log('Main useEffect: Hydrated with token, fetching user...');
      state.fetchUser();
    } else if (!state.accessToken && state.isAuthenticated) {
      // If no token found but state thinks it's authenticated (edge case), reset.
      console.log('Main useEffect: Hydrated without token, correcting state.');
    }
    // Add a condition to handle the case where we have a token AND a user already
    // This might happen if user data was persisted, ensures isAuthenticated is true
    else if (state.accessToken && state.user && !state.isAuthenticated) {
       console.log('Main useEffect: Hydrated with token and user, ensuring isAuthenticated is true.');
       // This setState might still be needed if the derivation isn't perfect on load
       // but let's try without it first.
       // useAuthStore.setState({ isAuthenticated: true });
    }
  }, []); // Runs once on mount
  */

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
        <App />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={"/stockyodha-frontend"}>
      <Main />
    </BrowserRouter>
  </React.StrictMode>,
)
