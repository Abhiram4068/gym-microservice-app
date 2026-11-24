import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminRoute from './SuperAdminRoute';
import GymOwnerRoute from './GymOwnerRoute';

// Lazy Loaded Auth & Registration Pages
const GymLogin = lazy(() => import('../pages/auth/GymLogin'));
const SuperAdminLogin = lazy(() => import('../pages/auth/SuperAdminLogin'));
const GymOwnerRegister = lazy(() => import('../pages/gymowner/GymOwnerRegister'));
// Lazy Loaded Gym Owner Layout & Pages
const GymOwnerLayout = lazy(() => import('../layouts/gymowner/GymOwnerLayout'));
const GymOwnerDashboard = lazy(() => import('../pages/gymowner/GymOwnerDashboard'));
const AddReceptionist = lazy(() => import('../pages/gymowner/AddReceptionist'));
const ManageReceptionists = lazy(() => import('../pages/gymowner/ManageReceptionists'));

// Lazy Loaded SuperAdmin Layout & Pages
const SuperAdminLayout = lazy(() => import('../layouts/superadmin/SuperAdminLayout'));
const Dashboard = lazy(() => import('../pages/superadmin/Dashboard'));
const ViewOwners = lazy(() => import('../pages/superadmin/ViewOwners'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-medium text-slate-500">Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<GymLogin />} />
        <Route path="/owner/login" element={<GymLogin />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/admin/login" element={<Navigate to="/superadmin/login" replace />} />
        <Route path="/register" element={<GymOwnerRegister />} />
        <Route path="/gymowner/register" element={<GymOwnerRegister />} />

        {/* Gym Owner Protected Routes */}
        <Route element={<GymOwnerRoute />}>
          <Route element={<GymOwnerLayout />}>
            <Route path="/owner" element={<Navigate to="/owner/dashboard" replace />} />
            <Route path="/owner/dashboard" element={<GymOwnerDashboard />} />
            <Route path="/owner/receptionists" element={<ManageReceptionists />} />
            <Route path="/owner/receptionists/add" element={<AddReceptionist />} />
            <Route path="/gymowner/dashboard" element={<Navigate to="/owner/dashboard" replace />} />
          </Route>
        </Route>

        {/* SuperAdmin Protected Routes */}
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
