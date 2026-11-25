import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ReceptionistNavbar from '../../components/receptionist/ReceptionistNavbar';
import ReceptionistSidebar from '../../components/receptionist/ReceptionistSidebar';

const ReceptionistLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#101828] font-sans antialiased">
      {/* Top Navbar */}
      <ReceptionistNavbar onToggleMobile={() => setMobileOpen(!mobileOpen)} />

      {/* Fixed Sidebar & Main Content */}
      <div className="flex">
        <ReceptionistSidebar
          isMobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <main className="flex-1 ml-0 lg:ml-[240px] mt-14 p-4 sm:p-6 no-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ReceptionistLayout;
