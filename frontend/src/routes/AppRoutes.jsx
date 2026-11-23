import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminRoute from './SuperAdminRoute';

// Lazy Loaded Auth Pages
const Login = lazy(() => import('../pages/auth/login'));

// Lazy Loaded SuperAdmin Layout & Pages
const SuperAdminLayout = lazy(() => import('../layouts/superadmin/SuperAdminLayout'));
const Dashboard = lazy(() => import('../pages/superadmin/Dashboard'));
const ViewOwners = lazy(() => import('../pages/superadmin/ViewOwners'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* SuperAdmin / Admin Protected Routes */}
        <Route element={<SuperAdminRoute />}>
          <Route element={<SuperAdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/owners" element={<ViewOwners />} />
            <Route path="/superadmin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/superadmin/owners" element={<Navigate to="/admin/owners" replace />} />
          </Route>
        </Route>

        {/* 404 / Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
