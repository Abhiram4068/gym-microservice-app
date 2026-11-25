import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminNavbar from '../../components/superadmin/SuperAdminNavbar';
import SuperAdminSidebar from '../../components/superadmin/SuperAdminSidebar';

const SuperAdminLayout = () => {
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#101828] font-sans antialiased">
      <SuperAdminNavbar searchQuery={globalSearch} onSearchChange={setGlobalSearch} />
      <div className="flex">
        <SuperAdminSidebar />
        <main className="ml-0 lg:ml-[224px] mt-[54px] flex-1 p-5 sm:p-6 pb-16 min-h-[calc(100vh-54px)]">
          <Outlet context={{ globalSearch, setGlobalSearch }} />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
