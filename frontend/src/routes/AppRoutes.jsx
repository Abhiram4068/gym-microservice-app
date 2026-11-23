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
    <Suspense fallback={<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* SuperAdmin Protected Routes */}
        <Route element={<SuperAdminRoute />}>
          <Route element={<SuperAdminLayout />}>
            <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
            <Route path="/superadmin/dashboard" element={<Dashboard />} />
            <Route path="/superadmin/owners" element={<ViewOwners />} />
          </Route>
        </Route>

        {/* 404 / Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
