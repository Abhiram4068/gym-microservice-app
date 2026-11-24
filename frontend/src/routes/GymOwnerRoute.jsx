import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole, UserRole } from '../utils/tokenStorage';

const GymOwnerRoute = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = getUserRole();

  if (role === UserRole.GymOwner) {
    return <Outlet />;
  }

  // Redirect other roles to their portal
  if (role === UserRole.SuperAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (role === UserRole.Receptionist) return <Navigate to="/receptionist/dashboard" replace />;
  if (role === UserRole.Trainer) return <Navigate to="/trainer/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

export default GymOwnerRoute;
