import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  // You can add role-based access control props here later if needed
  // e.g., allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  // Use the reactive isAuthenticated value from the hook selector
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  console.log('ProtectedRoute Render - isAuthenticated:', isAuthenticated);

  // Remove the potentially stale getState() call
  // const auth = useAuthStore.getState();

  // Use the reactive isAuthenticated directly in the condition
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to /login');
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after login.
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Authenticated, rendering Outlet');
  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 