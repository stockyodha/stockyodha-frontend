import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  // You can add role-based access control props here later if needed
  // e.g., allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  // Use the reactive isAuthenticated value from the hook selector
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // Get the hydration status
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  console.log('ProtectedRoute Render - isAuthenticated:', isAuthenticated, 'hasHydrated:', hasHydrated);

  // Wait for hydration to complete before rendering based on auth state
  if (!hasHydrated) {
    console.log('ProtectedRoute: Waiting for hydration...');
    // Render loading state or null while waiting for Zustand hydration
    // Replace this with a proper loading spinner/component if desired
    return <div>Loading session...</div>; 
  }

  // Once hydrated, check authentication
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Hydrated, Not authenticated, redirecting to /login');
    // Redirect them to the /login page
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Hydrated, Authenticated, rendering Outlet');
  // If hydrated and authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 