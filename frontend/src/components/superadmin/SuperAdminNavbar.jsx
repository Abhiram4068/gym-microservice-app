import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { getUserData } from '../../utils/tokenStorage';

const SuperAdminNavbar = ({ searchQuery, onSearchChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = getUserData();

  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : 'SA';

  const userFullName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Super Administrator';

  const userEmail = user?.email || 'admin@wixstudio.com';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authApi.logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[54px] bg-white border-b border-[#eaecf0] flex items-center justify-between px-[18px] z-50">
      <div className="flex items-center gap-[18px]">
        <Link to="/admin/dashboard" className="font-bold text-[18px] tracking-tight text-slate-900 no-underline flex items-center">
          Gym Platform
        </Link>
        <div className="flex items-center gap-1.5 text-[13.5px] font-medium text-[#101828] cursor-pointer px-2 py-1.5 rounded-md hover:bg-[#f4f6f8] transition">
          <span>Superadmin</span>
        </div>
      </div>

      <div className="flex-1 max-w-[440px] mx-6 hidden lg:block">
        <div className="relative w-full">
          <svg className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#4f81c7] w-[15px] height-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search for gym owners, email, phone..."
            className="w-full h-9 bg-[#f1f5f9] border border-transparent rounded-full pl-[38px] pr-4 text-[13px] text-[#101828] outline-none transition focus:bg-white focus:border-[#116dff] focus:ring-2 focus:ring-[#116dff]/15 placeholder:text-[#6b7b8f]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <button className="relative p-1.5 text-[#101828] hover:bg-[#f1f5f9] rounded-full transition" title="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span className="absolute top-[1px] right-[1px] bg-[#2563eb] text-white text-[10px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1">
            1
          </span>
        </button>

        {/* User Profile & Logout Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-[#f1f5f9] transition"
          >
            <div className="w-[32px] h-[32px] rounded-full bg-[#dbeafe] text-[#1e40af] flex items-center justify-center font-bold text-xs select-none">
              {userInitials}
            </div>
            <span className="hidden md:block text-[13px] font-semibold text-[#1e293b] max-w-[120px] truncate">
              {userFullName}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={`text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
              <div className="px-3.5 py-2.5 border-b border-slate-100">
                <p className="text-[13px] font-semibold text-slate-900 truncate">{userFullName}</p>
                <p className="text-[11.5px] text-slate-500 truncate">{userEmail}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                  Super Admin
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SuperAdminNavbar;
