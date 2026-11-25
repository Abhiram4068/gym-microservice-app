import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { authApi } from '../../api/auth';

const GymOwnerSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const handleLogout = async () => {
    if (onClose) onClose();
    await authApi.logout();
  };

  // Collapsible Receptionist section state (open by default)
  const isReceptionistRoute = location.pathname.startsWith('/owner/receptionist');
  const [isReceptionistOpen, setIsReceptionistOpen] = useState(true);

  const navItemClass = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition duration-150 no-underline ${
      isActive
        ? 'bg-[#116dff] text-white font-semibold shadow-sm shadow-[#116dff]/20'
        : 'text-[#475467] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
    }`;

  const subNavItemClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition duration-150 no-underline ${
      isActive
        ? 'bg-[#eef4ff] text-[#116dff] font-semibold'
        : 'text-[#64748b] hover:bg-slate-100 hover:text-[#0f172a]'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-[60px] left-0 bottom-0 w-[240px] bg-white border-r border-[#e2e8f0] z-40 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto space-y-5">
          {/* Main Navigation Group */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
              Main Menu
            </div>
            <nav className="space-y-1">
              {/* Dashboard */}
              <NavLink
                to="/owner/dashboard"
                onClick={onClose}
                className={navItemClass}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Dashboard</span>
                </div>
              </NavLink>

              {/* Collapsible Receptionist Menu */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsReceptionistOpen(!isReceptionistOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition duration-150 cursor-pointer ${
                    isReceptionistRoute
                      ? 'bg-slate-100 text-[#0f172a] font-semibold'
                      : 'text-[#475467] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#64748b] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Receptionist</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-[#94a3b8] transition-transform duration-200 ${
                      isReceptionistOpen ? 'rotate-180 text-[#0f172a]' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Submenu */}
                {isReceptionistOpen && (
                  <div className="mt-1 pl-4 pr-1 space-y-1 border-l-2 border-slate-100 ml-4 py-1">
                    <NavLink
                      to="/owner/receptionists/add"
                      onClick={onClose}
                      className={subNavItemClass}
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Add Receptionist</span>
                    </NavLink>

                    <NavLink
                      to="/owner/receptionists"
                      end
                      onClick={onClose}
                      className={subNavItemClass}
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span>View / Manage</span>
                    </NavLink>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>

        {/* Footer Logout Button */}
        <div className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc]/70">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default GymOwnerSidebar;
