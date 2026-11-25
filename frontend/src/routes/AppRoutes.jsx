import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminRoute from './SuperAdminRoute';
import GymOwnerRoute from './GymOwnerRoute';
import ReceptionistRoute from './ReceptionistRoute';

// Lazy Loaded Auth & Registration Pages
const GymLogin = lazy(() => import('../pages/auth/GymLogin'));
const SuperAdminLogin = lazy(() => import('../pages/auth/SuperAdminLogin'));
const GymOwnerRegister = lazy(() => import('../pages/gymowner/GymOwnerRegister'));

// Lazy Loaded Gym Owner Layout & Pages
const GymOwnerLayout = lazy(() => import('../layouts/gymowner/GymOwnerLayout'));
const GymOwnerDashboard = lazy(() => import('../pages/gymowner/GymOwnerDashboard'));
const AddReceptionist = lazy(() => import('../pages/gymowner/AddReceptionist'));
const ManageReceptionists = lazy(() => import('../pages/gymowner/ManageReceptionists'));

// Lazy Loaded Receptionist Layout & Pages
const ReceptionistLayout = lazy(() => import('../layouts/receptionist/ReceptionistLayout'));
const ReceptionistDashboard = lazy(() => import('../pages/receptionist/ReceptionistDashboard'));
const CreateCustomer = lazy(() => import('../pages/receptionist/CreateCustomer'));

// Lazy Loaded SuperAdmin Layout & Pages
const SuperAdminLayout = lazy(() => import('../layouts/superadmin/SuperAdminLayout'));
const Dashboard = lazy(() => import('../pages/superadmin/Dashboard'));
const ViewOwners = lazy(() => import('../pages/superadmin/ViewOwners'));
const OwnerDetails = lazy(() => import('../pages/superadmin/OwnerDetails'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-medium text-slate-500">Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<GymLogin />} />
        <Route path="/owner/login" element={<GymLogin />} />
        <Route path="/receptionist/login" element={<GymLogin />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/admin/login" element={<Navigate to="/superadmin/login" replace />} />
        <Route path="/register" element={<GymOwnerRegister />} />
        <Route path="/gymowner/register" element={<GymOwnerRegister />} />

        {/* Receptionist Protected Routes */}
        <Route element={<ReceptionistRoute />}>
          <Route element={<ReceptionistLayout />}>
            <Route path="/receptionist" element={<Navigate to="/receptionist/dashboard" replace />} />
            <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
            <Route path="/receptionist/customers" element={<Navigate to="/receptionist/dashboard" replace />} />
            <Route path="/receptionist/customers/create" element={<CreateCustomer />} />
            <Route path="/receptionist/customers/add" element={<CreateCustomer />} />
          </Route>
        </Route>

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
            <Route path="/admin/owners/:id" element={<OwnerDetails />} />
            <Route path="/superadmin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/superadmin/owners" element={<Navigate to="/admin/owners" replace />} />
            <Route path="/superadmin/owners/:id" element={<OwnerDetails />} />
          </Route>
        </Route>

        {/* 404 / Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
