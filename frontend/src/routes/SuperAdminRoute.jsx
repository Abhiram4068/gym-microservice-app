import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole, UserRole } from '../utils/tokenStorage';

const SuperAdminRoute = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Preserve attempted destination
    return <Navigate to="/superadmin/login" state={{ from: location }} replace />;
  }

  const role = getUserRole();

  if (role === UserRole.SuperAdmin) {
    return <Outlet />;
  }

  // Redirect users with other roles to their dedicated spaces
  if (role === UserRole.GymOwner) return <Navigate to="/owner/dashboard" replace />;
  if (role === UserRole.Receptionist) return <Navigate to="/receptionist/dashboard" replace />;
  if (role === UserRole.Trainer) return <Navigate to="/trainer/dashboard" replace />;

  return <Navigate to="/superadmin/login" replace />;
};

export default SuperAdminRoute;
