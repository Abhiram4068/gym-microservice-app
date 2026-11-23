import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const SuperAdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      <aside style={{ width: 220, backgroundColor: '#161b22', color: '#ffffff', padding: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 20 }}>WIX Superadmin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link to="/superadmin/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/superadmin/owners" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Gym Owners</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
