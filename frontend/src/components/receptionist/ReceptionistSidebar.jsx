import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const ReceptionistSidebar = ({ isMobileOpen, onCloseMobile }) => {
  const location = useLocation();

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors duration-150 no-underline w-full rounded-none ${
      isActive
        ? 'bg-[#eff6ff] text-[#116dff] font-semibold border-r-2 border-[#116dff]'
        : 'text-[#475467] hover:bg-slate-50 hover:text-[#0f172a]'
    }`;

  const primaryItems = [
    {
      to: '/receptionist/dashboard',
      end: true,
      label: 'Front Desk Console',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
        </svg>
      )
    },
    {
      to: '/receptionist/customers/add',
      label: 'New Registration',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      )
    },
    {
      to: '/receptionist/customers',
      end: true,
      label: 'Member Directory',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  const operationsItems = [
    {
      to: '/receptionist/checkins',
      fallbackHash: '#checkins',
      label: 'Check-In Log',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      to: '/receptionist/memberships',
      fallbackHash: '#memberships',
      label: 'Plans & Renewals',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      to: '/receptionist/schedule',
      fallbackHash: '#schedule',
      label: 'Floor & Classes',
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 lg:hidden"
        />
      )}

      {/* Fixed Sidebar Container */}
      <aside
        className={`fixed top-14 left-0 bottom-0 w-[240px] bg-white border-r border-slate-200 z-40 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Sections */}
        <div className="py-3 px-0 flex-1 overflow-y-auto no-scrollbar space-y-5">
          {/* Primary Front Desk Navigation */}
          <div>
            <nav className="space-y-0.5">
              {primaryItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onCloseMobile}
                  className={({ isActive }) => {
                    // Prevent Front Desk Console from staying highlighted if a hash sub-view is active
                    const trulyActive =
                      item.to === '/receptionist/dashboard'
                        ? isActive && !location.hash
                        : isActive;
                    return navItemClass({ isActive: trulyActive });
                  }}
                  title={item.label}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Secondary Operations Navigation */}
          <div>
            <div className="px-4 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operations
            </div>
            <nav className="space-y-0.5">
              {operationsItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={`/receptionist/dashboard${item.fallbackHash}`}
                  onClick={onCloseMobile}
                  className={() => {
                    const isHashActive = location.hash === item.fallbackHash;
                    return navItemClass({ isActive: isHashActive });
                  }}
                  title={item.label}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ReceptionistSidebar;
