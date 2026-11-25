import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import GymOwnerNavbar from '../../components/gymowner/GymOwnerNavbar';
import GymOwnerSidebar from '../../components/gymowner/GymOwnerSidebar';

const GymOwnerLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eaf2fd] via-[#f3f7fd] to-[#ffffff] text-[#101828] font-sans antialiased">
      {/* Top Fixed Navbar */}
      <GymOwnerNavbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      {/* Main Content & Sidebar */}
      <div className="flex">
        <GymOwnerSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        <main className="ml-0 lg:ml-[240px] mt-[60px] flex-1 p-5 sm:p-8 pb-16 min-h-[calc(100vh-60px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default GymOwnerLayout;
