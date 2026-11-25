import React from 'react';
import { NavLink } from 'react-router-dom';
import { getUserData } from '../../utils/tokenStorage';
import { authApi } from '../../api/auth';

const ReceptionistNavbar = ({ onToggleMobile }) => {
  const user = getUserData();

  const handleLogout = async () => {
    await authApi.logout();
  };

  const initials = `${user?.firstName?.[0] || 'R'}${user?.lastName?.[0] || 'C'}`.toUpperCase();
  const gymName = user?.gymName || 'Iron Pulse Fitness';
  const staffName = `${user?.firstName || 'Staff'} ${user?.lastName || 'Member'}`.trim();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-50 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Trigger & Facility Brand */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={onToggleMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition bg-transparent border-none cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Facility Brand & Terminal Tag */}
        <NavLink
          to="/receptionist/dashboard"
          className="flex items-center gap-2.5 no-underline group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-tighter shrink-0">
            IP
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-slate-900">
              {gymName}
            </span>
          </div>
        </NavLink>
      </div>

      {/* Center Nav Links */}
      <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
      </nav>

      {/* Right: Actions, Staff Identity & Logout */}
      <div className="flex items-center gap-3">
        {/* Action Button */}
        <NavLink
          to="/receptionist/customers/add"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#116dff] hover:bg-[#0057e6] rounded-lg transition shadow-xs no-underline"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Member</span>
        </NavLink>

        {/* Staff Profile Meta */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-[#116dff] text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              {staffName}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Front Desk Staff
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer"
          title="Sign out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default ReceptionistNavbar;
