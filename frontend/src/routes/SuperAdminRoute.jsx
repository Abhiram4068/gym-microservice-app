import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getUserRole, UserRole } from '../utils/tokenStorage';

const SuperAdminRoute = () => {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();

  if (role === UserRole.SuperAdmin) {
    return <Outlet />;
  }

  if (role === UserRole.GymOwner) return <Navigate to="/owner/dashboard" replace />;
  if (role === UserRole.Receptionist) return <Navigate to="/receptionist/dashboard" replace />;
  if (role === UserRole.Trainer) return <Navigate to="/trainer/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

export default SuperAdminRoute;
