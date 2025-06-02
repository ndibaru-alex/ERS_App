import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../api/services/auth.service';
import { toast } from 'react-toastify';

interface AuthRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}

export default function AuthRoute({ children, requireAdmin = false }: AuthRouteProps) {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();
  
  console.log('AuthRoute check:', { isAuthenticated, userRole, requireAdmin, path: location.pathname });

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && userRole !== 'admin') {
    console.log('User is not admin, redirecting to home');
    toast.error('You do not have permission to access this area');
    return <Navigate to="/" replace />;
  }

  return children;
}