import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getUserRole } from '../utils/tokenStorage';

const SuperAdminRoute = () => {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();

  // Role 1 is SuperAdmin (or customized role check)
  if (role === 1 || role === 'SuperAdmin' || role === 'superadmin') {
    return <Outlet />;
  }

  if (role === 2) return <Navigate to="/manager/dashboard" replace />;
  if (role === 3) return <Navigate to="/employee/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

export default SuperAdminRoute;
